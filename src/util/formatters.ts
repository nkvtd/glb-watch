import type { EventDto } from "./types";

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
