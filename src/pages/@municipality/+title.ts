import type { PageContext } from "vike/types";
import { municipalityTitle } from "../../util/seo";
import type { Data } from "./+data";

export default function title(pageContext: PageContext<Data>): string {
  return municipalityTitle(pageContext.data?.municipality?.nameMk);
}
