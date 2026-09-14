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
// Acknowledgement format per NETOPIA Payments API v2 (confirmed by user):
// 200, Content-Type: application/json, body {"errorCode":0} -- this is the
// exact, specific ack NETOPIA's notifyUrl expects, not a generic webhook
// "200 OK" convention. errorCode is always 0 here regardless of what the
// notification actually contains, because this stub never inspects it.
export const handler: Handler = async (event, context) => {
  console.log(`payments-netopia-notify[${context.awsRequestId}] received (stub, no processing)`);

  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ errorCode: 0 }),
  };
};
