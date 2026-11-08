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

  try {
    const [mapReports, activeEvents] = await Promise.all([
      apiClient.getMapTelemetryReports(headers),
      apiClient.getActiveEvents(headers),
    ]);

    const muniReports = mapReports.filter(
      (r) =>
        (r.status === "ongoing" || r.status === "scheduled") &&
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
  } catch {
    return {
      municipality: target,
      municipalities: all,
      mapReports: [],
      activeEvents: [],
      initialFeed: {
        data: [],
        meta: { nextCursor: null, hasNextPage: false },
      },
    };
  }
}
