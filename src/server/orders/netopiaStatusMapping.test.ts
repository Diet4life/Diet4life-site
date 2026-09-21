import { describe, expect, it } from "vitest";
import { mapNetopiaStatus, resolveMonotonicOrderStatus } from "./netopiaStatusMapping";

describe("mapNetopiaStatus", () => {
  it("maps status 3 to paid", () => {
    expect(mapNetopiaStatus(3)).toBe("paid");
  });

  it("maps status 12 to payment_failed", () => {
    expect(mapNetopiaStatus(12)).toBe("payment_failed");
  });

  it("maps any other numeric status to the safe payment_processing holding state, never invents a mapping", () => {
    expect(mapNetopiaStatus(1)).toBe("payment_processing");
    expect(mapNetopiaStatus(0)).toBe("payment_processing");
    expect(mapNetopiaStatus(99)).toBe("payment_processing");
  });

  it("never returns paid/payment_failed for non-numeric or missing status -- defaults to processing", () => {
    expect(mapNetopiaStatus(undefined)).toBe("payment_processing");
    expect(mapNetopiaStatus(null)).toBe("payment_processing");
    expect(mapNetopiaStatus("3")).toBe("payment_processing"); // string "3" !== number 3, deliberately strict
    expect(mapNetopiaStatus({})).toBe("payment_processing");
  });
});

describe("resolveMonotonicOrderStatus", () => {
  it("applies the incoming status when the order is still in a non-terminal state", () => {
    expect(resolveMonotonicOrderStatus("pending_payment", "paid")).toBe("paid");
    expect(resolveMonotonicOrderStatus("pending_payment", "payment_processing")).toBe("payment_processing");
    expect(resolveMonotonicOrderStatus("payment_processing", "paid")).toBe("paid");
    expect(resolveMonotonicOrderStatus("payment_processing", "payment_failed")).toBe("payment_failed");
  });

  it("never moves a terminal order (paid/payment_failed/cancelled/refunded) to a new status", () => {
    for (const terminal of ["paid", "payment_failed", "cancelled", "refunded"] as const) {
      expect(resolveMonotonicOrderStatus(terminal, "paid")).toBeNull();
      expect(resolveMonotonicOrderStatus(terminal, "payment_failed")).toBeNull();
      expect(resolveMonotonicOrderStatus(terminal, "payment_processing")).toBeNull();
    }
  });

  it("returns null (no-op) when the incoming status matches the current one", () => {
    expect(resolveMonotonicOrderStatus("payment_processing", "payment_processing")).toBeNull();
  });

  it("critically: a late 'processing' notification arriving after an earlier 'paid' one cannot downgrade the order", () => {
    expect(resolveMonotonicOrderStatus("paid", "payment_processing")).toBeNull();
    expect(resolveMonotonicOrderStatus("paid", "payment_failed")).toBeNull();
  });
});
