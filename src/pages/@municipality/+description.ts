import type { PageContext } from "vike/types";
import { municipalityDescription } from "../../util/seo";
import type { Data } from "./+data";

export default function description(pageContext: PageContext<Data>): string {
  return municipalityDescription(pageContext.data?.municipality?.nameMk);
}
