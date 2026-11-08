<template>
    <div
        class="min-h-screen flex flex-col bg-slate-100 dark:bg-glb-950 text-slate-900 dark:text-slate-100"
    >
        <AppHeader
            :events="activeEvents"
            :is-dark="isDark"
            @reset="resetHome"
            @toggle-theme="toggleTheme"
        />

        <main class="max-w-7xl w-full mx-auto px-4 pt-3 space-y-6 flex-1">
            <div
                class="flex flex-col gap-3 lg:h-[calc(100vh-4.75rem)] lg:min-h-165 pb-2"
            >
                <CategoryBar
                    class="shrink-0"
                    :selected="selectedCategory"
                    :counts="nationalCategoryCounts"
                    :total-count="totalActiveIncidentCount"
                    @select="selectedCategory = $event"
                />

                <section
                    class="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:items-stretch flex-1 min-h-0"
                >
                    <div class="lg:col-span-7 lg:order-2 flex flex-col min-h-0">
                        <ChoroplethMap
                            :municipalities="municipalities"
                            :stats-by-municipality="statsByMunicipality"
                            :nearby-center="radar.coords.value"
                            :nearby-radius-meters="radar.radiusMeters.value"
                            :show-pins="false"
                            :is-dark="isDark"
                        />
                    </div>

                    <div
                        class="lg:col-span-5 lg:order-1 flex flex-col gap-3 min-h-0"
                    >
                        <div
                            class="grid grid-cols-2 border border-slate-300 dark:border-glb-800 bg-white dark:bg-glb-900 divide-x divide-slate-300 dark:divide-glb-800 shrink-0"
                        >
                            <div
                                class="p-3.5 border-t-4 border-t-rose-600 dark:border-t-rose-500"
                            >
                                <div
                                    class="text-xs font-mono uppercase text-slate-500 dark:text-slate-400"
                                >
                                    Во тек
                                </div>
                                <div
                                    class="mt-0.5 text-3xl font-mono font-bold text-rose-600 dark:text-rose-400"
                                >
                                    {{ ongoingNationalCount }}
                                </div>
                            </div>
                            <div
                                class="p-3.5 border-t-4 border-t-amber-500 dark:border-t-amber-400"
                            >
                                <div
                                    class="text-xs font-mono uppercase text-slate-500 dark:text-slate-400"
                                >
                                    Најавени
                                </div>
                                <div
                                    class="mt-0.5 text-3xl font-mono font-bold text-amber-600 dark:text-amber-300"
                                >
                                    {{ scheduledNationalCount }}
                                </div>
                            </div>
                        </div>

                        <div
                            class="bg-white dark:bg-glb-900 border border-slate-300 dark:border-glb-800 flex-1 flex flex-col justify-between min-h-0"
                        >
                            <div
                                class="grid grid-cols-2 border-b border-slate-300 dark:border-glb-800 bg-slate-100 dark:bg-glb-950 shrink-0"
                            >
                                <button
                                    type="button"
                                    class="px-3 py-2 text-xs font-mono uppercase border-r border-slate-300 dark:border-glb-800 cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                                    :class="
                                        sidebarTab === 'leaderboard'
                                            ? 'bg-glb-500 text-white font-bold'
                                            : 'hover:bg-slate-200 dark:hover:bg-glb-800 text-slate-700 dark:text-slate-300'
                                    "
                                    @click="sidebarTab = 'leaderboard'"
                                >
                                    <span>Најпогодени</span>
                                </button>
                                <button
                                    type="button"
                                    class="px-3 py-2 text-xs font-mono uppercase cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                                    :class="
                                        sidebarTab === 'radar'
                                            ? 'bg-glb-500 text-white font-bold'
                                            : 'hover:bg-slate-200 dark:hover:bg-glb-800 text-slate-700 dark:text-slate-300'
                                    "
                                    @click="activateRadarTab"
                                >
                                    <LocateOutline
                                        class="w-3.5 h-3.5 shrink-0"
                                        :class="
                                            radar.loading.value
                                                ? 'animate-spin'
                                                : ''
                                        "
                                    />
                                    <span>Локален радар</span>
                                </button>
                            </div>

                            <div
                                v-if="sidebarTab === 'leaderboard'"
                                class="flex flex-col flex-1 min-h-0"
                            >
                                <div
                                    class="px-3 py-2 border-b border-slate-200 dark:border-glb-800 flex items-center justify-between shrink-0"
                                >
                                    <div class="relative flex-1">
                                        <SearchOutline
                                            class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2"
                                        />
                                        <input
                                            v-model="leaderboardSearch"
                                            type="text"
                                            placeholder="Филтрирај општина..."
                                            class="w-full pl-8 pr-2 py-1 text-xs font-mono bg-slate-50 dark:bg-glb-950 border border-slate-300 dark:border-glb-700 focus:outline-none focus:border-glb-500"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        class="lg:hidden ml-2 px-2 py-1 text-[10px] font-mono font-bold uppercase bg-slate-100 dark:bg-glb-800 border border-slate-300 dark:border-glb-700 cursor-pointer"
                                        @click="
                                            mobileLeaderboardOpen =
                                                !mobileLeaderboardOpen
                                        "
                                    >
                                        {{
                                            mobileLeaderboardOpen ? "▲" : "▼"
                                        }}
                                    </button>
                                </div>

                                <div
                                    class="divide-y divide-slate-200 dark:divide-glb-800 overflow-y-auto flex-1 max-h-72 lg:max-h-none"
                                    :class="
                                        mobileLeaderboardOpen
                                            ? 'block'
                                            : 'hidden lg:block'
                                    "
                                >
                                    <a
                                        v-for="(item, idx) in topMunicipalities"
                                        :key="item.m.code"
                                        :href="`/${item.m.slug}`"
                                        class="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-glb-800/60 cursor-pointer transition-colors group"
                                    >
                                        <div
                                            class="flex items-center gap-2 min-w-0"
                                        >
                                            <span
                                                class="text-xs font-mono text-slate-400 w-5"
                                            >
                                                {{ idx + 1 }}.
                                            </span>
                                            <span
                                                class="text-xs font-bold truncate group-hover:text-glb-600 dark:group-hover:text-glb-300"
                                            >
                                                {{ item.m.nameMk }}
                                            </span>
                                        </div>
                                        <div
                                            class="flex items-center gap-1.5 font-mono text-xs shrink-0"
                                        >
                                            <span
                                                v-if="item.stats.ongoing > 0"
                                                class="px-1.5 py-0.5 bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950/70 dark:text-rose-200 dark:border-rose-800 font-bold"
                                                title="Во тек"
                                            >
                                                {{ item.stats.ongoing }}
                                            </span>
                                            <span
                                                v-if="item.stats.scheduled > 0"
                                                class="px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/65 dark:text-amber-200 dark:border-amber-800 font-bold"
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
                                    </a>
                                </div>
                            </div>

                            <div
                                v-else
                                class="flex flex-col flex-1 min-h-0 p-3 gap-3 overflow-y-auto"
                            >
                                <div
                                    class="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-glb-800"
                                >
                                    <div class="text-xs font-mono">
                                        <div
                                            v-if="radar.municipality.value"
                                            class="font-bold text-glb-600 dark:text-glb-300 uppercase"
                                        >
                                            Општина
                                            {{
                                                radar.municipality.value.nameMk
                                            }}
                                        </div>
                                        <div
                                            v-if="radar.coords.value"
                                            class="text-[11px] text-slate-500"
                                        >
                                            GPS:
                                            {{
                                                radar.coords.value.lat.toFixed(
                                                    4,
                                                )
                                            }}°N,
                                            {{
                                                radar.coords.value.lng.toFixed(
                                                    4,
                                                )
                                            }}°E
                                        </div>
                                        <div
                                            v-else
                                            class="text-[11px] text-slate-500"
                                        >
                                            Побарајте пристап до локација за
                                            пребарување во радиус.
                                        </div>
                                    </div>

                                    <a
                                        v-if="radar.municipalitySlug.value"
                                        :href="`/${radar.municipalitySlug.value}`"
                                        class="px-2 py-1 text-[11px] font-mono font-bold uppercase bg-glb-500 text-white hover:bg-glb-600 transition-colors"
                                    >
                                        Погледни општина →
                                    </a>
                                </div>

                                <div class="space-y-1.5">
                                    <div
                                        class="flex items-center justify-between text-[11px] font-mono uppercase text-slate-500"
                                    >
                                        <span>Радиус на пребарување</span>
                                        <div
                                            class="flex items-center border border-slate-300 dark:border-glb-700 bg-slate-50 dark:bg-glb-950"
                                        >
                                            <input
                                                :value="
                                                    radar.radiusMeters.value
                                                "
                                                type="number"
                                                min="50"
                                                max="50000"
                                                step="100"
                                                aria-label="Радиус во метри"
                                                class="w-18 px-1.5 py-0.5 text-xs font-mono text-slate-900 dark:text-slate-100 bg-transparent focus:outline-none"
                                                @change="onCustomRadiusInput"
                                            />
                                            <span
                                                class="px-1.5 text-[10px] font-mono text-slate-500 border-l border-slate-300 dark:border-glb-800"
                                            >
                                                m
                                            </span>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-5 gap-1">
                                        <button
                                            v-for="preset in radarPresets"
                                            :key="preset"
                                            type="button"
                                            class="py-1 text-xs font-mono border cursor-pointer transition-colors"
                                            :class="
                                                radar.radiusMeters.value ===
                                                preset
                                                    ? 'bg-glb-500 text-white border-glb-600 font-bold'
                                                    : 'bg-slate-50 dark:bg-glb-950 border-slate-300 dark:border-glb-700 hover:border-glb-500'
                                            "
                                            @click="selectRadarRadius(preset)"
                                        >
                                            {{
                                                preset >= 1000
                                                    ? `${preset / 1000}km`
                                                    : `${preset}m`
                                            }}
                                        </button>
                                    </div>
                                </div>

                                <div
                                    v-if="radar.error.value"
                                    class="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-xs font-mono text-rose-800 dark:text-rose-200"
                                >
                                    {{ radar.error.value }}
                                </div>

                                <div
                                    v-else-if="radar.loading.value"
                                    class="py-8 text-center text-xs font-mono text-slate-500"
                                >
                                    Се вчитуваат податоци во радиус од
                                    {{ radar.radiusMeters.value }}m...
                                </div>

                                <div
                                    v-else-if="radar.reports.value.length > 0"
                                    class="space-y-2 flex-1 overflow-y-auto pr-1"
                                >
                                    <div
                                        v-for="rep in radar.reports.value"
                                        :key="`near-${rep.id}`"
                                        class="p-2.5 bg-slate-50 dark:bg-glb-950 border border-slate-300 dark:border-glb-800 space-y-1"
                                    >
                                        <div
                                            class="flex items-center justify-between gap-2"
                                        >
                                            <span
                                                class="px-1.5 py-0.5 text-[10px] font-mono font-bold border uppercase"
                                                :class="
                                                    getCategoryMeta(
                                                        rep.category,
                                                    ).badgeClass
                                                "
                                            >
                                                {{
                                                    getCategoryMeta(
                                                        rep.category,
                                                    ).shortMk
                                                }}
                                            </span>
                                            <span
                                                class="px-1.5 py-0.5 text-[10px] font-mono font-bold border"
                                                :class="
                                                    STATUS_META[rep.status]
                                                        .badgeClass
                                                "
                                            >
                                                {{
                                                    STATUS_META[rep.status]
                                                        .labelMk
                                                }}
                                            </span>
                                        </div>
                                        <div class="text-xs font-bold">
                                            {{ rep.title }}
                                        </div>
                                        <p
                                            v-if="rep.description"
                                            class="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2"
                                        >
                                            {{ rep.description }}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    v-else-if="radar.coords.value"
                                    class="py-6 text-center text-xs font-mono text-teal-700 dark:text-teal-400"
                                >
                                    Нема активни прекини во радиус од
                                    {{ radar.radiusMeters.value }} метри.
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
                                    Табела на сите 80 општини ↓
                                </button>

                                <button
                                    type="button"
                                    class="w-full py-2.5 px-4 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                                    :class="
                                        radar.active.value
                                            ? 'bg-slate-700 hover:bg-slate-800 text-white'
                                            : 'bg-glb-500 hover:bg-glb-600 text-white'
                                    "
                                    @click="toggleRadarAction"
                                >
                                    <LocateOutline
                                        class="w-4 h-4"
                                        :class="
                                            radar.loading.value
                                                ? 'animate-spin'
                                                : ''
                                        "
                                    />
                                    <span>
                                        {{
                                            radar.loading.value
                                                ? "Лоцирање во тек..."
                                                : radar.active.value
                                                  ? "Исклучи локален радар"
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
            />
        </main>

        <AppFooter />
    </div>
</template>

<script setup lang="ts">
import { LocateOutline, SearchOutline } from "@vicons/ionicons5";
import { useData } from "vike-vue/useData";
import { computed, ref } from "vue";
import AppFooter from "../../components/AppFooter.vue";
import AppHeader from "../../components/AppHeader.vue";
import CategoryBar from "../../components/CategoryBar.vue";
import ChoroplethMap from "../../components/ChoroplethMap.vue";
import MunicipalitySection from "../../components/MunicipalitySection.vue";
import { useLiveTelemetry } from "../../composables/useLiveTelemetry";
import { useNearbyRadar } from "../../composables/useNearbyRadar";
import { useTheme } from "../../composables/useTheme";
import { apiClient } from "../../util/api";
import {
  createEmptyBreakdown,
  getCategoryMeta,
  STATUS_META,
} from "../../util/constants";
import type { CategoryBreakdown, ReportCategory } from "../../util/types";
import type { Data } from "./+data";

const ssrData = useData<Data>();

const municipalities = computed(() => ssrData.municipalities);
const { mapReports, activeEvents } = useLiveTelemetry(
  ssrData.mapReports,
  ssrData.activeEvents,
);

const selectedCategory = ref<ReportCategory | "all">("all");
const sidebarTab = ref<"leaderboard" | "radar">("leaderboard");
const leaderboardSearch = ref("");
const mobileLeaderboardOpen = ref(false);
const radarPresets = [500, 1000, 2500, 5000, 10000];

const radar = useNearbyRadar();
const { isDark, toggleTheme } = useTheme();

function activateRadarTab() {
  sidebarTab.value = "radar";
  if (!radar.coords.value && !radar.loading.value) {
    radar.triggerLocate();
  }
}

function toggleRadarAction() {
  if (radar.active.value) {
    radar.closeRadar();
    sidebarTab.value = "leaderboard";
  } else {
    sidebarTab.value = "radar";
    radar.triggerLocate();
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
}

function selectRadarRadius(val: number) {
  radar.radiusMeters.value = val;
  radar.fetchSpatialData();
}

function onCustomRadiusInput(e: Event) {
  const val = Number((e.target as HTMLInputElement).value);
  radar.radiusMeters.value = val;
  radar.fetchSpatialData();
}

function scrollToAllMunicipalities() {
  document.getElementById("municipalities-section")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function resetHome() {
  selectedCategory.value = "all";
  sidebarTab.value = "leaderboard";
  radar.closeRadar();
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
  selectedCategory.value === "all"
    ? mapReports.value
    : mapReports.value.filter((r) => r.category === selectedCategory.value),
);

const statsByMunicipality = computed<Record<string, CategoryBreakdown>>(() => {
  const map: Record<string, CategoryBreakdown> = {};
  for (const r of filteredMapReports.value) {
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
    .slice(0, 15);
});
</script>