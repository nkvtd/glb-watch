import type {
  CategoryBreakdown,
  LifecycleStatus,
  ReportCategory,
} from "./types";

export const CATEGORY_META: Record<
  ReportCategory,
  {
    labelMk: string;
    shortMk: string;
    colorHex: string;
    badgeClass: string;
    barColor: string;
  }
> = {
  power: {
    labelMk: "Електрична енергија",
    shortMk: "Струја",
    colorHex: "#d97706",
    badgeClass:
      "bg-amber-100 text-amber-950 border-amber-400 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700",
    barColor: "#f59e0b",
  },
  water: {
    labelMk: "Водовод и канализација",
    shortMk: "Вода",
    colorHex: "#0284c7",
    badgeClass:
      "bg-sky-100 text-sky-950 border-sky-400 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-700",
    barColor: "#0ea5e9",
  },
  air_quality: {
    labelMk: "Квалитет на воздух",
    shortMk: "Воздух",
    colorHex: "#7c3aed",
    badgeClass:
      "bg-violet-100 text-violet-950 border-violet-400 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-700",
    barColor: "#8b5cf6",
  },
  weather: {
    labelMk: "Метео аларм",
    shortMk: "Метео",
    colorHex: "#ea580c",
    badgeClass:
      "bg-orange-100 text-orange-950 border-orange-400 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-700",
    barColor: "#f97316",
  },
  road: {
    labelMk: "Сообраќај и патишта",
    shortMk: "Патишта",
    colorHex: "#4f46e5",
    badgeClass:
      "bg-indigo-100 text-indigo-950 border-indigo-400 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-700",
    barColor: "#6366f1",
  },
  wildfire: {
    labelMk: "Пожари и земјотреси",
    shortMk: "Итни",
    colorHex: "#dc2626",
    badgeClass:
      "bg-red-100 text-red-950 border-red-400 dark:bg-red-950/60 dark:text-red-300 dark:border-red-700",
    barColor: "#ef4444",
  },
};

export const STATUS_META: Record<
  LifecycleStatus,
  { labelMk: string; badgeClass: string; indicatorClass: string }
> = {
  ongoing: {
    labelMk: "ВО ТЕК",
    badgeClass:
      "bg-red-600 text-white border-red-700 dark:bg-red-600 dark:text-white dark:border-red-500",
    indicatorClass: "bg-white",
  },
  scheduled: {
    labelMk: "НАЈАВЕНО",
    badgeClass:
      "bg-amber-300 text-slate-950 border-amber-600 dark:bg-amber-300 dark:text-slate-950 dark:border-amber-400",
    indicatorClass: "bg-slate-950",
  },
  ended: {
    labelMk: "ЗАВРШЕНО",
    badgeClass:
      "bg-slate-200 text-slate-800 border-slate-400 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600",
    indicatorClass: "bg-slate-500",
  },
  omitted: {
    labelMk: "МЕРЕЊЕ НА СТАНИЦА",
    badgeClass:
      "bg-teal-100 text-teal-950 border-teal-500 dark:bg-teal-950/80 dark:text-teal-300 dark:border-teal-700",
    indicatorClass: "bg-teal-500",
  },
  unknown: {
    labelMk: "НЕПОЗНАТО",
    badgeClass:
      "bg-slate-200 text-slate-700 border-slate-400 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    indicatorClass: "bg-slate-400",
  },
};

export const SOURCE_LABELS: Record<string, string> = {
  evn: "ЕВН Македонија",
  "vodovod-skopje": "ЈП Водовод Скопје",
  moepp: "Министерство за животна средина и просторно планирање",
  "sensor-community": "Sensor.Community",
  meteoalarm: "Meteoalarm",
};

export function createEmptyBreakdown(): CategoryBreakdown {
  return {
    ongoing: 0,
    scheduled: 0,
    omitted: 0,
    byCategory: {
      power: { ongoing: 0, scheduled: 0, omitted: 0 },
      water: { ongoing: 0, scheduled: 0, omitted: 0 },
      road: { ongoing: 0, scheduled: 0, omitted: 0 },
      weather: { ongoing: 0, scheduled: 0, omitted: 0 },
      wildfire: { ongoing: 0, scheduled: 0, omitted: 0 },
      air_quality: { ongoing: 0, scheduled: 0, omitted: 0 },
    },
  };
}
