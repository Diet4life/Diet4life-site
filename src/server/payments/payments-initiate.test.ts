import { afterEach, describe, expect, it } from "vitest";
import {
  buildNetopiaRequestBody,
  isValidHttpsUrl,
  resolveSiteBaseUrl,
  safeHostname,
  UnknownCountryCodeError,
} from "../../../netlify/functions/payments-initiate";

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

describe("isValidHttpsUrl", () => {
  it("accepts a well-formed https:// URL", () => {
    expect(isValidHttpsUrl("https://claude-tool-usage-check-htkbjz--diet4life.netlify.app")).toBe(true);
    expect(isValidHttpsUrl("https://diet4lifeconcept.ro")).toBe(true);
  });

  it("rejects http:// (not https), a bare hostname, a non-URL scheme, and garbage", () => {
    expect(isValidHttpsUrl("http://claude-tool-usage-check-htkbjz--diet4life.netlify.app")).toBe(false);
    expect(isValidHttpsUrl("claude-tool-usage-check-htkbjz--diet4life.netlify.app")).toBe(false);
    expect(isValidHttpsUrl("javascript:alert(1)")).toBe(false);
    expect(isValidHttpsUrl("")).toBe(false);
    expect(isValidHttpsUrl("not a url at all")).toBe(false);
  });

  it("never throws on malformed input", () => {
    expect(() => isValidHttpsUrl("::::not-a-url::::")).not.toThrow();
  });
});

describe("resolveSiteBaseUrl", () => {
  const ENV_KEYS = ["CONTEXT", "URL", "D4L_SITE_BASE_URL"] as const;
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

  it("production: ignores D4L_SITE_BASE_URL entirely and uses URL, even if D4L_SITE_BASE_URL is set to something else", () => {
    setEnv({
      CONTEXT: "production",
      URL: "https://diet4lifeconcept.ro",
      D4L_SITE_BASE_URL: "https://claude-tool-usage-check-htkbjz--diet4life.netlify.app",
    });
    expect(resolveSiteBaseUrl()).toBe("https://diet4lifeconcept.ro");
  });

  it("branch deploy: uses D4L_SITE_BASE_URL when it's set to a valid https:// URL", () => {
    setEnv({
      CONTEXT: "branch-deploy",
      URL: "https://diet4lifeconcept.ro",
      D4L_SITE_BASE_URL: "https://claude-tool-usage-check-htkbjz--diet4life.netlify.app",
    });
    expect(resolveSiteBaseUrl()).toBe("https://claude-tool-usage-check-htkbjz--diet4life.netlify.app");
  });

  it("also works when CONTEXT itself is unset, matching the real Function-runtime behavior confirmed via diagnostics (context=unset)", () => {
    setEnv({
      CONTEXT: undefined,
      URL: "https://diet4lifeconcept.ro",
      D4L_SITE_BASE_URL: "https://claude-tool-usage-check-htkbjz--diet4life.netlify.app",
    });
    expect(resolveSiteBaseUrl()).toBe("https://claude-tool-usage-check-htkbjz--diet4life.netlify.app");
  });

  it("falls back safely to URL when D4L_SITE_BASE_URL is not a valid https:// URL (http://, bare hostname, garbage)", () => {
    for (const invalid of ["http://claude-tool-usage-check-htkbjz--diet4life.netlify.app", "not-a-url", ""]) {
      setEnv({ CONTEXT: "branch-deploy", URL: "https://diet4lifeconcept.ro", D4L_SITE_BASE_URL: invalid });
      expect(resolveSiteBaseUrl()).toBe("https://diet4lifeconcept.ro");
    }
  });

  it("falls back to URL in a non-production context when D4L_SITE_BASE_URL is simply unset", () => {
    setEnv({ CONTEXT: "dev", URL: "https://diet4lifeconcept.ro", D4L_SITE_BASE_URL: undefined });
    expect(resolveSiteBaseUrl()).toBe("https://diet4lifeconcept.ro");
  });

  it("returns an empty string, never throws, when nothing is set at all", () => {
    setEnv({ CONTEXT: undefined, URL: undefined, D4L_SITE_BASE_URL: undefined });
    expect(resolveSiteBaseUrl()).toBe("");
  });
});

describe("safeHostname", () => {
  it("extracts only the hostname, never the protocol, path, or query string", () => {
    expect(safeHostname("https://claude-tool-usage-check-htkbjz--diet4life.netlify.app/checkout/retur?token=SECRET")).toBe(
      "claude-tool-usage-check-htkbjz--diet4life.netlify.app",
    );
    expect(safeHostname("https://diet4lifeconcept.ro")).toBe("diet4lifeconcept.ro");
  });

  it("never throws and never leaks a secret-looking value -- returns a fixed label instead", () => {
    expect(safeHostname(undefined)).toBe("unset");
    expect(safeHostname("")).toBe("unset");
    expect(safeHostname("not a url at all, could be anything")).toBe("unparseable");
  });
});
