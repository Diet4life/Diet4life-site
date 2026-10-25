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

// Baked in at build time from the server-side D4L_NETOPIA_SANDBOX_RELAY
// flag (see vite.config.ts's `define` and src/server/environment.ts's
// isSandboxRelayEnabled()) -- true only on the dedicated NETOPIA sandbox
// relay site. Same disclaimer as isProductionBuild(): this is UI-only. The
// real, authoritative gate is server-side (isCheckoutAllowed(), checked
// independently by orderService.createOrder() and payments-initiate.ts at
// request time, reading process.env directly) -- a client build can never
// forge its way into a real order or payment just by having this flag true,
// since the server never trusts anything the client sends about its own
// build.
declare const __D4L_SANDBOX_RELAY__: boolean;

export function isSandboxRelayBuild(): boolean {
  return typeof __D4L_SANDBOX_RELAY__ !== "undefined" && __D4L_SANDBOX_RELAY__;
}

// The one place PaymentButton.tsx and Checkout.tsx decide whether checkout
// is available in this build -- mirrors isCheckoutAllowed() on the server
// exactly (same "production, and the flag was not set to exactly true ->
// blocked" logic), so the UI and the server can never disagree about which
// deploy is allowed to actually place an order.
export function isCheckoutDisabledInBuild(): boolean {
  return isProductionBuild() && !isSandboxRelayBuild();
}
