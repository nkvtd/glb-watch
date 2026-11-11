import type { PageContext } from "vike/types";

export default function title(pageContext: PageContext): string {
  const is404 = pageContext.is404 || pageContext.abortStatusCode === 404;
  return is404
    ? "404 Страницата не постои - glb::watch"
    : "Настана грешка - glb::watch";
}
