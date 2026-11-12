<template>
    <section
        id="municipalities-section"
        class="bg-white dark:bg-glb-900 border border-slate-300 dark:border-glb-800 scroll-mt-16"
    >
        <div
            class="p-3 border-b border-slate-300 dark:border-glb-800 flex flex-wrap items-center justify-between gap-2"
        >
            <h2 class="text-sm font-bold uppercase tracking-wider">
                Состојба по статистички региони и општини
            </h2>
            <div class="flex items-center gap-2">
                <input
                    v-model="search"
                    type="text"
                    placeholder="Пребарај општина..."
                    class="px-2.5 py-1 text-xs font-mono bg-slate-50 dark:bg-glb-950 border border-slate-300 dark:border-glb-700 focus:outline-none focus:border-glb-500"
                />
                <button
                    type="button"
                    class="px-2.5 py-1 text-xs font-mono border cursor-pointer transition-colors"
                    :class="
                        onlyActive
                            ? 'bg-glb-500 text-white border-glb-600 font-bold'
                            : 'bg-slate-100 dark:bg-glb-950 border-slate-300 dark:border-glb-700'
                    "
                    @click="
                        onlyActive = !onlyActive;
                        currentPage = 1;
                    "
                >
                    Само тековни
                </button>
            </div>
        </div>

        <div
            class="flex overflow-x-auto border-b border-slate-300 dark:border-glb-800 bg-slate-100 dark:bg-glb-950 divide-x divide-slate-300 dark:divide-glb-800"
        >
            <button
                type="button"
                class="px-2 py-2 text-xs font-mono uppercase shrink-0 cursor-pointer transition-colors"
                :class="
                    selectedRegion === 'all'
                        ? 'bg-glb-500 text-white font-bold'
                        : 'hover:bg-slate-200 dark:hover:bg-glb-800'
                "
                @click="
                    selectedRegion = 'all';
                    currentPage = 1;
                "
            >
                Сите општини ({{ municipalities.length }})
            </button>
            <button
                v-for="reg in regions"
                :key="reg.code"
                type="button"
                class="px-5 py-2 text-xs font-mono uppercase shrink-0 cursor-pointer flex items-center gap-2 transition-colors"
                :class="
                    selectedRegion === reg.code
                        ? 'bg-glb-500 text-white font-bold'
                        : 'hover:bg-slate-200 dark:hover:bg-glb-800'
                "
                @click="
                    selectedRegion = reg.code;
                    currentPage = 1;
                "
            >
                <span>{{ reg.nameMk.replace(" Регион", "") }}</span>
                <span
                    v-if="reg.ongoingCount > 0"
                    class="px-1.5 py-0.5 text-[10px] font-bold bg-red-300 text-red-900 border border-red-300 dark:bg-red-950/80 dark:text-red-200 dark:border-red-800"
                    title="Во тек"
                >
                    {{ reg.ongoingCount }}
                </span>
                <span
                    v-if="reg.scheduledCount > 0"
                    class="px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800"
                    title="Најавени"
                >
                    {{ reg.scheduledCount }}
                </span>
            </button>
        </div>

        <div
            class="px-3 py-2 bg-slate-100 dark:bg-glb-950 border-b border-slate-300 dark:border-glb-800 text-[11px] font-mono uppercase text-slate-500 flex items-center justify-between"
        >
            <span>Општина / Статистички регион</span>
            <div class="flex items-center gap-4">
                <span class="w-14 text-right">Во тек</span>
                <span class="w-16 text-right">Најавени</span>
            </div>
        </div>

        <div
            v-if="pagedRows.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 divide-y divide-slate-200 dark:divide-glb-800"
        >
            <a
                v-for="(row, idx) in pagedRows"
                :key="row.m.code"
                :href="`/${row.m.slug}`"
                class="w-full px-3 py-2.5 text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-glb-800/60 cursor-pointer transition-colors group"
                :class="[
                    idx % 2 === 0
                        ? 'md:border-r md:border-slate-200 md:dark:border-glb-800'
                        : '',
                    idx === 1 ? 'md:border-t-0' : '',
                ]"
            >
                <div class="min-w-0 pr-2">
                    <div
                        class="text-xs font-bold truncate group-hover:text-glb-600 dark:group-hover:text-glb-300 transition-colors"
                    >
                        {{ row.m.nameMk }}
                    </div>
                    <div class="text-[10px] font-mono text-slate-500">
                        {{ row.m.regionNameMk }}
                    </div>
                </div>

                <div class="flex items-center gap-4 shrink-0 font-mono text-xs">
                    <span
                        class="w-14 text-right px-1.5 py-0.5 font-bold border"
                        :class="
                            row.stats.ongoing > 0
                                ? 'bg-red-100 text-red-900 border-red-300 dark:bg-red-950/70 dark:text-red-200 dark:border-red-800'
                                : 'border-transparent text-slate-400'
                        "
                    >
                        {{ row.stats.ongoing }}
                    </span>
                    <span
                        class="w-16 text-right px-1.5 py-0.5 font-bold border"
                        :class="
                            row.stats.scheduled > 0
                                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/65 dark:text-amber-200 dark:border-amber-800'
                                : 'border-transparent text-slate-400'
                        "
                    >
                        {{ row.stats.scheduled }}
                    </span>
                </div>
            </a>
        </div>

        <div
            v-else
            class="p-8 text-center text-xs font-mono text-slate-500"
        >
            Нема активни настани за избраниот филтер. Кликнете „Само тековни“ за
            преглед на сите општини.
        </div>

        <div
            v-if="totalPages > 1"
            class="px-3 py-2 border-t border-slate-300 dark:border-glb-800 bg-slate-50 dark:bg-glb-950 flex items-center justify-between text-xs font-mono"
        >
            <span>
                Страница {{ currentPage }} од {{ totalPages }} ({{
                    filteredRows.length
                }}
                општини)
            </span>
            <div class="flex items-center gap-1">
                <button
                    type="button"
                    :disabled="currentPage <= 1"
                    class="px-2.5 py-1 border border-slate-300 dark:border-glb-700 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                    @click="currentPage--"
                >
                    <ChevronBackOutline class="w-3.5 h-3.5" />
                    <span>Назад</span>
                </button>
                <button
                    type="button"
                    :disabled="currentPage >= totalPages"
                    class="px-2.5 py-1 border border-slate-300 dark:border-glb-700 disabled:opacity-40 cursor-pointer flex items-center gap-1"
                    @click="currentPage++"
                >
                    <span>Напред</span>
                    <ChevronForwardOutline class="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ChevronBackOutline, ChevronForwardOutline } from "@vicons/ionicons5";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { createEmptyBreakdown } from "../util/constants";
