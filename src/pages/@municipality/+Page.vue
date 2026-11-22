<template>
    <div
        class="min-h-screen flex flex-col bg-slate-100 dark:bg-glb-950 text-slate-900 dark:text-slate-100"
        @click="handleGlobalClick"
    >
        <AppHeader
            :events="activeEvents"
            :municipalities="municipalities"
            :stats-by-municipality="statsByMunicipality"
            :last-updated-at="lastUpdatedAt"
            :refreshing="refreshing"
            @toggle-theme="toggleTheme"
            @refresh="refreshNow(true)"
        />

        <main class="max-w-7xl w-full mx-auto px-4 pt-3 space-y-5 flex-1">
            <div
                class="bg-white dark:bg-glb-900 border border-slate-300 dark:border-glb-800 flex flex-col"
            >
                <div
                    class="p-3 flex flex-wrap items-center justify-between gap-3"
                >
                    <div class="flex items-center gap-3">
                        <button
                            type="button"
                            :disabled="isSwitchingRoute"
                            class="px-2.5 py-1.5 text-xs font-mono font-bold uppercase bg-slate-100 dark:bg-glb-800 border border-slate-300 dark:border-glb-700 hover:border-glb-500 inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                            @click="switchRoute('/')"
                        >
                            <ArrowBackOutline class="w-3.5 h-3.5" />
                            <span>Сите општини</span>
                        </button>
                        <div>
                            <h1
                                class="text-base sm:text-lg font-bold uppercase tracking-wide"
                            >
                                Општина {{ municipality.nameMk }}
                            </h1>
                            <p class="text-xs font-mono text-slate-500">
                                {{ municipality.regionNameMk }} регион
                            </p>
                        </div>
                    </div>

                    <div class="flex items-center gap-3 font-mono text-xs">
                        <div
                            class="px-3 py-1.5 border border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/35 flex items-center gap-2"
                        >
                            <span
                                v-if="muniStats.ongoing > 0"
                                class="w-2 h-2 bg-rose-500 animate-pulse shrink-0"
                            ></span>
                            <span class="text-slate-600 dark:text-slate-300">
                                Во тек:
                            </span>
                            <span
                                class="text-sm font-bold text-rose-700 dark:text-rose-300"
                            >
                                {{ muniStats.ongoing }}
                            </span>
                        </div>
                        <div
                            class="px-3 py-1.5 border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 flex items-center gap-2"
                        >
                            <span class="text-slate-600 dark:text-slate-300">
                                Најавени:
                            </span>
                            <span
                                class="text-sm font-bold text-amber-700 dark:text-amber-300"
                            >
                                {{ muniStats.scheduled }}
                            </span>
                        </div>
                    </div>
                </div>

                <div
                    v-if="ambientAir || ambientInternet"
                    class="border-t border-slate-200 dark:border-glb-800 grid grid-cols-1"
                    :class="
                        ambientAir && ambientInternet
                            ? 'md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-glb-800'
                            : ''
                    "
                >
                    <div
                        v-if="ambientAir"
                        class="px-3 py-2.5 bg-slate-50/70 dark:bg-glb-950/60 font-mono text-[11px] flex flex-wrap items-center gap-x-2 gap-y-1.5"
                        :title="ambientAir.description"
                    >
                        <span
                            class="w-1.5 h-1.5 shrink-0"
                            :class="ambientAir.dot"
                        ></span>
                        <span
                            class="uppercase tracking-wider text-slate-500 dark:text-slate-400"
                        >
                            Воздух
                        </span>
                        <span class="font-bold" :class="ambientAir.text">
                            {{ ambientAir.status }}
                        </span>
                        <span
                            v-for="metric in ambientAir.metrics"
                            :key="metric"
                            class="px-1 py-0.5 border border-slate-300 dark:border-glb-700 bg-white dark:bg-glb-900 text-slate-700 dark:text-slate-300 tabular-nums"
                        >
                            {{ metric }}
                        </span>
                        <span
                            class="ml-auto text-[10px] uppercase text-slate-400 dark:text-slate-500"
                        >
                            {{ ambientAir.sourceLabel }}
                        </span>
                    </div>
                    <div
                        v-if="ambientInternet"
                        class="px-3 py-2.5 bg-slate-50/70 dark:bg-glb-950/60 font-mono text-[11px] flex flex-wrap items-center gap-x-2 gap-y-1.5"
                        :title="ambientInternet.description"
                    >
                        <span
                            class="w-1.5 h-1.5 shrink-0"
                            :class="ambientInternet.dot"
                        ></span>
                        <span
                            class="uppercase tracking-wider text-slate-500 dark:text-slate-400"
                        >
                            Интернет
                        </span>
                        <span class="font-bold" :class="ambientInternet.text">
                            {{ ambientInternet.status }}
                        </span>
                        <span
                            v-if="ambientInternet.pctValue !== null"
                            class="text-slate-700 dark:text-slate-300 tabular-nums"
                        >
                            {{ ambientInternet.pctLabel }}
                            {{ ambientInternet.phrase }}
                        </span>
                        <span
                            v-if="ambientInternet.pctValue !== null"
                            class="w-20 h-1.5 shrink-0 bg-slate-200 dark:bg-glb-800"
                        >
                            <span
                                class="block h-full"
                                :class="ambientInternet.barTone"
                                :style="{
                                    width: `${ambientInternet.pctValue}%`,
                                }"
                            ></span>
                        </span>
                        <span
                            class="ml-auto text-[10px] uppercase text-slate-400 dark:text-slate-500"
                        >
                            {{ ambientInternet.sourceLabel }}
                        </span>
                    </div>
                </div>
            </div>

            <section
                id="map-anchor"
                class="grid grid-cols-1 lg:grid-cols-12 gap-4 scroll-mt-16"
            >
                <div class="lg:col-span-8 lg:h-110 flex flex-col">
                    <ChoroplethMap
                        :municipalities="municipalities"
                        :stats-by-municipality="statsByMunicipality"
                        :map-reports="muniMapReports"
                        :focused-municipality-code="municipality.code"
                        :show-pins="true"
                        :now-ms="lastUpdatedAt?.getTime() ?? 0"
                        @select-report="onSelectReportPin"
                    />
                </div>

                <div
                    class="lg:col-span-4 bg-white dark:bg-glb-900 border border-slate-300 dark:border-glb-800 flex flex-col lg:h-110 overflow-hidden"
                >
                    <div
                        class="px-3 py-2.5 border-b border-slate-300 dark:border-glb-800 bg-slate-50 dark:bg-glb-950 flex items-center justify-between gap-2 shrink-0"
                    >
                        <h2
                            class="text-xs font-bold uppercase tracking-wider truncate"
                        >
                            Општини во {{ municipality.regionNameMk }} регион
                        </h2>
                        <span
                            class="text-[11px] font-mono text-slate-500 shrink-0"
                        >
                            Во тек / Нај.
                        </span>
                    </div>

                    <div
                        class="divide-y divide-slate-200 dark:divide-glb-800 overflow-y-auto max-h-44 sm:max-h-56 lg:max-h-none lg:flex-1"
                    >
                        <button
                            v-for="peer in regionalPeers"
                            :key="peer.m.code"
                            type="button"
                            :disabled="
                                isSwitchingRoute ||
                                peer.m.code === municipality.code
                            "
                            class="w-full px-3 py-2 flex items-center justify-between text-xs text-left transition-colors cursor-pointer disabled:cursor-default"
                            :class="
                                peer.m.code === municipality.code
                                    ? 'bg-glb-500/20 font-bold border-l-4 border-l-glb-500'
                                    : 'hover:bg-slate-100 dark:hover:bg-glb-800/60'
                            "
                            @click="switchRoute(`/${peer.m.slug}`)"
                        >
                            <span class="truncate">{{ peer.m.nameMk }}</span>
                            <div
                                class="flex items-center gap-1.5 font-mono shrink-0"
                            >
                                <span
                                    v-if="peer.stats.ongoing > 0"
                                    class="px-1.5 py-0.5"
                                    :class="COUNT_BADGE_ONGOING"
                                >
                                    {{ peer.stats.ongoing }}
                                </span>
                                <span
                                    v-if="peer.stats.scheduled > 0"
                                    class="px-1.5 py-0.5"
                                    :class="COUNT_BADGE_SCHEDULED"
                                >
                                    {{ peer.stats.scheduled }}
                                </span>
                                <span
                                    v-if="
                                        peer.stats.ongoing === 0 &&
                                        peer.stats.scheduled === 0
                                    "
                                    class="px-1"
                                    :class="COUNT_ZERO"
                                >
                                    —
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            </section>

            <ReportsExplorer
                data-muni-interactive
                :items="displayedFeedItems"
                :has-next-page="feed.hasNextPage.value"
                :loading="feed.loading.value"
                :status-filter="feed.statusFilter.value"
                :search-query="feed.searchQuery.value"
                :source-filter="feed.sourceFilter.value"
                :sort-option="feed.sortOption.value"
                :category-filter="feed.categoryFilter.value"
                :highlighted-id="highlightedReportId"
                @update:status-filter="onUpdateStatus"
                @update:search-query="onUpdateSearch"
                @update:source-filter="onUpdateSource"
                @update:sort-option="onUpdateSort"
                @update:category-filter="onSelectCategory"
                @load-more="feed.loadMore"
            />
        </main>

        <AppFooter />
    </div>
