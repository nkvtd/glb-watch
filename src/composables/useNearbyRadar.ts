import { ref } from "vue";
import { fetchFromGlb } from "../util/api";
import type {
  Coordinates,
  MunicipalityDto,
  PaginatedResponse,
  ReportDto,
} from "../util/types";

export function useNearbyRadar(onMunicipalityDetected: (code: string) => void) {
  const active = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const coords = ref<Coordinates | null>(null);
  const radiusMeters = ref(2500);
  const municipality = ref<MunicipalityDto | null>(null);
  const reports = ref<ReportDto[]>([]);

  function clampRadius(val: number): number {
    if (!Number.isFinite(val)) return 2500;
    return Math.max(50, Math.min(50_000, Math.round(val)));
  }

  async function fetchSpatialData() {
    if (!coords.value) return;
    const { lat, lng } = coords.value;
    const safeRadius = clampRadius(radiusMeters.value);
    radiusMeters.value = safeRadius;
    loading.value = true;
    error.value = null;

    try {
      if (!municipality.value) {
        const [muniRes, repRes] = await Promise.all([
          fetchFromGlb<PaginatedResponse<MunicipalityDto>>(
            `/municipalities?lat=${lat}&lng=${lng}&includeBoundary=false`,
          ),
          fetchFromGlb<PaginatedResponse<ReportDto>>(
            `/reports?lat=${lat}&lng=${lng}&radius=${safeRadius}&status=ongoing&pageSize=50`,
          ),
        ]);
        municipality.value = muniRes.data[0] ?? null;
        reports.value = repRes.data;
        if (municipality.value) {
          onMunicipalityDetected(municipality.value.code);
        }
      } else {
        const repRes = await fetchFromGlb<PaginatedResponse<ReportDto>>(
          `/reports?lat=${lat}&lng=${lng}&radius=${safeRadius}&status=ongoing&pageSize=50`,
        );
        reports.value = repRes.data;
      }
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Грешка при пребарување во близина.";
    } finally {
      loading.value = false;
    }
  }

  function triggerLocate() {
    if (active.value && !loading.value) {
      closeRadar();
      return;
    }
    if (!("geolocation" in navigator)) {
      error.value = "Прелистувачот не поддржува геолокација.";
      active.value = true;
      return;
    }
    loading.value = true;
    error.value = null;
    active.value = true;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        coords.value = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        await fetchSpatialData();
      },
      () => {
        loading.value = false;
        error.value =
          "Пристапот до локација беше одбиен. Овозможете локација во прелистувачот.";
      },
      {
        enableHighAccuracy: false,
        timeout: 10_000,
        maximumAge: 60_000,
      },
    );
  }

  function closeRadar() {
    active.value = false;
    loading.value = false;
    error.value = null;
    coords.value = null;
    municipality.value = null;
    reports.value = [];
  }

  return {
    active,
    loading,
    error,
    coords,
    radiusMeters,
    municipality,
    reports,
    triggerLocate,
    fetchSpatialData,
    closeRadar,
  };
}
