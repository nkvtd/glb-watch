<template>
    <header
        class="sticky top-0 z-30 bg-white dark:bg-glb-950 border-b-2 border-slate-300 dark:border-glb-800"
    >
        <div class="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
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
                v-if="municipalities?.length"
                ref="searchBox"
                class="relative w-full max-w-52 sm:w-56 md:w-64 ml-auto min-w-0"
            >
                <SearchOutline
                    class="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2"
                />
                <input
                    ref="searchInput"
                    v-model="searchQuery"
                    type="text"
                    aria-label="Пребарај општина"
                    :aria-expanded="searchOpen"
                    placeholder="Пребарај општина... (/)"
                    class="w-full pl-8 pr-2.5 py-1.5 text-xs font-mono bg-slate-50 dark:bg-glb-900 border border-slate-300 dark:border-glb-700 focus:outline-none focus:border-glb-500"
                />

                <div
                    v-if="searchOpen && searchResults.length > 0"
                    class="absolute left-0 right-0 top-full mt-1 z-40 bg-white dark:bg-glb-900 border border-slate-300 dark:border-glb-700 divide-y divide-slate-200 dark:divide-glb-800 max-h-80 overflow-y-auto"
                >
                    <button
                        v-for="(m, idx) in searchResults"
                        :key="m.code"
                        type="button"
                        class="w-full px-3 py-2 flex items-center justify-between gap-2 text-left cursor-pointer transition-colors"
                        :class="
                            idx === activeIndex
                                ? 'bg-glb-500/15 dark:bg-glb-700/60'
                                : 'hover:bg-slate-100 dark:hover:bg-glb-800/60'
                        "
                        @click="selectMunicipality(m)"
                        @mouseenter="activeIndex = idx"
                    >
                        <span class="min-w-0">
                            <span class="block text-xs font-bold truncate">
                                {{ m.nameMk }}
                            </span>
                            <span
                                class="block text-[10px] font-mono text-slate-500 truncate"
                            >
                                {{ m.regionNameMk }}
                            </span>
                        </span>
                        <span
                            class="flex items-center gap-1 shrink-0 font-mono text-[10px]"
                        >
                            <span
                                v-if="ongoingCount(m.code) > 0"
                                class="px-1.5 py-0.5"
                                :class="COUNT_BADGE_ONGOING"
                                title="Во тек"
                            >
                                {{ ongoingCount(m.code) }}
                            </span>
                            <span
                                v-if="scheduledCount(m.code) > 0"
                                class="px-1.5 py-0.5"
                                :class="COUNT_BADGE_SCHEDULED"
                                title="Најавени"
                            >
                                {{ scheduledCount(m.code) }}
                            </span>
                        </span>
                    </button>
                </div>
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
            ref="headlineBox"
            class="relative border-t border-slate-200 dark:border-glb-800 bg-slate-100 dark:bg-glb-900"
        >
            <div
                class="max-w-7xl mx-auto px-4 h-8 flex items-center gap-3 text-[11px] font-mono min-w-0"
            >
                <button
                    type="button"
                    aria-label="Освежи податоци"
                    class="flex items-center gap-1.5 shrink-0 cursor-pointer transition-opacity"
                    :class="refreshing ? 'animate-pulse' : 'hover:opacity-80'"
                    @click="$emit('refresh')"
                >
                    <span class="w-2 h-2 bg-emerald-500 animate-pulse shrink-0" />
                    <span
                        class="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                    >
                        ВО ЖИВО
                    </span>
                    <span v-if="lastUpdatedAt" class="text-slate-500">
                        [{{ formatSkopjeTime(lastUpdatedAt) }}]
                    </span>
                </button>

                <div
                    v-if="headlines.length > 0"
                    class="flex-1 min-w-0 flex items-center gap-2 sm:relative h-full"
                >
                    <span
                        class="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-glb-500 text-white shrink-0"
                    >
                        {{ currentHeadline?.tag }}
                    </span>
                    <button
                        type="button"
                        class="truncate text-left text-slate-800 dark:text-slate-200 font-medium cursor-pointer hover:text-glb-600 dark:hover:text-glb-300 min-w-0"
                        :title="currentHeadline?.text"
                        :aria-expanded="headlineOpen"
                        @click="headlineOpen = !headlineOpen"
                    >
                        {{ currentHeadline?.text }}
                    </button>
                    <button
                        v-if="headlines.length > 1"
                        type="button"
                        aria-label="Следна вест"
                        class="px-1 text-[10px] text-slate-500 hover:text-glb-500 cursor-pointer shrink-0"
                        @click="nextHeadline"
                    >
                        [{{ safeIdx + 1 }}/{{ headlines.length }}]
                    </button>

                    <div
                        v-if="headlineOpen"
                        class="absolute inset-x-0 sm:inset-x-auto sm:left-0 top-full z-40 sm:w-max sm:max-w-[calc(100vw-11rem)] md:max-w-2xl bg-white dark:bg-glb-950 border-b-2 sm:border-x border-slate-300 dark:border-glb-700 shadow-lg"
                    >
                        <div
                            class="divide-y divide-slate-200 dark:divide-glb-800 max-h-80 overflow-y-auto"
                        >
                            <div
                                v-for="(h, idx) in headlines"
                                :key="idx"
                                class="px-3 py-2 flex items-start gap-2"
                            >
                                <span
                                    class="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-glb-500 text-white shrink-0"
                                >
                                    {{ h.tag }}
                                </span>
                                <span
                                    class="text-[11px] text-slate-800 dark:text-slate-200"
                                >
                                    {{ h.text }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { MoonOutline, SearchOutline, SunnyOutline } from "@vicons/ionicons5";
import { navigate } from "vike/client/router";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import logoTextUrl from "../../assets/logo_text.svg";
import { COUNT_BADGE_ONGOING, COUNT_BADGE_SCHEDULED } from "../util/constants";
import { formatEventHeadline, formatSkopjeTime } from "../util/formatters";
import type {
  CategoryBreakdown,
  EventDto,
  PrecomputedMunicipality,
} from "../util/types";

const props = defineProps<{
  events: EventDto[];
  municipalities?: PrecomputedMunicipality[];
  statsByMunicipality?: Record<string, CategoryBreakdown>;
  lastUpdatedAt?: Date | null;
  refreshing?: boolean;
}>();

defineEmits<{
  reset: [];
  toggleTheme: [];
  refresh: [];
}>();

const navLinks: Array<{ label: string; href: string }> = [
  //   { label: "За нас", href: "/about" },
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

const searchBox = ref<HTMLElement | null>(null);
const searchInput = ref<HTMLInputElement | null>(null);
const searchQuery = ref("");
const searchOpen = ref(false);
const activeIndex = ref(0);
const headlineBox = ref<HTMLElement | null>(null);
const headlineOpen = ref(false);

function ongoingCount(code: string): number {
  return props.statsByMunicipality?.[code]?.ongoing ?? 0;
}

function scheduledCount(code: string): number {
  return props.statsByMunicipality?.[code]?.scheduled ?? 0;
}

const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();
  if (!q) return [];
  return (props.municipalities ?? [])
    .filter(
      (m) =>
        m.nameMk.toLowerCase().includes(q) ||
        m.nameEn.toLowerCase().includes(q),
    )
    .sort((a, b) => {
      const aActive = ongoingCount(a.code) > 0 ? 1 : 0;
      const bActive = ongoingCount(b.code) > 0 ? 1 : 0;
      if (aActive !== bActive) return bActive - aActive;
      return a.nameMk.localeCompare(b.nameMk, "mk");
    })
    .slice(0, 8);
});

