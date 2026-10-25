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
  //
  // __D4L_SANDBOX_RELAY__ reuses the exact same server-side flag name
  // (D4L_NETOPIA_SANDBOX_RELAY) already set, by hand, only on the dedicated
  // NETOPIA sandbox relay site -- deliberately not a new/separate
  // VITE_-prefixed variable. The flag means one thing ("is this the sandbox
  // relay deploy") everywhere it's read, server and client alike; a second
  // name for the same boolean would just be two things that could drift out
  // of sync. Baked in as a plain boolean (not the raw string), same pattern
  // as __NETLIFY_CONTEXT__ -- this value is not a secret (same category as
  // CONTEXT itself), only NETOPIA_POS_SIGNATURE/NETOPIA_PUBLIC_KEY/
  // NETLIFY_DB_URL are, and none of those are ever read here.
  define: {
    __NETLIFY_CONTEXT__: JSON.stringify(process.env.CONTEXT ?? "dev"),
    __D4L_SANDBOX_RELAY__: JSON.stringify(process.env.D4L_NETOPIA_SANDBOX_RELAY === "true"),
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
