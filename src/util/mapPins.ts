import {
  Cloud,
  Construct,
  Flame,
  Flash,
  Pulse,
  Thunderstorm,
  Water,
  Wifi,
} from "@vicons/ionicons5";
import type { Component } from "vue";
import { h } from "vue";
import type { LifecycleStatus, ReportCategory } from "./types";

export interface PinGlyphReport {
  id: number;
  title: string;
  status: LifecycleStatus;
  category: ReportCategory;
  svgPt: [number, number];
  pinStroke: string;
}

function glyphStroke(pinStroke: string) {
  return {
    stroke: pinStroke,
    "stroke-width": 1,
    "vector-effect": "non-scaling-stroke",
    "stroke-linejoin": "round",
  } as const;
}

function glyphFill(r: PinGlyphReport): string {
  switch (r.category) {
    case "power":
      return r.status === "scheduled" || r.status === "omitted"
        ? "#f59e0b"
        : "#e11d48";
    case "water":
      return r.status === "omitted" ? "#0ea5e9" : "#e11d48";
    case "air_quality":
      return r.status === "ongoing" ? "#e11d48" : "#0d9488";
    case "road":
      return r.status === "omitted" ? "#4f46e5" : "#f59e0b";
    case "internet":
      return r.status === "omitted" ? "#14b8a6" : "#f59e0b";
    case "wildfire":
      return r.status === "ongoing" ? "#e11d48" : "#ea580c";
    case "earthquake":
      return "#db2777";
    default:
      if (r.status === "ongoing") return "#e11d48";
      return r.status === "scheduled" ? "#d97706" : "#0d9488";
  }
}

const CATEGORY_ICONS: Partial<Record<ReportCategory, Component>> = {
  power: Flash,
  water: Water,
  air_quality: Cloud,
  weather: Thunderstorm,
  road: Construct,
  wildfire: Flame,
  earthquake: Pulse,
  internet: Wifi,
};

function pulseRing() {
  const timing = {
    dur: "1.8s",
    repeatCount: "indefinite",
  } as const;
  return h(
    "circle",
    {
      cx: 0,
      cy: 0,
      r: 5,
      fill: "#db2777",
      stroke: "#db2777",
      "stroke-width": 1,
      "vector-effect": "non-scaling-stroke",
    },
    [
      h("animate", { attributeName: "r", values: "5;7.2", ...timing }),
      h("animate", { attributeName: "opacity", values: "0.85;0", ...timing }),
    ],
  );
}

function glyphNodes(r: PinGlyphReport) {
  const fill = glyphFill(r);
  const icon = CATEGORY_ICONS[r.category];
  if (!icon) {
    return [
      h("circle", { cx: 0, cy: 0, r: 2.6, fill, ...glyphStroke(r.pinStroke) }),
    ];
  }

  return [
    ...(r.category === "earthquake" && r.status === "ongoing"
      ? [pulseRing()]
      : []),
    h(icon, {
      x: -4.6,
      y: -4.6,
      width: 9.2,
      height: 9.2,
      style: { color: fill },
      stroke: r.pinStroke,
      "stroke-width": 25,
      "stroke-linejoin": "round",
    }),
  ];
}

export const PinGlyph = Object.assign(
  (
    props: { r: PinGlyphReport; radius: number },
    { attrs }: { attrs: Record<string, unknown> },
  ) =>
    h(
      "g",
      {
        transform: `translate(${props.r.svgPt[0]}, ${props.r.svgPt[1]}) scale(${props.radius / 5})`,
        ...attrs,
      },
      [h("title", props.r.title), ...glyphNodes(props.r)],
    ),
  {
    props: {
      r: { type: Object, required: true },
      radius: { type: Number, required: true },
    },
  },
);
