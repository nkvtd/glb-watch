import { ref } from "vue";
import { apiClient } from "../util/api";
import { toMunicipalitySlug } from "../util/formatters";
import type { Coordinates, MunicipalityDto, ReportDto } from "../util/types";

export function useNearbyRadar() {
  const active = ref(false);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const coords = ref<Coordinates | null>(null);
  const radiusMeters = ref(2500);
  const municipality = ref<MunicipalityDto | null>(null);
  const municipalitySlug = ref<string | null>(null);
  const reports = ref<ReportDto[]>([]);
  let requestSeq = 0;

  function clampRadius(val: number): number {
    if (!Number.isFinite(val)) return 2500;
    return Math.max(50, Math.min(50_000, Math.round(val)));
  }

  async function fetchSpatialData() {
    if (!coords.value) return;
    const seq = ++requestSeq;
    const { lat, lng } = coords.value;
    const safeRadius = clampRadius(radiusMeters.value);
    radiusMeters.value = safeRadius;
    loading.value = true;
    error.value = null;

    try {
      if (!municipality.value) {
        const [muni, repRes] = await Promise.all([
          apiClient.getMunicipalityByCoords(lat, lng).catch(() => null),
          apiClient.getReportsPage({
            lat,
            lng,
            radius: safeRadius,
            status: "ongoing",
            pageSize: 50,
          }),
        ]);
        if (seq === requestSeq) {
          municipality.value = muni;
          municipalitySlug.value = muni
            ? toMunicipalitySlug(muni.nameEn, muni.code)
            : null;
          reports.value = repRes.data;
        }
      } else {
        const repRes = await apiClient.getReportsPage({
          lat,
          lng,
          radius: safeRadius,
          status: "ongoing",
          pageSize: 50,
        });
        if (seq === requestSeq) reports.value = repRes.data;
      }
    } catch (e) {
      if (seq === requestSeq) {
        error.value =
          e instanceof Error ? e.message : "Грешка при пребарување во близина.";
      }
    } finally {
      if (seq === requestSeq) loading.value = false;
    }
  }

  function triggerLocate() {
    if (!("geolocation" in navigator)) {
      error.value = "Прелистувачот не поддржува геолокација.";
      active.value = true;
      return;
    }
    loading.value = true;
    error.value = null;
    active.value = true;
    const locateSeq = ++requestSeq;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        if (locateSeq !== requestSeq || !active.value) return;
        coords.value = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        municipality.value = null;
        await fetchSpatialData();
      },
      () => {
        if (locateSeq !== requestSeq || !active.value) return;
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
    requestSeq++;
    active.value = false;
    loading.value = false;
    error.value = null;
    coords.value = null;
    municipality.value = null;
    municipalitySlug.value = null;
    reports.value = [];
  }

  return {
    active,
    loading,
    error,
    coords,
    radiusMeters,
    municipality,
    municipalitySlug,
    reports,
    triggerLocate,
    fetchSpatialData,
    closeRadar,
  };
}
