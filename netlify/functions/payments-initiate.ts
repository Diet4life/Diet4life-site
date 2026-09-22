import type { Handler } from "@netlify/functions";
import { getOrderForPaymentInitiation } from "@/server/orders/orderService";
import { isProductionContext } from "@/server/environment";
import { getCountryName, getCountryNumericCode } from "@/lib/checkout/countries";

// Step 1 of NETOPIA Payments API v2 integration: initiate a card payment in
// SANDBOX only and hand the browser a redirect URL to NETOPIA's hosted
// payment page. Deliberately does NOT implement the callback/IPN (that is a
// separate, later round) and NEVER sets order.status = "paid" -- only a
// verified callback may ever do that, and that callback does not exist yet.
// This function's only job is: look up an existing pending_payment order by
// its public_status_token, ask NETOPIA to start a payment for the amount
// already stored in our own DB, and return the resulting paymentURL.

// ---- What is solidly confirmed vs. best-effort ---------------------------
// Everything below was originally reconstructed from NETOPIA's public API
// v2 documentation and multiple independent SDK READMEs -- this sandbox
// environment's network egress is blocked to every netopia-payments.com
// host (confirmed directly with curl: "CONNECT tunnel failed, response
// 403"), so the canonical Stoplight spec page could not be read directly
// from this session at any point. Solidly corroborated across every source
// found: the response shape (payment.paymentURL / payment.ntpID /
// payment.status, error.code), and the request's
// config.{notifyUrl,redirectUrl,language} + order.{posSignature,dateTime,
// description,orderID,amount,currency,billing} shape.
//
// The request body's top-level `payment` section was added after a real
// sandbox request returned HTTP 400 "Validation error" with only
// `config`+`order` -- the user independently checked the current official
// NETOPIA v2 SDK/docs and confirmed the three top-level sections
// (config, payment, order).
//
// After adding `payment: { instrument: null }` alone, the same sandbox
// request still returned HTTP 400 "Validation error". The user then read
// the live NETOPIA sandbox OpenAPI spec directly at
// https://secure.sandbox.netopia-payments.com/spec (still unreachable from
// this sandbox's own network -- same block as above) and confirmed two
// further, definite schema mismatches, both fixed below:
//   1) `payment.options` (an object with `installments`/`bonus`) is part
//      of the schema alongside `instrument` -- now sent as
//      `{ installments: 0, bonus: 0 }`, meaning no installment plan and no
//      bonus-points redemption, i.e. a plain single-charge payment.
//   2) `order.billing` uses NETOPIA's `Address` schema, which requires
//      email, phone, firstName, lastName, city, country, countryName,
//      state, postalCode, and details -- all of them, not just the first
//      six. `country` must be the ISO 3166-1 *numeric* code as an integer
//      (e.g. 642 for Romania), not the alpha-2 code used everywhere else
//      in this codebase. See getCountryNumericCode()/getCountryName() in
//      src/lib/checkout/countries.ts for the alpha-2 -> numeric mapping
//      (sourced from the same generated country data used by the checkout
//      country selector, not a separate list) and
//      getOrderForPaymentInitiation() in orderService.ts for where
//      state/postalCode/details are read from (billing_details.county /
//      .postalCode / .streetAddress+.buildingDetails -- all already
//      collected by checkout, never invented).
//
// These two fixes are based on the user's own direct reading of the live
// spec, not independently re-verified by this session (still no network
// path to netopia-payments.com from here). Still best-effort / unverified
// from this session specifically:
//   1) Authorization header: every source shows the raw API key as the
//      header value directly (e.g. "Authorization: <key>"), never a
//      "Bearer <key>" prefix. Implemented that way below.
//   2) order.billing field names (firstName/lastName split): inferred
//      from an SDK example; our own billing_details table stores one
//      combined fullName/companyName, split heuristically below.
//   3) The notify-stub's exact acknowledgement format (see
//      payments-netopia-notify.ts) -- best-effort 200 JSON ack.

const NETOPIA_SANDBOX_URL = "https://secure.sandbox.netopia-payments.com/payment/card/start";

function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) return { firstName: trimmed, lastName: trimmed };
  return { firstName: trimmed.slice(0, spaceIndex), lastName: trimmed.slice(spaceIndex + 1) };
}

type OrderForPayment = NonNullable<Awaited<ReturnType<typeof getOrderForPaymentInitiation>>>;