</template>

<script setup lang="ts">
import { ArrowBackOutline } from "@vicons/ionicons5";
import { navigate } from "vike/client/router";
import { useData } from "vike-vue/useData";
import { computed, nextTick, ref, watch } from "vue";
import AppFooter from "../../components/AppFooter.vue";
import AppHeader from "../../components/AppHeader.vue";
import ChoroplethMap from "../../components/ChoroplethMap.vue";
import ReportsExplorer from "../../components/ReportsExplorer.vue";
import { useLiveTelemetry } from "../../composables/useLiveTelemetry";
import { useReportsFeed } from "../../composables/useReportsFeed";
import { useTheme } from "../../composables/useTheme";
import { apiClient } from "../../util/api";
import {
  COUNT_BADGE_ONGOING,
  COUNT_BADGE_SCHEDULED,
  COUNT_ZERO,
  createEmptyBreakdown,
  SOURCE_LABELS,
} from "../../util/constants";
import {
  parseAmbientAirDetails,
  parseAmbientInternetDetails,
} from "../../util/formatters";
import {
  aggregateStatsByMunicipality,
  compareMunicipalityRows,
} from "../../util/telemetry";
import type {
  CategoryBreakdown,
  ReportCategory,
  ReportDto,
} from "../../util/types";
import type { Data } from "./+data";

