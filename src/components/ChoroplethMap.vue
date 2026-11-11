<template>
    <div
        ref="containerRef"
        data-muni-interactive
        class="relative w-full h-105 sm:h-125 lg:h-full lg:min-h-0 flex flex-col border border-slate-300 dark:border-glb-800 overflow-hidden select-none"
        :style="{ backgroundColor: palette.canvasBg }"
        @mousemove="onContainerMouseMove"
    >
        <div
            v-if="isNavigating"
            class="absolute inset-0 z-30 bg-slate-900/40 dark:bg-glb-950/60 backdrop-blur-[1px] flex items-center justify-center"
        >
            <div
                class="px-3.5 py-2 bg-white/95 dark:bg-glb-900/95 border border-glb-500 shadow-lg flex items-center gap-2.5 text-[11px] font-mono font-bold uppercase tracking-wider"
            >
                <span class="relative flex items-center justify-center w-4 h-4">
                    <span
                        class="absolute inset-0 rounded-full border border-sky-500/70 animate-ping"
                    ></span>
                    <span
                        class="w-3.5 h-3.5 rounded-full border-2 border-glb-500 border-t-sky-400 animate-spin inline-block"
                    ></span>
                    <span
                        class="absolute w-1 h-1 rounded-full bg-sky-500"
                    ></span>
                </span>
                <span>Се вчитува...</span>
            </div>
        </div>

        <div class="absolute top-3 left-3 z-10 flex items-center gap-1.5">
            <button
                v-if="!focusedMunicipalityCode"
                type="button"
                class="px-2.5 py-1.5 text-xs font-mono font-bold uppercase bg-white/95 dark:bg-glb-950/95 border border-slate-400 dark:border-glb-700 hover:border-glb-500 cursor-pointer flex items-center gap-1.5 shadow-sm transition-colors"
                @click="zoomToSkopje"
            >
                <LocateOutline class="w-3.5 h-3.5 text-glb-500" />
                <span>Град Скопје</span>
            </button>
            <button
                v-if="isCameraMoved"
                type="button"
                class="px-2.5 py-1.5 text-xs font-mono font-bold uppercase bg-glb-500 text-white border border-glb-600 hover:bg-glb-600 cursor-pointer flex items-center gap-1 shadow-sm transition-colors"
                @click="resetCamera"
            >
                <CloseOutline class="w-3.5 h-3.5" />
                <span>Ресетирај поглед</span>
            </button>
        </div>

        <div
            class="absolute top-3 right-3 z-10 flex flex-col border border-slate-400 dark:border-glb-700 bg-white/95 dark:bg-glb-950/95 divide-y divide-slate-300 dark:divide-glb-800 shadow-sm"
        >
            <button
                type="button"
                aria-label="Зголеми"
                class="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-glb-800 cursor-pointer transition-colors"
                @click="stepZoom(1.45)"
            >
                <AddOutline class="w-4 h-4" />
            </button>
            <button
                type="button"
                aria-label="Намали"
                class="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-glb-800 cursor-pointer transition-colors"
                @click="stepZoom(0.69)"
            >
                <RemoveOutline class="w-4 h-4" />
            </button>
        </div>

        <svg
            ref="svgRef"
            :viewBox="`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`"
            preserveAspectRatio="xMidYMid meet"
            class="w-full flex-1 touch-none"
            :class="isDragging ? 'cursor-grabbing' : 'cursor-grab'"
            @wheel.prevent="onWheel"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
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

            <g
                :transform="`translate(${cam.tx}, ${cam.ty}) scale(${cam.scale})`"
            >
                <g>
                    <path
                        v-for="m in visibleMunicipalities"
                        :key="m.code"
                        :d="m.svgPath"
                        :fill="getPolygonFill(m.code)"
                        :fill-opacity="getPolygonOpacity(m.code)"
                        :stroke="palette.strokeBase"
                        stroke-width="1"
                        vector-effect="non-scaling-stroke"
                        stroke-linejoin="round"
                        :class="
                            focusedMunicipalityCode &&
                            focusedMunicipalityCode === m.code
                                ? 'cursor-default'
                                : 'cursor-pointer'
                        "
                        @pointerenter="onPolygonEnter($event, m.code)"
                        @pointerleave="onPolygonLeave($event)"
                        @click.stop="onPolygonClick(m)"
                    />
                </g>

                <g class="pointer-events-none">
                    <path
                        v-if="activeOutlinePath"
                        :d="activeOutlinePath"
                        fill="none"
                        :stroke="palette.strokeHighlight"
                        stroke-width="2.4"
                        vector-effect="non-scaling-stroke"
                        stroke-linejoin="round"
                    />
                    <path
                        v-if="
                            hoveredMunicipalityPath &&
                            hoveredCode !== activeOutlineCode
                        "
                        :d="hoveredMunicipalityPath"
                        fill="none"
                        :stroke="palette.strokeHighlight"
                        stroke-width="1.8"
                        vector-effect="non-scaling-stroke"
                        stroke-linejoin="round"
                    />
                </g>

                <g v-if="showPins">
                    <template v-for="r in geocodedReports" :key="`pt-${r.id}`">
                        <rect
                            v-if="r.status === 'omitted'"
                            :x="r.svgPt[0] - pinRadius * 0.9"
                            :y="r.svgPt[1] - pinRadius * 0.9"
                            :width="pinRadius * 1.8"
                            :height="pinRadius * 1.8"
                            fill="#0d9488"
                            :stroke="palette.pinStroke"
                            stroke-width="1.2"
                            vector-effect="non-scaling-stroke"
                            class="cursor-pointer"
                            @click.stop="$emit('selectReport', r)"
                        />
                        <circle
                            v-else
                            :cx="r.svgPt[0]"
                            :cy="r.svgPt[1]"
                            :r="pinRadius * 1.15"
                            :fill="r.status === 'ongoing' ? '#e11d48' : '#d97706'"
                            :stroke="palette.pinStroke"
                            stroke-width="1.2"
                            vector-effect="non-scaling-stroke"
                            class="cursor-pointer"
                            @click.stop="$emit('selectReport', r)"
                        />
                    </template>
                </g>

                <g v-if="cam.scale > 1.85" class="pointer-events-none">
                    <text
                        v-for="m in visibleMunicipalities"
                        :key="`lbl-${m.code}`"
                        :x="m.centerSvg[0]"
                        :y="m.centerSvg[1]"
                        text-anchor="middle"
                        dominant-baseline="central"
                        :font-size="labelFontSize"
                        :fill="palette.labelFill"
                        :opacity="
                            focusedMunicipalityCode &&
                            focusedMunicipalityCode !== m.code
                                ? 0.45
                                : 0.95
                        "
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
            </g>
        </svg>

        <div
            v-if="tooltipMunicipality && !isDragging && !mobilePreviewMuni && !isNavigating"
            class="hidden lg:block absolute z-20 w-60 p-2.5 bg-white/95 dark:bg-glb-950/95 border border-slate-400 dark:border-glb-600 shadow-md pointer-events-none"
            :style="tooltipStyle"
        >
            <div
                class="flex items-center justify-between border-b border-slate-200 dark:border-glb-800 pb-1"
            >
                <span class="text-xs font-bold uppercase tracking-wide">
                    {{ tooltipMunicipality.nameMk }}
                </span>
                <span class="text-[10px] font-mono text-slate-500">
                    {{ tooltipMunicipality.regionNameMk.replace(" Регион", "") }}
                </span>
            </div>

            <div class="mt-1.5 space-y-1 text-[11px] font-mono">
                <div class="flex justify-between">
                    <span class="text-slate-600 dark:text-slate-400">Во тек:</span>
                    <span class="font-bold text-rose-600 dark:text-rose-400">
                        {{ tooltipStats.ongoing }}
                    </span>
                </div>
                <div class="flex justify-between">
                    <span class="text-slate-600 dark:text-slate-400">
                        Најавено:
                    </span>
                    <span class="font-bold text-amber-600 dark:text-amber-300">
                        {{ tooltipStats.scheduled }}
                    </span>
                </div>
                <div
                    v-if="focusedMunicipalityCode !== tooltipMunicipality.code"
                    class="pt-1 border-t border-slate-200 dark:border-glb-800 text-[10px] text-glb-600 dark:text-glb-400 font-bold"
                >
                    Кликни за преглед на општината →
                </div>
            </div>
        </div>

        <div
            v-if="mobilePreviewMuni && !focusedMunicipalityCode && !isNavigating"
            class="lg:hidden absolute inset-x-0 bottom-9 z-20 mx-2 p-3 bg-white/98 dark:bg-glb-950/98 border-2 border-glb-500 shadow-lg space-y-2.5"
        >
            <div class="flex items-start justify-between gap-2">
                <div>
                    <div class="text-xs font-bold uppercase tracking-wider">
                        Општина {{ mobilePreviewMuni.nameMk }}
                    </div>
                    <div class="text-[11px] font-mono text-slate-500">
                        {{ mobilePreviewMuni.regionNameMk }}
                    </div>
                </div>
                <button
                    type="button"
                    aria-label="Затвори"
                    class="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                    @click="mobilePreviewCode = null"
                >
                    <CloseOutline class="w-4 h-4" />
                </button>
            </div>

            <div class="grid grid-cols-2 gap-2 text-xs font-mono">
                <div
                    class="px-2.5 py-1.5 bg-slate-100 dark:bg-glb-900 border border-slate-300 dark:border-glb-800 flex items-center justify-between"
                >
                    <span class="text-slate-600 dark:text-slate-400">Во тек:</span>
                    <span class="font-bold text-rose-600 dark:text-rose-400">
                        {{ mobilePreviewStats.ongoing }}
                    </span>
                </div>
                <div
                    class="px-2.5 py-1.5 bg-slate-100 dark:bg-glb-900 border border-slate-300 dark:border-glb-800 flex items-center justify-between"
                >
                    <span class="text-slate-600 dark:text-slate-400">
                        Најавени:
                    </span>
                    <span class="font-bold text-amber-600 dark:text-amber-300">
                        {{ mobilePreviewStats.scheduled }}
                    </span>
                </div>
            </div>

            <button
                type="button"
                class="w-full py-2 px-3 bg-glb-500 hover:bg-glb-600 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                @click="goToMunicipality(mobilePreviewMuni.slug)"
            >
                <span>Погледни општина {{ mobilePreviewMuni.nameMk }}</span>
                <ArrowForwardOutline class="w-3.5 h-3.5" />
            </button>
        </div>

        <div
            class="bg-white/95 dark:bg-glb-950/95 border-t border-slate-300 dark:border-glb-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono shrink-0"
        >
            <div class="flex flex-wrap items-center gap-3">
                <span class="inline-flex items-center gap-1.5">
                    <span
                        class="w-3 h-3 border border-slate-400 dark:border-glb-700 inline-block"
                        :style="{ backgroundColor: palette.none }"
                    ></span>
                    <span>Ништо</span>
                </span>
                <span class="inline-flex items-center gap-1.5">
                    <span
                        class="w-3 h-3 inline-block"
                        :style="{ backgroundColor: palette.scheduled }"
                    ></span>
                    <span>Најавено</span>
                </span>
                <span class="inline-flex items-center gap-1.5">
                    <span
                        class="w-3 h-3 inline-block"
                        :style="{ backgroundColor: palette.lowOngoing }"
                    ></span>
                    <span>1–2 во тек</span>
                </span>
                <span class="inline-flex items-center gap-1.5">
                    <span
                        class="w-3 h-3 inline-block"
                        :style="{ backgroundColor: palette.highOngoing }"
                    ></span>
                    <span>3+ во тек</span>
                </span>
                <span
                    v-if="showPins"
                    class="inline-flex items-center gap-1.5"
                >
                    <span
                        class="w-2.5 h-2.5 bg-teal-600 inline-block"
                    ></span>
                    <span>Мерна станица</span>
                </span>
            </div>
            <span class="hidden sm:inline text-slate-500">
                {{
                    focusedMunicipalityCode
                        ? "Прикажан е статистичкиот регион на општината"
                        : "Кликни општина за детален преглед"
                }}
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
  AddOutline,
  ArrowForwardOutline,
  CloseOutline,
  LocateOutline,
  RemoveOutline,
} from "@vicons/ionicons5";
import { navigate } from "vike/client/router";
import { computed, onMounted, reactive, ref, watch } from "vue";
import { createEmptyBreakdown, MAP_PALETTE } from "../util/constants";
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
  ReportDto,
} from "../util/types";

