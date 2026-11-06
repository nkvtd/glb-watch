<template>
    <section class="p-4 bg-white dark:bg-glb-900 border-2 border-glb-500 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-glb-800 pb-3">
            <div class="flex items-center gap-2.5">
                <LocateOutline class="w-5 h-5 text-glb-500 shrink-0" />
                <div>
                    <h2 class="text-sm font-bold uppercase tracking-wider">
                        Локален радар
                        <span v-if="municipality" class="text-glb-500 font-mono">
                            [{{ municipality.nameMk }}]
                        </span>
                    </h2>
                    <p v-if="coords" class="text-xs font-mono text-slate-600 dark:text-slate-400">
                        GPS: {{ coords.lat.toFixed(4) }}°N, {{ coords.lng.toFixed(4) }}°E
                    </p>
                </div>
            </div>

            <div class="flex flex-wrap items-center gap-1.5">
                <span class="text-xs font-mono uppercase text-slate-600 dark:text-slate-400 mr-1">
                    Радиус:
                </span>
                <button
                    v-for="preset in presets"
                    :key="preset"
                    type="button"
                    class="px-2 py-1 text-xs font-mono border cursor-pointer"
                    :class="
                        modelValue === preset
                            ? 'bg-glb-500 text-white border-glb-600 font-bold'
                            : 'bg-slate-100 dark:bg-glb-950 border-slate-300 dark:border-glb-700 hover:border-glb-500'
                    "
                    @click="selectPreset(preset)"
                >
                    {{ preset >= 1000 ? `${preset / 1000}km` : `${preset}m` }}
                </button>

                <div class="flex items-center border border-slate-300 dark:border-glb-700 bg-slate-50 dark:bg-glb-950">
                    <input
                        :value="modelValue"
                        type="number"
                        min="50"
                        max="50000"
                        step="100"
                        class="w-20 px-2 py-1 text-xs font-mono bg-transparent focus:outline-none"
                        @change="onCustomInput"
                    />
                    <span class="px-1.5 text-[11px] font-mono text-slate-500 border-l border-slate-300 dark:border-glb-800">
                        m
                    </span>
                </div>

                <button
                    type="button"
                    aria-label="Затвори радар"
                    class="p-1.5 border border-slate-300 dark:border-glb-700 hover:border-red-500 cursor-pointer ml-1"
                    @click="$emit('close')"
                >
                    <CloseOutline class="w-4 h-4" />
                </button>
            </div>
        </div>

        <div v-if="error" class="text-xs font-mono text-red-600 dark:text-red-400 font-bold">
            {{ error }}
        </div>

        <div
            v-else-if="reports.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1"
        >
            <div
                v-for="rep in reports"
                :key="`near-${rep.id}`"
                class="p-3 bg-slate-50 dark:bg-glb-950 border border-slate-300 dark:border-glb-800 flex flex-col justify-between gap-2"
            >
                <div class="flex items-center justify-between gap-2">
                    <span
                        class="px-1.5 py-0.5 text-[11px] font-mono font-bold border uppercase"
                        :class="getCategoryMeta(rep.category).badgeClass"
                    >
                        {{ getCategoryMeta(rep.category).shortMk }}
                    </span>
                    <span
                        class="px-1.5 py-0.5 text-[11px] font-mono font-bold border"
                        :class="STATUS_META[rep.status].badgeClass"
                    >
                        {{ STATUS_META[rep.status].labelMk }}
                    </span>
                </div>
                <div>
                    <div class="text-xs font-bold">{{ rep.title }}</div>
                    <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mt-0.5">
                        {{ rep.description }}
                    </p>
                </div>
            </div>
        </div>
        <div v-else-if="!loading" class="text-xs font-mono text-emerald-700 dark:text-emerald-400">
            Нема регистрирано настани во радиус од {{ modelValue }} метри.
        </div>
    </section>
</template>

<script setup lang="ts">
import { CloseOutline, LocateOutline } from "@vicons/ionicons5";
import { CATEGORY_META, getCategoryMeta, STATUS_META } from "../util/constants";
import type { Coordinates, MunicipalityDto, ReportDto } from "../util/types";

defineProps<{
  modelValue: number;
  coords: Coordinates | null;
  municipality: MunicipalityDto | null;
  reports: ReportDto[];
  loading: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [val: number];
  refresh: [];
  close: [];
}>();

const presets = [500, 1000, 2500, 5000, 10000, 25000];

function selectPreset(val: number) {
  emit("update:modelValue", val);
  emit("refresh");
}

function onCustomInput(e: Event) {
  const val = Number((e.target as HTMLInputElement).value);
  emit("update:modelValue", val);
  emit("refresh");
}
</script>