import type { EventDto } from "./types";

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

export function formatFuelTicker(ev?: EventDto): string {
  if (!ev?.description) return "";
  const matches = [
    ...ev.description.matchAll(
      /(ЕУРОСУПЕР БС-95|ЕУРОСУПЕР БС-98|ЕУРОДИЗЕЛ[^a-zA-Z0-9А-Шa-ш]*).*?(\d+(?:\.\d+)?)\s*ден\/л/g,
    ),
  ];
  if (matches.length > 0) {
    return matches
      .map((m) => `${m[1]?.replace("ЕУРОСУПЕР ", "")}: ${m[2]} ден/л`)
      .join("  |  ");
  }
  return ev.description;
}
