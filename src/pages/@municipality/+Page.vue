<template>
    <div
        class="min-h-screen flex flex-col bg-slate-100 dark:bg-glb-950 text-slate-900 dark:text-slate-100"
        @click="handleGlobalClick"
    >
        <AppHeader
            :events="activeEvents"
            @toggle-theme="toggleTheme"
        />

        <main class="max-w-7xl w-full mx-auto px-4 pt-3 space-y-5 flex-1">
            <div
                class="bg-white dark:bg-glb-900 border border-slate-300 dark:border-glb-800 p-3 flex flex-wrap items-center justify-between gap-3"
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
                        class="px-3 py-1.5 border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 flex items-center gap-2"
                    >
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
                        class="px-3 py-1.5 border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 flex items-center gap-2"
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

            <CategoryBar
                :selected="feed.categoryFilter.value"
                :counts="muniCategoryCounts"
                :total-count="muniStats.ongoing + muniStats.scheduled"
                @select="onSelectCategory"
            />

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
                                    class="px-1.5 py-0.5 bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950/70 dark:text-rose-200 dark:border-rose-800 font-bold"
                                >
                                    {{ peer.stats.ongoing }}
                                </span>
                                <span
                                    v-if="peer.stats.scheduled > 0"
                                    class="px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/65 dark:text-amber-200 dark:border-amber-800 font-bold"
                                >
                                    {{ peer.stats.scheduled }}
                                </span>
                                <span
                                    v-if="
                                        peer.stats.ongoing === 0 &&
                                        peer.stats.scheduled === 0
                                    "
                                    class="text-slate-400 px-1"
                                >
                                    0
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
                :highlighted-id="highlightedReportId"
                @update:status-filter="onUpdateStatus"
                @update:search-query="onUpdateSearch"
                @update:source-filter="onUpdateSource"
                @update:sort-option="onUpdateSort"
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
import { computed, ref, watch } from "vue";
import AppFooter from "../../components/AppFooter.vue";
import AppHeader from "../../components/AppHeader.vue";
import CategoryBar from "../../components/CategoryBar.vue";
import ChoroplethMap from "../../components/ChoroplethMap.vue";
import ReportsExplorer from "../../components/ReportsExplorer.vue";
import { useLiveTelemetry } from "../../composables/useLiveTelemetry";
import { useReportsFeed } from "../../composables/useReportsFeed";
import { useTheme } from "../../composables/useTheme";
import { apiClient } from "../../util/api";
import { createEmptyBreakdown } from "../../util/constants";
import type {
  CategoryBreakdown,
  ReportCategory,
  ReportDto,
} from "../../util/types";
import type { Data } from "./+data";

const ssrData = useData<Data>();

const municipality = computed(() => ssrData.municipality);
const municipalities = computed(() => ssrData.municipalities);
const { mapReports, activeEvents } = useLiveTelemetry(
  ssrData.mapReports,
  ssrData.activeEvents,
);

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

const statsByMunicipality = computed<Record<string, CategoryBreakdown>>(() => {
  const map: Record<string, CategoryBreakdown> = {};
  for (const r of mapReports.value) {
    if (
      feed.categoryFilter.value !== "all" &&
      r.category !== feed.categoryFilter.value
    ) {
      continue;
    }
    const code = apiClient.resolveReportMunicipalityCode(
      r,
      municipalities.value,
    );
    if (!code) continue;

    let entry = map[code];
    if (!entry) {
      entry = createEmptyBreakdown();
      map[code] = entry;
    }
    let catBucket = entry.byCategory[r.category];
    if (!catBucket) {
      catBucket = { ongoing: 0, scheduled: 0, omitted: 0 };
      entry.byCategory[r.category] = catBucket;
    }
    if (r.status === "ongoing") {
      entry.ongoing += 1;
      catBucket.ongoing += 1;
    } else if (r.status === "scheduled") {
      entry.scheduled += 1;
      catBucket.scheduled += 1;
    } else if (r.status === "omitted") {
      entry.omitted += 1;
      catBucket.omitted += 1;
    }
  }
  return map;
});

const muniStats = computed(
  () =>
    statsByMunicipality.value[municipality.value.code] ??
    createEmptyBreakdown(),
);

const muniCategoryCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const r of mapReports.value) {
    const code = apiClient.resolveReportMunicipalityCode(
      r,
      municipalities.value,
    );
    if (
      code === municipality.value.code &&
      (r.status === "ongoing" || r.status === "scheduled")
    ) {
      counts[r.category] = (counts[r.category] || 0) + 1;
    }
  }
  return counts;
});

const muniMapReports = computed(() =>
  mapReports.value.filter((r) => {
    if (
      feed.categoryFilter.value !== "all" &&
      r.category !== feed.categoryFilter.value
    ) {
      return false;
    }
    const code = apiClient.resolveReportMunicipalityCode(
      r,
      municipalities.value,
    );
    return code === municipality.value.code;
  }),
);

const regionalPeers = computed(() =>
  municipalities.value
    .filter((m) => m.regionCode === municipality.value.regionCode)
    .map((m) => ({
      m,
      stats: statsByMunicipality.value[m.code] ?? createEmptyBreakdown(),
    }))
    .sort(
      (a, b) =>
        b.stats.ongoing - a.stats.ongoing ||
        b.stats.scheduled - a.stats.scheduled ||
        a.m.nameMk.localeCompare(b.m.nameMk, "mk"),
    ),
);

const displayedFeedItems = computed(() => {
  const existingIds = new Set(feed.items.value.map((r) => r.id));
  const allowedStatuses = new Set(feed.statusFilter.value.split(","));
  const q = feed.searchQuery.value.trim().toLowerCase();

  const fallbackMatches = muniMapReports.value.filter((r) => {
    if (existingIds.has(r.id)) return false;
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

function onSelectReportPin(rep: ReportDto) {
  highlightedReportId.value = rep.id;
  if (
    rep.status === "omitted" &&
    !feed.statusFilter.value.includes("omitted")
  ) {
    feed.statusFilter.value = "ongoing,omitted";
    feed.refreshFeed();
  }
  setTimeout(() => {
    document
      .getElementById(`report-${rep.id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 80);
}
</script>
