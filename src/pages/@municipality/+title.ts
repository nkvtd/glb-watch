import type { PageContext } from "vike/types";
import type { Data } from "./+data";

export default function title(pageContext: PageContext<Data>): string {
  const nameMk = pageContext.data?.municipality?.nameMk;
  return nameMk
    ? `${nameMk} - Прекини, дефекти и настани | glb::watch`
    : "glb::watch - Прекини, дефекти и настани во Македонија";
}
