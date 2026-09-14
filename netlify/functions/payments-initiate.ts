import type { Handler } from "@netlify/functions";
import { getOrderForPaymentInitiation } from "@/server/orders/orderService";
import { isProductionContext } from "@/server/environment";

// Step 1 of NETOPIA Payments API v2 integration: initiate a card payment in
// SANDBOX only and hand the browser a redirect URL to NETOPIA's hosted
// payment page. Deliberately does NOT implement the callback/IPN (that is a
// separate, later round) and NEVER sets order.status = "paid" -- only a
// verified callback may ever do that, and that callback does not exist yet.
// This function's only job is: look up an existing pending_payment order by
// its public_status_token, ask NETOPIA to start a payment for the amount
// already stored in our own DB, and return the resulting paymentURL.

// ---- What is solidly confirmed vs. best-effort ---------------------------
// Everything below was reconstructed from NETOPIA's public API v2
// documentation and multiple independent SDK READMEs -- this sandbox
// environment's network egress is blocked to every netopia-payments.com
// host (confirmed directly with curl: "CONNECT tunnel failed, response
// 403"), so the canonical Stoplight spec page could not be read directly.
// Solidly corroborated across every source found: the response shape
// (payment.paymentURL / payment.ntpID / payment.status, error.code), and
// the request's config.{notifyUrl,redirectUrl,language} + order.{
// posSignature,dateTime,description,orderID,amount,currency,billing} shape.
// Best-effort, NOT independently confirmed against the primary spec --
// verify against the real sandbox response before relying on this in a
// later round:
//   1) Authorization header: every source shows the raw API key as the
//      header value directly (e.g. "Authorization: <key>"), never a
//      "Bearer <key>" prefix. Implemented that way below.
//   2) payment.instrument: omitted entirely here (not even an empty
//      object) to request the hosted-page redirect flow rather than
//      direct card-field submission. Not independently confirmed that
//      omission is the correct way to ask for a hosted page.
//   3) order.billing field names (firstName/lastName split, country as
//      the ISO alpha-2 code): inferred from an SDK example; our own
//      billing_details table stores one combined fullName/companyName,
//      split heuristically below.
//   4) The notify-stub's exact acknowledgement format (see
//      payments-netopia-notify.ts) -- best-effort 200 JSON ack.

const NETOPIA_SANDBOX_URL = "https://secure.sandbox.netopia-payments.com/payment/card/start";

function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const spaceIndex = trimmed.indexOf(" ");
  if (spaceIndex === -1) return { firstName: trimmed, lastName: trimmed };
  return { firstName: trimmed.slice(0, spaceIndex), lastName: trimmed.slice(spaceIndex + 1) };
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

  const siteUrl = process.env.URL ?? ""; // Netlify's own injected site-URL var (not one we define)
  const { firstName, lastName } = splitName(
    order.billingPersonType === "company" ? order.billingCompanyName ?? "" : order.billingFullName ?? "",
  );

  const netopiaRequestBody = {
    config: {
      notifyUrl: `${siteUrl}/.netlify/functions/payments-netopia-notify`,
      redirectUrl: `${siteUrl}/checkout/retur?token=${encodeURIComponent(publicStatusToken)}`,
      language: "ro",
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
        country: order.billingCountryCode,
      },
    },
  };

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

    const netopiaBody = (await netopiaRes.json().catch(() => null)) as
      | { payment?: { paymentURL?: string; ntpID?: string }; error?: { code?: string; message?: string } }
      | null;

    const paymentURL = netopiaBody?.payment?.paymentURL;
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

    // Never log the full NETOPIA response body (could contain billing
    // data we just sent) -- only the provider's own error code.
    console.error(
      `payments-initiate[${requestId}] failure netopia_rejected status=${netopiaRes.status} code=${netopiaBody?.error?.code ?? "unknown"}`,
    );
    return { statusCode: 502, body: JSON.stringify({ error: "payment_initiation_failed" }) };
  } catch (error) {
    console.error(
      `payments-initiate[${requestId}] failure network_error type=${error instanceof Error ? error.name : "unknown"}`,
    );
    return { statusCode: 502, body: JSON.stringify({ error: "payment_initiation_failed" }) };
  }
};