import { compareMunicipalityRows } from "../util/telemetry";
import type { CategoryBreakdown, PrecomputedMunicipality } from "../util/types";

const props = defineProps<{
  municipalities: PrecomputedMunicipality[];
  statsByMunicipality: Record<string, CategoryBreakdown>;
}>();

const selectedRegion = ref<string>("all");
const search = ref("");
const onlyActive = ref(true);
const currentPage = ref(1);

const isMobile = ref(false);
function updateViewport() {
  if (typeof window !== "undefined") {
    isMobile.value = window.innerWidth < 768;
  }
}
onMounted(() => {
  updateViewport();
  window.addEventListener("resize", updateViewport, { passive: true });
});
onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateViewport);
  }
});

const pageSize = computed(() => (isMobile.value ? 6 : 16));

watch(search, () => {
  currentPage.value = 1;
});

const regions = computed(() => {
  const map = new Map<
    string,
    {
      code: string;
      nameMk: string;
      ongoingCount: number;
      scheduledCount: number;
    }
  >();
  for (const m of props.municipalities) {
    const stats = props.statsByMunicipality[m.code];
    const ongoing = stats?.ongoing ?? 0;
    const scheduled = stats?.scheduled ?? 0;
    const existing = map.get(m.regionCode);
    if (existing) {
      existing.ongoingCount += ongoing;
      existing.scheduledCount += scheduled;
    } else {
      map.set(m.regionCode, {
        code: m.regionCode,
        nameMk: m.regionNameMk,
        ongoingCount: ongoing,
        scheduledCount: scheduled,
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => a.code.localeCompare(b.code));
});

const filteredRows = computed(() => {
  const q = search.value.trim().toLowerCase();
  return props.municipalities
    .filter(
      (m) =>
        (selectedRegion.value === "all" ||
          m.regionCode === selectedRegion.value) &&
        (!q ||
          m.nameMk.toLowerCase().includes(q) ||
          m.nameEn.toLowerCase().includes(q)),
    )
    .map((m) => ({
      m,
      stats: props.statsByMunicipality[m.code] ?? createEmptyBreakdown(),
    }))
    .filter((r) => !onlyActive.value || r.stats.ongoing + r.stats.scheduled > 0)
    .sort(compareMunicipalityRows);
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value)),
);

watch(totalPages, (max) => {
  if (currentPage.value > max) currentPage.value = max;
});

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredRows.value.slice(start, start + pageSize.value);
});
</script>
