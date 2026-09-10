// Baked in at build time from Netlify's own CONTEXT env var (see
// vite.config.ts's `define`) -- "production" | "deploy-preview" |
// "branch-deploy" | "dev". This only controls what the UI *shows*; the
// authoritative block lives server-side in orderService.ts's createOrder(),
// which independently checks the same variable at request time. A client
// build flag alone would be spoofable -- it never is the real gate.
declare const __NETLIFY_CONTEXT__: string;

export function isProductionBuild(): boolean {
  return (typeof __NETLIFY_CONTEXT__ !== "undefined" ? __NETLIFY_CONTEXT__ : "dev") === "production";
}