// Thrown by buildNetopiaRequestBody() when a billing country code has no
// ISO 3166-1 numeric mapping -- should not happen in practice (checkout's
// zod schema only ever accepts a code from the same generated country
// list this looks up against), but NETOPIA's Address schema requires a
// numeric `country`, so failing closed here beats silently sending a
// broken/undefined value.
export class UnknownCountryCodeError extends Error {
  constructor(code: string) {
    super(`No ISO 3166-1 numeric mapping for country code "${code}"`);
    this.name = "UnknownCountryCodeError";
  }
}

// Pure request-body builder, exported for testing (see
// src/server/payments/payments-initiate.test.ts) -- no DB/network access
// here. Builds exactly the three top-level sections NETOPIA's v2
// card/start contract requires: config, payment, order.
// `payment.instrument` stays null and `payment.options` carries no
// installments/bonus -- this implementation never collects or sends a
// card number, expiry, CVV, or any other PCI-sensitive field; NETOPIA's
// own hosted page is where the customer enters card details.
export function buildNetopiaRequestBody(
  order: OrderForPayment,
  amount: number,
  currency: string,
  posSignature: string,
  siteUrl: string,
  notifyBaseUrl: string,
  publicStatusToken: string,
) {
  const { firstName, lastName } = splitName(
    order.billingPersonType === "company" ? order.billingCompanyName ?? "" : order.billingFullName ?? "",
  );

  const country = getCountryNumericCode(order.billingCountryCode);
  if (country === undefined) {
    throw new UnknownCountryCodeError(order.billingCountryCode);
  }

  // Real collected checkout data only -- streetAddress is a required
  // billing_details column, buildingDetails (bloc/scară/apartament) is
  // optional and simply omitted from `details` when not provided.
  const details = [order.billingStreetAddress, order.billingBuildingDetails].filter(Boolean).join(", ");

  return {
    config: {
      // notifyUrl deliberately uses its OWN base (notifyBaseUrl), separate
      // from redirectUrl's siteUrl -- see resolveNotifyBaseUrl()'s comment
      // below for why: Netlify's Visitor Access/team-SSO gate blocks
      // server-to-server POSTs to the branch deploy's own domain (confirmed
      // via a real failed sandbox notification: HTTP 401 before this
      // function ever ran), so notify often needs a different, publicly
      // reachable host than the browser redirect does.
      notifyUrl: `${notifyBaseUrl}/.netlify/functions/payments-netopia-notify`,
      // Still requested with ?token=... (the stronger, unguessable
      // identifier) -- but confirmed on a real sandbox payment that
      // NETOPIA's own redirect drops this and lands the browser on
      // ?orderId=<order_number> instead. CheckoutReturn.tsx/orders-status.ts
      // handle both; kept as ?token= here in case some other NETOPIA flow
      // does preserve it.
      redirectUrl: `${siteUrl}/checkout/retur?token=${encodeURIComponent(publicStatusToken)}`,
      language: "ro",
    },
    payment: {
      options: {
        installments: 0,
        bonus: 0,
      },
      instrument: null,
    },
    order: {
      posSignature,
      dateTime: new Date().toISOString(),
      description: `${order.orderNumber} - ${order.productName}`,
      orderID: order.orderNumber,
      amount,
      currency,
      billing: {
        email: order.billingEmail,
        phone: order.billingPhone,
        firstName,
        lastName,
        city: order.billingCity,
        country,
        countryName: getCountryName(order.billingCountryCode, "en"),
        state: order.billingCounty,
        // Not every country requires a postal code at checkout (see
        // isPostalCodeRequired() in countries.ts) -- when the buyer left
        // it blank, NETOPIA's Address schema still requires the field to
        // be present, so an empty string (never an invented value) fills
        // it, per the explicit "safest schema-valid neutral value" rule.
        postalCode: order.billingPostalCode ?? "",
        details,
      },
    },
  };
}

// Diagnostic-only helpers for logging a rejected NETOPIA response. Never
// log the request we sent (it carries billing data) or any secret -- only
// what NETOPIA sent back, and even that goes through redaction + a length
// cap before it ever reaches console.error, in case their error body ever
// echoes something we sent (e.g. an email in a validation message).
function redactSensitive(text: string): string {
  return text
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[redacted-email]")
    .replace(/\+?\d[\d\s\-().]{6,}\d/g, "[redacted-number]");
}

