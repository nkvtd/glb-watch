<template>
    <section
        class="bg-white dark:bg-glb-900 border border-slate-300 dark:border-glb-800"
    >
        <div
            class="p-3 border-b border-slate-300 dark:border-glb-800 flex items-center justify-between gap-3"
        >
            <h2 class="text-sm font-bold uppercase tracking-wider">
                Регистар
            </h2>
        </div>

        <div
            class="grid grid-cols-2 sm:grid-cols-5 bg-slate-100 dark:bg-glb-950 border-b border-slate-300 dark:border-glb-800"
        >
            <button
                v-for="(st, idx) in statusTabs"
                :key="st.value"
                type="button"
                class="px-3 py-2 text-xs font-mono uppercase cursor-pointer transition-colors border-slate-300 dark:border-glb-800 flex items-center justify-center text-center"
                :class="[
                    idx === 0
                        ? 'col-span-2 sm:col-span-1 border-b sm:border-b-0 sm:border-r'
                        : '',
                    idx === 1 || idx === 3
                        ? 'border-r'
                        : '',
                    idx === 2
                        ? 'sm:border-r'
                        : '',
                    idx === 1 || idx === 2
                        ? 'border-b sm:border-b-0'
                        : '',
                    statusFilter === st.value
                        ? 'bg-glb-500 text-white font-bold'
                        : 'hover:bg-slate-200 dark:hover:bg-glb-800 text-slate-800 dark:text-slate-200',
                ]"
                @click="$emit('update:statusFilter', st.value)"
            >
                {{ st.label }}
            </button>
        </div>

        <div
            class="p-3 bg-slate-100 dark:bg-glb-950 border-b border-slate-300 dark:border-glb-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
            <div class="sm:col-span-2 flex flex-col gap-1">
                <label
                    class="text-[11px] font-mono uppercase font-bold text-slate-600 dark:text-slate-400"
                >
                    Пребарување
                </label>
                <div class="relative">
                    <SearchOutline
                        class="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2"
                    />
                    <input
                        :value="searchQuery"
                        type="text"
                        placeholder="Улица, населба или клучен збор..."
                        class="w-full pl-9 pr-3 py-1.5 text-xs font-mono bg-white dark:bg-glb-900 border border-slate-300 dark:border-glb-700 focus:outline-none focus:border-glb-500"
                        @input="
                            $emit(
                                'update:searchQuery',
                                ($event.target as HTMLInputElement).value,
                            )
                        "
                    />
                </div>
            </div>

            <div class="flex flex-col gap-1">
                <label
                    class="text-[11px] font-mono uppercase font-bold text-slate-600 dark:text-slate-400"
                >
                    Извор на податоци
                </label>
                <select
                    :value="sourceFilter"
                    class="px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-glb-900 border border-slate-300 dark:border-glb-700"
                    @change="
                        $emit(
                            'update:sourceFilter',
                            ($event.target as HTMLSelectElement).value,
                        )
                    "
                >
                    <option value="">Сите извори</option>
                    <option
                        v-for="src in availableSources"
                        :key="src.key"
                        :value="src.key"
                    >
                        {{ src.label }}
                    </option>
                </select>
            </div>

            <div class="flex flex-col gap-1">
                <label
                    class="text-[11px] font-mono uppercase font-bold text-slate-600 dark:text-slate-400"
                >
                    Подреди по
                </label>
                <select
                    :value="sortOption"
                    class="px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-glb-900 border border-slate-300 dark:border-glb-700"
                    @change="
                        $emit(
                            'update:sortOption',
                            ($event.target as HTMLSelectElement).value as any,
                        )
                    "
                >
                    <option value="startsAt:desc">
                        Почеток (најнови прво)
                    </option>
                    <option value="startsAt:asc">
                        Почеток (најстари прво)
                    </option>
                    <option value="observedAt:desc">Последно проверени</option>
                </select>
            </div>
        </div>

        <div
            ref="scrollBoxRef"
            class="max-h-160 overflow-y-auto divide-y divide-slate-200 dark:divide-glb-800"
            @scroll="onScroll"
        >
            <div
                v-if="items.length > 0"
                class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-glb-800"
            >
                <article
                    v-for="rep in items"
                    :id="`report-${rep.id}`"
                    :key="rep.id"
                    class="p-4 flex flex-col justify-between gap-3 border-b border-slate-200 dark:border-glb-800 transition-colors"
                    :class="
                        highlightedId === rep.id
                            ? 'bg-glb-500/15 ring-2 ring-inset ring-glb-500'
                            : 'hover:bg-slate-50 dark:hover:bg-glb-800/40'
                    "
                >
                    <div class="space-y-2">
                        <div
                            class="flex flex-wrap items-center justify-between gap-2"
                        >
                            <div class="flex items-center gap-1.5">
                                <span
                                    class="px-2 py-0.5 text-[11px] font-mono font-bold border uppercase"
                                    :class="
                                        getCategoryMeta(rep.category).badgeClass
                                    "
                                >
                                    {{ getCategoryMeta(rep.category).labelMk }}
                                </span>
                                <span
                                    class="px-2 py-0.5 text-[11px] font-mono bg-slate-200 dark:bg-glb-800 text-slate-800 dark:text-slate-300"
                                >
                                    {{ SOURCE_LABELS[rep.source] || rep.source }}
                                </span>
                            </div>

                            <span
                                class="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono font-bold border"
                                :class="getStatusMeta(rep.status).badgeClass"
                            >
                                <span
                                    class="w-1.5 h-1.5"
                                    :class="
                                        getStatusMeta(rep.status).indicatorClass
                                    "
                                ></span>
                                {{ getStatusMeta(rep.status).labelMk }}
                            </span>
                        </div>

                        <h3 class="text-sm font-bold leading-snug">
                            {{ rep.title }}
                        </h3>
                        <p
                            v-if="rep.description"
                            class="text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                        >
                            {{ rep.description }}
                        </p>
                    </div>

                    <div
                        class="pt-2 border-t border-slate-200 dark:border-glb-800 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-400"
                    >
                        <div class="flex flex-wrap items-center gap-3">
                            <span
                                v-if="rep.locationLabel"
                                class="font-bold text-slate-800 dark:text-slate-200"
                            >
                                {{ rep.locationLabel }}
                            </span>
                            <span v-if="rep.startsAt">
                                Почеток:
                                {{ formatMacedonianDateTime(rep.startsAt) }}
                            </span>
                            <span
                                v-if="
                                    rep.endsAt && rep.endsAt !== rep.startsAt
                                "
                            >
                                Крај: {{ formatMacedonianDateTime(rep.endsAt) }}
                            </span>
                        </div>
                    </div>
                </article>
            </div>

            <div
                v-else-if="!loading"
                class="p-10 text-center text-xs font-mono text-slate-500"
            >
                Нема пронајдени записи за избраните параметри.
            </div>

            <div
                v-if="hasNextPage"
                class="p-3 bg-slate-50 dark:bg-glb-950 flex justify-center"
            >
                <button
                    type="button"
                    :disabled="loading"
                    class="px-4 py-2 text-xs font-mono font-bold uppercase bg-glb-500 text-white hover:bg-glb-600 disabled:opacity-50 cursor-pointer"
                    @click="$emit('loadMore')"
                >
                    {{ loading ? "Се вчитува..." : "Вчитај повеќе записи" }}
                </button>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { SearchOutline } from "@vicons/ionicons5";
