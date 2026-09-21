import type { Handler } from "@netlify/functions";
import { verifyNetopiaNotification } from "@/server/security/netopiaVerification";
import { recordNetopiaNotification } from "@/server/orders/orderService";
import { mapNetopiaStatus } from "@/server/orders/netopiaStatusMapping";

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

export const handler: Handler = async (event, context) => {
  const requestId = context.awsRequestId;

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
