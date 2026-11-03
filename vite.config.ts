import vike from "vike/plugin";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vike(), tailwindcss(), vue()],
});
