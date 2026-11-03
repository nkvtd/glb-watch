import { multiPolygonToSvg, projectPoint } from "./geo";
import type {
  EventDto,
  MunicipalityDto,
  PaginatedResponse,
  PrecomputedMunicipality,
  ReportDto,
} from "./types";

const PUBLIC_FALLBACK_API = "https://glb.nkvtd.com/api";

function getServerEnv(key: string): string | undefined {
  const proc = (
    globalThis as { process?: { env?: Record<string, string | undefined> } }
  ).process;
  return proc?.env?.[key];
}

export function getClientApiBase(): string {
  const envUrl = import.meta.env.PUBLIC_ENV__API_URL as string | undefined;
  return envUrl ? envUrl.replace(/\/$/, "") : PUBLIC_FALLBACK_API;
}

export async function fetchFromGlb<T>(
  path: string,
  forwardedHeaders?: Record<string, string>,
): Promise<T> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  if (import.meta.env.SSR) {
    const internalEnv = getServerEnv("INTERNAL_API_URL");
    const publicEnv = getServerEnv("PUBLIC_ENV__API_URL");

    const candidates = [
      internalEnv ? { url: internalEnv, timeout: 1500 } : null,
      { url: "http://glb-server:8080/api", timeout: 400 },
      { url: "http://localhost:8080/api", timeout: 400 },
      publicEnv ? { url: publicEnv, timeout: 5000 } : null,
      { url: PUBLIC_FALLBACK_API, timeout: 6000 },
    ].filter((c): c is { url: string; timeout: number } => Boolean(c));

    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (forwardedHeaders?.["cf-connecting-ip"]) {
      headers["cf-connecting-ip"] = forwardedHeaders["cf-connecting-ip"];
    } else if (forwardedHeaders?.["x-forwarded-for"]) {
      headers["x-forwarded-for"] = forwardedHeaders["x-forwarded-for"];
    }

    for (const candidate of candidates) {
      try {
        const url = `${candidate.url.replace(/\/$/, "")}${cleanPath}`;
        const res = await fetch(url, {
          headers,
          signal: AbortSignal.timeout(candidate.timeout),
        });
        if (res.ok) {
          return (await res.json()) as T;
        }
      } catch {
        // Fast fallback to next candidate
      }
    }
    throw new Error(`Failed to fetch ${cleanPath} from glb API.`);
  }

  const res = await fetch(`${getClientApiBase()}${cleanPath}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(err?.message || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

let cachedMunicipalities: PrecomputedMunicipality[] | null = null;
let cacheTimestamp = 0;

export async function getPrecomputedMunicipalities(
  forwardedHeaders?: Record<string, string>,
): Promise<PrecomputedMunicipality[]> {
  const now = Date.now();
  if (cachedMunicipalities && now - cacheTimestamp < 12 * 60 * 60 * 1000) {
    return cachedMunicipalities;
  }

  const response = await fetchFromGlb<PaginatedResponse<MunicipalityDto>>(
    "/municipalities?pageSize=100&includeBoundary=true&sortBy=nameMk&sortDirection=asc",
    forwardedHeaders,
  );

  cachedMunicipalities = response.data.map((m) => {
    const { boundary, ...rest } = m;
    const { svgPath, bbox } = multiPolygonToSvg(boundary);
    const centerSvg = projectPoint(m.center.lng, m.center.lat);
    return {
      ...rest,
      svgPath,
      bbox,
      centerSvg,
    };
  });
  cacheTimestamp = now;
  return cachedMunicipalities;
}

export async function fetchMapTelemetryReports(
  forwardedHeaders?: Record<string, string>,
): Promise<ReportDto[]> {
  const [ongoingRes, scheduledRes, aqRes] = await Promise.all([
    fetchFromGlb<PaginatedResponse<ReportDto>>(
      "/reports?status=ongoing&pageSize=100&sortBy=startsAt&sortDirection=desc",
      forwardedHeaders,
    ),
    fetchFromGlb<PaginatedResponse<ReportDto>>(
      "/reports?status=scheduled&pageSize=100&sortBy=startsAt&sortDirection=desc",
      forwardedHeaders,
    ),
    fetchFromGlb<PaginatedResponse<ReportDto>>(
      "/reports?category=air_quality&status=ongoing,omitted&pageSize=60&sortBy=startsAt&sortDirection=desc",
      forwardedHeaders,
    ),
  ]);

  const byId = new Map<number, ReportDto>();
  for (const r of ongoingRes.data) byId.set(r.id, r);
  for (const r of scheduledRes.data) byId.set(r.id, r);

  const seenAqLocations = new Set<string>();
  for (const r of aqRes.data) {
    const key = `${r.source}:${r.locationLabel ?? r.externalId}`;
    if (!seenAqLocations.has(key)) {
      seenAqLocations.add(key);
      byId.set(r.id, r);
    }
  }

  return Array.from(byId.values());
}

export async function fetchActiveEvents(
  forwardedHeaders?: Record<string, string>,
): Promise<EventDto[]> {
  const res = await fetchFromGlb<PaginatedResponse<EventDto>>(
    "/events?status=ongoing&pageSize=10",
    forwardedHeaders,
  );
  return res.data;
}

export function resolveReportMunicipalityCode(
  report: ReportDto,
  municipalities: PrecomputedMunicipality[],
): string | null {
  if (report.municipalityCode) return report.municipalityCode;

  const haystack =
    `${report.locationLabel ?? ""} ${report.title}`.toUpperCase();
  if (!haystack.trim()) return null;

  for (const m of municipalities) {
    const nameMk = m.nameMk.trim().toUpperCase();
    if (nameMk && haystack.includes(nameMk)) {
      return m.code;
    }
  }
  return null;
}
