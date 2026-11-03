<template>
    <div
        ref="containerRef"
        data-muni-interactive
        class="relative w-full h-105 sm:h-125 lg:h-full lg:min-h-0 flex flex-col bg-slate-200 dark:bg-glb-900 border border-slate-300 dark:border-glb-800 overflow-hidden select-none"
        @mousemove="onContainerMouseMove"
    >
        <div class="absolute top-3 left-3 z-10 flex items-center gap-1.5">
            <button
                type="button"
                class="px-2.5 py-1.5 text-xs font-mono font-bold uppercase bg-white dark:bg-glb-950 border border-slate-400 dark:border-glb-700 hover:border-glb-500 cursor-pointer flex items-center gap-1.5 shadow-sm"
                @click="zoomToSkopje"
            >
                <LocateOutline class="w-3.5 h-3.5 text-glb-500" />
                <span>Град Скопје</span>
            </button>
            <button
                v-if="isZoomed || selectedMunicipalityCode"
                type="button"
                class="px-2.5 py-1.5 text-xs font-mono font-bold uppercase bg-glb-500 text-white border border-glb-600 hover:bg-glb-600 cursor-pointer flex items-center gap-1 shadow-sm"
                @click="resetView"
            >
                <CloseOutline class="w-3.5 h-3.5" />
                <span>Ресетирај поглед</span>
            </button>
        </div>

        <div class="absolute top-3 right-3 z-10 flex flex-col border border-slate-400 dark:border-glb-700 bg-white dark:bg-glb-950 divide-y divide-slate-300 dark:divide-glb-800 shadow-sm">
            <button
                type="button"
                aria-label="Зголеми"
                class="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-glb-800 cursor-pointer"
                @click="zoomBy(0.72)"
            >
                <AddOutline class="w-4 h-4" />
            </button>
            <button
                type="button"
                aria-label="Намали"
                class="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-glb-800 cursor-pointer"
                @click="zoomBy(1.38)"
            >
                <RemoveOutline class="w-4 h-4" />
            </button>
        </div>

        <svg
            ref="svgRef"
            :viewBox="`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`"
            preserveAspectRatio="xMidYMid meet"
            class="w-full flex-1 touch-none"
            :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
            @wheel.prevent="onWheel"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointerleave="onPointerLeave"
            @click="onBackgroundClick"
        >
            <defs>
                <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="#0ea5e9" stop-opacity="0.32" />
                    <stop offset="70%" stop-color="#56797d" stop-opacity="0.18" />
                    <stop offset="100%" stop-color="#56797d" stop-opacity="0.04" />
                </radialGradient>
            </defs>

            <g>
                <path
                    v-for="m in municipalities"
                    :key="m.code"
                    :d="m.svgPath"
                    :fill="getPolygonFill(m.code)"
                    :stroke="baseStrokeColor"
                    stroke-width="1"
                    vector-effect="non-scaling-stroke"
                    stroke-linejoin="round"
                    class="cursor-pointer"
                    @mouseenter="hoveredCode = m.code"
                    @mouseleave="hoveredCode = null"
                    @click.stop="toggleMunicipality(m)"
                />
            </g>

            <g class="pointer-events-none">
                <path
                    v-if="selectedMunicipalityPath"
                    :d="selectedMunicipalityPath"
                    fill="none"
                    :stroke="highlightStrokeColor"
                    stroke-width="2.5"
                    vector-effect="non-scaling-stroke"
                    stroke-linejoin="round"
                />
                <path
                    v-if="hoveredMunicipalityPath && hoveredCode !== selectedMunicipalityCode"
                    :d="hoveredMunicipalityPath"
                    fill="none"
                    :stroke="highlightStrokeColor"
                    stroke-width="2"
                    vector-effect="non-scaling-stroke"
                    stroke-linejoin="round"
                />
            </g>

            <g>
                <template v-for="r in geocodedReports" :key="`pt-${r.id}`">
                    <rect
                        v-if="r.status === 'omitted'"
                        :x="r.svgPt[0] - pinRadius * 0.85"
                        :y="r.svgPt[1] - pinRadius * 0.85"
                        :width="pinRadius * 1.7"
                        :height="pinRadius * 1.7"
                        fill="#14b8a6"
                        :stroke="isDark ? '#0f1719' : '#ffffff'"
                        stroke-width="1.2"
                        vector-effect="non-scaling-stroke"
                        class="cursor-pointer"
                        @mouseenter="hoveredReport = r; hoveredCode = r.resolvedCode"
                        @mouseleave="hoveredReport = null"
                        @click.stop="$emit('selectReport', r)"
                    />
                    <circle
                        v-else
                        :cx="r.svgPt[0]"
                        :cy="r.svgPt[1]"
                        :r="pinRadius * 1.15"
                        :fill="r.status === 'ongoing' ? '#ef4444' : '#fcd34d'"
                        stroke="#0f1719"
                        stroke-width="1.2"
                        vector-effect="non-scaling-stroke"
                        class="cursor-pointer"
                        @mouseenter="hoveredReport = r; hoveredCode = r.resolvedCode"
                        @mouseleave="hoveredReport = null"
                        @click.stop="$emit('selectReport', r)"
                    />
                </template>
            </g>

            <g v-if="zoomScale < 0.55" class="pointer-events-none">
                <text
                    v-for="m in municipalities"
                    :key="`lbl-${m.code}`"
                    :x="m.centerSvg[0]"
                    :y="m.centerSvg[1]"
                    text-anchor="middle"
                    dominant-baseline="central"
                    :font-size="labelFontSize"
                    :fill="isDark ? '#f1f5f9' : '#0f172a'"
                    class="font-mono font-bold"
                >
                    {{ m.nameMk }}
                </text>
            </g>

            <g v-if="nearbyCircleSvg" class="pointer-events-none">
                <circle
                    :cx="nearbyCircleSvg.cx"
                    :cy="nearbyCircleSvg.cy"
                    :r="nearbyCircleSvg.r"
                    fill="url(#radar-glow)"
                    stroke="#0ea5e9"
                    stroke-width="1.5"
                    vector-effect="non-scaling-stroke"
                    stroke-dasharray="5 3"
                />
                <circle
                    :cx="nearbyCircleSvg.cx"
                    :cy="nearbyCircleSvg.cy"
                    :r="nearbyCircleSvg.r"
                    fill="none"
                    stroke="#0ea5e9"
                    stroke-width="1.5"
                    vector-effect="non-scaling-stroke"
                >
                    <animate
                        attributeName="r"
                        :from="pinRadius * 1.4"
                        :to="nearbyCircleSvg.r"
                        dur="2.4s"
                        repeatCount="indefinite"
                    />
                    <animate
                        attributeName="opacity"
                        from="0.85"
                        to="0"
                        dur="2.4s"
                        repeatCount="indefinite"
                    />
                </circle>
                <line
                    :x1="nearbyCircleSvg.cx"
                    :y1="nearbyCircleSvg.cy"
                    :x2="nearbyCircleSvg.cx"
                    :y2="nearbyCircleSvg.cy - nearbyCircleSvg.r"
                    stroke="#0ea5e9"
                    stroke-width="1.5"
                    stroke-opacity="0.75"
                    vector-effect="non-scaling-stroke"
                >
                    <animateTransform
                        attributeName="transform"
                        type="rotate"
                        :from="`0 ${nearbyCircleSvg.cx} ${nearbyCircleSvg.cy}`"
                        :to="`360 ${nearbyCircleSvg.cx} ${nearbyCircleSvg.cy}`"
                        dur="4s"
                        repeatCount="indefinite"
                    />
                </line>
                <circle
                    :cx="nearbyCircleSvg.cx"
                    :cy="nearbyCircleSvg.cy"
                    :r="pinRadius * 1.9"
                    fill="#0ea5e9"
                    fill-opacity="0.3"
                >
                    <animate
                        attributeName="r"
                        :values="`${pinRadius * 1.4};${pinRadius * 2.5};${pinRadius * 1.4}`"
                        dur="1.8s"
                        repeatCount="indefinite"
                    />
                </circle>
                <circle
                    :cx="nearbyCircleSvg.cx"
                    :cy="nearbyCircleSvg.cy"
                    :r="pinRadius * 1.15"
                    fill="#0ea5e9"
                    stroke="#ffffff"
                    stroke-width="1.8"
                    vector-effect="non-scaling-stroke"
                />
            </g>
        </svg>

        <div
            v-if="tooltipMunicipality && !isDragging"
            class="absolute z-20 w-60 p-2.5 bg-white/95 dark:bg-glb-950/95 border-2 border-slate-800 dark:border-glb-400 shadow-md pointer-events-none"
            :style="tooltipStyle"
        >
            <div class="flex items-center justify-between border-b border-slate-300 dark:border-glb-800 pb-1">
                <span class="text-xs font-bold uppercase tracking-wide">
                    {{ tooltipMunicipality.nameMk }}
                </span>
                <span class="text-[10px] font-mono text-slate-500">
                    {{ tooltipMunicipality.regionNameMk }}
                </span>
            </div>

            <div v-if="hoveredReport" class="mt-1.5 text-[11px] space-y-0.5">
                <div class="font-mono font-bold text-glb-600 dark:text-glb-300">
                    {{ STATUS_META[hoveredReport.status].labelMk }}
                </div>
                <div class="font-semibold leading-snug">{{ hoveredReport.title }}</div>
            </div>

            <div v-else class="mt-1.5 space-y-1 text-[11px] font-mono">
                <div class="flex justify-between">
                    <span class="text-slate-600 dark:text-slate-400">Во тек:</span>
                    <span class="font-bold text-red-600 dark:text-red-400">{{ tooltipStats.ongoing }}</span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-600 dark:text-slate-400">Најавено:</span>
                    <span class="font-bold text-amber-500 dark:text-amber-300">{{ tooltipStats.scheduled }}</span>
                </div>
                <div v-if="tooltipStats.omitted > 0" class="flex justify-between">
                    <span class="text-slate-600 dark:text-slate-400">Мерни станици:</span>
                    <span class="font-bold text-teal-600 dark:text-teal-400">{{ tooltipStats.omitted }}</span>
                </div>
            </div>
        </div>

        <div class="bg-white/95 dark:bg-glb-950/95 border-t border-slate-300 dark:border-glb-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono shrink-0">
            <div class="flex flex-wrap items-center gap-3">
                <span class="inline-flex items-center gap-1.5">
                    <span class="w-3 h-3 bg-slate-50 dark:bg-glb-800 border border-slate-400 inline-block"></span>
                    <span>Ништо</span>
                </span>
                <span class="inline-flex items-center gap-1.5">
                    <span class="w-3 h-3 bg-amber-300 border border-amber-500 inline-block"></span>
                    <span>Најавено</span>
                </span>
                <span class="inline-flex items-center gap-1.5">
                    <span class="w-3 h-3 bg-orange-600 inline-block"></span>
                    <span>1–2 во тек</span>
                </span>
                <span class="inline-flex items-center gap-1.5">
                    <span class="w-3 h-3 bg-red-600 inline-block"></span>
                    <span>3+ во тек</span>
                </span>
                <span class="inline-flex items-center gap-1.5">
                    <span class="w-2.5 h-2.5 bg-teal-500 border border-slate-900 inline-block"></span>
                    <span>Мерна станица</span>
                </span>
            </div>
            <span class="hidden sm:inline text-slate-500">
                Кликни празно место за ресетирање
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
  AddOutline,
  CloseOutline,
  LocateOutline,
  RemoveOutline,
} from "@vicons/ionicons5";
import { computed, reactive, ref, watch } from "vue";
import { resolveReportMunicipalityCode } from "../util/api";
import { createEmptyBreakdown, STATUS_META } from "../util/constants";
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  projectPoint,
  SKOPJE_VIEWBOX,
} from "../util/geo";
import type {
  CategoryBreakdown,
  Coordinates,
  PrecomputedMunicipality,
  ReportCategory,
  ReportDto,
} from "../util/types";

