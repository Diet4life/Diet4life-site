// Netlify sets CONTEXT to "production" | "deploy-preview" | "branch-deploy"
// | "dev" for both the build step and the Functions runtime. This is the
// single source of truth for "are we live" on the server side -- never
// inferred from a header, a hostname, or anything the client could spoof.
export function isProductionContext(): boolean {
  return process.env.CONTEXT === "production";
}
