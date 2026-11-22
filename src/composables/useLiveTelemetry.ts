import { onMounted, onUnmounted, ref } from "vue";
import { apiClient } from "../util/api";
import type { EventDto, ReportDto } from "../util/types";

export function useLiveTelemetry(
  initialReports: ReportDto[],
  initialEvents: EventDto[],
  intervalMs = 60_000,
) {
  const mapReports = ref<ReportDto[]>(initialReports);
  const activeEvents = ref<EventDto[]>(initialEvents);
  const lastUpdatedAt = ref<Date | null>(null);
  const refreshing = ref(false);
  let timer: ReturnType<typeof setInterval> | null = null;

  async function refreshNow(force = false) {
    refreshing.value = true;
    try {
      const [reports, events] = await Promise.all([
        apiClient.getMapTelemetryReports(undefined, force),
        apiClient.getActiveEvents(undefined, force),
      ]);
      mapReports.value = reports;
      activeEvents.value = events;
      lastUpdatedAt.value = new Date();
    } catch {
      // Keep existing state on transient network errors
    } finally {
      refreshing.value = false;
    }
  }

  function onVisibilityChange() {
    if (
      typeof document !== "undefined" &&
      document.visibilityState === "visible"
    ) {
      refreshNow();
    }
  }

  onMounted(() => {
    lastUpdatedAt.value = new Date();
    timer = setInterval(refreshNow, intervalMs);
    document.addEventListener("visibilitychange", onVisibilityChange);
  });

  onUnmounted(() => {
    if (timer) clearInterval(timer);
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    }
  });

  return {
    mapReports,
    activeEvents,
    lastUpdatedAt,
    refreshing,
    refreshNow,
  };
}
