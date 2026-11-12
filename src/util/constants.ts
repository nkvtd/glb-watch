import type {
  CategoryBreakdown,
  LifecycleStatus,
  ReportCategory,
} from "./types";

export interface CategoryMetaItem {
  labelMk: string;
  shortMk: string;
  colorHex: string;
  badgeClass: string;
  barColor: string;
}

export const CATEGORY_META: Record<string, CategoryMetaItem> = {
  power: {
    labelMk: "Електрична енергија",
    shortMk: "Струја",
    colorHex: "#d97706",
    badgeClass:
      "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/45 dark:text-amber-200 dark:border-amber-800/80",
    barColor: "#d97706",
  },
  water: {
    labelMk: "Водовод и канализација",
    shortMk: "Вода",
    colorHex: "#0284c7",
    badgeClass:
      "bg-sky-50 text-sky-900 border-sky-300 dark:bg-sky-950/45 dark:text-sky-200 dark:border-sky-800/80",
    barColor: "#0284c7",
  },
  air_quality: {
    labelMk: "Квалитет на воздух",
    shortMk: "Воздух",
    colorHex: "#7c3aed",
    badgeClass:
      "bg-violet-50 text-violet-900 border-violet-300 dark:bg-violet-950/45 dark:text-violet-200 dark:border-violet-800/80",
    barColor: "#7c3aed",
  },
  weather: {
    labelMk: "Метео аларм",
    shortMk: "Метео",
    colorHex: "#c2410c",
    badgeClass:
      "bg-orange-50 text-orange-900 border-orange-300 dark:bg-orange-950/45 dark:text-orange-200 dark:border-orange-800/80",
    barColor: "#ea580c",
  },
  road: {
    labelMk: "Сообраќај и патишта",
    shortMk: "Патишта",
    colorHex: "#4f46e5",
    badgeClass:
      "bg-indigo-50 text-indigo-900 border-indigo-300 dark:bg-indigo-950/45 dark:text-indigo-200 dark:border-indigo-800/80",
    barColor: "#6366f1",
  },
  wildfire: {
    labelMk: "Пожари",
    shortMk: "Пожари",
    colorHex: "#be123c",
    badgeClass:
      "bg-red-50 text-red-900 border-red-300 dark:bg-red-950/45 dark:text-red-200 dark:border-red-800/80",
    barColor: "#e11d48",
  },
  earthquake: {
    labelMk: "Сеизмичка активност",
    shortMk: "Земјотреси",
    colorHex: "#be185d",
    badgeClass:
      "bg-pink-50 text-pink-900 border-pink-300 dark:bg-pink-950/45 dark:text-pink-200 dark:border-pink-800/80",
    barColor: "#db2777",
  },
};

const DEFAULT_CATEGORY_META: CategoryMetaItem = {
  labelMk: "Останато",
  shortMk: "Останато",
  colorHex: "#56797d",
  badgeClass:
    "bg-slate-100 text-slate-800 border-slate-300 dark:bg-glb-800 dark:text-slate-200 dark:border-glb-700",
  barColor: "#56797d",
};

export function getCategoryMeta(category: ReportCategory): CategoryMetaItem {
  return (
    CATEGORY_META[category] ?? {
      ...DEFAULT_CATEGORY_META,
      labelMk: category,
      shortMk: category,
    }
  );
}

export const STATUS_META: Record<
  LifecycleStatus,
  { labelMk: string; badgeClass: string; indicatorClass: string }
> = {
  ongoing: {
    labelMk: "ВО ТЕК",
    badgeClass:
      "bg-red-100 text-red-900 border-red-300 dark:bg-red-950/70 dark:text-red-200 dark:border-red-800",
    indicatorClass: "bg-red-600 dark:bg-red-400",
  },
  scheduled: {
    labelMk: "НАЈАВЕНО",
    badgeClass:
      "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/65 dark:text-amber-200 dark:border-amber-800",
    indicatorClass: "bg-amber-600 dark:bg-amber-400",
  },
  ended: {
    labelMk: "ЗАВРШЕНО",
    badgeClass:
      "bg-slate-100 text-slate-700 border-slate-300 dark:bg-glb-900 dark:text-slate-400 dark:border-glb-700",
    indicatorClass: "bg-slate-400 dark:bg-slate-500",
  },
  omitted: {
    labelMk: "МЕРЕЊЕ НА СТАНИЦА",
    badgeClass:
      "bg-teal-50 text-teal-900 border-teal-300 dark:bg-teal-950/60 dark:text-teal-200 dark:border-teal-800",
    indicatorClass: "bg-teal-600 dark:bg-teal-400",
  },
  unknown: {
    labelMk: "НЕПОЗНАТО",
    badgeClass:
      "bg-slate-100 text-slate-600 border-slate-300 dark:bg-glb-900 dark:text-slate-400 dark:border-glb-800",
    indicatorClass: "bg-slate-400",
  },
};

export function getStatusMeta(status: LifecycleStatus) {
  return STATUS_META[status] ?? STATUS_META.unknown;
}

export const MAP_PALETTE = {
  canvasBg: "var(--map-canvas-bg)",
  strokeBase: "var(--map-stroke-base)",
  strokeHighlight: "var(--map-stroke-highlight)",
  pinStroke: "var(--map-pin-stroke)",
  labelFill: "var(--map-label-fill)",
  none: "var(--map-none)",
  noneHover: "var(--map-none-hover)",
  scheduled: "var(--map-scheduled)",
  scheduledHover: "var(--map-scheduled-hover)",
  lowOngoing: "var(--map-low-ongoing)",
  lowOngoingHover: "var(--map-low-ongoing-hover)",
  highOngoing: "var(--map-high-ongoing)",
  highOngoingHover: "var(--map-high-ongoing-hover)",
} as const;

export const SOURCE_LABELS: Record<string, string> = {
  evn: "ЕВН Македонија",
  "vodovod-skopje": "ЈП Водовод - Скопје",
  moepp: "МЖСПП Воздух",
  "sensor-community": "Sensor.Community",
  meteoalarm: "Meteoalarm",
  "emsc-csem": "EMSC Сеизмички портал",
  "vodovod-kumanovo": "ЈП Водовод - Куманово",
  "vodovod-prilep": "ЈКП Водовод и Канализација - Прилеп",
};

export function createEmptyBreakdown(): CategoryBreakdown {
  return {
    ongoing: 0,
    scheduled: 0,
    omitted: 0,
  };
}
