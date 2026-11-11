import type { PageContext } from "vike/types";

export default function description(pageContext: PageContext): string {
  const is404 = pageContext.is404 || pageContext.abortStatusCode === 404;
  return is404
    ? "Страницата што ја барате не е пронајдена на glb::watch."
    : "Серверот моментално не може да го обработи барањето.";
}
