<template>
    <header class="sticky top-0 z-30 bg-white dark:bg-glb-950 border-b-2 border-slate-300 dark:border-glb-800">
        <div class="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            <button
                type="button"
                class="flex items-center gap-3 cursor-pointer text-left"
                @click="$emit('reset')"
            >
                <img :src="logoTextUrl" alt="glb" class="h-7 w-auto" />
                <span class="px-2 py-0.5 text-[11px] font-mono font-bold uppercase tracking-widest bg-glb-500 text-white">
                    WATCH
                </span>
            </button>

            <div
                v-if="events.length > 0"
                class="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-glb-900 border border-slate-300 dark:border-glb-800 text-xs font-mono"
            >
                <SpeedometerOutline class="w-4 h-4 text-glb-500 shrink-0" />
                <span class="font-bold uppercase text-slate-900 dark:text-slate-200">
                    {{ events[0]?.title }}:
                </span>
                <span class="text-slate-700 dark:text-slate-300">
                    {{ formatFuelTicker(events[0]) }}
                </span>
            </div>

            <div class="flex items-center gap-2">
                <button
                    type="button"
                    aria-label="Промени тема"
                    class="h-9 w-9 flex items-center justify-center bg-slate-100 dark:bg-glb-900 border border-slate-300 dark:border-glb-700 hover:border-glb-500 cursor-pointer"
                    @click="$emit('toggleTheme')"
                >
                    <SunnyOutline v-if="isDark" class="w-4 h-4 text-amber-400" />
                    <MoonOutline v-else class="w-4 h-4 text-slate-800" />
                </button>
            </div>
        </div>

        <div
            v-if="events.length > 0"
            class="md:hidden px-4 py-1.5 bg-slate-100 dark:bg-glb-900 border-t border-slate-300 dark:border-glb-800 text-[11px] font-mono flex items-center gap-2 overflow-x-auto whitespace-nowrap"
        >
            <SpeedometerOutline class="w-3.5 h-3.5 text-glb-500 shrink-0" />
            <span class="font-bold uppercase">{{ events[0]?.title }}:</span>
            <span>{{ formatFuelTicker(events[0]) }}</span>
        </div>
    </header>
</template>

<script setup lang="ts">
import {
  MoonOutline,
  SpeedometerOutline,
  SunnyOutline,
} from "@vicons/ionicons5";
import logoTextUrl from "../../assets/logo_text.svg";
import { formatFuelTicker } from "../util/formatters";
import type { EventDto } from "../util/types";

defineProps<{
  events: EventDto[];
  isDark: boolean;
}>();

defineEmits<{
  reset: [];
  toggleTheme: [];
}>();
</script>