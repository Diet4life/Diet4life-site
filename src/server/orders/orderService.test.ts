import { afterEach, describe, expect, it } from "vitest";
import { CheckoutDisabledInProductionError, createOrder } from "./orderService";

afterEach(() => {
  delete process.env.CONTEXT;
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
describe("createOrder -- production guard", () => {
  const dummyInput = {
    productSlug: "does-not-matter-never-reached",
    billing: {} as never,
  };

  it("Diet4Life's real production site (production, relay flag never set): fails closed before touching the database", async () => {
    process.env.CONTEXT = "production";
    delete process.env.D4L_NETOPIA_SANDBOX_RELAY;
    await expect(createOrder(dummyInput)).rejects.toBeInstanceOf(CheckoutDisabledInProductionError);
  });

  it("production with the relay flag at a near-miss value: still fails closed", async () => {
    process.env.CONTEXT = "production";
    process.env.D4L_NETOPIA_SANDBOX_RELAY = "1";
    await expect(createOrder(dummyInput)).rejects.toBeInstanceOf(CheckoutDisabledInProductionError);
  });
});
