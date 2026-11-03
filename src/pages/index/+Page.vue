<template>
    <div
        class="min-h-screen flex flex-col bg-slate-100 dark:bg-glb-950 text-slate-900 dark:text-slate-100"
        @click="handleGlobalClick"
    >
        <AppHeader
            :events="activeEvents"
            :is-dark="isDark"
            @reset="resetAll"
            @toggle-theme="toggleTheme"
        />

        <main class="max-w-7xl w-full mx-auto px-4 pt-3 space-y-6 flex-1">
            <div
                class="flex flex-col gap-3 lg:h-[calc(100vh-4.75rem)] lg:min-h-170 pb-2"
            >
                <CategoryBar
                    data-muni-interactive
                    class="shrink-0"
                    :selected="feed.categoryFilter.value"
                    :counts="nationalCategoryCounts"
                    :total-count="totalActiveIncidentCount"
                    @select="onSelectCategory"
                />

                <div
                    data-muni-interactive
                    class="grid transition-[grid-template-rows,opacity] duration-300 ease-out shrink-0"
                    :class="
                        radar.active.value
                            ? 'grid-rows-[1fr] opacity-100'
                            : 'grid-rows-[0fr] opacity-0 pointer-events-none'
                    "
                >
                    <div class="overflow-hidden">
                        <NearbyRadarPanel
                            v-model="radar.radiusMeters.value"
                            :coords="radar.coords.value"
                            :municipality="radar.municipality.value"
                            :reports="radar.reports.value"
                            :loading="radar.loading.value"
                            :error="radar.error.value"
                            @refresh="radar.fetchSpatialData"
                            @close="radar.closeRadar"
                        />
                    </div>
                </div>

                <section
                    id="map-anchor"
                    class="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:items-stretch flex-1 min-h-0 scroll-mt-16"
                >
                    <div class="lg:col-span-7 lg:order-2 flex flex-col min-h-0">
                        <ChoroplethMap
                            :municipalities="municipalities"
                            :stats-by-municipality="statsByMunicipality"
                            :map-reports="filteredMapReports"
                            :selected-municipality-code="feed.municipalityFilter.value"
                            :selected-category="feed.categoryFilter.value"
                            :nearby-center="radar.coords.value"
                            :nearby-radius-meters="radar.radiusMeters.value"
                            :is-dark="isDark"
                            @select-municipality="onSelectMunicipality"
                            @select-report="onSelectReportPin"
                        />
                    </div>

                    <div class="lg:col-span-5 lg:order-1 flex flex-col gap-3 min-h-0">
                        <div
                            class="grid grid-cols-2 border border-slate-300 dark:border-glb-800 bg-white dark:bg-glb-900 divide-x divide-slate-300 dark:divide-glb-800 shrink-0"
                        >
                            <div class="p-3.5 border-t-4 border-t-red-600">
                                <div
                                    class="text-xs font-mono uppercase text-slate-500 dark:text-slate-400"
                                >
                                    Во тек
                                </div>
                                <div
                                    class="mt-0.5 text-3xl font-mono font-bold text-red-600 dark:text-red-500"
                                >
                                    {{ ongoingNationalCount }}
                                </div>
                            </div>
                            <div class="p-3.5 border-t-4 border-t-amber-300">
                                <div
                                    class="text-xs font-mono uppercase text-slate-500 dark:text-slate-400"
                                >
                                    Најавени
                                </div>
                                <div
                                    class="mt-0.5 text-3xl font-mono font-bold text-amber-500 dark:text-amber-300"
                                >
                                    {{ scheduledNationalCount }}
                                </div>
                            </div>
                        </div>

                        <div
                            data-muni-interactive
                            class="bg-white dark:bg-glb-900 border border-slate-300 dark:border-glb-800 flex-1 flex flex-col justify-between min-h-0"
                        >
                            <div class="flex flex-col flex-1 min-h-0">
                                <div
                                    class="px-3 py-2 border-b border-slate-300 dark:border-glb-800 flex items-center justify-between shrink-0"
                                >
                                    <h2
                                        class="text-xs font-bold uppercase tracking-wider"
                                    >
                                        Најпогодени општини
                                    </h2>
                                    <span class="text-[11px] font-mono text-slate-500">
                                        Во тек / Најавени
                                    </span>
                                </div>

                                <div
                                    class="p-2 border-b border-slate-200 dark:border-glb-800 relative shrink-0"
                                >
                                    <SearchOutline
                                        class="w-3.5 h-3.5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2"
                                    />
                                    <input
                                        v-model="leaderboardSearch"
                                        type="text"
                                        placeholder="Филтрирај општина..."
                                        class="w-full pl-8 pr-2 py-1 text-xs font-mono bg-slate-50 dark:bg-glb-950 border border-slate-300 dark:border-glb-700 focus:outline-none focus:border-glb-500"
                                    />
                                </div>

                                <div
                                    class="divide-y divide-slate-200 dark:divide-glb-800 overflow-y-auto flex-1 max-h-85 lg:max-h-none"
                                >
                                    <button
                                        v-for="(item, idx) in topMunicipalities"
                                        :key="item.m.code"
                                        type="button"
                                        class="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-glb-800/60 cursor-pointer transition-colors"
                                        :class="
                                            feed.municipalityFilter.value === item.m.code
                                                ? 'bg-glb-500/20 font-bold border-l-4 border-l-glb-500'
                                                : ''
                                        "
                                        @click="toggleLeaderboardMunicipality(item.m.code)"
                                    >
                                        <div class="flex items-center gap-2 min-w-0">
                                            <span
                                                class="text-xs font-mono text-slate-400 w-5"
                                            >
                                                {{ idx + 1 }}.
                                            </span>
                                            <span class="text-xs font-bold truncate">
                                                {{ item.m.nameMk }}
                                            </span>
                                        </div>
                                        <div
                                            class="flex items-center gap-1.5 font-mono text-xs shrink-0"
                                        >
                                            <span
                                                v-if="item.stats.ongoing > 0"
                                                class="px-1.5 py-0.5 bg-red-600 text-white font-bold"
                                                title="Во тек"
                                            >
                                                {{ item.stats.ongoing }}
                                            </span>
                                            <span
                                                v-if="item.stats.scheduled > 0"
                                                class="px-1.5 py-0.5 bg-amber-300 text-slate-950 font-bold"
                                                title="Најавени"
                                            >
                                                {{ item.stats.scheduled }}
                                            </span>
                                            <span
                                                v-if="
                                                    item.stats.ongoing === 0 &&
                                                    item.stats.scheduled === 0
                                                "
                                                class="px-1.5 py-0.5 text-slate-400"
                                            >
                                                0
                                            </span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div
                                class="border-t border-slate-300 dark:border-glb-800 bg-slate-50 dark:bg-glb-950 p-2.5 flex flex-col gap-2 shrink-0"
                            >
                                <button
                                    type="button"
                                    class="text-xs font-mono font-bold uppercase tracking-wider text-glb-600 dark:text-glb-400 hover:underline text-center py-0.5 cursor-pointer"
                                    @click="scrollToAllMunicipalities"
                                >
                                    Прикажи ги сите
                                </button>

                                <button
                                    type="button"
                                    class="w-full py-2.5 px-4 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                                    :class="
                                        radar.active.value
                                            ? 'bg-glb-700 text-white'
                                            : 'bg-glb-500 hover:bg-glb-600 text-white'
                                    "
                                    @click="radar.triggerLocate"
                                >
                                    <span
                                        class="relative flex items-center justify-center w-4 h-4"
                                    >
                                        <span
                                            class="absolute inset-0 border border-current opacity-75"
                                            :class="
                                                radar.active.value || radar.loading.value
                                                    ? 'animate-ping'
                                                    : ''
                                            "
                                        ></span>
                                        <LocateOutline
                                            class="w-4 h-4 relative"
                                            :class="
                                                radar.loading.value ? 'animate-spin' : ''
                                            "
                                        />
                                    </span>
                                    <span>
                                        {{
                                            radar.loading.value
                                                ? "Лоцирање во тек..."
                                                : radar.active.value
                                                  ? "Затвори локален радар"
                                                  : "Настани во моја близина"
                                        }}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            <MunicipalitySection
                :municipalities="municipalities"
                :stats-by-municipality="statsByMunicipality"
                :selected-municipality-code="feed.municipalityFilter.value"
                @select-municipality="onSelectMunicipality"
            />

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
                @jump-to-map="jumpToMapFromReport"
                @load-more="feed.loadMore"
            />
        </main>

        <AppFooter />
    </div>
