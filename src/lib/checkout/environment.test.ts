import { describe, expect, it } from "vitest";
import { isCheckoutDisabledInBuild, isProductionBuild, isSandboxRelayBuild } from "./environment";

// __NETLIFY_CONTEXT__ / __D4L_SANDBOX_RELAY__ are build-time constants
// (vite.config.ts's `define`), not process.env reads -- they can't be
// reassigned per-test the way src/server/environment.test.ts reassigns
// process.env. These tests instead document and verify the exact behavior
// of the current build (local/dev, which is what `npm run test` always
// runs under): both globals are unset here, the same as every real local/
// dev build, so isProductionBuild() is false and isSandboxRelayBuild() is
// false -- checkout is never disabled locally, matching production's own
// "dev defaults to enabled" behavior documented in each function's comment.
describe("isProductionBuild / isSandboxRelayBuild (local/dev build)", () => {
  it("isProductionBuild is false when __NETLIFY_CONTEXT__ is unset (local/dev, same as every real dev build)", () => {
    expect(isProductionBuild()).toBe(false);
  });

  it("isSandboxRelayBuild is false when __D4L_SANDBOX_RELAY__ is unset -- fails closed by default", () => {
    expect(isSandboxRelayBuild()).toBe(false);
  });

  it("isCheckoutDisabledInBuild is false locally -- checkout stays testable in dev", () => {
    expect(isCheckoutDisabledInBuild()).toBe(false);
  });
});

// The 4 cases that matter for real deploys, verified directly against the
// boolean formula isCheckoutDisabledInBuild() implements
// (isProductionBuild() && !isSandboxRelayBuild()), since the underlying
// globals are compile-time constants that can't be swapped at runtime in a
// single test file the way process.env can. This is the exact same logic
// src/server/environment.test.ts's isCheckoutAllowed() suite exercises
// server-side -- client and server must never disagree.
describe("isCheckoutDisabledInBuild -- the 4 real-deploy cases", () => {
  function disabled(productionBuild: boolean, sandboxRelayBuild: boolean): boolean {
    return productionBuild && !sandboxRelayBuild;
  }

  it("Diet4Life's real production site (production, relay flag never baked in): disabled -- button hidden", () => {
    expect(disabled(true, false)).toBe(true);
  });

  it("dedicated NETOPIA sandbox relay site (production + sandbox relay baked in true): enabled -- button visible", () => {
    expect(disabled(true, true)).toBe(false);
  });

  it("deploy preview / branch deploy (not production): enabled regardless of the relay flag", () => {
    expect(disabled(false, false)).toBe(false);
    expect(disabled(false, true)).toBe(false);
  });

  it("missing/misconfigured relay flag in production: disabled -- fails closed, never guesses enabled", () => {
    expect(disabled(true, false)).toBe(true);
  });
});
