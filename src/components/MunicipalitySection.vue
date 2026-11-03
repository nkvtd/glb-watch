<template>
    <section
        id="municipalities-section"
        data-muni-interactive
        class="bg-white dark:bg-glb-900 border border-slate-300 dark:border-glb-800 scroll-mt-16"
    >
        <div class="p-3 border-b border-slate-300 dark:border-glb-800 flex flex-wrap items-center justify-between gap-2">
            <h2 class="text-sm font-bold uppercase tracking-wider">
                Состојба по статистички региони и општини
            </h2>
            <div class="flex items-center gap-2">
                <button
                    v-if="selectedMunicipalityCode"
                    type="button"
                    class="px-2.5 py-1 text-xs font-mono font-bold bg-glb-500 text-white cursor-pointer flex items-center gap-1"
                    @click="$emit('selectMunicipality', null)"
                >
                    <span>Поништи избор</span>
                    <CloseOutline class="w-3.5 h-3.5" />
                </button>
                <button
                    type="button"
                    class="px-2.5 py-1 text-xs font-mono border cursor-pointer"
                    :class="
                        onlyActive
                            ? 'bg-glb-500 text-white border-glb-600 font-bold'
                            : 'bg-slate-100 dark:bg-glb-950 border-slate-300 dark:border-glb-700'
                    "
                    @click="onlyActive = !onlyActive; currentPage = 1"
                >
                    Само тековни
                </button>
            </div>
        </div>

        <div class="flex overflow-x-auto border-b border-slate-300 dark:border-glb-800 bg-slate-100 dark:bg-glb-950 divide-x divide-slate-300 dark:divide-glb-800">
            <button
                type="button"
                class="px-3 py-2 text-xs font-mono uppercase shrink-0 cursor-pointer"
                :class="
                    selectedRegion === 'all'
                        ? 'bg-glb-500 text-white font-bold'
                        : 'hover:bg-slate-200 dark:hover:bg-glb-800'
                "
                @click="selectedRegion = 'all'; currentPage = 1"
            >
                Сите општини ({{ municipalities.length }})
            </button>
            <button
                v-for="reg in regions"
                :key="reg.code"
                type="button"
                class="px-3 py-2 text-xs font-mono uppercase shrink-0 cursor-pointer flex items-center gap-1.5"
                :class="
                    selectedRegion === reg.code
                        ? 'bg-glb-500 text-white font-bold'
                        : 'hover:bg-slate-200 dark:hover:bg-glb-800'
                "
                @click="selectedRegion = reg.code; currentPage = 1"
            >
                <span>{{ reg.nameMk }}</span>
                <span
                    v-if="reg.ongoingCount > 0"
                    class="px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white"
                    title="Во тек"
                >
                    {{ reg.ongoingCount }}
                </span>
                <span
                    v-if="reg.scheduledCount > 0"
                    class="px-1.5 py-0.5 text-[10px] font-bold bg-amber-300 text-slate-950"
                    title="Најавени"
                >
                    {{ reg.scheduledCount }}
                </span>
            </button>
        </div>

        <div class="px-3 py-2 bg-slate-100 dark:bg-glb-950 border-b border-slate-300 dark:border-glb-800 text-[11px] font-mono uppercase text-slate-500 flex items-center justify-between">
            <span>Општина / Статистички регион</span>
            <div class="flex items-center gap-4">
                <span class="w-14 text-right">Во тек</span>
                <span class="w-16 text-right">Најавени</span>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 divide-y divide-slate-200 dark:divide-glb-800">
            <button
                v-for="(row, idx) in pagedRows"
                :key="row.m.code"
                type="button"
                class="w-full px-3 py-2.5 text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-glb-800/60 cursor-pointer transition-colors"
                :class="[
                    idx % 2 === 0 ? 'md:border-r md:border-slate-200 md:dark:border-glb-800' : '',
                    idx === 1 ? 'md:border-t-0' : '',
                    selectedMunicipalityCode === row.m.code
                        ? 'bg-glb-500/20 font-bold border-l-4 border-l-glb-500'
                        : '',
                ]"
                @click="toggleRow(row.m.code)"
            >
                <div class="min-w-0 pr-2">
                    <div class="text-xs font-bold truncate">{{ row.m.nameMk }}</div>
                    <div class="text-[10px] font-mono text-slate-500">{{ row.m.regionNameMk }}</div>
                </div>

                <div class="flex items-center gap-4 shrink-0 font-mono text-xs">
                    <span
                        class="w-14 text-right px-1.5 py-0.5 font-bold"
                        :class="
                            row.stats.ongoing > 0
                                ? 'bg-red-600 text-white'
                                : 'text-slate-400'
                        "
                    >
                        {{ row.stats.ongoing }}
                    </span>
                    <span
                        class="w-16 text-right px-1.5 py-0.5 font-bold"
                        :class="
                            row.stats.scheduled > 0
                                ? 'bg-amber-300 text-slate-950'
                                : 'text-slate-400'
                        "
                    >
                        {{ row.stats.scheduled }}
                    </span>
                </div>
            </button>
        </div>

        <div
            v-if="totalPages > 1"
            class="px-3 py-2 border-t border-slate-300 dark:border-glb-800 bg-slate-50 dark:bg-glb-950 flex items-center justify-between text-xs font-mono"
        >
            <span>
                Страница {{ currentPage }} од {{ totalPages }} ({{ filteredRows.length }} општини)
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
import {
  ChevronBackOutline,
  ChevronForwardOutline,
  CloseOutline,
} from "@vicons/ionicons5";
import { computed, ref } from "vue";
import { createEmptyBreakdown } from "../util/constants";
import type { CategoryBreakdown, PrecomputedMunicipality } from "../util/types";

const props = defineProps<{
  municipalities: PrecomputedMunicipality[];
  statsByMunicipality: Record<string, CategoryBreakdown>;
  selectedMunicipalityCode: string | null;
}>();

const emit = defineEmits<{
  selectMunicipality: [code: string | null];
}>();

const selectedRegion = ref<string>("all");
const onlyActive = ref(false);
const currentPage = ref(1);
const pageSize = 16;

function toggleRow(code: string) {
  emit(
    "selectMunicipality",
    props.selectedMunicipalityCode === code ? null : code,
  );
}

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

const filteredRows = computed(() =>
  props.municipalities
    .filter(
      (m) =>
        selectedRegion.value === "all" || m.regionCode === selectedRegion.value,
    )
    .map((m) => ({
      m,
      stats: props.statsByMunicipality[m.code] ?? createEmptyBreakdown(),
    }))
    .filter((r) => !onlyActive.value || r.stats.ongoing + r.stats.scheduled > 0)
    .sort(
      (a, b) =>
        b.stats.ongoing - a.stats.ongoing ||
        b.stats.scheduled - a.stats.scheduled ||
        a.m.nameMk.localeCompare(b.m.nameMk, "mk"),
    ),
);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / pageSize)),
);

const pagedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredRows.value.slice(start, start + pageSize);
});
</script>