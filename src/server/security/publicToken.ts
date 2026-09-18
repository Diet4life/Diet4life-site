import { randomBytes } from "node:crypto";

// The only identifier ever exposed to the browser for order-status lookups.
// Never derived from order_number/id -- must not be guessable or enumerable.
export function generatePublicStatusToken(): string {
  return randomBytes(32).toString("base64url");
}

// Human-facing, invoice-style order number. Sequential-looking, not a
// security boundary -- public_status_token remains the preferred status-
// lookup identifier, but order_number is also accepted as a read-only
// fallback (see getOrderByOrderNumber() in orderService.ts) since NETOPIA's
// hosted-page return redirect echoes this back as ?orderId=, not the token.
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `D4L-${year}-${suffix}`;
}
