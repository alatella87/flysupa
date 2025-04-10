import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  // Remove manual define section - Vite will automatically load VITE_ prefixed
  // environment variables from .env files into import.meta.env
  plugins: [
    react(),
    sentryVitePlugin({
      org: "northsouth-rt",
      project: "flysupa-react",
    }),
  ],
  base: "/",
  server: {
    watch: {
      usePolling: true,
    },
    host: true,
    strictPort: true,
    port: 8080,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    assetsDir: "assets",

    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },

    sourcemap: true,
  },
});
