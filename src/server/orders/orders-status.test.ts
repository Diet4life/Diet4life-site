import { describe, expect, it, vi, beforeEach } from "vitest";

const getOrderByPublicToken = vi.fn();
const getOrderByOrderNumber = vi.fn();

// vi.mock calls are hoisted above every import in this file by vitest's
// transform, so the handler import below already sees the mocked module.
vi.mock("@/server/orders/orderService", () => ({
  getOrderByPublicToken: (...args: unknown[]) => getOrderByPublicToken(...args),
  getOrderByOrderNumber: (...args: unknown[]) => getOrderByOrderNumber(...args),
}));

import { handler, resolveOrderIdentifier } from "../../../netlify/functions/orders-status";

const FAKE_ORDER = {
  orderNumber: "D4L-2026-77354A78",
  status: "pending_payment",
  productName: "Consultație Nutrițională",
  productType: "consultation",
  priceSnapshotCents: 30000,
  currency: "RON",
  invoiceStatus: "pending",
  deliveryStatus: null,
};

async function invoke(query: Record<string, string | undefined> | null) {
  // @ts-expect-error -- minimal event stand-in, only queryStringParameters is read
  const result = await handler({ queryStringParameters: query }, {});
  // The Handler type allows `void` (e.g. for streaming responses), which
  // this function never actually returns -- narrow it back for the tests.
  return result as { statusCode: number; body: string };
}

describe("resolveOrderIdentifier", () => {
  it("prefers token when both token and orderId are present", () => {
    expect(resolveOrderIdentifier({ token: "abc", orderId: "D4L-2026-XXXXXXXX" })).toEqual({
      type: "token",
      value: "abc",
    });
  });

  it("falls back to orderId when token is absent", () => {
    expect(resolveOrderIdentifier({ orderId: "D4L-2026-77354A78" })).toEqual({
      type: "orderId",
      value: "D4L-2026-77354A78",
    });
  });

  it("returns null when neither is present", () => {
    expect(resolveOrderIdentifier({})).toBeNull();
    expect(resolveOrderIdentifier(null)).toBeNull();
    expect(resolveOrderIdentifier(undefined)).toBeNull();
  });

  it("ignores an empty-string token and falls back to orderId", () => {
    expect(resolveOrderIdentifier({ token: "", orderId: "D4L-2026-77354A78" })).toEqual({
      type: "orderId",
      value: "D4L-2026-77354A78",
    });
  });
});

describe("orders-status handler", () => {
  beforeEach(() => {
    getOrderByPublicToken.mockReset();
    getOrderByOrderNumber.mockReset();
  });

  it("token lookup still works", async () => {
    getOrderByPublicToken.mockResolvedValue(FAKE_ORDER);
    const res = await invoke({ token: "real-token-value" });
    expect(res.statusCode).toBe(200);
    expect(getOrderByPublicToken).toHaveBeenCalledWith("real-token-value");
    expect(getOrderByOrderNumber).not.toHaveBeenCalled();
    expect(JSON.parse(res.body).orderNumber).toBe(FAKE_ORDER.orderNumber);
  });

  it("orderId lookup works (the NETOPIA return-redirect fallback)", async () => {
    getOrderByOrderNumber.mockResolvedValue(FAKE_ORDER);
    const res = await invoke({ orderId: "D4L-2026-77354A78" });
    expect(res.statusCode).toBe(200);
    expect(getOrderByOrderNumber).toHaveBeenCalledWith("D4L-2026-77354A78");
    expect(getOrderByPublicToken).not.toHaveBeenCalled();
    const body = JSON.parse(res.body);
    expect(body.orderNumber).toBe(FAKE_ORDER.orderNumber);
    expect(body.status).toBe("pending_payment");
  });

  it("unknown orderId returns not found", async () => {
    getOrderByOrderNumber.mockResolvedValue(null);
    const res = await invoke({ orderId: "D4L-2026-DOESNOTEXIST" });
    expect(res.statusCode).toBe(404);
    expect(JSON.parse(res.body)).toEqual({ error: "not_found" });
  });

  it("missing identifier returns 400, never looks up anything", async () => {
    const res = await invoke({});
    expect(res.statusCode).toBe(400);
    expect(getOrderByPublicToken).not.toHaveBeenCalled();
    expect(getOrderByOrderNumber).not.toHaveBeenCalled();
  });

  it("browser return cannot force paid -- an attacker-supplied status query param is never read, response always reflects the DB row", async () => {
    getOrderByOrderNumber.mockResolvedValue({ ...FAKE_ORDER, status: "pending_payment" });
    // Simulate a malicious/naive client appending &status=paid to the URL.
    const res = await invoke({ orderId: "D4L-2026-77354A78", status: "paid" } as Record<string, string>);
    const body = JSON.parse(res.body);
    expect(body.status).toBe("pending_payment");
    // The DB layer was called with only the identifier, never the forged status.
    expect(getOrderByOrderNumber).toHaveBeenCalledWith("D4L-2026-77354A78");
    expect(getOrderByOrderNumber).not.toHaveBeenCalledWith(expect.objectContaining({ status: "paid" }));
  });

  it("no private order data is exposed -- response contains only the documented public fields", async () => {
    getOrderByPublicToken.mockResolvedValue(FAKE_ORDER);
    const res = await invoke({ token: "real-token-value" });
    const body = JSON.parse(res.body);
    expect(Object.keys(body).sort()).toEqual(
      ["orderNumber", "status", "productName", "productType", "totalCents", "currency", "invoiceStatus", "deliveryStatus"].sort(),
    );
    const serialized = JSON.stringify(body).toLowerCase();
    for (const forbidden of ["email", "phone", "billing", "patient", "address", "county", "postal", "firstname", "lastname"]) {
      expect(serialized).not.toContain(forbidden);
    }
  });
});
