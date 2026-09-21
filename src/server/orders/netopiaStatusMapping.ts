// Pure, DB-free helpers for turning a verified NETOPIA IPN payload into an
// order_status transition. Kept separate from orderService.ts (which does
// the actual DB write) so both are independently unit-testable --
// mapNetopiaStatus() and resolveMonotonicOrderStatus() need no database.

import type { orderStatusEnum } from "../../../db/schema";

export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];

// Only "paid" (status 3) and "declined" (status 12) numeric codes are
// solidly corroborated (via a real, working open-source Node.js NETOPIA
// integration's README -- this sandbox's network egress to
// netopia-payments.com/doc.netopia-payments.com remains blocked, so this
// was not independently confirmed against the primary spec). Every other
// numeric status -- including ones not seen anywhere, and including any
// status this mapping doesn't recognize -- deliberately maps to
// "payment_processing" (a safe, non-paid holding state) rather than being
// guessed at. This satisfies "failed/cancelled -> corresponding stored
// state only when supported by verified NETOPIA data": only status 12 is
// solidly enough confirmed to earn the "payment_failed" mapping. Flag to
// the user before relying on this further if NETOPIA sends other status
// codes in practice -- see the notify handler's diagnostic logging, which
// records the raw numeric status/code on every notification.
const NETOPIA_STATUS_PAID = 3;
const NETOPIA_STATUS_DECLINED = 12;

export function mapNetopiaStatus(status: unknown): "paid" | "payment_failed" | "payment_processing" {
  if (status === NETOPIA_STATUS_PAID) return "paid";
  if (status === NETOPIA_STATUS_DECLINED) return "payment_failed";
  return "payment_processing";
}

// A terminal order status is never overwritten by a later/out-of-order
// notification. This is what makes duplicate or out-of-sequence
// notifications safe: e.g. a late "processing" notification arriving
// after an earlier "paid" one (possible with at-least-once webhook
// delivery, which NETOPIA's retry-on-non-200 behavior implies) must never
// downgrade an already-paid order.
const TERMINAL_STATUSES: ReadonlySet<OrderStatus> = new Set(["paid", "payment_failed", "cancelled", "refunded"]);

// Given the order's current status and the status a freshly-verified
// notification maps to, returns the status the order should actually be
// set to, or null if no change should be made. Pure -- takes no DB
// dependency, so every rule here is independently testable.
export function resolveMonotonicOrderStatus(
  current: OrderStatus,
  incoming: "paid" | "payment_failed" | "payment_processing",
): OrderStatus | null {
  if (TERMINAL_STATUSES.has(current)) {
    // Already resolved -- never move a terminal order, in either
    // direction, based on a later notification (out-of-order delivery,
    // or a genuine duplicate that already passed the payments-table
    // uniqueness check upstream).
    return null;
  }
  if (incoming === current) return null;
  return incoming;
}
