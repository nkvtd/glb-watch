import type { PageContextServer } from "vike/types";
import {
  fetchActiveEvents,
  fetchFromGlb,
  fetchMapTelemetryReports,
  getPrecomputedMunicipalities,
} from "../../util/api";
import type { PaginatedResponse, ReportDto } from "../../util/types";

export type Data = Awaited<ReturnType<typeof data>>;

export async function data(pageContext: PageContextServer) {
  const headers = pageContext.headers ?? undefined;

  try {
    const [municipalities, mapReports, activeEvents, initialFeed] =
      await Promise.all([
        getPrecomputedMunicipalities(headers),
        fetchMapTelemetryReports(headers),
        fetchActiveEvents(headers),
        fetchFromGlb<PaginatedResponse<ReportDto>>(
          "/reports?status=ongoing,scheduled&pageSize=20&sortBy=startsAt&sortDirection=desc",
          headers,
        ),
      ]);

    return {
      municipalities,
      mapReports,
      activeEvents,
      initialFeed,
      ssrError: null as string | null,
    };
  } catch (error) {
    return {
      municipalities: [],
      mapReports: [],
      activeEvents: [],
      initialFeed: {
        data: [],
        meta: { nextCursor: null, hasNextPage: false },
      },
      ssrError:
        error instanceof Error
          ? error.message
          : "Неуспешно поврзување со glb API.",
    };
  }
}
