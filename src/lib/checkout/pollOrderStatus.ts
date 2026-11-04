import type { OrderStatus, PublicOrderStatus } from "@/lib/checkout/types";

// Bounded status refresh for /checkout/retur.
//
// NETOPIA redirects the browser back and sends its server-to-server notify
// callback independently, so the browser can arrive before the callback has
// been verified and the order updated. The return page therefore re-reads
// the order from orders-status a limited number of times while it is still
// awaiting confirmation, and stops as soon as the DB status settles.
// "paid" only ever comes from the database (set by the verified notify
// callback) -- never from the redirect URL's query parameters.

export type OrderLookup =
  | { kind: "found"; order: PublicOrderStatus }
  | { kind: "not-found" }
  | { kind: "error" };

export function isAwaitingConfirmation(status: OrderStatus): boolean {
  return status === "pending_payment" || status === "payment_processing";
}

export interface PollOrderStatusOptions {
  fetchStatus: () => Promise<OrderLookup>;
  /** Called after every lookup; `polling` is true while more attempts will follow. */
  onUpdate: (lookup: OrderLookup, polling: boolean) => void;
  sleep?: (ms: number) => Promise<void>;
  isCancelled?: () => boolean;
  /** Total lookups, including the first one. */
  maxAttempts?: number;
  intervalMs?: number;
}

export const DEFAULT_POLL_ATTEMPTS = 10;
export const DEFAULT_POLL_INTERVAL_MS = 3000;

export async function pollOrderStatus({
  fetchStatus,
  onUpdate,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  isCancelled = () => false,
  maxAttempts = DEFAULT_POLL_ATTEMPTS,
  intervalMs = DEFAULT_POLL_INTERVAL_MS,
}: PollOrderStatusOptions): Promise<OrderLookup> {
  let last: OrderLookup = { kind: "error" };
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (isCancelled()) return last;
    last = await fetchStatus();
    if (isCancelled()) return last;
    // A transient error is retried like a still-pending order; a definite
    // 404 or a settled status stops immediately.
    const keepPolling =
      attempt < maxAttempts &&
      (last.kind === "error" || (last.kind === "found" && isAwaitingConfirmation(last.order.status)));
    onUpdate(last, keepPolling);
    if (!keepPolling) return last;
    await sleep(intervalMs);
  }
  return last;
}
