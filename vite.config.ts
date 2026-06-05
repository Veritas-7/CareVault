import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// @ts-expect-error process is a nodejs global
const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/");

          if (normalizedId.includes("/node_modules/lucide-react/")) return "vendor-icons";
          if (normalizedId.includes("/node_modules/recharts/")) return "vendor-recharts";
          if (normalizedId.includes("/src/cervicalCancerCare")) return "care-cervical";
          if (normalizedId.includes("/src/healthStandards")) return "health-standards";
          if (
            normalizedId.includes("/src/caregiverExport") ||
            normalizedId.includes("/src/csvExport") ||
            normalizedId.includes("/src/visitPacket") ||
            normalizedId.includes("/src/exportPreviewSummary")
          ) {
            return "export-tools";
          }

          return undefined;
        },
      },
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  // 1. prevent Vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