</template>

<script setup lang="ts">
import { LocateOutline, SearchOutline } from "@vicons/ionicons5";
import { useData } from "vike-vue/useData";
import { computed, onMounted, ref } from "vue";
import AppFooter from "../../components/AppFooter.vue";
import AppHeader from "../../components/AppHeader.vue";
import CategoryBar from "../../components/CategoryBar.vue";
import ChoroplethMap from "../../components/ChoroplethMap.vue";
import MunicipalitySection from "../../components/MunicipalitySection.vue";
import NearbyRadarPanel from "../../components/NearbyRadarPanel.vue";
import ReportsExplorer from "../../components/ReportsExplorer.vue";
import { useNearbyRadar } from "../../composables/useNearbyRadar";
import { useReportsFeed } from "../../composables/useReportsFeed";
import { resolveReportMunicipalityCode } from "../../util/api";
import { createEmptyBreakdown } from "../../util/constants";
import type {
  CategoryBreakdown,
  ReportCategory,
  ReportDto,
} from "../../util/types";
import type { Data } from "./+data";

const ssrData = useData<Data>();

const municipalities = ref(ssrData.municipalities);
const mapReports = ref<ReportDto[]>(ssrData.mapReports);
const activeEvents = ref(ssrData.activeEvents);

const isDark = ref(true);
const leaderboardSearch = ref("");
const highlightedReportId = ref<number | null>(null);