watch(searchQuery, () => {
  activeIndex.value = 0;
  searchOpen.value = searchQuery.value.trim().length > 0;
});

async function selectMunicipality(m: PrecomputedMunicipality | undefined) {
  if (!m) return;
  searchQuery.value = "";
  searchOpen.value = false;
  searchInput.value?.blur();
  await navigate(`/${m.slug}`);
}

function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return (
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT" ||
    el.isContentEditable
  );
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    searchOpen.value = false;
    headlineOpen.value = false;
    if (document.activeElement === searchInput.value) searchInput.value?.blur();
    return;
  }

  if (
    e.key === "/" &&
    !e.metaKey &&
    !e.ctrlKey &&
    !e.altKey &&
    !isEditableTarget(e.target)
  ) {
    e.preventDefault();
    searchInput.value?.focus();
    searchOpen.value = searchQuery.value.trim().length > 0;
    return;
  }

  if (!searchOpen.value || searchResults.value.length === 0) return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    activeIndex.value = Math.min(
      activeIndex.value + 1,
      searchResults.value.length - 1,
    );
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
  } else if (e.key === "Enter") {
    selectMunicipality(searchResults.value[activeIndex.value]);
  }
}

function onPointerDown(e: PointerEvent) {
  const target = e.target as Node | null;
  if (searchBox.value && target && !searchBox.value.contains(target)) {
    searchOpen.value = false;
  }
  if (headlineBox.value && target && !headlineBox.value.contains(target)) {
    headlineOpen.value = false;
  }
}

onMounted(() => {
  tickerTimer = setInterval(advanceHeadline, 8000);
  document.addEventListener("keydown", onKeydown);
  document.addEventListener("pointerdown", onPointerDown);
});
onUnmounted(() => {
  if (tickerTimer) clearInterval(tickerTimer);
  document.removeEventListener("keydown", onKeydown);
  document.removeEventListener("pointerdown", onPointerDown);
});
</script>
