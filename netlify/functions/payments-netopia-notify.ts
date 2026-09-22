import type { Handler } from "@netlify/functions";
import { verifyNetopiaNotification } from "@/server/security/netopiaVerification";
import { recordNetopiaNotification } from "@/server/orders/orderService";
import { mapNetopiaStatus } from "@/server/orders/netopiaStatusMapping";
import { isProductionContext } from "@/server/environment";

// Real NETOPIA v2 IPN/notify handler. See
// src/server/security/netopiaVerification.ts's header comment for exactly
// what "real" means here and its confidence level (well-researched
// implementation of a documented mechanism, never independently confirmed
// against the primary spec -- this sandbox's network to
// netopia-payments.com/doc.netopia-payments.com has been blocked for the
// entire project).
//
// The single hard security rule this whole file exists to enforce: only a
// request that passes verifyNetopiaNotification() -- RS256 signature +
// issuer + audience + body-hash, all four -- may ever reach
// recordNetopiaNotification(), the only function in this codebase that can
// set order.status = "paid". Nothing from the browser (query params,
// headers, /checkout/retur) is ever read here or has any path to this
// function at all -- this endpoint only ever receives NETOPIA's own
// server-to-server POST.
//
// Body shape (order.orderID, payment.{ntpID,status,code,amount}) is from
// the same source as the verification mechanism -- see
// netopiaVerification.ts's header comment for the confidence caveat.

interface ExtractedNotificationFields {
  orderNumber: string;
  providerTransactionId: string;
  status: unknown;
  code: string | undefined;
  amountCents: number;
}

// Pure, exported for testing. Defensive against every shape that isn't
// exactly {order:{orderID:string}, payment:{ntpID:string, ...}} --
// anything else is treated as a malformed payload and rejected, never
// guessed at.
export function extractNotificationFields(body: unknown): ExtractedNotificationFields | null {
  if (!body || typeof body !== "object") return null;
  const order = (body as Record<string, unknown>).order;
  const payment = (body as Record<string, unknown>).payment;
  if (!order || typeof order !== "object" || !payment || typeof payment !== "object") return null;

  const orderNumber = (order as Record<string, unknown>).orderID;
  const providerTransactionId = (payment as Record<string, unknown>).ntpID;
  if (typeof orderNumber !== "string" || !orderNumber) return null;
  if (typeof providerTransactionId !== "string" || !providerTransactionId) return null;

  const status = (payment as Record<string, unknown>).status;
  const codeRaw = (payment as Record<string, unknown>).code;
  const amountRaw = (payment as Record<string, unknown>).amount;

  return {
    orderNumber,
    providerTransactionId,
    status,
    code: typeof codeRaw === "string" ? codeRaw : undefined,
    amountCents: typeof amountRaw === "number" && Number.isFinite(amountRaw) ? Math.round(amountRaw * 100) : 0,
  };
}

// Case-insensitive header lookup -- Netlify's event.headers keys are
// typically already lowercased, but this doesn't assume that.
function getHeader(headers: Record<string, string | undefined> | undefined | null, name: string): string | undefined {
  if (!headers) return undefined;
  const lower = name.toLowerCase();
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === lower) return headers[key];
  }
  return undefined;
}

// Acknowledgement format per NETOPIA Payments API v2 (confirmed by user in
// an earlier round): 200, Content-Type: application/json, {"errorCode":0}
// for anything NETOPIA doesn't need to retry -- including a verified
// notification for an order we can't find (retrying won't ever find it)
// and a verified duplicate (already recorded, nothing to redo). {"errorCode":1}
// with a non-200 status is used only when something about THIS delivery
// itself failed (bad signature, malformed body) -- cases where a retry
// might plausibly help (e.g. once our own config is fixed) or where
// NETOPIA's own delivery monitoring should see a failure.
const ACK_OK = { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ errorCode: 0 }) };
const ACK_REJECT = { statusCode: 400, headers: { "content-type": "application/json" }, body: JSON.stringify({ errorCode: 1 }) };

// The dedicated sandbox relay site (see resolveNotifyBaseUrl() in
// payments-initiate.ts) is a SECOND Netlify site deployed from this same
// repo/branch -- Netlify necessarily labels ITS own deploy "production"
// (there is no other deploy context for a site's primary branch), which
// would otherwise make the isProductionContext() guard below refuse to run
// there at all. This flag is the one, narrow, explicit opt-out for that
// specific site only -- it does NOT touch verifyNetopiaNotification() (the
// RS256/issuer/audience/body-hash checks), recordNetopiaNotification()'s
// idempotency/DB safeguards, or Diet4Life's own real production site (which
// simply never has this variable set). Fails closed by design: only the
// exact string "true" enables it -- unset, empty, "1", "yes", "TRUE", or
// anything else leaves relay mode off and preserves today's 503 behavior.
// Read only from process.env (server-side, hand-set in Netlify's dashboard)
// -- never derived from a request header, query string, or any other
// client-controllable input, so a forged request can never enable it.
export function isSandboxRelayEnabled(): boolean {
  return process.env.D4L_NETOPIA_SANDBOX_RELAY === "true";
}