const ssrData = useData<Data>();

const municipality = computed(() => ssrData.municipality);
const municipalities = computed(() => ssrData.municipalities);
const { mapReports, activeEvents, lastUpdatedAt, refreshing, refreshNow } =
  useLiveTelemetry(ssrData.mapReports, ssrData.activeEvents);

const isSwitchingRoute = ref(false);
const highlightedReportId = ref<number | null>(null);
const feed = useReportsFeed(ssrData.initialFeed, ssrData.municipality.code);
const { toggleTheme } = useTheme();

async function switchRoute(url: string) {
  if (isSwitchingRoute.value) return;
  isSwitchingRoute.value = true;
  try {
    await navigate(url);
  } finally {
    isSwitchingRoute.value = false;
  }
}

watch(
  () => ssrData.municipality.code,
  (newCode) => {
    isSwitchingRoute.value = false;
    feed.municipalityFilter.value = newCode;
    highlightedReportId.value = null;
    if (
      feed.statusFilter.value !== "ongoing,scheduled" ||
      feed.categoryFilter.value !== "all" ||
      feed.sourceFilter.value !== "" ||
      feed.searchQuery.value !== "" ||
      feed.sortOption.value !== "startsAt:desc"
    ) {
      feed.refreshFeed();
    } else {
      feed.resetFeed(ssrData.initialFeed);
    }
  },
);

function handleGlobalClick(e: MouseEvent) {
  if (highlightedReportId.value === null) return;
  const target = e.target as HTMLElement | null;
  if (!target) return;
  if (!target.closest("[data-muni-interactive]")) {
    highlightedReportId.value = null;
  }
}

const statsByMunicipality = computed<Record<string, CategoryBreakdown>>(() =>
  aggregateStatsByMunicipality(mapReports.value, municipalities.value, "all"),
);

const muniStats = computed(
  () =>
    statsByMunicipality.value[municipality.value.code] ??
    createEmptyBreakdown(),
);

const muniMapReports = computed(() =>
  mapReports.value.filter(
    (r) =>
      apiClient.resolveReportMunicipalityCode(r, municipalities.value) ===
      municipality.value.code,
  ),
);