const props = withDefaults(
  defineProps<{
    municipalities: PrecomputedMunicipality[];
    statsByMunicipality: Record<string, CategoryBreakdown>;
    mapReports?: ReportDto[];
    focusedMunicipalityCode?: string | null;
    nearbyCenter?: Coordinates | null;
    nearbyRadiusMeters?: number;
    showPins?: boolean;
  }>(),
  {
    mapReports: () => [],
    focusedMunicipalityCode: null,
    nearbyCenter: null,
    nearbyRadiusMeters: 2500,
    showPins: false,
  },
);

defineEmits<{
  selectReport: [report: ReportDto];
}>();

const MAX_ZOOM = 20;
const MIN_ZOOM = 1;

const containerRef = ref<HTMLElement | null>(null);
const svgRef = ref<SVGSVGElement | null>(null);
const hoveredCode = ref<string | null>(null);
const mobilePreviewCode = ref<string | null>(null);
const isNavigating = ref(false);
const cursorPos = reactive({ x: 20, y: 20 });

const cam = reactive({
  scale: 1,
  tx: 0,
  ty: 0,
});

const palette = MAP_PALETTE;

/**
 * On a municipality page, only render the polygons belonging to that statistical region!
 * This cuts SVG DOM elements by ~85% and restricts map exploration to the statistical region.
 */
