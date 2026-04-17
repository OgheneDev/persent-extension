import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.config";

export default defineConfig({
  server: {
    port: 5173,
    strictPort: true,
  },
  plugins: [react(), crx({ manifest })],
  build: {
    minify: false, // easier debugging during dev
    sourcemap: true,
  },
});
