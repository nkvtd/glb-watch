export const THEME_STORAGE_KEY = "glb-theme";
export const THEME_COLOR_DARK = "#0f1719";
export const THEME_COLOR_LIGHT = "#f2f6f7";

export function useTheme() {
  function toggleTheme() {
    if (typeof document === "undefined") return;
    const dark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", dark ? THEME_COLOR_DARK : THEME_COLOR_LIGHT);
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
    } catch {
      // Ignore storage quota/privacy errors
    }
  }

  return {
    toggleTheme,
  };
}
