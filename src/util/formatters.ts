import type { EventDto } from "./types";

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
  return new Intl.DateTimeFormat("mk-MK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
}

export function formatRelativeTimeMk(iso: string | null): string {
  if (!iso) return "";
  const diffMs = new Date(iso).getTime() - Date.now();
  const diffMin = Math.round(diffMs / 60_000);
  const absMin = Math.abs(diffMin);

  if (absMin < 1) return "сега";
  if (absMin < 60) {
    return diffMin > 0 ? `за ${absMin} мин` : `пред ${absMin} мин`;
  }
  const hours = Math.round(absMin / 60);
  if (hours < 24) {
    return diffMin > 0 ? `за ${hours} ч` : `пред ${hours} ч`;
  }
  const days = Math.round(hours / 24);
  return diffMin > 0 ? `за ${days} д` : `пред ${days} д`;
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
  return { tag: "ИНФО", text };
}
