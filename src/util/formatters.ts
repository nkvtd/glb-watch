import type { EventDto, ReportDto } from "./types";

const mkDateTimeFormatter = new Intl.DateTimeFormat("mk-MK", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function toMunicipalitySlug(nameEn: string, code: string): string {
  const cleaned = nameEn
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || code.toLowerCase();
}

export function formatMacedonianDateTime(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return mkDateTimeFormatter.format(d);
}

const skopjeTimeFormatter = new Intl.DateTimeFormat("mk-MK", {
  timeZone: "Europe/Skopje",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatSkopjeTime(date: Date): string {
  return skopjeTimeFormatter.format(date).replace(/^24:/, "00:");
}

export function formatRelativeTimeMk(
  iso: string | null,
  nowMs: number,
): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";

  const diffMs = then - nowMs;
  const absMin = Math.floor(Math.abs(diffMs) / 60_000);
  if (absMin < 1) return "сега";

  const prefix = diffMs < 0 ? "пред" : "за";
  if (absMin < 60) return `${prefix} ${absMin} мин`;

  const hours = Math.floor(absMin / 60);
  if (hours < 24) return `${prefix} ${hours} ч`;

  return `${prefix} ${Math.floor(hours / 24)} д`;
}

export function formatReportTimeTag(
  rep: ReportDto,
  nowMs: number,
): string | null {
  if (rep.status === "ongoing" && rep.endsAt) {
    const remainingMs = new Date(rep.endsAt).getTime() - nowMs;
    if (remainingMs > 0) {
      const minutes = Math.floor(remainingMs / 60_000);
      if (minutes < 60) return `уште ${Math.max(1, minutes)} мин`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `уште ${hours} ч`;
      return `уште ${Math.floor(hours / 24)} д`;
    }
  }
  if (rep.status === "ongoing" && rep.startsAt) {
    return formatRelativeTimeMk(rep.startsAt, nowMs);
  }
  if (rep.status === "scheduled" && rep.startsAt) {
    return formatRelativeTimeMk(rep.startsAt, nowMs);
  }
  if (rep.status === "ended" && (rep.endsAt || rep.startsAt)) {
    return formatRelativeTimeMk(rep.endsAt ?? rep.startsAt, nowMs);
  }
  return null;
}

export interface AmbientAirDetails {
  status: string | null;
  aqi: number | null;
  pm10: string | null;
  pm25: string | null;
  temperature: string | null;
  humidity: string | null;
}

const AIR_STATUS_WORDS = [
  "Екстремно лош",
  "Многу лош",
  "Прифатлив",
  "Умерен",
  "Добар",
  "Лош",
];

function firstMatch(text: string, re: RegExp): string | null {
  return text.match(re)?.[1]?.trim() ?? null;
}

export function parseAmbientAirDetails(rep: ReportDto): AmbientAirDetails {
  const titlePrefix = rep.title.split(":")[0].trim();
  const text = `${titlePrefix} ${rep.description ?? ""}`;
  const aqi = firstMatch(text, /индекс:\s*(\d+)/i);

  return {
    status:
      AIR_STATUS_WORDS.find((word) => titlePrefix.startsWith(word)) ??
      titlePrefix.split(/\s+/)[0] ??
      null,
    aqi: aqi !== null ? Number(aqi) : null,
    pm10: firstMatch(text, /PM10\s+од\s+([\d.,]+)\s*µg\/m³/i),
    pm25: firstMatch(text, /PM2\.5\s+од\s+([\d.,]+)\s*µg\/m³/i),
    temperature: firstMatch(text, /температура\s+од\s+(-?[\d.,]+)\s*°C/i),
    humidity: firstMatch(text, /влажност\s+од\s+(\d+%)/i),
  };
}

export interface AmbientInternetDetails {
  status: "Нормален" | "Отежнат" | "Прекин";
  pctValue: number | null;
  pctLabel: string | null;
  phrase: string;
}

export function parseAmbientInternetDetails(
  rep: ReportDto,
): AmbientInternetDetails {
  const description = rep.description ?? "";
  const text = `${rep.title} ${description}`.toLowerCase();
  const status = /прекин/.test(text)
    ? ("Прекин" as const)
    : /нормал/.test(text)
      ? ("Нормален" as const)
      : rep.status === "ongoing"
        ? ("Отежнат" as const)
        : ("Нормален" as const);

  const pctLabel = description.match(/\d+(?:[.,]\d+)?\s*%/)?.[0] ?? null;
  const pctValue =
    pctLabel !== null
      ? Number(pctLabel.replace("%", "").replace(",", "."))
      : null;
  const phrase =
    description.match(
      /\d+(?:[.,]\d+)?\s*%\s*(достапност|од вообичаениот капацитет)/i,
    )?.[1] ??
    (status === "Отежнат" ? "од вообичаениот капацитет" : "достапност");

  return {
    status,
    pctValue: pctValue !== null && Number.isFinite(pctValue) ? pctValue : null,
    pctLabel,
    phrase,
  };
}

export function stripEventBoilerplate(
  description: string | null | undefined,
): string {
  if (!description) return "";
  const colonIdx = description.indexOf(":");
  return colonIdx !== -1
    ? description.slice(colonIdx + 1).trim()
    : description.trim();
}

export function formatEventHeadline(ev: EventDto): {
  tag: string;
  text: string;
} {
  const text = stripEventBoilerplate(ev.description) || ev.title;

  if (ev.category === "fuel_price" || ev.source === "amsm-fuel") {
    return { tag: "ГОРИВА", text };
  }
  if (ev.category === "currency_exchange" || ev.source === "nbrm-rates") {
    return { tag: "КУРСНА ЛИСТА", text };
  }
  if (ev.category === "internet" || ev.source === "ioda") {
    return { tag: "ИНТЕРНЕТ", text };
  }
  return { tag: "ИНФО", text };
}
