import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import wasm from "vite-plugin-wasm";
import { fileURLToPath } from "url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), wasm()],
  resolve: {
    alias: {
      "@riscv_sim/alfa": fileURLToPath(new URL("../alfa", import.meta.url)),
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
