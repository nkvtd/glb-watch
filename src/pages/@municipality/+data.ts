import { render } from "vike/abort";
import type { PageContextServer } from "vike/types";
import { apiClient } from "../../util/api";
import { isActiveReport } from "../../util/telemetry";

export type Data = Awaited<ReturnType<typeof data>>;

export async function data(pageContext: PageContextServer) {
  const headers = pageContext.headers ?? undefined;
  const rawParam = pageContext.routeParams?.municipality ?? "";

  const { target, all } = await apiClient.findMunicipalityByParam(
    rawParam,
    headers,
  );

  if (!target) {
    throw render(404, "Општината не е пронајдена.");
  }

  const [mapReports, activeEvents] = await Promise.all([
    apiClient.getMapTelemetryReports(headers).catch(() => []),
    apiClient.getActiveEvents(headers).catch(() => []),
  ]);

  const muniReports = mapReports.filter(
    (r) =>
      isActiveReport(r) &&
      apiClient.resolveReportMunicipalityCode(r, all) === target.code,
  );

  return {
    municipality: target,
    municipalities: all,
    mapReports,
    activeEvents,
    initialFeed: {
      data: muniReports,
      meta: { nextCursor: null, hasNextPage: false },
    },
  };
}
