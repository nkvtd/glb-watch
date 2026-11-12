import { apiClient } from "./api";
import { createEmptyBreakdown } from "./constants";
import type {
  CategoryBreakdown,
  PrecomputedMunicipality,
  ReportCategory,
  ReportDto,
} from "./types";

const mkCollator = new Intl.Collator("mk");

export function isActiveReport(r: ReportDto): boolean {
  return r.status === "ongoing" || r.status === "scheduled";
}

export function countActiveByCategory(
  reports: readonly ReportDto[],
  municipalities?: readonly PrecomputedMunicipality[],
  targetMunicipalityCode?: string,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const r of reports) {
    if (!isActiveReport(r)) continue;
    if (
      targetMunicipalityCode &&
      municipalities &&
      apiClient.resolveReportMunicipalityCode(r, municipalities) !==
        targetMunicipalityCode
    ) {
      continue;
    }
    counts[r.category] = (counts[r.category] || 0) + 1;
  }
  return counts;
}

export function aggregateStatsByMunicipality(
  reports: readonly ReportDto[],
  municipalities: readonly PrecomputedMunicipality[],
  categoryFilter: ReportCategory | "all" = "all",
): Record<string, CategoryBreakdown> {
  const map: Record<string, CategoryBreakdown> = {};
  for (const r of reports) {
    if (categoryFilter !== "all" && r.category !== categoryFilter) continue;
    const code = apiClient.resolveReportMunicipalityCode(r, municipalities);
    if (!code) continue;

    let entry = map[code];
    if (!entry) {
      entry = createEmptyBreakdown();
      map[code] = entry;
    }
    if (r.status === "ongoing") {
      entry.ongoing += 1;
    } else if (r.status === "scheduled") {
      entry.scheduled += 1;
    } else if (r.status === "omitted") {
      entry.omitted += 1;
    }
  }
  return map;
}

export function compareMunicipalityRows(
  a: { m: PrecomputedMunicipality; stats: CategoryBreakdown },
  b: { m: PrecomputedMunicipality; stats: CategoryBreakdown },
): number {
  return (
    b.stats.ongoing - a.stats.ongoing ||
    b.stats.scheduled - a.stats.scheduled ||
    mkCollator.compare(a.m.nameMk, b.m.nameMk)
  );
}