const visibleMunicipalities = computed(() => {
  if (!props.focusedMunicipalityCode) return props.municipalities;
  const focused = props.municipalities.find(
    (m) => m.code === props.focusedMunicipalityCode,
  );
  if (!focused) return props.municipalities;
  return props.municipalities.filter(
    (m) => m.regionCode === focused.regionCode,
  );
});

const isCameraMoved = computed(
  () =>
    !props.focusedMunicipalityCode &&
    (cam.scale > 1.05 || Math.abs(cam.tx) > 5 || Math.abs(cam.ty) > 5),
);

function clampCamera(scale: number, tx: number, ty: number) {
  const s = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, scale));
  const minTx = MAP_WIDTH * (1 - s);
  const minTy = MAP_HEIGHT * (1 - s);
  return {
    scale: s,
    tx: Math.max(minTx, Math.min(0, tx)),
    ty: Math.max(minTy, Math.min(0, ty)),
  };
}

let animFrame: number | null = null;
function animateCamera(target: { scale: number; tx: number; ty: number }) {
  if (animFrame) cancelAnimationFrame(animFrame);
  const clamped = clampCamera(target.scale, target.tx, target.ty);
  const startS = cam.scale;
  const startX = cam.tx;
  const startY = cam.ty;
  const duration = 200;
  const startTime = performance.now();

  function step(now: number) {
    const t = Math.min(1, (now - startTime) / duration);
    const ease = 1 - (1 - t) ** 3;
    cam.scale = startS + (clamped.scale - startS) * ease;
    cam.tx = startX + (clamped.tx - startX) * ease;
    cam.ty = startY + (clamped.ty - startY) * ease;
    if (t < 1) {
      animFrame = requestAnimationFrame(step);
    }
  }
  animFrame = requestAnimationFrame(step);
}

