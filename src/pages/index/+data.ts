import type { PageContextServer } from "vike/types";
import { useConfig } from "vike-vue/useConfig";
import { apiClient } from "../../util/api";
import { getCategoryMeta } from "../../util/constants";
import {
  buildSeoHead,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
} from "../../util/seo";

export type Data = Awaited<ReturnType<typeof data>>;

const FALLBACK_MEASURED = ["Струја", "Вода"];

export async function data(pageContext: PageContextServer) {
  const config = useConfig();
  const headers = pageContext.headers ?? undefined;
  const [municipalities, mapReports, activeEvents] = await Promise.all([
    apiClient.getPrecomputedMunicipalities(headers).catch(() => []),
    apiClient.getMapTelemetryReports(headers).catch(() => []),
    apiClient.getActiveEvents(headers).catch(() => []),
  ]);

  const categoryLabels = [
    ...new Set(mapReports.map((r) => getCategoryMeta(r.category).labelMk)),
  ];
  const starts = mapReports
    .map((r) => Date.parse(r.startsAt ?? ""))
    .filter(Number.isFinite);
  const dateModified =
    starts.length > 0
      ? new Date(Math.min(Math.max(...starts), Date.now())).toISOString()
      : new Date().toISOString();
  const organizationId = `${SITE_URL}/#organization`;

  config({
    Head: buildSeoHead({
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      url: `${SITE_URL}/`,
      imageAlt: "glb::watch — прекини, дефекти и настани во Македонија",
      jsonLd: {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebSite",
            name: "glb.mk",
            alternateName: "GLB Watch",
            url: `${SITE_URL}/`,
            inLanguage: "mk",
            isAccessibleForFree: true,
            description:
              "Актуелни и планирани прекини на електрична енергија, водоснабдување, сообраќај и други инциденти во општините низ Македонија, во живо.",
            publisher: { "@id": organizationId },
          },
          {
            "@type": "Organization",
            "@id": organizationId,
            name: "glb.mk",
            url: `${SITE_URL}/`,
          },
          {
            "@type": "Dataset",
            name: "Прекини на струја и вода во Македонија — glb.mk",
            description:
              "Актуелни и планирани прекини на електрична енергија (ЕВН), водоснабдување и други инциденти во општините низ Македонија.",
            url: `${SITE_URL}/`,
            inLanguage: "mk",
            isAccessibleForFree: true,
            dateModified,
            license: "https://www.apache.org/licenses/LICENSE-2.0",
            keywords: categoryLabels.length
              ? categoryLabels
              : FALLBACK_MEASURED,
            variableMeasured: categoryLabels.length
              ? categoryLabels
              : FALLBACK_MEASURED,
            creator: { "@id": organizationId },
            publisher: { "@id": organizationId },
            spatialCoverage: {
              "@type": "Country",
              name: "Македонија",
            },
            distribution: {
              "@type": "DataDownload",
              encodingFormat: "application/json",
              contentUrl: `${SITE_URL}/api/reports`,
            },
          },
        ],
      },
    }),
  });

  return { municipalities, mapReports, activeEvents };
}
