import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// @ts-expect-error process is a nodejs global
const tauriDevHost = process.env.TAURI_DEV_HOST;
const host = tauriDevHost || "127.0.0.1";

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [react()],
  base: "./",

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/");

          if (normalizedId.includes("/node_modules/lucide-react/"))
            return "vendor-icons";
          if (normalizedId.includes("/node_modules/recharts/"))
            return "vendor-recharts";
          if (normalizedId.includes("/src/cervicalCancerCareClipboard")) {
            return "care-cervical-clipboard";
          }
          if (normalizedId.includes("/src/cervicalCancerCareMetric")) {
            return "care-cervical-metric";
          }
          if (normalizedId.includes("/src/cervicalCancerCare"))
            return "care-cervical";
          if (normalizedId.includes("/src/healthRules"))
            return "health-rules";
          if (normalizedId.includes("/src/healthStandards"))
            return "health-standards";
          if (normalizedId.includes("/src/caregiverExport"))
            return "export-caregiver";
          if (normalizedId.includes("/src/csvExport"))
            return "export-csv";
          if (normalizedId.includes("/src/visitPacket"))
            return "export-visit";
          if (normalizedId.includes("/src/exportPreviewSummary"))
            return "export-preview";

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
    host,
    hmr: tauriDevHost
      ? {
          protocol: "ws",
          host: tauriDevHost,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell Vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
