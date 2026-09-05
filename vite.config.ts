import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Baked into the client bundle at build time from Netlify's own CONTEXT
  // build variable ("production" | "deploy-preview" | "branch-deploy" |
  // "dev") -- see src/lib/checkout/environment.ts. Not set here locally
  // (CONTEXT is undefined outside a Netlify build), so local dev/preview
  // builds correctly default to "dev".
  define: {
    __NETLIFY_CONTEXT__: JSON.stringify(process.env.CONTEXT ?? "dev"),
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    host: "0.0.0.0",
    // Dev-only convenience: on Netlify itself, static assets and Functions
    // share one domain with no proxy needed. This just lets `npm run dev`
    // reach a locally running `netlify functions:serve` (default port).
    proxy: {
      "/.netlify/functions": {
        target: "http://localhost:9999",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    host: "0.0.0.0",
  },
});
