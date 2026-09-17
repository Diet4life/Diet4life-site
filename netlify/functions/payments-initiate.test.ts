import { describe, expect, it } from "vitest";
import { buildNetopiaRequestBody } from "./payments-initiate";

// Minimal stand-in matching getOrderForPaymentInitiation()'s return shape
// (src/server/orders/orderService.ts) -- only the fields buildNetopiaRequestBody
// actually reads.
const baseOrder = {
  id: 1,
  orderNumber: "D4L-2026-ABCD1234",
  status: "pending_payment" as const,
  productName: "Consultație Nutrițională",
  priceSnapshotCents: 30000,
  currency: "RON",
  billingPersonType: "individual" as const,
  billingFullName: "Ion Popescu",
  billingCompanyName: null,
  billingEmail: "ion.popescu@example.com",
  billingPhone: "+40712345678",
  billingCity: "Timișoara",
  billingCountryCode: "RO",
};

describe("buildNetopiaRequestBody", () => {
  it("sends exactly the three required top-level sections: config, payment, order", () => {
    const body = buildNetopiaRequestBody(baseOrder, 300, "RON", "POS-SIG", "https://example.netlify.app", "tok123");
    expect(Object.keys(body).sort()).toEqual(["config", "order", "payment"]);
  });

  it("uses the hosted payment-page flow -- payment.instrument is null, never a card object", () => {
    const body = buildNetopiaRequestBody(baseOrder, 300, "RON", "POS-SIG", "https://example.netlify.app", "tok123");
    expect(body.payment).toEqual({ instrument: null });
  });

  it("never contains raw card data anywhere in the serialized request", () => {
    const body = buildNetopiaRequestBody(baseOrder, 300, "RON", "POS-SIG", "https://example.netlify.app", "tok123");
    const serialized = JSON.stringify(body).toLowerCase();
    for (const forbidden of [
      "cardnumber",
      "card_number",
      "cvv",
      "cvc",
      "expmonth",
      "exp_month",
      "expyear",
      "exp_year",
      "secretcode",
      "secret_code",
      '"pan"',
      "token\":",
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it("populates config with notify/redirect URLs and order with billing details", () => {
    const body = buildNetopiaRequestBody(baseOrder, 300, "RON", "POS-SIG-VALUE", "https://example.netlify.app", "tok123");
    expect(body.config).toEqual({
      notifyUrl: "https://example.netlify.app/.netlify/functions/payments-netopia-notify",
      redirectUrl: "https://example.netlify.app/checkout/retur?token=tok123",
      language: "ro",
    });
    expect(body.order.posSignature).toBe("POS-SIG-VALUE");
    expect(body.order.amount).toBe(300);
    expect(body.order.currency).toBe("RON");
    expect(body.order.orderID).toBe(baseOrder.orderNumber);
    expect(body.order.billing).toEqual({
      email: baseOrder.billingEmail,
      phone: baseOrder.billingPhone,
      firstName: "Ion",
      lastName: "Popescu",
      city: baseOrder.billingCity,
      country: baseOrder.billingCountryCode,
    });
  });

  it("uses the company name (split into first/last) for company billing", () => {
    const companyOrder = {
      ...baseOrder,
      billingPersonType: "company" as const,
      billingFullName: null,
      billingCompanyName: "Acme Nutriție SRL",
    };
    const body = buildNetopiaRequestBody(companyOrder, 300, "RON", "POS-SIG", "https://example.netlify.app", "tok123");
    expect(body.order.billing.firstName).toBe("Acme");
    expect(body.order.billing.lastName).toBe("Nutriție SRL");
  });
});
