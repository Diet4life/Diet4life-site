import { describe, expect, it, vi } from "vitest";
import { isNetopiaSandboxPaymentUrl, submitCheckout } from "./submitCheckout";

// Real shape NETOPIA returns in payment.paymentURL (hyphenated host).
const SANDBOX_PAYMENT_URL = "https://secure-sandbox.netopia-payments.com/ui/card?p=abc";
const payload = { productSlug: "consultatie-nutritionala" };

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

// Routes each function URL to a handler; records every call in order.
function mockFetch(routes: Record<string, () => Response | Promise<Response>>) {
  return vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
    const url = String(input);
    const route = routes[url];
    if (!route) throw new Error(`unexpected fetch ${url}`);
    return route();
  });
}

describe("submitCheckout -- sandbox relay (checkout enabled)", () => {
  it("creates the order, then calls payments-initiate with its token, then redirects to NETOPIA sandbox", async () => {
    const fetch = mockFetch({
      "/.netlify/functions/orders-create": () => jsonResponse(201, { publicStatusToken: "tok-1" }),
      "/.netlify/functions/payments-initiate": () => jsonResponse(200, { paymentURL: SANDBOX_PAYMENT_URL, orderNumber: "D4L-2026-X" }),
    });

    const result = await submitCheckout(payload, { fetch: fetch as unknown as typeof globalThis.fetch, checkoutDisabled: false });

    expect(result).toEqual({ kind: "redirect", url: SANDBOX_PAYMENT_URL });
    expect(fetch.mock.calls.map((c) => String(c[0]))).toEqual([
      "/.netlify/functions/orders-create",
      "/.netlify/functions/payments-initiate",
    ]);
    const initiateInit = fetch.mock.calls[1][1] as RequestInit;
    expect(initiateInit.method).toBe("POST");
    // Only the token is sent -- never amount/currency.
    expect(JSON.parse(initiateInit.body as string)).toEqual({ publicStatusToken: "tok-1" });
  });
});

describe("submitCheckout -- real production without relay flag (checkout disabled)", () => {
  it("makes no request at all and reports disabled", async () => {
    const fetch = vi.fn();
    const result = await submitCheckout(payload, { fetch: fetch as unknown as typeof globalThis.fetch, checkoutDisabled: true });
    expect(result).toEqual({ kind: "disabled" });
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("submitCheckout -- initiation failures are errors, never a pending-success redirect", () => {
  const orderOk = () => jsonResponse(201, { publicStatusToken: "tok-2" });

  it.each([
    ["500 payment_not_configured", () => jsonResponse(500, { error: "payment_not_configured" })],
    ["502 payment_initiation_failed", () => jsonResponse(502, { error: "payment_initiation_failed" })],
    ["503 checkout_disabled", () => jsonResponse(503, { error: "checkout_disabled" })],
    ["200 without paymentURL", () => jsonResponse(200, { orderNumber: "D4L" })],
    ["200 with a non-NETOPIA paymentURL", () => jsonResponse(200, { paymentURL: "https://evil.example.com/pay" })],
    ["network error", () => Promise.reject(new TypeError("Failed to fetch"))],
  ])("%s -> initiate_failed (no redirect URL at all)", async (_label, initiate) => {
    const fetch = mockFetch({
      "/.netlify/functions/orders-create": orderOk,
      "/.netlify/functions/payments-initiate": initiate,
    });
    const result = await submitCheckout(payload, { fetch: fetch as unknown as typeof globalThis.fetch, checkoutDisabled: false });
    expect(result).toEqual({ kind: "initiate_failed", publicStatusToken: "tok-2" });
    expect(result).not.toHaveProperty("url");
  });

  it("orders-create failure -> order_failed, payments-initiate never called", async () => {
    const fetch = mockFetch({
      "/.netlify/functions/orders-create": () => jsonResponse(503, { error: "checkout_disabled" }),
    });
    const result = await submitCheckout(payload, { fetch: fetch as unknown as typeof globalThis.fetch, checkoutDisabled: false });
    expect(result).toEqual({ kind: "order_failed" });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("isNetopiaSandboxPaymentUrl", () => {
  it("accepts only https NETOPIA sandbox hosts", () => {
    expect(isNetopiaSandboxPaymentUrl(SANDBOX_PAYMENT_URL)).toBe(true);
    expect(isNetopiaSandboxPaymentUrl("https://secure.sandbox.netopia-payments.com/ui/card?p=abc")).toBe(true);
    expect(isNetopiaSandboxPaymentUrl("http://secure-sandbox.netopia-payments.com/ui")).toBe(false);
    expect(isNetopiaSandboxPaymentUrl("https://secure-sandbox.netopia-payments.com.evil.com/")).toBe(false);
    expect(isNetopiaSandboxPaymentUrl("https://evil-secure-sandbox.netopia-payments.com/")).toBe(false);
    expect(isNetopiaSandboxPaymentUrl("https://secure.netopia-payments.com/ui")).toBe(false);
    expect(isNetopiaSandboxPaymentUrl("https://sandbox.netopia-payments.com.evil.com/")).toBe(false);
    expect(isNetopiaSandboxPaymentUrl("/checkout/retur?token=x")).toBe(false);
    expect(isNetopiaSandboxPaymentUrl("javascript:alert(1)")).toBe(false);
    expect(isNetopiaSandboxPaymentUrl(undefined)).toBe(false);
  });
});