function frameBox(
  minX: number,
  minY: number,
  maxX: number,
  maxY: number,
  paddingFactor = 1.65,
  animate = true,
) {
  const bw = Math.max(36, (maxX - minX) * paddingFactor);
  const bh = Math.max(28, (maxY - minY) * paddingFactor);
  const scale = Math.min(MAX_ZOOM, Math.min(MAP_WIDTH / bw, MAP_HEIGHT / bh));
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const tx = MAP_WIDTH / 2 - cx * scale;
  const ty = MAP_HEIGHT / 2 - cy * scale;
  if (animate && typeof window !== "undefined") {
    animateCamera({ scale, tx, ty });
  } else {
    const c = clampCamera(scale, tx, ty);
    cam.scale = c.scale;
    cam.tx = c.tx;
    cam.ty = c.ty;
  }
}

function frameFocusedMunicipality(animate = false) {
  if (!props.focusedMunicipalityCode) return;
  const found = props.municipalities.find(
    (m) => m.code === props.focusedMunicipalityCode,
  );
  if (found) {
    const [minX, minY, maxX, maxY] = found.bbox;
    frameBox(minX, minY, maxX, maxY, 1.75, animate);
  }
}

onMounted(() => {
  if (props.focusedMunicipalityCode) {
    frameFocusedMunicipality(false);
  }
});

