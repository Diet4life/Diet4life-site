import { afterEach, describe, expect, it } from "vitest";
import { CheckoutDisabledInProductionError, createOrder } from "./orderService";

afterEach(() => {
  delete process.env.CONTEXT;
  delete process.env.URL;
  delete process.env.D4L_NETOPIA_SANDBOX_RELAY;
});

// createOrder()'s isCheckoutAllowed() guard is the very first statement in
// the function body -- it throws before ever calling getDb(), so the
// "blocked" case is testable here with no database at all. The "allowed,
// proceeds" case is NOT tested here on purpose: past the guard, createOrder()
// immediately needs a real Postgres connection (see CLAUDE.md's "scratch
// local Postgres" verification method for this file) -- that path is
// integration-tested manually, the same way every other DB-touching function
// in this file already is, not with a DB mock introduced just for this guard.
//
// 2026-11-04: isCheckoutAllowed() no longer reads CONTEXT at all (confirmed
// unreliable at Functions runtime) -- it decides from process.env.URL's
// hostname instead. These tests use URL, not CONTEXT, to match.
describe("createOrder -- production guard", () => {
  const dummyInput = {
    productSlug: "does-not-matter-never-reached",
    billing: {} as never,
  };

  it("Diet4Life's real production site (URL=diet4lifeconcept.ro, relay flag never set): fails closed before touching the database", async () => {
    process.env.URL = "https://diet4lifeconcept.ro";
    delete process.env.D4L_NETOPIA_SANDBOX_RELAY;
    await expect(createOrder(dummyInput)).rejects.toBeInstanceOf(CheckoutDisabledInProductionError);
  });

  it("the real production hostname with the relay flag at a near-miss value: still fails closed", async () => {
    process.env.URL = "https://diet4lifeconcept.ro";
    process.env.D4L_NETOPIA_SANDBOX_RELAY = "1";
    await expect(createOrder(dummyInput)).rejects.toBeInstanceOf(CheckoutDisabledInProductionError);
  });

  it("the real production hostname is an absolute veto even if the relay flag is set to exactly \"true\" there by mistake", async () => {
    process.env.URL = "https://diet4lifeconcept.ro";
    process.env.D4L_NETOPIA_SANDBOX_RELAY = "true";
    await expect(createOrder(dummyInput)).rejects.toBeInstanceOf(CheckoutDisabledInProductionError);
  });

  it("any deploy without URL set and without the relay flag: also fails closed by default now (was previously permissive under a non-production CONTEXT)", async () => {
    delete process.env.URL;
    delete process.env.D4L_NETOPIA_SANDBOX_RELAY;
    await expect(createOrder(dummyInput)).rejects.toBeInstanceOf(CheckoutDisabledInProductionError);
  });
});