const AIR_TONES: Record<string, { dot: string; text: string }> = {
  Добар: {
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  Прифатлив: {
    dot: "bg-teal-500",
    text: "text-teal-700 dark:text-teal-300",
  },
  Умерен: { dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-300" },
  Лош: { dot: "bg-rose-500", text: "text-rose-700 dark:text-rose-300" },
  "Многу лош": {
    dot: "bg-rose-600",
    text: "text-rose-800 dark:text-rose-200",
  },
  "Екстремно лош": {
    dot: "bg-rose-800",
    text: "text-rose-900 dark:text-rose-100",
  },
};

function latestMuniReport(
  category: ReportCategory,
  source?: string,
): ReportDto | null {
  const code = municipality.value.code;
  const matches = (r: ReportDto, src?: string) =>
    r.category === category &&
    Boolean(r.startsAt) &&
    apiClient.resolveReportMunicipalityCode(r, municipalities.value) === code &&
    (!src || r.source === src);
  const rows = mapReports.value.filter((r) => matches(r, source));
  const pool =
    source && rows.length === 0
      ? mapReports.value.filter((r) => matches(r))
      : rows;
  return (
    pool.sort((a, b) =>
      (b.startsAt ?? "").localeCompare(a.startsAt ?? ""),
    )[0] ?? null
  );
}

const ambientAir = computed(() => {
  const rep = latestMuniReport("air_quality");
  if (!rep) return null;
  const details = parseAmbientAirDetails(rep);
  const status = details.status ?? "Непознато";
  const metrics = [
    details.aqi !== null ? `Индекс ${details.aqi}` : null,
    details.pm10 ? `PM10 ${details.pm10} µg/m³` : null,
    details.pm25 ? `PM2.5 ${details.pm25} µg/m³` : null,
    details.temperature ? `${details.temperature} °C` : null,
    details.humidity ? `${details.humidity} влажност` : null,
  ].filter((metric): metric is string => metric !== null);

  return {
    status,
    ...(AIR_TONES[status] ?? {
      dot: "bg-slate-400",
      text: "text-slate-600 dark:text-slate-300",
    }),
    metrics,
    sourceLabel: SOURCE_LABELS[rep.source] ?? rep.source,
    description: rep.description ?? rep.title,
  };
});

const ambientInternet = computed(() => {
  const rep = latestMuniReport("internet", "ioda-regions");
  if (!rep) return null;
  const details = parseAmbientInternetDetails(rep);
  const { pctValue } = details;

  return {
    ...details,
    dot:
      details.status === "Нормален"
        ? "bg-teal-500"
        : details.status === "Отежнат"
          ? "bg-amber-500"
          : "bg-rose-500",
    text:
      details.status === "Нормален"
        ? "text-teal-700 dark:text-teal-300"
        : details.status === "Отежнат"
          ? "text-amber-700 dark:text-amber-300"
          : "text-rose-700 dark:text-rose-300",
    barTone:
      pctValue === null
        ? "bg-slate-400"
        : pctValue >= 90
          ? "bg-emerald-500"
          : pctValue >= 75
            ? "bg-amber-500"
            : "bg-rose-500",
    sourceLabel: SOURCE_LABELS[rep.source] ?? rep.source,
    description: rep.description ?? rep.title,
  };
});

const regionalPeers = computed(() =>
  municipalities.value
    .filter((m) => m.regionCode === municipality.value.regionCode)
    .map((m) => ({
      m,
      stats: statsByMunicipality.value[m.code] ?? createEmptyBreakdown(),
    }))
    .sort(compareMunicipalityRows),
);

const displayedFeedItems = computed(() => {
  const existingIds = new Set(feed.items.value.map((r) => r.id));
  const allowedStatuses = new Set(feed.statusFilter.value.split(","));
  const q = feed.searchQuery.value.trim().toLowerCase();

  const fallbackMatches = muniMapReports.value.filter((r) => {
    if (existingIds.has(r.id)) return false;
    if (
      feed.categoryFilter.value !== "all" &&
      r.category !== feed.categoryFilter.value
    ) {
      return false;
    }
    if (!allowedStatuses.has(r.status)) return false;
    if (feed.sourceFilter.value && r.source !== feed.sourceFilter.value) {
      return false;
    }
    if (q) {
      const text =
        `${r.title} ${r.description ?? ""} ${r.locationLabel ?? ""}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  return [...fallbackMatches, ...feed.items.value];
});

function onSelectCategory(cat: ReportCategory | "all") {
  feed.categoryFilter.value = cat;
  feed.refreshFeed();
}

function onUpdateStatus(status: string) {
  feed.statusFilter.value = status;
  feed.refreshFeed();
}

function onUpdateSearch(q: string) {
  feed.searchQuery.value = q;
  feed.debouncedRefresh();
}

function onUpdateSource(src: string) {
  feed.sourceFilter.value = src;
  feed.refreshFeed();
}

function onUpdateSort(
  opt: "startsAt:desc" | "startsAt:asc" | "observedAt:desc",
) {
  feed.sortOption.value = opt;
  feed.refreshFeed();
}

async function onSelectReportPin(rep: ReportDto) {
  highlightedReportId.value = rep.id;
  if (
    rep.status === "omitted" &&
    !feed.statusFilter.value.includes("omitted")
  ) {
    feed.statusFilter.value = "omitted";
    await feed.refreshFeed();
  } else if (
    rep.status === "ended" &&
    !feed.statusFilter.value.includes("ended")
  ) {
    feed.statusFilter.value = "ended";
    await feed.refreshFeed();
  }
  await nextTick();
  document
    .getElementById(`report-${rep.id}`)
    ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
</script>
