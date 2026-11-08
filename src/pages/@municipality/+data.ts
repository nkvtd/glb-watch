import { render } from "vike/abort";
import type { PageContextServer } from "vike/types";
import { apiClient } from "../../util/api";

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

  const [mapReports, activeEvents, initialFeed] = await Promise.all([
    apiClient.getMapTelemetryReports(headers),
    apiClient.getActiveEvents(headers),
    apiClient.getReportsPage(
      {
        municipalityCode: target.code,
        status: "ongoing,scheduled",
        pageSize: 20,
        sortBy: "startsAt",
        sortDirection: "desc",
      },
      headers,
    ),
  ]);

  return {
    municipality: target,
    municipalities: all,
    mapReports,
    activeEvents,
    initialFeed,
  };
}
