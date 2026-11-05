// 2026-11-04: CONTEXT is NOT a reliable signal at Netlify Functions runtime.
// A real sandbox payment's own server logs showed `isProduction=false` even
// on a deploy that Netlify's own dashboard calls "production" -- CONTEXT is
// apparently only populated at the build step on this project, not injected
// into the Functions runtime environment the way Netlify's docs suggest.
// Trusting it here would mean isCheckoutAllowed() below silently defaults to
// "allowed" (fails OPEN, not closed) on any deploy where CONTEXT happens to
// be unset -- including, hypothetically, Diet4Life's real production site.
// That is a real security gap, not a cosmetic one.
//
// The one env var confirmed reliably populated at Functions runtime on this
// project (via the exact same real sandbox-payment round trip that exposed
// the CONTEXT problem -- resolveSiteBaseUrl()/resolveOwnDeployHost() in
// payments-initiate.ts already depend on it successfully) is `process.env.URL`,
// Netlify's own "this site's primary/canonical URL" variable. It's server-side
// only (never a request header, query string, or anything client-controllable),
// so a forged request can never influence it.
//
// isDiet4LifeProductionSite() checks that URL's hostname against the one real
// production hostname, hardcoded here (not read from an env var) so that
// turning on real production payments requires an actual code change and
// review, never a Netlify dashboard env-var edit alone.
const DIET4LIFE_PRODUCTION_HOSTNAME = "diet4lifeconcept.ro";

// 2026-11-05: a blacklist-only design (veto one named hostname, allow
// everything else once the flag is set) still leaves a hole -- any OTHER
// hostname (www.diet4lifeconcept.ro, an unrelated/unknown Netlify project,
// a deploy preview, a stray localhost) would pass through to "allowed"
// just by having the flag set, even though none of those are the one
// dedicated relay site this flag is meant for. Checkout/payment processing
// now requires an explicit ALLOWLIST match on the relay's own hostname, not
// merely "not the production hostname" -- see isCheckoutAllowed() below.
const SANDBOX_RELAY_HOSTNAME = "diet4life-netopia-sandbox-relay.netlify.app";

function siteHostname(): string | undefined {
  const url = process.env.URL;
  if (!url) return undefined;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return undefined;
  }
}

export function isDiet4LifeProductionSite(): boolean {
  return siteHostname() === DIET4LIFE_PRODUCTION_HOSTNAME;
}

// The explicit allowlist half of isCheckoutAllowed(): true only when
// process.env.URL's hostname is byte-for-byte the dedicated sandbox relay
// site's hostname -- never a substring/suffix/prefix match (so
// "evil-diet4life-netopia-sandbox-relay.netlify.app" or
// "diet4life-netopia-sandbox-relay.netlify.app.evil.com" are both false),
// and never derived from a request Host header (only server-side
// process.env.URL -- see this file's header comment for why that's the
// one reliable runtime signal here).
export function isSandboxRelaySite(): boolean {
  return siteHostname() === SANDBOX_RELAY_HOSTNAME;
}

// Kept only for any existing caller that genuinely wants Netlify's own build-time
// deploy-context label (e.g. a log line) -- never used for a security decision
// below. See the header comment above: this is NOT reliable at Functions runtime
// and must never gate checkout/payment behavior by itself.
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
// repo/branch, with its own `process.env.URL` (its own hostname, never
// "diet4lifeconcept.ro"). This flag is the one, narrow, explicit opt-in for
// that specific site only -- it does not touch verification/DB logic
// anywhere. Fails closed by design: only the exact string "true" enables
// it -- unset, empty, "1", "yes", "TRUE", or anything else leaves relay mode
// off. Read only from process.env (server-side, hand-set in Netlify's
// dashboard) -- never derived from a request header, query string, or any
// other client-controllable input, so a forged request can never enable it.
export function isSandboxRelayEnabled(): boolean {
  return process.env.D4L_NETOPIA_SANDBOX_RELAY === "true";
}

// The one shared predicate every checkout/payment entry point (orderService
// .createOrder(), payments-initiate.ts, payments-netopia-notify.ts) calls.
//
// 2026-11-05: rewritten from a blacklist ("block the one named production
// hostname, allow everything else once flagged") to an explicit ALLOWLIST,
// per an explicit security correction -- a blacklist alone still lets an
// unanticipated hostname (www.diet4lifeconcept.ro, an unrelated Netlify
// project, a deploy preview, a stray localhost) through just because it
// isn't the one name on the blacklist. Checkout is now allowed if and only
// if BOTH of these are true, with no other path to `true` anywhere in this
// function:
//   1. process.env.URL's hostname is byte-for-byte the dedicated sandbox
//      relay site's own hostname (isSandboxRelaySite()) -- every other
//      hostname is blocked by default, which includes, explicitly:
//      diet4lifeconcept.ro, www.diet4lifeconcept.ro, any other/unknown
//      Netlify project, any deploy-preview hostname, localhost, and a
//      missing or malformed URL value (siteHostname() returns undefined,
//      which matches nothing).
//   2. D4L_NETOPIA_SANDBOX_RELAY is the exact, case-sensitive string "true"
//      (isSandboxRelayEnabled()) -- "TRUE", "True", "1", "yes", empty, or
//      unset all remain blocked.
// Both conditions read only server-side process.env values -- never a
// request Host/Origin header or any other client-controllable input, so a
// forged request can never influence either one.
export function isCheckoutAllowed(): boolean {
  return isSandboxRelaySite() && isSandboxRelayEnabled();
}
