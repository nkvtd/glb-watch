import type { PageContextServer } from "vike/types";
import { apiClient } from "../../util/api";

export type Data = Awaited<ReturnType<typeof data>>;

export async function data(pageContext: PageContextServer) {
  const headers = pageContext.headers ?? undefined;
  const [municipalities, mapReports, activeEvents] = await Promise.all([
    apiClient.getPrecomputedMunicipalities(headers).catch(() => []),
    apiClient.getMapTelemetryReports(headers).catch(() => []),
    apiClient.getActiveEvents(headers).catch(() => []),
  ]);

  return { municipalities, mapReports, activeEvents };
}