const props = defineProps<{
  municipalities: PrecomputedMunicipality[];
  statsByMunicipality: Record<string, CategoryBreakdown>;
  mapReports: ReportDto[];
  selectedMunicipalityCode: string | null;
  selectedCategory: ReportCategory | "all";
  nearbyCenter: Coordinates | null;
  nearbyRadiusMeters: number;
  isDark: boolean;
}>();

const emit = defineEmits<{
  selectMunicipality: [code: string | null];
  selectReport: [report: ReportDto];
}>();

const containerRef = ref<HTMLElement | null>(null);
const svgRef = ref<SVGSVGElement | null>(null);
const hoveredCode = ref<string | null>(null);
const hoveredReport = ref<ReportDto | null>(null);
const cursorPos = reactive({ x: 20, y: 20 });

const viewBox = reactive({
  x: 0,
  y: 0,
  w: MAP_WIDTH,
  h: MAP_HEIGHT,
});

const isZoomed = computed(
  () => viewBox.w < MAP_WIDTH * 0.92 || viewBox.x > 10 || viewBox.y > 10,
);

let animFrame: number | null = null;

function animateViewBox(target: {
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  if (animFrame) cancelAnimationFrame(animFrame);
  const startX = viewBox.x;
  const startY = viewBox.y;
  const startW = viewBox.w;
  const startH = viewBox.h;
  const duration = 200;
  const startTime = performance.now();

  function step(now: number) {
    const t = Math.min(1, (now - startTime) / duration);
    const ease = 1 - (1 - t) ** 3;
    viewBox.x = startX + (target.x - startX) * ease;
    viewBox.y = startY + (target.y - startY) * ease;
    viewBox.w = startW + (target.w - startW) * ease;
    viewBox.h = startH + (target.h - startH) * ease;
    if (t < 1) {
      animFrame = requestAnimationFrame(step);
    }
  }

  animFrame = requestAnimationFrame(step);
}

function zoomToMunicipality(m: PrecomputedMunicipality) {
  const [minX, minY, maxX, maxY] = m.bbox;
  const bw = Math.max(70, (maxX - minX) * 1.7);
  const bh = Math.max(55, (maxY - minY) * 1.7);
  const aspect = MAP_WIDTH / MAP_HEIGHT;
  const w = Math.max(bw, bh * aspect);
  const h = w / aspect;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  animateViewBox({
    x: Math.max(0, Math.min(MAP_WIDTH - w, cx - w / 2)),
    y: Math.max(0, Math.min(MAP_HEIGHT - h, cy - h / 2)),
    w,
    h,
  });
}

watch(
  () => props.selectedMunicipalityCode,
  (code) => {
    if (!code) {
      animateViewBox({ x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT });
      return;
    }
    const found = props.municipalities.find((m) => m.code === code);
    if (found) zoomToMunicipality(found);
  },
);

watch(
  () => props.nearbyCenter,
  (center) => {
    if (!center) return;
    const [cx, cy] = projectPoint(center.lng, center.lat);
    const w = 220;
    const h = w * (MAP_HEIGHT / MAP_WIDTH);
    animateViewBox({
      x: Math.max(0, Math.min(MAP_WIDTH - w, cx - w / 2)),
      y: Math.max(0, Math.min(MAP_HEIGHT - h, cy - h / 2)),
      w,
      h,
    });
  },
);

function toggleMunicipality(m: PrecomputedMunicipality) {
  if (didDragMove.value) return;
  emit(
    "selectMunicipality",
    props.selectedMunicipalityCode === m.code ? null : m.code,
  );
}

function onBackgroundClick() {
  if (didDragMove.value) return;
  if (props.selectedMunicipalityCode) {
    emit("selectMunicipality", null);
  }
}

function zoomToSkopje() {
  animateViewBox(SKOPJE_VIEWBOX);
}

function resetView() {
  emit("selectMunicipality", null);
  animateViewBox({ x: 0, y: 0, w: MAP_WIDTH, h: MAP_HEIGHT });
}

function zoomBy(factor: number) {
  const newW = Math.max(100, Math.min(MAP_WIDTH, viewBox.w * factor));
  const newH = newW * (MAP_HEIGHT / MAP_WIDTH);
  const cx = viewBox.x + viewBox.w / 2;
  const cy = viewBox.y + viewBox.h / 2;
  animateViewBox({
    x: Math.max(0, Math.min(MAP_WIDTH - newW, cx - newW / 2)),
    y: Math.max(0, Math.min(MAP_HEIGHT - newH, cy - newH / 2)),
    w: newW,
    h: newH,
  });
}

function onWheel(e: WheelEvent) {
  if (!svgRef.value) return;
  if (animFrame) cancelAnimationFrame(animFrame);
  const rect = svgRef.value.getBoundingClientRect();
  const relX = (e.clientX - rect.left) / rect.width;
  const relY = (e.clientY - rect.top) / rect.height;

  const factor = e.deltaY < 0 ? 0.84 : 1.19;
  const newW = Math.max(100, Math.min(MAP_WIDTH, viewBox.w * factor));
  const newH = newW * (MAP_HEIGHT / MAP_WIDTH);

  const cursorSvgX = viewBox.x + relX * viewBox.w;
  const cursorSvgY = viewBox.y + relY * viewBox.h;

  viewBox.x = Math.max(0, Math.min(MAP_WIDTH - newW, cursorSvgX - relX * newW));
  viewBox.y = Math.max(
    0,
    Math.min(MAP_HEIGHT - newH, cursorSvgY - relY * newH),
  );
  viewBox.w = newW;
  viewBox.h = newH;
}

const isDragging = ref(false);
const didDragMove = ref(false);
let dragStart = { x: 0, y: 0, vx: 0, vy: 0 };

function onPointerDown(e: PointerEvent) {
  if (e.button !== 0) return;
  if (animFrame) cancelAnimationFrame(animFrame);
  isDragging.value = true;
  didDragMove.value = false;
  dragStart = { x: e.clientX, y: e.clientY, vx: viewBox.x, vy: viewBox.y };
}

function onPointerMove(e: PointerEvent) {
  if (!isDragging.value || !svgRef.value) return;
  const dist = Math.hypot(e.clientX - dragStart.x, e.clientY - dragStart.y);
  if (dist > 4) didDragMove.value = true;

  const rect = svgRef.value.getBoundingClientRect();
  const dx = ((e.clientX - dragStart.x) / rect.width) * viewBox.w;
  const dy = ((e.clientY - dragStart.y) / rect.height) * viewBox.h;
  viewBox.x = Math.max(0, Math.min(MAP_WIDTH - viewBox.w, dragStart.vx - dx));
  viewBox.y = Math.max(0, Math.min(MAP_HEIGHT - viewBox.h, dragStart.vy - dy));
}

function onPointerUp() {
  isDragging.value = false;
}

function onPointerLeave() {
  isDragging.value = false;
  hoveredCode.value = null;
  hoveredReport.value = null;
}

function onContainerMouseMove(e: MouseEvent) {
  if (!containerRef.value) return;
  const rect = containerRef.value.getBoundingClientRect();
  cursorPos.x = e.clientX - rect.left;
  cursorPos.y = e.clientY - rect.top;
}

const tooltipStyle = computed(() => {
  const cw = containerRef.value?.clientWidth || 700;
  const ch = containerRef.value?.clientHeight || 460;
  const boxW = 240;
  const boxH = 110;
  const left =
    cursorPos.x + boxW + 24 > cw
      ? Math.max(8, cursorPos.x - boxW - 14)
      : cursorPos.x + 14;
  const top =
    cursorPos.y + boxH + 36 > ch
      ? Math.max(8, cursorPos.y - boxH - 10)
      : cursorPos.y + 14;
  return {
    left: `${left}px`,
    top: `${top}px`,
  };
});

const zoomScale = computed(() => viewBox.w / MAP_WIDTH);
const pinRadius = computed(() => Math.max(2.0, 5.2 * zoomScale.value));
const labelFontSize = computed(() => Math.max(4.5, 10 * zoomScale.value));

const geocodedReports = computed(() =>
  props.mapReports
    .filter((r) => r.coordinates !== null)
    .map((r) => ({
      ...r,
      resolvedCode: resolveReportMunicipalityCode(r, props.municipalities),
      svgPt: projectPoint(r.coordinates.lng, r.coordinates.lat),
    })),
);

const nearbyCircleSvg = computed(() => {
  if (!props.nearbyCenter) return null;
  const [cx, cy] = projectPoint(props.nearbyCenter.lng, props.nearbyCenter.lat);
  const rSvg =
    (props.nearbyRadiusMeters / 111_320 / (42.39 - 40.83)) * (MAP_HEIGHT - 56);
  return { cx, cy, r: Math.max(8, rSvg) };
});

const baseStrokeColor = computed(() => (props.isDark ? "#436063" : "#94a3b8"));
const highlightStrokeColor = computed(() =>
  props.isDark ? "#ffffff" : "#0f172a",
);

const selectedMunicipalityPath = computed(
  () =>
    props.municipalities.find((m) => m.code === props.selectedMunicipalityCode)
      ?.svgPath ?? null,
);

const hoveredMunicipalityPath = computed(
  () =>
    props.municipalities.find((m) => m.code === hoveredCode.value)?.svgPath ??
    null,
);

function getPolygonFill(code: string): string {
  const isHovered = hoveredCode.value === code;
  const isSelected = props.selectedMunicipalityCode === code;
  const stats = props.statsByMunicipality[code];
  const ongoing = stats?.ongoing ?? 0;
  const scheduled = stats?.scheduled ?? 0;

  if (ongoing === 0 && scheduled === 0) {
    if (isSelected) return props.isDark ? "#2e3f42" : "#cbd5e1";
    if (isHovered) return props.isDark ? "#233438" : "#e2e8f0";
    return props.isDark ? "#162124" : "#f8fafc";
  }

  if (ongoing === 0 && scheduled > 0) {
    return isHovered || isSelected ? "#fde047" : "#fcd34d";
  }
  if (ongoing <= 2) {
    return isHovered || isSelected ? "#fb923c" : "#ea580c";
  }
  return isHovered || isSelected ? "#f87171" : "#dc2626";
}

const tooltipMunicipality = computed(() => {
  const code = hoveredCode.value;
  if (!code) return null;
  return props.municipalities.find((m) => m.code === code) ?? null;
});

const tooltipStats = computed<CategoryBreakdown>(() => {
  const code = tooltipMunicipality.value?.code;
  return (code && props.statsByMunicipality[code]) || createEmptyBreakdown();
});
</script>