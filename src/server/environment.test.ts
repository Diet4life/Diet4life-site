import { afterEach, describe, expect, it } from "vitest";
import { isCheckoutAllowed, isProductionContext, isSandboxRelayEnabled } from "./environment";

afterEach(() => {
  delete process.env.CONTEXT;
  delete process.env.D4L_NETOPIA_SANDBOX_RELAY;
});

describe("isProductionContext", () => {
  it("is true only when CONTEXT is exactly \"production\"", () => {
    process.env.CONTEXT = "production";
    expect(isProductionContext()).toBe(true);
  });

  it("is false for every other context, including unset", () => {
    for (const value of [undefined, "deploy-preview", "branch-deploy", "dev", ""]) {
      if (value === undefined) delete process.env.CONTEXT;
      else process.env.CONTEXT = value;
      expect(isProductionContext()).toBe(false);
    }
  });
});

// Moved here from payments-netopia-notify.test.ts -- same tests, now
// alongside the function's real home (src/server/environment.ts).
describe("isSandboxRelayEnabled", () => {
  it("is true only for the exact string \"true\"", () => {
    process.env.D4L_NETOPIA_SANDBOX_RELAY = "true";
    expect(isSandboxRelayEnabled()).toBe(true);
  });

  it("is false when unset", () => {
    delete process.env.D4L_NETOPIA_SANDBOX_RELAY;
    expect(isSandboxRelayEnabled()).toBe(false);
  });

  it("is false for every near-miss value -- fails closed, never guesses truthiness", () => {
    for (const value of ["1", "yes", "TRUE", "True", "on", "false", ""]) {
      process.env.D4L_NETOPIA_SANDBOX_RELAY = value;
      expect(isSandboxRelayEnabled()).toBe(false);
    }
  });
});

// The shared predicate every checkout/payment entry point now calls. Covers
// the full 2x2 matrix explicitly -- this is the exact logic that decides
// whether a real request is allowed to proceed, so every branch is a named
// case rather than a parametrized loop.
describe("isCheckoutAllowed", () => {
  it("Diet4Life's real production site (production, relay flag never set): blocked -- fail closed", () => {
    process.env.CONTEXT = "production";
    delete process.env.D4L_NETOPIA_SANDBOX_RELAY;
    expect(isCheckoutAllowed()).toBe(false);
  });

  it("production with the relay flag left at a near-miss value: still blocked -- fail closed", () => {
    process.env.CONTEXT = "production";
    process.env.D4L_NETOPIA_SANDBOX_RELAY = "1";
    expect(isCheckoutAllowed()).toBe(false);
  });

  it("dedicated sandbox relay site (production + D4L_NETOPIA_SANDBOX_RELAY=true): allowed", () => {
    process.env.CONTEXT = "production";
    process.env.D4L_NETOPIA_SANDBOX_RELAY = "true";
    expect(isCheckoutAllowed()).toBe(true);
  });

  it("any non-production deploy (branch-deploy/deploy-preview/dev): allowed regardless of the relay flag", () => {
    for (const context of ["branch-deploy", "deploy-preview", "dev", undefined]) {
      if (context === undefined) delete process.env.CONTEXT;
      else process.env.CONTEXT = context;
      delete process.env.D4L_NETOPIA_SANDBOX_RELAY;
      expect(isCheckoutAllowed()).toBe(true);
    }
  });
});