function describeNetopiaFailure(parsedBody: Record<string, unknown> | null, rawBody: string): string {
  if (parsedBody) {
    const errorObj = parsedBody.error as { code?: unknown; message?: unknown } | undefined;
    const errorsArr = Array.isArray(parsedBody.errors) ? parsedBody.errors : undefined;
    const code = errorObj?.code ?? parsedBody.errorCode ?? parsedBody.code;
    const message = errorObj?.message ?? parsedBody.message;
    if (code !== undefined || message !== undefined || errorsArr) {
      const codeStr = typeof code === "string" || typeof code === "number" ? String(code) : "none";
      const messageStr =
        typeof message === "string"
          ? redactSensitive(message).slice(0, 200)
          : errorsArr
            ? redactSensitive(JSON.stringify(errorsArr)).slice(0, 200)
            : "none";
      return `code=${codeStr} message="${messageStr}"`;
    }
  }
  // Not JSON, or JSON without any recognizable error field -- fall back to
  // a redacted, truncated snippet of the raw body so there's still
  // something to go on.
  return `body="${redactSensitive(rawBody).slice(0, 300)}"`;
}

// Round 1 (commit 5c43916): pinned production to URL and everything else to
// DEPLOY_PRIME_URL, reasoning from Netlify's documented *build-time*
// behavior alone. Still resolved to production from the branch deploy.
//
// Round 2 (commit 7a97557): added DEPLOY_URL as a second fallback and
// temporary diagnostic logging to see real Function-runtime values instead
// of guessing from documentation.
//
// Round 3 (this commit) -- the diagnostics from round 2 came back with the
// actual answer: on a real branch-deploy invocation, context=unset,
// deployUrlHost=unset, deployPrimeUrlHost=unset, urlHost=diet4lifeconcept.ro.
// CONTEXT, DEPLOY_URL, and DEPLOY_PRIME_URL are build-time-only variables
// and are NOT available in the Functions runtime at all -- URL is the only
// one of the previously-tried variables that's actually populated there,
// and it's always the production domain. No env-var-only approach can ever
// distinguish branch-deploy from production this way; the fallback chain
// from rounds 1-2 could never have worked.
//
// Fix: a new, explicit, self-defined variable -- D4L_SITE_BASE_URL -- set
// by hand in Netlify's dashboard, scoped to the Branch deploys context only
// (never Production, so production is structurally incapable of picking it
// up regardless of this code). In non-production, if it's set and is a
// valid https:// URL, it's used; otherwise this falls back to URL, same as
// production. Production remains pinned to URL unconditionally, exactly as
// in every previous round -- production behavior never depended on, and
// still does not depend on, any of the build-time-only variables.
//
// Takes no arguments -- reads only server-side env vars, never a
// browser-supplied Host/Origin header (which would be attacker-
// controllable and could enable an open redirect). No branch name or
// Netlify hostname is hardcoded anywhere in this file; the actual branch
// URL lives only in Netlify's own environment-variable configuration.
//
// Both branches strip a trailing slash before returning: this value is
// always interpolated as `${siteUrl}/checkout/retur` /
// `${siteUrl}/.netlify/functions/...` in buildNetopiaRequestBody(), so a
// base URL entered with a trailing slash (an easy copy-paste mistake when
// setting D4L_SITE_BASE_URL by hand in Netlify's dashboard) would otherwise
// produce a double slash in both notifyUrl and redirectUrl.
export function resolveSiteBaseUrl(): string {
  if (isProductionContext()) {
    return stripTrailingSlash(process.env.URL ?? "");
  }
  const custom = process.env.D4L_SITE_BASE_URL;
  if (custom && isValidHttpsUrl(custom)) {
    return stripTrailingSlash(custom);
  }
  return stripTrailingSlash(process.env.URL ?? "");
}

export function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

