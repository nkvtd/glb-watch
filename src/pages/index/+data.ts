import type { PageContextServer } from "vike/types";
import { apiClient } from "../../util/api";

export type Data = Awaited<ReturnType<typeof data>>;

export async function data(pageContext: PageContextServer) {
  const headers = pageContext.headers ?? undefined;

  try {
    const [municipalities, mapReports, activeEvents] = await Promise.all([
      apiClient.getPrecomputedMunicipalities(headers),
      apiClient.getMapTelemetryReports(headers),
      apiClient.getActiveEvents(headers),
    ]);

    return {
      municipalities,
      mapReports,
      activeEvents,
      ssrError: null as string | null,
    };
  } catch (error) {
    return {
      municipalities: await apiClient
        .getPrecomputedMunicipalities(headers)
        .catch(() => []),
      mapReports: [],
      activeEvents: [],
      ssrError:
        error instanceof Error
          ? error.message
          : "Неуспешно поврзување со glb API.",
    };
  }
}
