import { toMunicipalitySlug } from "./formatters";
import { multiPolygonToSvg, projectPoint } from "./geo";
import type {
  EventDto,
  MunicipalityDto,
  PaginatedResponse,
  PrecomputedMunicipality,
  ReportDto,
  ReportQueryParams,
} from "./types";

const PUBLIC_FALLBACK_API = "https://glb.nkvtd.com/api";
const TELEMETRY_TTL_MS = 45_000;
const MUNICIPALITIES_TTL_MS = 12 * 60 * 60 * 1000;

function getServerEnv(key: string): string | undefined {
  const proc = (
    globalThis as { process?: { env?: Record<string, string | undefined> } }
  ).process;
  return proc?.env?.[key];
}

export class ApiClient {
  private cachedMunicipalities: PrecomputedMunicipality[] | null = null;
  private muniCacheTime = 0;
  private inFlightMunicipalities: Promise<PrecomputedMunicipality[]> | null =
    null;

  private cachedMapReports: ReportDto[] | null = null;
  private mapReportsCacheTime = 0;
  private inFlightMapReports: Promise<ReportDto[]> | null = null;

  private cachedEvents: EventDto[] | null = null;
  private eventsCacheTime = 0;
  private inFlightEvents: Promise<EventDto[]> | null = null;

  private lastWorkingSsrBase: { url: string; timeout: number } | null = null;

  getClientBaseUrl(): string {
    const envUrl = import.meta.env.PUBLIC_ENV__API_URL as string | undefined;
    return envUrl ? envUrl.replace(/\/$/, "") : PUBLIC_FALLBACK_API;
  }

