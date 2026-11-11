import type { Config } from "vike/types";
import vikeVue from "vike-vue/config";
import {
  THEME_COLOR_DARK,
  THEME_COLOR_LIGHT,
  THEME_STORAGE_KEY,
} from "../composables/useTheme";

const themeScript = `(function(){try{var d=localStorage.getItem('${THEME_STORAGE_KEY}')!=='light';document.documentElement.classList.toggle('dark',d);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',d?'${THEME_COLOR_DARK}':'${THEME_COLOR_LIGHT}')}catch(e){document.documentElement.classList.add('dark')}})()`;

const config: Config = {
  title: "glb::watch - Прекини, дефекти и настани во Македонија",
  description:
    "Агрегатор во реално време за настани и прекини на електрична енергија, водоснабдување, комунални дефекти и информации за сите општини во Македонија",
  lang: "mk",
  htmlAttributes: { class: "dark" },
  headHtmlBegin: `<meta name="theme-color" content="${THEME_COLOR_DARK}"><script>${themeScript}</script>`,
  extends: [vikeVue],
  server: true,
};

export default config;
