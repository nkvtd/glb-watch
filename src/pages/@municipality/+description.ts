import type { PageContext } from "vike/types";
import type { Data } from "./+data";

export default function description(pageContext: PageContext<Data>): string {
  const nameMk = pageContext.data?.municipality?.nameMk;
  return nameMk
    ? `Актуелни информации во реално време за прекини на струја, вода, дефекти и настани во Општина ${nameMk}. Следете ја состојбата во живо на glb::watch`
    : "Агрегатор во реално време за настани и прекини на електрична енергија, водоснабдување, комунални дефекти и информации за сите општини во Македонија";
}