  async request<T>(
    path: string,
    forwardedHeaders?: Record<string, string>,
  ): Promise<T> {
    const cleanPath = path.startsWith("/") ? path : `/${path}`;

    if (import.meta.env.SSR) {
      const internalEnv = getServerEnv("INTERNAL_API_URL");
      const publicEnv = getServerEnv("PUBLIC_ENV__API_URL");

      const baseCandidates = [
        this.lastWorkingSsrBase,
        internalEnv ? { url: internalEnv, timeout: 1500 } : null,
        { url: "http://glb-server:8080/api", timeout: 350 },
        { url: "http://localhost:8080/api", timeout: 350 },
        publicEnv ? { url: publicEnv, timeout: 5000 } : null,
        { url: PUBLIC_FALLBACK_API, timeout: 6000 },
      ].filter((c): c is { url: string; timeout: number } => Boolean(c));

      const seenUrls = new Set<string>();
      const candidates = baseCandidates.filter((c) => {
        const key = c.url.replace(/\/$/, "");
        if (seenUrls.has(key)) return false;
        seenUrls.add(key);
        return true;
      });

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
            this.lastWorkingSsrBase = candidate;
            return (await res.json()) as T;
          }
        } catch {
          if (this.lastWorkingSsrBase?.url === candidate.url) {
            this.lastWorkingSsrBase = null;
          }
        }
      }
      throw new Error(`Failed to fetch ${cleanPath} from API.`);
    }

    const res = await fetch(`${this.getClientBaseUrl()}${cleanPath}`, {
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

  async getPrecomputedMunicipalities(
    forwardedHeaders?: Record<string, string>,
  ): Promise<PrecomputedMunicipality[]> {
    const now = Date.now();
    if (
      this.cachedMunicipalities &&
      now - this.muniCacheTime < MUNICIPALITIES_TTL_MS
    ) {
      return this.cachedMunicipalities;
    }

    if (this.inFlightMunicipalities) {
      return this.inFlightMunicipalities;
    }

    this.inFlightMunicipalities = (async () => {
      try {
        const response = await this.request<PaginatedResponse<MunicipalityDto>>(
          "/municipalities?pageSize=100&includeBoundary=true&sortBy=nameMk&sortDirection=asc",
          forwardedHeaders,
        );

        this.cachedMunicipalities = response.data.map((m) => {
          const { boundary, ...rest } = m;
          const { svgPath, bbox } = multiPolygonToSvg(boundary);
          const centerSvg = projectPoint(m.center.lng, m.center.lat);
          return {
            ...rest,
            slug: toMunicipalitySlug(m.nameEn, m.code),
            svgPath,
            bbox,
            centerSvg,
          };
        });
        this.muniCacheTime = Date.now();
        return this.cachedMunicipalities;
      } catch (err) {
        if (this.cachedMunicipalities) return this.cachedMunicipalities;
        throw err;
      } finally {
        this.inFlightMunicipalities = null;
      }
    })();

    return this.inFlightMunicipalities;
  }

  async findMunicipalityByParam(
    param: string,
    forwardedHeaders?: Record<string, string>,
  ): Promise<{
    target: PrecomputedMunicipality | null;
    all: PrecomputedMunicipality[];
  }> {
    const all = await this.getPrecomputedMunicipalities(forwardedHeaders);
    const needle = decodeURIComponent(param).trim().toLowerCase();
    const target =
      all.find(
        (m) =>
          m.slug === needle ||
          m.code.toLowerCase() === needle ||
          m.municipalityCode.toLowerCase() === needle ||
          m.nameMk.toLowerCase() === needle ||
          m.nameEn.toLowerCase() === needle,
      ) ?? null;
    return { target, all };
  }

  async getMapTelemetryReports(
    forwardedHeaders?: Record<string, string>,
    forceRefresh = false,
  ): Promise<ReportDto[]> {
    const now = Date.now();
    if (
      !forceRefresh &&
      this.cachedMapReports &&
      now - this.mapReportsCacheTime < TELEMETRY_TTL_MS
    ) {
      return this.cachedMapReports;
    }

    if (this.inFlightMapReports) {
      return this.inFlightMapReports;
    }

    this.inFlightMapReports = (async () => {
      try {
        const [ongoingRes, scheduledRes, aqRes] = await Promise.all([
          this.request<PaginatedResponse<ReportDto>>(
            "/reports?status=ongoing&pageSize=100&sortBy=startsAt&sortDirection=desc",
            forwardedHeaders,
          ),
          this.request<PaginatedResponse<ReportDto>>(
            "/reports?status=scheduled&pageSize=100&sortBy=startsAt&sortDirection=desc",
            forwardedHeaders,
          ),
          this.request<PaginatedResponse<ReportDto>>(
            "/reports?category=air_quality&status=ongoing,omitted&pageSize=60&sortBy=startsAt&sortDirection=desc",
            forwardedHeaders,
          ).catch(() => ({
            data: [] as ReportDto[],
            meta: { nextCursor: null, hasNextPage: false },
          })),
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

        const merged = Array.from(byId.values());
        this.cachedMapReports = merged;
        this.mapReportsCacheTime = Date.now();
        return merged;
      } catch (err) {
        if (this.cachedMapReports) return this.cachedMapReports;
        throw err;
      } finally {
        this.inFlightMapReports = null;
      }
    })();

    return this.inFlightMapReports;
  }

  async getReportsPage(
    query: ReportQueryParams,
    forwardedHeaders?: Record<string, string>,
  ): Promise<PaginatedResponse<ReportDto>> {
    const params = new URLSearchParams({
      pageSize: String(query.pageSize ?? 20),
      sortBy: query.sortBy ?? "startsAt",
      sortDirection: query.sortDirection ?? "desc",
    });

    if (query.status) params.set("status", query.status);
    if (query.category && query.category !== "all") {
      params.set("category", query.category);
    }
    if (query.municipalityCode) {
      params.set("municipalityCode", query.municipalityCode);
    }
    if (query.source) params.set("source", query.source);
    if (query.search?.trim()) params.set("search", query.search.trim());
    if (query.cursor) params.set("cursor", query.cursor);
    if (query.lat !== undefined && query.lng !== undefined) {
      params.set("lat", String(query.lat));
      params.set("lng", String(query.lng));
      if (query.radius !== undefined) {
        params.set("radius", String(query.radius));
      }
    }

    return this.request<PaginatedResponse<ReportDto>>(
      `/reports?${params.toString()}`,
      forwardedHeaders,
    );
  }

  async getMunicipalityByCoords(
    lat: number,
    lng: number,
    forwardedHeaders?: Record<string, string>,
  ): Promise<MunicipalityDto | null> {
    const res = await this.request<PaginatedResponse<MunicipalityDto>>(
      `/municipalities?lat=${lat}&lng=${lng}&includeBoundary=false`,
      forwardedHeaders,
    );
    return res.data[0] ?? null;
  }

  async getActiveEvents(
    forwardedHeaders?: Record<string, string>,
    forceRefresh = false,
  ): Promise<EventDto[]> {
    const now = Date.now();
    if (
      !forceRefresh &&
      this.cachedEvents &&
      now - this.eventsCacheTime < TELEMETRY_TTL_MS
    ) {
      return this.cachedEvents;
    }

    if (this.inFlightEvents) {
      return this.inFlightEvents;
    }

    this.inFlightEvents = (async () => {
      try {
        const res = await this.request<PaginatedResponse<EventDto>>(
          "/events?status=ongoing&pageSize=10",
          forwardedHeaders,
        );
        this.cachedEvents = res.data;
        this.eventsCacheTime = Date.now();
        return res.data;
      } catch (err) {
        if (this.cachedEvents) return this.cachedEvents;
        throw err;
      } finally {
        this.inFlightEvents = null;
      }
    })();

    return this.inFlightEvents;
  }

  resolveReportMunicipalityCode(
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
}

export const apiClient = new ApiClient();
