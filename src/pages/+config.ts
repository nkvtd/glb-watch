import type { Config } from "vike/types";
import vikeVue from "vike-vue/config";

const config: Config = {
  title: "glb-watch",
  description: "Следење на најразлични нешта низ Македонија во реално време.",
  extends: [vikeVue],
  server: true,
};

export default config;