export const handler: Handler = async (event, context) => {
  const requestId = context.awsRequestId;

  const productionContext = isProductionContext();
  const sandboxRelayEnabled = isSandboxRelayEnabled();

  // Safe diagnostics -- booleans only, never a header, body, token, or env
  // var value itself. Cheap to keep permanently: this is exactly the kind
  // of flag where "did the dedicated relay site actually pick up its env
  // var" is worth being able to confirm from real logs, the same way the
  // D4L_SITE_BASE_URL diagnostics in payments-initiate.ts already are.
  console.log(
    `payments-netopia-notify[${requestId}] diag isProduction=${productionContext} sandboxRelayEnabled=${sandboxRelayEnabled}`,
  );

  // Defense-in-depth, checked first, before anything else (mirrors
  // payments-initiate.ts's own production guard). This endpoint's only
  // *other* protection against running unverified in production is
  // NETOPIA_PUBLIC_KEY being unset there -- a config omission, not a
  // structural block.
  //
  // Diet4Life's own real production site: productionContext=true,
  // sandboxRelayEnabled=false (the variable is never set there) -> still
  // refuses, exactly as before this round.
  //
  // The dedicated sandbox relay site: productionContext=true (Netlify's own
  // label for that site's primary branch deploy), sandboxRelayEnabled=true
  // (set by hand, only on that site) -> falls through to the real
  // verification/DB logic below, completely unmodified. Everything past
  // this point -- signature/issuer/audience/body-hash verification, order
  // lookup, idempotency, status transitions -- is exactly the same code
  // path a non-production branch-deploy request already goes through; this
  // flag only ever changes whether that path is reached, never what it does.
  //
  // Any non-production branch/preview deploy: productionContext=false ->
  // this guard is skipped regardless of the flag, unchanged from before.
  if (productionContext && !sandboxRelayEnabled) {
    return {
      statusCode: 503,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "notify_disabled" }),
    };
  }

  const rawBody: Buffer | string =
    event.isBase64Encoded && event.body ? Buffer.from(event.body, "base64") : (event.body ?? "");

  const verification = verifyNetopiaNotification({
    rawBody,
    verificationToken: getHeader(event.headers, "verification-token"),
    publicKeyPem: process.env.NETOPIA_PUBLIC_KEY,
    expectedAudience: process.env.NETOPIA_POS_SIGNATURE ?? "",
  });

  if (!verification.ok) {
    // Never log the token, the body, or any header value -- only the
    // classification of why verification failed.
    console.error(`payments-netopia-notify[${requestId}] rejected reason=${verification.reason}`);
    return ACK_REJECT;
  }

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(typeof rawBody === "string" ? rawBody : rawBody.toString("utf8"));
  } catch {
    console.error(`payments-netopia-notify[${requestId}] rejected reason=malformed_body`);
    return ACK_REJECT;
  }

  const fields = extractNotificationFields(parsedBody);
  if (!fields) {
    console.error(`payments-netopia-notify[${requestId}] rejected reason=malformed_fields`);
    return ACK_REJECT;
  }

  try {
    const result = await recordNetopiaNotification({
      orderNumber: fields.orderNumber,
      providerTransactionId: fields.providerTransactionId,
      providerStatus: fields.code ?? String(fields.status ?? "unknown"),
      mappedStatus: mapNetopiaStatus(fields.status),
      amountCents: fields.amountCents,
    });

    // Diagnostic only: request id, order number (already logged elsewhere
    // in this codebase as a non-sensitive correlation id -- e.g.
    // payments-initiate.ts's own success/failure logs), and the outcome.
    // Never the raw body, the JWT, amount, or anything billing-shaped.
    if (result.outcome === "order_not_found") {
      console.error(`payments-netopia-notify[${requestId}] verified order=${fields.orderNumber} outcome=order_not_found`);
    } else if (result.outcome === "duplicate") {
      console.log(`payments-netopia-notify[${requestId}] verified order=${fields.orderNumber} outcome=duplicate`);
    } else {
      console.log(
        `payments-netopia-notify[${requestId}] verified order=${fields.orderNumber} outcome=processed ` +
          `previousStatus=${result.previousStatus} newStatus=${result.newStatus}`,
      );
    }

    return ACK_OK;
  } catch (error) {
    console.error(
      `payments-netopia-notify[${requestId}] failure db_error type=${error instanceof Error ? error.name : "unknown"}`,
    );
    return ACK_REJECT;
  }
};
