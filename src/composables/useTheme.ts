import { onMounted, ref } from "vue";

const STORAGE_KEY = "glb-theme";
const isDark = ref(true);
let initialized = false;

function applyTheme(dark: boolean) {
  isDark.value = dark;
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", dark);
  }
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
    } catch {
      // Ignore storage quota/privacy errors
    }
  }
}

export function useTheme() {
  onMounted(() => {
    if (!initialized && typeof window !== "undefined") {
      initialized = true;
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const prefersDark = saved ? saved === "dark" : true;
        applyTheme(prefersDark);
      } catch {
        applyTheme(true);
      }
    } else if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", isDark.value);
    }
  });

  function toggleTheme() {
    applyTheme(!isDark.value);
  }

  return {
    isDark,
    toggleTheme,
  };
}
