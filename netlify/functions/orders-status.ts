import type { Handler } from "@netlify/functions";
import { getOrderByOrderNumber, getOrderByPublicToken } from "@/server/orders/orderService";

// Resolves order status by EITHER the public_status_token query param
// (preferred -- unguessable, 256 bits of randomness, see
// generatePublicStatusToken() in src/server/security/publicToken.ts) OR the
// orderId query param (order_number -- human-facing, ~32 bits of
// randomness, generateOrderNumber()). Both paths are strictly read-only and
// return the exact same minimal, public fields; neither can ever change an
// order's status -- only a verified server-side NETOPIA notify may do that
// (payments-netopia-notify.ts, still a stub, still never marks anything
// paid). This function never reads a `status` query param or anything else
// from the request besides the identifier -- the returned status always
// comes straight from the database row.
//
// orderId support exists because NETOPIA's hosted-page return redirect was
// observed, on a real sandbox payment, to drop the ?token= requested in
// payments-initiate.ts's redirectUrl and substitute its own
// ?orderId=<order_number> instead. token is tried first so the stronger
// identifier is still used whenever it's actually present (older/demo
// links that still use ?token=, or if NETOPIA's behavior differs in some
// other flow).
export function resolveOrderIdentifier(
  query: Record<string, string | undefined> | null | undefined,
): { type: "token"; value: string } | { type: "orderId"; value: string } | null {
  const token = query?.token;
  if (token) return { type: "token", value: token };
  const orderId = query?.orderId;
  if (orderId) return { type: "orderId", value: orderId };
  return null;
}

export const handler: Handler = async (event) => {
  const identifier = resolveOrderIdentifier(event.queryStringParameters);
  if (!identifier) {
    return { statusCode: 400, body: JSON.stringify({ error: "missing_identifier" }) };
  }

  try {
    const order =
      identifier.type === "token"
        ? await getOrderByPublicToken(identifier.value)
        : await getOrderByOrderNumber(identifier.value);
    if (!order) {
      return { statusCode: 404, body: JSON.stringify({ error: "not_found" }) };
    }

    return {
      statusCode: 200,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        orderNumber: order.orderNumber,
        status: order.status,
        productName: order.productName,
        productType: order.productType,
        totalCents: order.priceSnapshotCents,
        currency: order.currency,
        invoiceStatus: order.invoiceStatus,
        deliveryStatus: order.deliveryStatus,
      }),
    };
  } catch (error) {
    console.error("orders-status failed", error);
    return { statusCode: 500, body: JSON.stringify({ error: "internal_error" }) };
  }
};
