export type ReportCategory =
  | "power"
  | "water"
  | "road"
  | "weather"
  | "wildfire"
  | "air_quality";

export type EventCategory = "fuel_price" | "currency_exchange";

export type LifecycleStatus =
  | "scheduled"
  | "ongoing"
  | "ended"
  | "unknown"
  | "omitted";

export type MorphologicalType = "urban" | "rural";

export interface Coordinates {
  lng: number;
  lat: number;
}

export interface MultiPolygonGeoJson {
  type: "MultiPolygon";
  coordinates: number[][][][];
}

export interface MunicipalityDto {
  id: number;
  code: string;
  municipalityCode: string;
  nameMk: string;
  nameEn: string;
  regionCode: string;
  regionNameMk: string;
  regionNameEn: string;
  morphologicalType: MorphologicalType;
  center: Coordinates;
  boundary?: MultiPolygonGeoJson;
}

export interface PrecomputedMunicipality
  extends Omit<MunicipalityDto, "boundary"> {
  svgPath: string;
  bbox: [number, number, number, number];
  centerSvg: [number, number];
}

export interface ReportDto {
  id: number;
  externalId: string;
  source: string;
  category: ReportCategory;
  title: string;
  description: string | null;
  municipalityCode: string | null;
  locationLabel: string | null;
  status: LifecycleStatus;
  observedAt: string;
  startsAt: string | null;
  endsAt: string | null;
  coordinates: Coordinates | null;
}

export interface EventDto {
  id: number;
  externalId: string;
  source: string;
  category: EventCategory;
  title: string;
  description: string | null;
  status: LifecycleStatus;
  observedAt: string;
  startsAt: string | null;
  endsAt: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}

export interface CategoryBreakdown {
  ongoing: number;
  scheduled: number;
  omitted: number;
  byCategory: Record<
    ReportCategory,
    { ongoing: number; scheduled: number; omitted: number }
  >;
}
