import { describe, expect, it, vi } from "vitest";
import { isAwaitingConfirmation, pollOrderStatus, type OrderLookup } from "./pollOrderStatus";
import type { PublicOrderStatus } from "./types";

function found(status: PublicOrderStatus["status"]): OrderLookup {
  return { kind: "found", order: { orderNumber: "D4L-2026-012F7470", status } as PublicOrderStatus };
}

function sequence(...lookups: OrderLookup[]) {
  let i = 0;
  return vi.fn(async () => lookups[Math.min(i++, lookups.length - 1)]);
}

const noSleep = vi.fn(async () => {});

describe("pollOrderStatus (bounded return-page refresh)", () => {
  it("delayed notify: pending -> pending -> paid is shown as paid and polling stops", async () => {
    const fetchStatus = sequence(found("pending_payment"), found("pending_payment"), found("paid"));
    const updates: Array<[string, boolean]> = [];
    const result = await pollOrderStatus({
      fetchStatus,
      sleep: noSleep,
      onUpdate: (l, polling) => updates.push([l.kind === "found" ? l.order.status : l.kind, polling]),
    });
    expect(result).toEqual(found("paid"));
    expect(fetchStatus).toHaveBeenCalledTimes(3);
    expect(updates).toEqual([
      ["pending_payment", true],
      ["pending_payment", true],
      ["paid", false],
    ]);
  });

  it("is bounded: a notify that never arrives stops after maxAttempts and reports pending, not paid", async () => {
    const fetchStatus = sequence(found("pending_payment"));
    const onUpdate = vi.fn();
    const result = await pollOrderStatus({ fetchStatus, onUpdate, sleep: noSleep, maxAttempts: 4 });
    expect(fetchStatus).toHaveBeenCalledTimes(4);
    expect(result).toEqual(found("pending_payment"));
    expect(onUpdate).toHaveBeenLastCalledWith(found("pending_payment"), false);
  });

  it("an already-paid order is shown immediately with a single request", async () => {
    const fetchStatus = sequence(found("paid"));
    await pollOrderStatus({ fetchStatus, onUpdate: () => {}, sleep: noSleep });
    expect(fetchStatus).toHaveBeenCalledTimes(1);
  });

  it("failed and cancelled are settled states -- no further polling, never turned into pending or paid", async () => {
    for (const status of ["payment_failed", "cancelled"] as const) {
      const fetchStatus = sequence(found(status), found("paid"));
      const result = await pollOrderStatus({ fetchStatus, onUpdate: () => {}, sleep: noSleep });
      expect(result).toEqual(found(status));
      expect(fetchStatus).toHaveBeenCalledTimes(1);
    }
  });

  it("a transient error is retried; a 404 stops immediately", async () => {
    const retried = sequence({ kind: "error" }, found("paid"));
    expect(await pollOrderStatus({ fetchStatus: retried, onUpdate: () => {}, sleep: noSleep })).toEqual(found("paid"));
    const missing = sequence({ kind: "not-found" });
    await pollOrderStatus({ fetchStatus: missing, onUpdate: () => {}, sleep: noSleep });
    expect(missing).toHaveBeenCalledTimes(1);
  });

  it("stops when the page is left (cancelled)", async () => {
    let cancelled = false;
    const fetchStatus = vi.fn(async () => {
      cancelled = true;
      return found("pending_payment");
    });
    const onUpdate = vi.fn();
    await pollOrderStatus({ fetchStatus, onUpdate, sleep: noSleep, isCancelled: () => cancelled });
    expect(fetchStatus).toHaveBeenCalledTimes(1);
    expect(onUpdate).not.toHaveBeenCalled();
  });

  it("isAwaitingConfirmation covers exactly the two pending states", () => {
    expect(isAwaitingConfirmation("pending_payment")).toBe(true);
    expect(isAwaitingConfirmation("payment_processing")).toBe(true);
    for (const s of ["paid", "payment_failed", "cancelled", "refunded"] as const) expect(isAwaitingConfirmation(s)).toBe(false);
  });
});
