import { afterEach, describe, expect, it } from "vitest";
import { buildNetopiaRequestBody, resolveSiteBaseUrl, UnknownCountryCodeError } from "../../../netlify/functions/payments-initiate";

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
  billingCounty: "Timiș",
  billingPostalCode: "300001",
  billingStreetAddress: "Str. Exemplu nr. 1",
  billingBuildingDetails: "Bloc A1, Ap. 3",
};

describe("buildNetopiaRequestBody", () => {
  it("sends exactly the three required top-level sections: config, payment, order", () => {
    const body = buildNetopiaRequestBody(baseOrder, 300, "RON", "POS-SIG", "https://example.netlify.app", "tok123");
    expect(Object.keys(body).sort()).toEqual(["config", "order", "payment"]);
  });

  it("uses the hosted payment-page flow -- payment.options is a plain single-charge, instrument is null, never a card object", () => {
    const body = buildNetopiaRequestBody(baseOrder, 300, "RON", "POS-SIG", "https://example.netlify.app", "tok123");
    expect(body.payment).toEqual({ options: { installments: 0, bonus: 0 }, instrument: null });
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

  it("populates config with notify/redirect URLs and order with the full Address schema", () => {
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
      country: 642,
      countryName: "Romania",
      state: baseOrder.billingCounty,
      postalCode: baseOrder.billingPostalCode,
      details: "Str. Exemplu nr. 1, Bloc A1, Ap. 3",
    });
  });

  it("all 10 required Address fields are present (email, phone, firstName, lastName, city, country, countryName, state, postalCode, details)", () => {
    const body = buildNetopiaRequestBody(baseOrder, 300, "RON", "POS-SIG", "https://example.netlify.app", "tok123");
    expect(Object.keys(body.order.billing).sort()).toEqual(
      ["city", "country", "countryName", "details", "email", "firstName", "lastName", "phone", "postalCode", "state"].sort(),
    );
  });

  it("sends country as an ISO 3166-1 numeric integer, never the alpha-2 code", () => {
    const body = buildNetopiaRequestBody(baseOrder, 300, "RON", "POS-SIG", "https://example.netlify.app", "tok123");
    expect(body.order.billing.country).toBe(642);
    expect(typeof body.order.billing.country).toBe("number");
  });

  it("resolves the numeric country code for a non-Romanian address too (e.g. Germany -> 276)", () => {
    const deOrder = { ...baseOrder, billingCountryCode: "DE" };
    const body = buildNetopiaRequestBody(deOrder, 300, "RON", "POS-SIG", "https://example.netlify.app", "tok123");
    expect(body.order.billing.country).toBe(276);
    expect(body.order.billing.countryName).toBe("Germany");
  });

  it("throws UnknownCountryCodeError (fails closed) for a code with no numeric mapping, rather than sending a broken value", () => {
    const badOrder = { ...baseOrder, billingCountryCode: "XX" };
    expect(() => buildNetopiaRequestBody(badOrder, 300, "RON", "POS-SIG", "https://example.netlify.app", "tok123")).toThrow(
      UnknownCountryCodeError,
    );
  });

  it("uses an empty string for postalCode when checkout didn't collect one, rather than inventing a value", () => {
    const noPostal = { ...baseOrder, billingPostalCode: null };
    const body = buildNetopiaRequestBody(noPostal, 300, "RON", "POS-SIG", "https://example.netlify.app", "tok123");
    expect(body.order.billing.postalCode).toBe("");
  });

  it("builds details from streetAddress alone when buildingDetails wasn't collected", () => {
    const noBuilding = { ...baseOrder, billingBuildingDetails: null };
    const body = buildNetopiaRequestBody(noBuilding, 300, "RON", "POS-SIG", "https://example.netlify.app", "tok123");
    expect(body.order.billing.details).toBe("Str. Exemplu nr. 1");
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

  it("config.notifyUrl and config.redirectUrl always use the exact same trusted base passed in", () => {
    const body = buildNetopiaRequestBody(baseOrder, 300, "RON", "POS-SIG", "https://claude-tool-usage-check-htkbjz--diet4life.netlify.app", "tok123");
    expect(body.config.notifyUrl.startsWith("https://claude-tool-usage-check-htkbjz--diet4life.netlify.app/")).toBe(true);
    expect(body.config.redirectUrl.startsWith("https://claude-tool-usage-check-htkbjz--diet4life.netlify.app/")).toBe(true);
  });
});

describe("resolveSiteBaseUrl", () => {
  const ENV_KEYS = ["CONTEXT", "URL", "DEPLOY_PRIME_URL"] as const;
  const saved: Record<string, string | undefined> = {};

  afterEach(() => {
    for (const key of ENV_KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });

  function setEnv(vars: Partial<Record<(typeof ENV_KEYS)[number], string | undefined>>) {
    for (const key of ENV_KEYS) {
      saved[key] = process.env[key];
      const value = vars[key];
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }

  it("takes no arguments -- there is no way to pass a browser-supplied Host/Origin into it (no open-redirect surface)", () => {
    expect(resolveSiteBaseUrl.length).toBe(0);
  });

  it("production URLs: pins to URL (the custom domain), even if DEPLOY_PRIME_URL points somewhere else", () => {
    setEnv({
      CONTEXT: "production",
      URL: "https://diet4lifeconcept.ro",
      DEPLOY_PRIME_URL: "https://diet4life.netlify.app",
    });
    expect(resolveSiteBaseUrl()).toBe("https://diet4lifeconcept.ro");
  });

  it("branch-deploy URLs: uses DEPLOY_PRIME_URL, not the production URL -- this is the actual bug fix", () => {
    setEnv({
      CONTEXT: "branch-deploy",
      URL: "https://diet4lifeconcept.ro",
      DEPLOY_PRIME_URL: "https://claude-tool-usage-check-htkbjz--diet4life.netlify.app",
    });
    expect(resolveSiteBaseUrl()).toBe("https://claude-tool-usage-check-htkbjz--diet4life.netlify.app");
  });

  it("deploy-preview URLs: also uses DEPLOY_PRIME_URL", () => {
    setEnv({
      CONTEXT: "deploy-preview",
      URL: "https://diet4lifeconcept.ro",
      DEPLOY_PRIME_URL: "https://deploy-preview-12--diet4life.netlify.app",
    });
    expect(resolveSiteBaseUrl()).toBe("https://deploy-preview-12--diet4life.netlify.app");
  });

  it("falls back to URL in a non-production context if DEPLOY_PRIME_URL is unset (e.g. local netlify dev)", () => {
    setEnv({ CONTEXT: "dev", URL: "https://diet4lifeconcept.ro", DEPLOY_PRIME_URL: undefined });
    expect(resolveSiteBaseUrl()).toBe("https://diet4lifeconcept.ro");
  });

  it("returns an empty string, never throws, when nothing is set at all", () => {
    setEnv({ CONTEXT: undefined, URL: undefined, DEPLOY_PRIME_URL: undefined });
    expect(resolveSiteBaseUrl()).toBe("");
  });
});