const feed = useReportsFeed(ssrData.initialFeed);
const radar = useNearbyRadar((code) => {
  feed.municipalityFilter.value = code;
  feed.refreshFeed();
});

function toggleTheme() {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle("dark", isDark.value);
  localStorage.setItem("glb-theme", isDark.value ? "dark" : "light");
}

function handleGlobalClick(e: MouseEvent) {
  if (!feed.municipalityFilter.value) return;
  const target = e.target as HTMLElement | null;
  if (!target) return;
  if (!target.closest("[data-muni-interactive]")) {
    onSelectMunicipality(null);
  }
}

function scrollToAllMunicipalities() {
  document.getElementById("municipalities-section")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

const nationalCategoryCounts = computed(() => {
  const counts: Record<string, number> = {};
  for (const r of mapReports.value) {
    if (r.status === "ongoing" || r.status === "scheduled") {
      counts[r.category] = (counts[r.category] || 0) + 1;
    }
  }
  return counts;
});

const totalActiveIncidentCount = computed(
  () =>
    mapReports.value.filter(
      (r) => r.status === "ongoing" || r.status === "scheduled",
    ).length,
);

const filteredMapReports = computed(() =>
  feed.categoryFilter.value === "all"
    ? mapReports.value
    : mapReports.value.filter((r) => r.category === feed.categoryFilter.value),
);

const statsByMunicipality = computed<Record<string, CategoryBreakdown>>(() => {
  const map: Record<string, CategoryBreakdown> = {};
  for (const r of filteredMapReports.value) {
    const code = resolveReportMunicipalityCode(r, municipalities.value);
    if (!code) continue;

    let entry = map[code];
    if (!entry) {
      entry = createEmptyBreakdown();
      map[code] = entry;
    }
    if (r.status === "ongoing") {
      entry.ongoing += 1;
      entry.byCategory[r.category].ongoing += 1;
    } else if (r.status === "scheduled") {
      entry.scheduled += 1;
      entry.byCategory[r.category].scheduled += 1;
    } else if (r.status === "omitted") {
      entry.omitted += 1;
      entry.byCategory[r.category].omitted += 1;
    }
  }
  return map;
});

const ongoingNationalCount = computed(
  () => filteredMapReports.value.filter((r) => r.status === "ongoing").length,
);
const scheduledNationalCount = computed(
  () => filteredMapReports.value.filter((r) => r.status === "scheduled").length,
);

const topMunicipalities = computed(() => {
  const q = leaderboardSearch.value.trim().toLowerCase();
  return municipalities.value
    .filter((m) => !q || m.nameMk.toLowerCase().includes(q))
    .map((m) => ({
      m,
      stats: statsByMunicipality.value[m.code] ?? createEmptyBreakdown(),
    }))
    .sort(
      (a, b) =>
        b.stats.ongoing - a.stats.ongoing ||
        b.stats.scheduled - a.stats.scheduled ||
        a.m.nameMk.localeCompare(b.m.nameMk, "mk"),
    )
    .slice(0, 12);
});

const displayedFeedItems = computed(() => {
  const muniCode = feed.municipalityFilter.value;
  if (!muniCode) return feed.items.value;

  const existingIds = new Set(feed.items.value.map((r) => r.id));
  const allowedStatuses = new Set(feed.statusFilter.value.split(","));
  const q = feed.searchQuery.value.trim().toLowerCase();

  const fallbackMatches = filteredMapReports.value.filter((r) => {
    if (existingIds.has(r.id)) return false;
    if (!allowedStatuses.has(r.status)) return false;
    if (feed.sourceFilter.value && r.source !== feed.sourceFilter.value) {
      return false;
    }
    const resolved = resolveReportMunicipalityCode(r, municipalities.value);
    if (resolved !== muniCode) return false;
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

function onSelectMunicipality(code: string | null) {
  feed.municipalityFilter.value = code;
  feed.refreshFeed();
}

function toggleLeaderboardMunicipality(code: string) {
  onSelectMunicipality(feed.municipalityFilter.value === code ? null : code);
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
  const code = resolveReportMunicipalityCode(rep, municipalities.value);
  const el = document.getElementById(`report-${rep.id}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "nearest" });
  } else {
    if (rep.status === "omitted") {
      feed.statusFilter.value = "ongoing,omitted";
    }
    onSelectMunicipality(code);
  }
}

function jumpToMapFromReport(rep: ReportDto) {
  highlightedReportId.value = rep.id;
  const code = resolveReportMunicipalityCode(rep, municipalities.value);
  onSelectMunicipality(code);
  document.getElementById("map-anchor")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function resetAll() {
  feed.categoryFilter.value = "all";
  feed.municipalityFilter.value = null;
  feed.sourceFilter.value = "";
  feed.searchQuery.value = "";
  feed.statusFilter.value = "ongoing,scheduled";
  radar.closeRadar();
  feed.refreshFeed();
}

onMounted(() => {
  isDark.value = document.documentElement.classList.contains("dark");
});
</script>