watch(
  () => props.focusedMunicipalityCode,
  (code) => {
    isNavigating.value = false;
    hoveredCode.value = null;
    if (code) frameFocusedMunicipality(true);
    else animateCamera({ scale: 1, tx: 0, ty: 0 });
  },
);

watch(
  () => props.nearbyCenter,
  (center) => {
    if (!center) return;
    const [cx, cy] = projectPoint(center.lng, center.lat);
    frameBox(cx - 85, cy - 65, cx + 85, cy + 65, 1.2, true);
  },
);

function zoomToSkopje() {
  frameBox(
    SKOPJE_VIEWBOX.x,
    SKOPJE_VIEWBOX.y,
    SKOPJE_VIEWBOX.x + SKOPJE_VIEWBOX.w,
    SKOPJE_VIEWBOX.y + SKOPJE_VIEWBOX.h,
    1.0,
    true,
  );
}

function resetCamera() {
  mobilePreviewCode.value = null;
  if (props.focusedMunicipalityCode) {
    frameFocusedMunicipality(true);
  } else {
    animateCamera({ scale: 1, tx: 0, ty: 0 });
  }
}

function stepZoom(factor: number) {
  const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, cam.scale * factor));
  const ratio = newScale / cam.scale;
  const cx = MAP_WIDTH / 2;
  const cy = MAP_HEIGHT / 2;
  const tx = cx - (cx - cam.tx) * ratio;
  const ty = cy - (cy - cam.ty) * ratio;
  animateCamera({ scale: newScale, tx, ty });
}

function clientToSvgViewport(clientX: number, clientY: number) {
  const el = svgRef.value;
  if (!el) return { vx: MAP_WIDTH / 2, vy: MAP_HEIGHT / 2, svgScale: 1 };
  const rect = el.getBoundingClientRect();
  const scaleX = rect.width / MAP_WIDTH;
  const scaleY = rect.height / MAP_HEIGHT;
  const s = Math.min(scaleX, scaleY);
  const offsetX = (rect.width - MAP_WIDTH * s) / 2;
  const offsetY = (rect.height - MAP_HEIGHT * s) / 2;
  return {
    vx: (clientX - rect.left - offsetX) / s,
    vy: (clientY - rect.top - offsetY) / s,
    svgScale: s,
  };
}

function onWheel(e: WheelEvent) {
  if (!svgRef.value || isNavigating.value) return;
  if (animFrame) cancelAnimationFrame(animFrame);

  const { vx, vy } = clientToSvgViewport(e.clientX, e.clientY);
  const factor = e.deltaY < 0 ? 1.22 : 0.82;
  const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, cam.scale * factor));
  const ratio = newScale / cam.scale;

  const next = clampCamera(
    newScale,
    vx - (vx - cam.tx) * ratio,
    vy - (vy - cam.ty) * ratio,
  );
  cam.scale = next.scale;
  cam.tx = next.tx;
  cam.ty = next.ty;
}

