import { render } from "vike/abort";
import type { PageContextServer } from "vike/types";
import { useConfig } from "vike-vue/useConfig";
import { apiClient } from "../../util/api";
import { getCategoryMeta } from "../../util/constants";
import {
  buildSeoHead,
  municipalityDescription,
  municipalityTitle,
  SITE_URL,
} from "../../util/seo";
import { isActiveReport } from "../../util/telemetry";

export type Data = Awaited<ReturnType<typeof data>>;

const FALLBACK_MEASURED = [
  "Прекини на електрична енергија (ЕВН)",
  "Прекини на водоснабдување (Водовод)",
];

export async function data(pageContext: PageContextServer) {
  const config = useConfig();
  const headers = pageContext.headers ?? undefined;
  const rawParam = pageContext.routeParams?.municipality ?? "";

  const { target, all } = await apiClient.findMunicipalityByParam(
    rawParam,
    headers,
  );

  if (!target) {
    throw render(404, "Општината не е пронајдена.");
  }

  const url = `${SITE_URL}/${target.slug}`;

  const [mapReports, activeEvents] = await Promise.all([
    apiClient.getMapTelemetryReports(headers).catch(() => []),
    apiClient.getActiveEvents(headers).catch(() => []),
  ]);

  const resolvedReports = mapReports.filter(
    (r) => apiClient.resolveReportMunicipalityCode(r, all) === target.code,
  );
  const muniReports = resolvedReports.filter(isActiveReport);

  const categoryLabels = [
    ...new Set(resolvedReports.map((r) => getCategoryMeta(r.category).labelMk)),
  ];
  const starts = resolvedReports
    .map((r) => Date.parse(r.startsAt ?? ""))
    .filter(Number.isFinite);
  const dateModified =
    starts.length > 0
      ? new Date(Math.min(Math.max(...starts), Date.now())).toISOString()
      : new Date().toISOString();

  config({
    Head: buildSeoHead({
      title: municipalityTitle(target.nameMk),
      description: municipalityDescription(target.nameMk),
      url,
      imageAlt: `glb::watch — ${target.nameMk}`,
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "glb.mk",
                item: `${SITE_URL}/`,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: target.nameMk,
                item: url,
              },
            ],
          },
          {
            "@type": "Dataset",
            name: `Прекини на струја и вода во Општина ${target.nameMk} — glb.mk`,
            alternateName: [target.nameEn, `Општина ${target.nameMk}`],
            description: `Актуелни и планирани прекини на електрична енергија (ЕВН) и водоснабдување во Општина ${target.nameMk}.`,
            url,
            inLanguage: "mk",
            isAccessibleForFree: true,
            dateModified,
            license: "https://www.apache.org/licenses/LICENSE-2.0",
            keywords: categoryLabels.length
              ? [target.nameEn, ...categoryLabels]
              : FALLBACK_MEASURED,
            creator: { "@id": `${SITE_URL}/#organization` },
            publisher: { "@id": `${SITE_URL}/#organization` },
            spatialCoverage: {
              "@type": "AdministrativeArea",
              name: `Општина ${target.nameMk}`,
              address: {
                "@type": "PostalAddress",
                addressLocality: target.nameMk,
                addressCountry: "MK",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: target.center.lat,
                longitude: target.center.lng,
              },
              containedInPlace: {
                "@type": "AdministrativeArea",
                name: target.regionNameMk,
              },
            },
            variableMeasured: categoryLabels.length
              ? categoryLabels
              : FALLBACK_MEASURED,
            distribution: {
              "@type": "DataDownload",
              encodingFormat: "application/json",
              contentUrl: `${SITE_URL}/api/reports?municipalityCode=${target.code}`,
            },
          },
        ],
      },
    }),
  });

  return {
    municipality: target,
    municipalities: all,
    mapReports,
    activeEvents,
    initialFeed: {
      data: muniReports,
      meta: { nextCursor: null, hasNextPage: false },
    },
  };
}
