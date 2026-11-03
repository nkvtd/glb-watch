<template>
    <section
        class="grid grid-cols-2 sm:grid-cols-5 bg-white dark:bg-glb-900 border-t border-l border-slate-300 dark:border-glb-800"
    >
        <button
            type="button"
            class="col-span-2 sm:col-span-1 px-3 py-2.5 flex items-center justify-between text-left cursor-pointer transition-colors border-r border-b border-slate-300 dark:border-glb-800 relative"
            :class="
                selected === 'all'
                    ? 'bg-slate-200/80 dark:bg-glb-800 font-bold'
                    : 'hover:bg-slate-100 dark:hover:bg-glb-800/50'
            "
            @click="$emit('select', 'all')"
        >
            <div class="flex items-center gap-2">
                <AppsOutline class="w-4 h-4 text-glb-500 shrink-0" />
                <span class="text-xs uppercase tracking-wider">Сите</span>
            </div>
            <span
                class="text-xs font-mono font-bold px-1.5 py-0.5 bg-slate-200 dark:bg-glb-950"
            >
                {{ totalCount }}
            </span>
            <span
                v-if="selected === 'all'"
                class="absolute bottom-0 inset-x-0 h-1 bg-glb-500"
            ></span>
        </button>

        <button
            v-for="cat in categories"
            :key="cat.key"
            type="button"
            class="px-3 py-2.5 flex items-center justify-between text-left cursor-pointer transition-colors border-r border-b border-slate-300 dark:border-glb-800 relative"
            :class="
                selected === cat.key
                    ? 'bg-slate-200/80 dark:bg-glb-800 font-bold'
                    : 'hover:bg-slate-100 dark:hover:bg-glb-800/50'
            "
            @click="$emit('select', cat.key)"
        >
            <div class="flex items-center gap-2 min-w-0">
                <component
                    :is="cat.icon"
                    class="w-4 h-4 shrink-0"
                    :style="{ color: cat.color }"
                />
                <span class="text-xs uppercase tracking-wider truncate">
                    {{ cat.shortMk }}
                </span>
            </div>
            <span
                class="text-xs font-mono font-bold px-1.5 py-0.5 bg-slate-200 dark:bg-glb-950"
            >
                {{ counts[cat.key] || 0 }}
            </span>
            <span
                v-if="selected === cat.key"
                class="absolute bottom-0 inset-x-0 h-1"
                :style="{ backgroundColor: cat.color }"
            ></span>
        </button>
    </section>
</template>

<script setup lang="ts">
import {
  AppsOutline,
  CloudOutline,
  FlashOutline,
  ThunderstormOutline,
  WaterOutline,
} from "@vicons/ionicons5";
import { CATEGORY_META } from "../util/constants";
import type { ReportCategory } from "../util/types";

defineProps<{
  selected: ReportCategory | "all";
  counts: Record<string, number>;
  totalCount: number;
}>();

defineEmits<{
  select: [category: ReportCategory | "all"];
}>();

const categories = [
  {
    key: "power" as const,
    shortMk: CATEGORY_META.power.shortMk,
    icon: FlashOutline,
    color: CATEGORY_META.power.barColor,
  },
  {
    key: "water" as const,
    shortMk: CATEGORY_META.water.shortMk,
    icon: WaterOutline,
    color: CATEGORY_META.water.barColor,
  },
  {
    key: "air_quality" as const,
    shortMk: CATEGORY_META.air_quality.shortMk,
    icon: CloudOutline,
    color: CATEGORY_META.air_quality.barColor,
  },
  {
    key: "weather" as const,
    shortMk: CATEGORY_META.weather.shortMk,
    icon: ThunderstormOutline,
    color: CATEGORY_META.weather.barColor,
  },
];
</script>