// Round 4: the site's Netlify Visitor Access is team-SSO-gated and cannot
// be made public on the current plan (confirmed by the user in her own
// dashboard). A real sandbox payment proved this blocks server-to-server
// requests too, not just browser page loads -- NETOPIA's notify POST to the
// branch deploy's own domain got HTTP 401 from Netlify's own access layer
// before payments-netopia-notify.ts ever ran. redirectUrl doesn't have this
// problem (the browser's own session on the branch deploy is already
// authenticated via team SSO), so only notifyUrl needs a way to point
// somewhere else.
//
// A same-site "relay" function was considered and rejected: Visitor Access
// gates the whole site, including every Function on it, so a relay
// forwarding to this same domain would hit the identical 401 -- there is no
// in-repo code fix for an access-control layer enforced in front of the
// whole site. The viable path is a second, separate Netlify site (a
// standard, well-supported Netlify capability: multiple sites can be linked
// to the same git repo/branch, each with its own independently configured
// settings, including Visitor Access) deployed as a sandbox-only public
// relay for exactly this one Function -- see the accompanying report for
// the manual dashboard steps, which only the user can do from here.
//
// D4L_NETOPIA_NOTIFY_BASE_URL is that second site's URL, set by hand,
// scoped the same way as D4L_SITE_BASE_URL (never Production). When unset
// or invalid, this simply falls back to resolveSiteBaseUrl() -- i.e.
// notifyUrl and redirectUrl share the same base exactly as before this
// variable existed, so leaving it unset changes nothing. Production is
// pinned to URL unconditionally, exactly like resolveSiteBaseUrl(), and
// never reads this variable at all.
export function resolveNotifyBaseUrl(): string {
  if (isProductionContext()) {
    return stripTrailingSlash(process.env.URL ?? "");
  }
  const custom = process.env.D4L_NETOPIA_NOTIFY_BASE_URL;
  if (custom && isValidHttpsUrl(custom)) {
    return stripTrailingSlash(custom);
  }
  return resolveSiteBaseUrl();
}

// HTTPS-only, well-formed-URL validation for D4L_SITE_BASE_URL. Rejects
// anything that isn't exactly a valid absolute https:// URL (plain http://,
// a bare hostname with no scheme, javascript:, an empty string, garbage
// text) -- resolveSiteBaseUrl() falls back to the safe URL-based default
// rather than trust an unvalidated value. Never throws.
export function isValidHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

// Hostname-only extraction for the temporary diagnostic log below -- even
// though none of these URLs are secret, logging only the hostname (never
// the full URL, and never a query string, which could carry a token) is
// the safest option that still answers "which deploy did this resolve
// to". Never throws.
export function safeHostname(value: string | undefined): string {
  if (!value) return "unset";
  try {
    return new URL(value).hostname;
  } catch {
    return "unparseable";
  }
}