import { computed, ref } from "vue";
import {
  getCategoryMeta,
  getStatusMeta,
  SOURCE_LABELS,
} from "../util/constants";
import { formatMacedonianDateTime } from "../util/formatters";
import type { ReportDto } from "../util/types";

const props = defineProps<{
  items: ReportDto[];
  hasNextPage: boolean;
  loading: boolean;
  statusFilter: string;
  searchQuery: string;
  sourceFilter: string;
  sortOption: string;
  highlightedId: number | null;
}>();

const emit = defineEmits<{
  "update:statusFilter": [val: string];
  "update:searchQuery": [val: string];
  "update:sourceFilter": [val: string];
  "update:sortOption": [
    val: "startsAt:desc" | "startsAt:asc" | "observedAt:desc",
  ];
  loadMore: [];
}>();

const statusTabs = [
  { label: "Во тек и најавени", value: "ongoing,scheduled" },
  { label: "Само во тек", value: "ongoing" },
  { label: "Најавени", value: "scheduled" },
  { label: "Завршени", value: "ended" },
  { label: "Останати", value: "omitted" },
];

const availableSources = computed(() => {
  const map = new Map<string, string>();
  for (const [k, v] of Object.entries(SOURCE_LABELS)) {
    map.set(k, v);
  }
  for (const item of props.items) {
    if (item.source && !map.has(item.source)) {
      map.set(item.source, item.source);
    }
  }
  return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
});

const scrollBoxRef = ref<HTMLElement | null>(null);

function onScroll() {
  const el = scrollBoxRef.value;
  if (!el || props.loading || !props.hasNextPage) return;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 180) {
    emit("loadMore");
  }
}
</script>
