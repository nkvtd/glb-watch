<template>
    <header
        class="sticky top-0 z-30 bg-white dark:bg-glb-950 border-b-2 border-slate-300 dark:border-glb-800"
    >
        <div
            class="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4"
        >
            <a
                href="/"
                class="flex items-center gap-3 cursor-pointer text-left shrink-0"
                @click="$emit('reset')"
            >
                <img :src="logoTextUrl" alt="glb" class="h-7 w-auto" />
                <span
                    class="px-2 py-0.5 text-[11px] font-mono font-bold uppercase tracking-widest bg-glb-500 text-white"
                >
                    WATCH
                </span>
            </a>

            <div
                v-if="headlines.length > 0"
                class="hidden lg:flex items-center gap-2.5 px-3 py-1.5 bg-slate-100 dark:bg-glb-900 border border-slate-300 dark:border-glb-800 text-xs font-mono min-w-0 overflow-hidden"
            >
                <span
                    class="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-glb-500 text-white shrink-0"
                >
                    {{ currentHeadline?.tag }}
                </span>
                <span
                    class="truncate text-slate-800 dark:text-slate-200 font-medium"
                    :title="currentHeadline?.text"
                >
                    {{ currentHeadline?.text }}
                </span>
                <button
                    v-if="headlines.length > 1"
                    type="button"
                    aria-label="Следна вест"
                    class="px-1 text-[10px] text-slate-500 hover:text-glb-500 cursor-pointer shrink-0"
                    @click="nextHeadline"
                >
                    [{{ safeIdx + 1 }}/{{ headlines.length }}]
                </button>
            </div>

            <div class="flex items-center gap-2 shrink-0">
                <nav
                    v-if="navLinks.length > 0"
                    class="hidden sm:flex items-center gap-1.5 font-mono text-xs"
                >
                    <a
                        v-for="link in navLinks"
                        :key="link.href"
                        :href="link.href"
                        class="px-2.5 py-1.5 bg-slate-100 dark:bg-glb-900 border border-slate-300 dark:border-glb-700 hover:border-glb-500 text-slate-800 dark:text-slate-200 transition-colors"
                    >
                        {{ link.label }}
                    </a>
                </nav>

                <button
                    type="button"
                    aria-label="Промени тема"
                    class="h-9 w-9 flex items-center justify-center bg-slate-100 dark:bg-glb-900 border border-slate-300 dark:border-glb-700 hover:border-glb-500 cursor-pointer transition-colors"
                    @click="$emit('toggleTheme')"
                >
                    <SunnyOutline class="w-4 h-4 text-amber-400 hidden dark:block" />
                    <MoonOutline class="w-4 h-4 text-slate-700 block dark:hidden" />
                </button>
            </div>
        </div>

        <div
            v-if="headlines.length > 0"
            class="lg:hidden px-4 py-1.5 bg-slate-100 dark:bg-glb-900 border-t border-slate-300 dark:border-glb-800 text-[11px] font-mono flex items-center gap-2 min-w-0"
        >
            <span
                class="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-glb-500 text-white shrink-0"
            >
                {{ currentHeadline?.tag }}
            </span>
            <span
                class="text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-nowrap min-w-0 flex-1"
                :title="currentHeadline?.text"
            >
                {{ currentHeadline?.text }}
            </span>
            <button
                v-if="headlines.length > 1"
                type="button"
                aria-label="Следна вест"
                class="px-1 text-[10px] text-slate-500 hover:text-glb-500 cursor-pointer shrink-0"
                @click="nextHeadline"
            >
                [{{ safeIdx + 1 }}/{{ headlines.length }}]
            </button>
        </div>
    </header>
</template>

<script setup lang="ts">
import { MoonOutline, SunnyOutline } from "@vicons/ionicons5";
import { computed, onMounted, onUnmounted, ref } from "vue";
import logoTextUrl from "../../assets/logo_text.svg";
import { formatEventHeadline } from "../util/formatters";
import type { EventDto } from "../util/types";

const props = defineProps<{
  events: EventDto[];
}>();

defineEmits<{
  reset: [];
  toggleTheme: [];
}>();

const navLinks: Array<{ label: string; href: string }> = [
  // { label: "За нас", href: "/about" },
  // { label: "Податоци", href: "/data" },
];

const headlines = computed(() => props.events.map(formatEventHeadline));
const activeIdx = ref(0);
const safeIdx = computed(() =>
  headlines.value.length > 0 ? activeIdx.value % headlines.value.length : 0,
);
const currentHeadline = computed(() => headlines.value[safeIdx.value]);

let tickerTimer: ReturnType<typeof setInterval> | null = null;

function advanceHeadline() {
  if (headlines.value.length > 1) {
    activeIdx.value = (safeIdx.value + 1) % headlines.value.length;
  }
}

function nextHeadline() {
  advanceHeadline();
  if (tickerTimer) {
    clearInterval(tickerTimer);
    tickerTimer = setInterval(advanceHeadline, 8000);
  }
}

onMounted(() => {
  tickerTimer = setInterval(advanceHeadline, 8000);
});
onUnmounted(() => {
  if (tickerTimer) clearInterval(tickerTimer);
});
</script>
