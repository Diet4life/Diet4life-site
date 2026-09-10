import { randomBytes } from "node:crypto";

// The only identifier ever exposed to the browser for order-status lookups.
// Never derived from order_number/id -- must not be guessable or enumerable.
export function generatePublicStatusToken(): string {
  return randomBytes(32).toString("base64url");
}

// Human-facing, invoice-style order number. Sequential-looking but NOT used
// for status lookups (see public_status_token) and not a security boundary.
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `D4L-${year}-${suffix}`;
}
