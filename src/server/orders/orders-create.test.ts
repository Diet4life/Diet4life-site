import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { services as checkoutCatalog } from "@/lib/catalog/services";

const createOrder = vi.fn();

// Only createOrder() is mocked -- the real error classes come through
// untouched (via vi.importActual), the same way orders-create.ts's own
// `error instanceof ProductNotFoundError` checks need them to, so this test
// exercises the real handler logic end to end without needing a live DB.
vi.mock("@/server/orders/orderService", async () => {
  const actual = await vi.importActual<typeof import("@/server/orders/orderService")>("@/server/orders/orderService");
  return {
    ...actual,
    createOrder: (...args: unknown[]) => createOrder(...args),
  };
});

import { handler } from "../../../netlify/functions/orders-create";
import { ProductNotFoundError } from "@/server/orders/orderService";

function validBillingFor(email: string) {
  return {
    personType: "individual" as const,
    fullName: "Ion Popescu",
    email,
    phone: "0700000000",
    countryCode: "RO",
    county: "Timiș",
    city: "Timișoara",
    streetAddress: "Str. Exemplu 1",
    postalCode: "300001",
  };
}

function buildEvent(body: unknown) {
  return { httpMethod: "POST", body: JSON.stringify(body), headers: {} } as never;
}

beforeEach(() => {
  createOrder.mockReset();
});

afterEach(() => {
  vi.clearAllMocks();
});

// 2026-11-09: Services-page checkout-CTA audit, requirement 9 -- every
// advertised paid service's canonical slug must be accepted end to end by
// orders-create, an unknown slug must still fail closed, and the browser
// must never be able to override the server-controlled price.
describe("orders-create handler -- every advertised paid service", () => {
  for (const service of checkoutCatalog) {
    it(`accepts the canonical slug "${service.id}" (${service.name.ro}) and never passes a price to createOrder()`, async () => {
      createOrder.mockResolvedValue({ orderNumber: "D4L-2026-TEST0001", publicStatusToken: "tok_abc", status: "pending_payment" });

      const payload = {
        productSlug: service.id,
        billing: validBillingFor("buyer@example.com"),
        // priceCents/amount included on purpose -- proves the browser
        // cannot override the amount: the zod schema has no such field, so
        // it must never reach createOrder() even if a forged request sends
        // one.
        priceCents: 1,
        amount: 1,
        patient: { sameAsBuyer: true },
        consent: { termsAccepted: true },
      };

      const res = await handler(buildEvent(payload), {} as never, undefined as never);

      expect(res).toMatchObject({ statusCode: 201 });
      expect(createOrder).toHaveBeenCalledTimes(1);
      const callArg = createOrder.mock.calls[0][0];
      expect(callArg.productSlug).toBe(service.id);
      expect(callArg).not.toHaveProperty("priceCents");
      expect(callArg).not.toHaveProperty("amount");
      expect(callArg).not.toHaveProperty("price");
    });
  }

  it("rejects an unknown/modified slug server-side -- fails closed with 404, never falls back to any default product", async () => {
    createOrder.mockRejectedValue(new ProductNotFoundError("Unknown or inactive product: not-a-real-service"));

    const res = await handler(
      buildEvent({
        productSlug: "not-a-real-service",
        billing: validBillingFor("buyer@example.com"),
        patient: { sameAsBuyer: true },
        consent: { termsAccepted: true },
      }),
      {} as never,
      undefined as never,
    );

    expect(res).toMatchObject({ statusCode: 404, body: JSON.stringify({ error: "product_not_found" }) });
  });

  it("a canonical slug with a tampered price in the raw request body still only ever reaches createOrder() with productSlug/billing/patient -- the amount has no path through this handler at all", async () => {
    createOrder.mockResolvedValue({ orderNumber: "D4L-2026-TEST0002", publicStatusToken: "tok_def", status: "pending_payment" });

    const forgedPayload = {
      productSlug: "consultatie-nutritionala",
      billing: validBillingFor("buyer@example.com"),
      patient: { sameAsBuyer: true },
      consent: { termsAccepted: true },
      priceCents: 1, // the real price is 30000 -- this must be ignored, not used
      totalCents: 1,
      currency: "USD",
    };

    await handler(buildEvent(forgedPayload), {} as never, undefined as never);

    expect(createOrder).toHaveBeenCalledWith({
      productSlug: "consultatie-nutritionala",
      billing: validBillingFor("buyer@example.com"),
      patient: { sameAsBuyer: true, fullName: undefined, email: undefined, phone: undefined },
    });
  });
});
