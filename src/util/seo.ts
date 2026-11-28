import { Fragment, h } from "vue";

export const SITE_URL = "https://glb.mk";
export const SITE_NAME = "glb::watch";
export const SITE_TITLE =
  "glb::watch - Прекини, дефекти и настани во Македонија";
export const SITE_DESCRIPTION =
  "Агрегатор во реално време за настани и прекини на електрична енергија, водоснабдување, комунални дефекти и информации за сите општини во Македонија";
export const OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export function municipalityTitle(nameMk?: string): string {
  return nameMk
    ? `${nameMk} - Прекини, дефекти и настани | glb::watch`
    : SITE_TITLE;
}

export function municipalityDescription(nameMk?: string): string {
  return nameMk
    ? `Актуелни информации во реално време за прекини на струја, вода, дефекти и настани во Општина ${nameMk}. Следете ја состојбата во живо на glb::watch`
    : SITE_DESCRIPTION;
}

export function buildSeoHead({
  title,
  description,
  url,
  imageAlt,
  jsonLd,
}: {
  title: string;
  description: string;
  url: string;
  imageAlt: string;
  jsonLd: unknown;
}) {
  return h(Fragment, [
    h("link", { rel: "canonical", href: url }),
    h("meta", { property: "og:title", content: title }),
    h("meta", { property: "og:description", content: description }),
    h("meta", { property: "og:type", content: "website" }),
    h("meta", { property: "og:url", content: url }),
    h("meta", { property: "og:site_name", content: SITE_NAME }),
    h("meta", { property: "og:locale", content: "mk_MK" }),
    h("meta", { property: "og:image", content: OG_IMAGE }),
    h("meta", { property: "og:image:alt", content: imageAlt }),
    h("meta", { property: "og:image:width", content: "1200" }),
    h("meta", { property: "og:image:height", content: "630" }),
    h("meta", { name: "twitter:card", content: "summary_large_image" }),
    h("meta", { name: "twitter:title", content: title }),
    h("meta", { name: "twitter:description", content: description }),
    h("meta", { name: "twitter:image", content: OG_IMAGE }),
    h("script", {
      type: "application/ld+json",
      innerHTML: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
    }),
  ]);
}
