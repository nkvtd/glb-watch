import type { Config } from "vike/types";
import { h } from "vue";

const config: Config = {
  Head: h("meta", { name: "robots", content: "noindex" }),
};

export default config;
