import type { MultiPolygonGeoJson } from "./types";

export const MAP_WIDTH = 1000;
export const MAP_HEIGHT = 780;

const MIN_LNG = 20.42;
const MAX_LNG = 23.06;
const MIN_LAT = 40.83;
const MAX_LAT = 42.39;

const PAD_X = 28;
const PAD_Y = 28;

const USABLE_W = MAP_WIDTH - PAD_X * 2;
const USABLE_H = MAP_HEIGHT - PAD_Y * 2;

export function projectPoint(lng: number, lat: number): [number, number] {
  const x = PAD_X + ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * USABLE_W;
  const y = PAD_Y + ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * USABLE_H;
  return [Number(x.toFixed(1)), Number(y.toFixed(1))];
}

export function multiPolygonToSvg(boundary?: MultiPolygonGeoJson): {
  svgPath: string;
  bbox: [number, number, number, number];
} {
  if (!boundary?.coordinates.length) {
    return { svgPath: "", bbox: [0, 0, MAP_WIDTH, MAP_HEIGHT] };
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  const parts: string[] = [];

  for (const polygon of boundary.coordinates) {
    for (const ring of polygon) {
      if (!ring.length) continue;
      for (let i = 0; i < ring.length; i++) {
        const pt = ring[i];
        if (!pt) continue;
        const [x, y] = projectPoint(pt[0], pt[1]);
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        parts.push(`${i === 0 ? "M" : "L"}${x} ${y}`);
      }
      parts.push("Z");
    }
  }

  return {
    svgPath: parts.join(" "),
    bbox: [
      Number.isFinite(minX) ? minX : 0,
      Number.isFinite(minY) ? minY : 0,
      Number.isFinite(maxX) ? maxX : MAP_WIDTH,
      Number.isFinite(maxY) ? maxY : MAP_HEIGHT,
    ],
  };
}

export const SKOPJE_VIEWBOX = {
  x: 310,
  y: 120,
  w: 175,
  h: 136,
};
