import type { Handler } from "@netlify/functions";

// SAFE STUB ONLY -- not the real IPN/callback handler.
//
// NETOPIA's config.notifyUrl appeared as part of the standard request shape
// in every example found for the card/start endpoint (see
// payments-initiate.ts's header comment on what's confirmed vs. best-effort)
// -- it was never shown as omitted, so this endpoint exists only so a
// sandbox payment can be initiated at all. It intentionally does nothing
// beyond acknowledging receipt:
//   - does NOT verify any NETOPIA signature/token
//   - does NOT write anything to the database
//   - does NOT change any order's status
//   - does NOT read or store the notification body beyond logging that one
//     arrived (no payload, no headers -- both could carry billing data)
// Real signature verification and order-status updates are a separate,
// later round, only once explicitly approved.
//
// The exact acknowledgement NETOPIA expects back was not independently
// confirmed against the primary spec (blocked from this sandbox's network,
// see payments-initiate.ts) -- this returns a plain 200 with a small JSON
// body, the universal "received, don't retry" webhook convention. Verify
// against a real sandbox notification before building the real handler.
export const handler: Handler = async (event, context) => {
  console.log(`payments-netopia-notify[${context.awsRequestId}] received (stub, no processing)`);

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ received: true }),
  };
};