const isDragging = ref(false);
const didDragMove = ref(false);
let dragStart = { x: 0, y: 0, tx: 0, ty: 0 };

const activePointers = new Map<number, { x: number; y: number }>();
let lastPinchDist = 0;
let lastPinchMid = { x: 0, y: 0 };

function getPinchMetrics() {
  const pts = Array.from(activePointers.values());
  if (pts.length < 2) return { dist: 0, mid: { x: 0, y: 0 } };
  const p1 = pts[0];
  const p2 = pts[1];
  return {
    dist: Math.hypot(p2.x - p1.x, p2.y - p1.y),
    mid: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 },
  };
}

function onPointerDown(e: PointerEvent) {
  if (isNavigating.value) return;
  if (e.pointerType === "mouse" && e.button !== 0) return;
  if (animFrame) cancelAnimationFrame(animFrame);

  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (activePointers.size === 1) {
    isDragging.value = true;
    didDragMove.value = false;
    dragStart = {
      x: e.clientX,
      y: e.clientY,
      tx: cam.tx,
      ty: cam.ty,
    };
  } else if (activePointers.size === 2) {
    didDragMove.value = true;
    const { dist, mid } = getPinchMetrics();
    lastPinchDist = dist;
    lastPinchMid = mid;
  }
}

function onPointerMove(e: PointerEvent) {
  if (!svgRef.value || !activePointers.has(e.pointerId)) return;
  activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

  if (activePointers.size === 2) {
    const { dist, mid } = getPinchMetrics();
    if (lastPinchDist > 8 && dist > 8) {
      const { vx, vy, svgScale } = clientToSvgViewport(mid.x, mid.y);
      const factor = dist / lastPinchDist;
      const newScale = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, cam.scale * factor),
      );
      const ratio = newScale / cam.scale;
      const panDx = (mid.x - lastPinchMid.x) / svgScale;
      const panDy = (mid.y - lastPinchMid.y) / svgScale;

      const next = clampCamera(
        newScale,
        vx - (vx - cam.tx) * ratio + panDx,
        vy - (vy - cam.ty) * ratio + panDy,
      );
      cam.scale = next.scale;
      cam.tx = next.tx;
      cam.ty = next.ty;
    }
    lastPinchDist = dist;
    lastPinchMid = mid;
    return;
  }

  if (activePointers.size === 1 && isDragging.value) {
    const dist = Math.hypot(e.clientX - dragStart.x, e.clientY - dragStart.y);
    if (dist > 5) didDragMove.value = true;

    if (didDragMove.value) {
      const { svgScale } = clientToSvgViewport(e.clientX, e.clientY);
      const dx = (e.clientX - dragStart.x) / svgScale;
      const dy = (e.clientY - dragStart.y) / svgScale;
      const next = clampCamera(cam.scale, dragStart.tx + dx, dragStart.ty + dy);
      cam.tx = next.tx;
      cam.ty = next.ty;
    }
  }
}

function onPointerUp(e: PointerEvent) {
  activePointers.delete(e.pointerId);
  if (activePointers.size === 1) {
    const remaining = Array.from(activePointers.values())[0];
    dragStart = {
      x: remaining.x,
      y: remaining.y,
      tx: cam.tx,
      ty: cam.ty,
    };
  } else if (activePointers.size === 0) {
    isDragging.value = false;
    lastPinchDist = 0;
  }
}

function onPointerLeave(e: PointerEvent) {
  activePointers.delete(e.pointerId);
  if (activePointers.size === 0) {
    isDragging.value = false;
    lastPinchDist = 0;
  }
  if (e.pointerType === "mouse") {
    hoveredCode.value = null;
  }
}

function onPolygonEnter(e: PointerEvent, code: string) {
  if (e.pointerType === "mouse" && !isNavigating.value) {
    hoveredCode.value = code;
  }
}

function onPolygonLeave(e: PointerEvent) {
  if (e.pointerType === "mouse") {
    hoveredCode.value = null;
  }
}

