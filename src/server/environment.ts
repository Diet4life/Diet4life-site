// Netlify sets CONTEXT to "production" | "deploy-preview" | "branch-deploy"
// | "dev" for both the build step and the Functions runtime. This is the
// single source of truth for "are we live" on the server side -- never
// inferred from a header, a hostname, or anything the client could spoof.
export function isProductionContext(): boolean {
  return process.env.CONTEXT === "production";
}

// Moved here from payments-netopia-notify.ts (same behavior, same
// comment/reasoning, now shared) -- orderService.ts and payments-initiate.ts
// need the exact same flag, and importing a function out of a
// netlify/functions/* handler file into src/server/* would be a backwards
// dependency direction. payments-netopia-notify.ts now imports this instead
// of defining its own copy.
//
// The dedicated sandbox relay site (see resolveNotifyBaseUrl() in
// payments-initiate.ts) is a SECOND Netlify site deployed from this same
// repo/branch -- Netlify necessarily labels ITS OWN deploy "production"
// (there is no other deploy context for a site's primary branch), which
// would otherwise make every isProductionContext() guard in this codebase
// refuse to run there at all. This flag is the one, narrow, explicit opt-out
// for that specific site only -- it does not touch verification/DB logic
// anywhere, and Diet4Life's own real production site simply never has this
// variable set. Fails closed by design: only the exact string "true" enables
// it -- unset, empty, "1", "yes", "TRUE", or anything else leaves relay mode
// off and preserves the normal production-blocked behavior everywhere this
// is checked. Read only from process.env (server-side, hand-set in
// Netlify's dashboard) -- never derived from a request header, query
// string, or any other client-controllable input, so a forged request can
// never enable it.
export function isSandboxRelayEnabled(): boolean {
  return process.env.D4L_NETOPIA_SANDBOX_RELAY === "true";
}

// The one shared predicate every checkout/payment entry point (orderService
// .createOrder(), payments-initiate.ts, payments-netopia-notify.ts) now
// calls instead of duplicating `isProductionContext() && !isSandboxRelayEnabled()`
// three times. true = allowed to proceed (either not production, or
// production AND the one explicit sandbox-relay opt-out is set). Fails
// closed: any production deploy without the flag set to exactly "true"
// stays blocked, including Diet4Life's real production site, which never
// sets it.
export function isCheckoutAllowed(): boolean {
  return !isProductionContext() || isSandboxRelayEnabled();
}
