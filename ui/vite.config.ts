import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev'de API'yi backend'e proxy'le; prod'da aynı origin'den /api beklenir.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3010",
      "/health": "http://localhost:3010",
    },
  },
  build: { outDir: "dist", sourcemap: true },
});