async function goToMunicipality(slug: string) {
  if (isNavigating.value) return;
  isNavigating.value = true;
  mobilePreviewCode.value = null;
  try {
    await navigate(`/${slug}`);
  } finally {
    isNavigating.value = false;
  }
}

function onPolygonClick(m: PrecomputedMunicipality) {
  if (didDragMove.value || isNavigating.value) return;

  if (props.focusedMunicipalityCode === m.code) return;

  if (
    !props.focusedMunicipalityCode &&
    typeof window !== "undefined" &&
    window.innerWidth < 1024
  ) {
    mobilePreviewCode.value = m.code;
    const [minX, minY, maxX, maxY] = m.bbox;
    frameBox(minX, minY, maxX, maxY, 2.2, true);
    return;
  }

  goToMunicipality(m.slug);
}

function onBackgroundClick(e: MouseEvent) {
  if (didDragMove.value) return;
  if (e.target === svgRef.value) {
    mobilePreviewCode.value = null;
  }
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

const pinRadius = computed(() => Math.max(1.2, 5.0 / cam.scale ** 0.75));
const labelFontSize = computed(() => Math.max(1.8, 9.5 / cam.scale ** 0.72));

const geocodedReports = computed(() =>
  props.mapReports
    .filter((r) => r.coordinates !== null)
    .map((r) => ({
      ...r,
      svgPt: projectPoint(r.coordinates.lng, r.coordinates.lat),
    })),
);

const nearbyCircleSvg = computed(() => {
  if (!props.nearbyCenter) return null;
  const [cx, cy] = projectPoint(props.nearbyCenter.lng, props.nearbyCenter.lat);
  const rSvg =
    (props.nearbyRadiusMeters / 111_320 / (42.39 - 40.83)) * (MAP_HEIGHT - 56);
  return { cx, cy, r: Math.max(4, rSvg) };
});

const activeOutlineCode = computed(
  () => props.focusedMunicipalityCode || mobilePreviewCode.value,
);

const activeOutlinePath = computed(
  () =>
    visibleMunicipalities.value.find((m) => m.code === activeOutlineCode.value)
      ?.svgPath ?? null,
);

const hoveredMunicipalityPath = computed(
  () =>
    visibleMunicipalities.value.find((m) => m.code === hoveredCode.value)
      ?.svgPath ?? null,
);

function getPolygonOpacity(code: string): number {
  if (props.focusedMunicipalityCode && props.focusedMunicipalityCode !== code) {
    return hoveredCode.value === code ? 0.65 : 0.35;
  }
  return 1;
}

function getPolygonFill(code: string): string {
  const isHovered =
    hoveredCode.value === code || mobilePreviewCode.value === code;
  const stats = props.statsByMunicipality[code];
  const ongoing = stats?.ongoing ?? 0;
  const scheduled = stats?.scheduled ?? 0;
  const p = palette;

  if (ongoing === 0 && scheduled === 0) {
    return isHovered ? p.noneHover : p.none;
  }
  if (ongoing === 0 && scheduled > 0) {
    return isHovered ? p.scheduledHover : p.scheduled;
  }
  if (ongoing <= 2) {
    return isHovered ? p.lowOngoingHover : p.lowOngoing;
  }
  return isHovered ? p.highOngoingHover : p.highOngoing;
}

const tooltipMunicipality = computed(() => {
  const code = hoveredCode.value;
  if (!code) return null;
  return visibleMunicipalities.value.find((m) => m.code === code) ?? null;
});

const tooltipStats = computed<CategoryBreakdown>(() => {
  const code = tooltipMunicipality.value?.code;
  return (code && props.statsByMunicipality[code]) || createEmptyBreakdown();
});

const mobilePreviewMuni = computed(() => {
  if (!mobilePreviewCode.value) return null;
  return (
    visibleMunicipalities.value.find(
      (m) => m.code === mobilePreviewCode.value,
    ) ?? null
  );
});

const mobilePreviewStats = computed<CategoryBreakdown>(() => {
  const code = mobilePreviewMuni.value?.code;
  return (code && props.statsByMunicipality[code]) || createEmptyBreakdown();
});
</script>