export const handler: Handler = async (event, context) => {
  const requestId = context.awsRequestId;

  // Mirrors orders-create.ts's guard: NETOPIA is sandbox-only for now,
  // never reachable from a production request, regardless of order state.
  if (isProductionContext()) {
    return { statusCode: 503, body: JSON.stringify({ error: "checkout_disabled" }) };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "method_not_allowed" }) };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(event.body ?? "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "invalid_json" }) };
  }

  const publicStatusToken =
    typeof payload === "object" && payload !== null && "publicStatusToken" in payload
      ? (payload as Record<string, unknown>).publicStatusToken
      : undefined;
  if (typeof publicStatusToken !== "string" || !publicStatusToken) {
    return { statusCode: 400, body: JSON.stringify({ error: "missing_token" }) };
  }

  const apiKey = process.env.NETOPIA_API_KEY;
  const posSignature = process.env.NETOPIA_POS_SIGNATURE;
  if (!apiKey || !posSignature) {
    console.error(`payments-initiate[${requestId}] failure netopia_not_configured`);
    return { statusCode: 500, body: JSON.stringify({ error: "payment_not_configured" }) };
  }

  const order = await getOrderForPaymentInitiation(publicStatusToken);
  if (!order) {
    return { statusCode: 404, body: JSON.stringify({ error: "order_not_found" }) };
  }

  // The only state a payment may be initiated from. Re-initiating from any
  // other status (already paid, failed, cancelled, refunded, or already
  // mid-processing) is refused -- this also makes the endpoint safe to call
  // more than once by accident (e.g. a double click) without side effects.
  if (order.status !== "pending_payment") {
    return { statusCode: 409, body: JSON.stringify({ error: "order_not_payable", status: order.status }) };
  }

  // Amount and currency are never taken from the request body -- payload
  // only carries the token. Everything financial is re-read from the order
  // row, which itself was priced server-side at orders-create time.
  const amount = order.priceSnapshotCents / 100;
  const currency = order.currency;
  if (!(amount > 0) || !currency) {
    console.error(`payments-initiate[${requestId}] failure invalid_order_amount`);
    return { statusCode: 500, body: JSON.stringify({ error: "invalid_order_amount" }) };
  }

  const siteUrl = resolveSiteBaseUrl();
  const notifyBaseUrl = resolveNotifyBaseUrl();
  // TEMPORARY diagnostics (remove once the branch-deploy redirectUrl fix is
  // confirmed against real logs) -- hostnames only, no secrets, no paths,
  // no query strings, no full URLs. context/deployUrlHost/deployPrimeUrlHost
  // are kept even though round 2's real logs already showed them unset at
  // Function runtime (they're build-time-only), as a cheap early warning if
  // Netlify's behavior there ever changes. See resolveSiteBaseUrl()'s
  // comment for the full history.
  console.log(
    `payments-initiate[${requestId}] diag context=${process.env.CONTEXT ?? "unset"} ` +
      `isProduction=${isProductionContext()} urlHost=${safeHostname(process.env.URL)} ` +
      `deployUrlHost=${safeHostname(process.env.DEPLOY_URL)} deployPrimeUrlHost=${safeHostname(process.env.DEPLOY_PRIME_URL)} ` +
      `d4lSiteBaseUrlHost=${safeHostname(process.env.D4L_SITE_BASE_URL)} resolvedHost=${safeHostname(siteUrl)} ` +
      `d4lNotifyBaseUrlHost=${safeHostname(process.env.D4L_NETOPIA_NOTIFY_BASE_URL)} resolvedNotifyHost=${safeHostname(notifyBaseUrl)}`,
  );
  let netopiaRequestBody: ReturnType<typeof buildNetopiaRequestBody>;
  try {
    netopiaRequestBody = buildNetopiaRequestBody(order, amount, currency, posSignature, siteUrl, notifyBaseUrl, publicStatusToken);
  } catch (err) {
    if (err instanceof UnknownCountryCodeError) {
      console.error(`payments-initiate[${requestId}] failure unknown_country_code`);
      return { statusCode: 500, body: JSON.stringify({ error: "invalid_billing_country" }) };
    }
    throw err;
  }

  try {
    const netopiaRes = await fetch(NETOPIA_SANDBOX_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "content-type": "application/json",
        // Best-effort per publicly available examples -- not independently
        // confirmed against the primary spec (see file header). If NETOPIA
        // actually expects "Bearer <key>", this is the one line to change.
        Authorization: apiKey,
      },
      body: JSON.stringify(netopiaRequestBody),
    });

    const contentType = netopiaRes.headers.get("content-type") ?? "none";
    const rawBody = await netopiaRes.text();
    let parsedBody: Record<string, unknown> | null = null;
    try {
      const json = JSON.parse(rawBody);
      if (json && typeof json === "object") parsedBody = json as Record<string, unknown>;
    } catch {
      parsedBody = null;
    }

    const payment = parsedBody?.payment as { paymentURL?: string; ntpID?: string } | undefined;
    const paymentURL = payment?.paymentURL;
    if (netopiaRes.ok && paymentURL) {
      console.log(`payments-initiate[${requestId}] success order=${order.orderNumber}`);
      // Deliberately minimal: only what the browser needs to redirect.
      // Never echoes the full NETOPIA response back to the client.
      return {
        statusCode: 200,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paymentURL, orderNumber: order.orderNumber }),
      };
    }

    // Diagnostic-only: status, response content-type, order number, and
    // either the recognizable error fields (if the body is JSON) or a
    // redacted/truncated snippet of the raw body. Never the request we
    // sent, never any secret. See describeNetopiaFailure()/redactSensitive()
    // above for exactly what's included.
    console.error(
      `payments-initiate[${requestId}] failure netopia_rejected order=${order.orderNumber} status=${netopiaRes.status} contentType=${contentType} ${describeNetopiaFailure(parsedBody, rawBody)}`,
    );
    return { statusCode: 502, body: JSON.stringify({ error: "payment_initiation_failed" }) };
  } catch (error) {
    console.error(
      `payments-initiate[${requestId}] failure network_error type=${error instanceof Error ? error.name : "unknown"}`,
    );
    return { statusCode: 502, body: JSON.stringify({ error: "payment_initiation_failed" }) };
  }
};
