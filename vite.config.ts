import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api/v1": {
        target: "https://supplyflow.waspx.ai",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, ""),
      },
    },
  },
});
