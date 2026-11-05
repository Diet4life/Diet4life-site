import { afterEach, describe, expect, it } from "vitest";
import {
  isCheckoutAllowed,
  isDiet4LifeProductionSite,
  isProductionContext,
  isSandboxRelayEnabled,
  isSandboxRelaySite,
} from "./environment";

const RELAY_HOSTNAME = "diet4life-netopia-sandbox-relay.netlify.app";
const PRODUCTION_HOSTNAME = "diet4lifeconcept.ro";

afterEach(() => {
  delete process.env.CONTEXT;
  delete process.env.URL;
  delete process.env.D4L_NETOPIA_SANDBOX_RELAY;
});

// isProductionContext() is kept only for informational logging -- see this
// file's header comment. These tests just confirm its (known-unreliable)
// CONTEXT-reading behavior is unchanged; isCheckoutAllowed() below no longer
// depends on it for anything security-relevant.
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

describe("isDiet4LifeProductionSite", () => {
  it("is true when URL's hostname is exactly diet4lifeconcept.ro", () => {
    process.env.URL = "https://diet4lifeconcept.ro";
    expect(isDiet4LifeProductionSite()).toBe(true);
  });

  it("is false for www.diet4lifeconcept.ro -- an exact hostname match only, never a suffix match", () => {
    process.env.URL = "https://www.diet4lifeconcept.ro";
    expect(isDiet4LifeProductionSite()).toBe(false);
  });

  it("is false for the sandbox relay site's own URL", () => {
    process.env.URL = `https://${RELAY_HOSTNAME}`;
    expect(isDiet4LifeProductionSite()).toBe(false);
  });
});

// 2026-11-05: isSandboxRelaySite() is the explicit ALLOWLIST half of
// isCheckoutAllowed() -- true only for a byte-for-byte match on the one
// dedicated relay hostname, never a substring/suffix/prefix match and never
// derived from anything client-controllable.
describe("isSandboxRelaySite", () => {
  it("is true for the exact relay hostname", () => {
    process.env.URL = `https://${RELAY_HOSTNAME}`;
    expect(isSandboxRelaySite()).toBe(true);
  });

  it("is true regardless of a path, port, or case in URL", () => {
    process.env.URL = `https://${RELAY_HOSTNAME.toUpperCase()}/some/path`;
    expect(isSandboxRelaySite()).toBe(true);
  });

  it("is false for Diet4Life's real production hostname", () => {
    process.env.URL = `https://${PRODUCTION_HOSTNAME}`;
    expect(isSandboxRelaySite()).toBe(false);
  });

  it("is false for www.diet4lifeconcept.ro", () => {
    process.env.URL = `https://www.${PRODUCTION_HOSTNAME}`;
    expect(isSandboxRelaySite()).toBe(false);
  });

  it("is false for a look-alike hostname (never substring/suffix/prefix matched)", () => {
    for (const url of [
      `https://evil-${RELAY_HOSTNAME}`,
      `https://${RELAY_HOSTNAME}.evil.com`,
      `https://not-${RELAY_HOSTNAME}`,
      `https://${RELAY_HOSTNAME.replace(".netlify.app", "")}.evil.com`,
    ]) {
      process.env.URL = url;
      expect(isSandboxRelaySite()).toBe(false);
    }
  });

  it("is false for an unrelated/unknown Netlify project", () => {
    process.env.URL = "https://some-other-project.netlify.app";
    expect(isSandboxRelaySite()).toBe(false);
  });

  it("is false for a deploy-preview hostname", () => {
    process.env.URL = `https://deploy-preview-12--${RELAY_HOSTNAME}`;
    expect(isSandboxRelaySite()).toBe(false);
  });

  it("is false for localhost", () => {
    process.env.URL = "http://localhost:8888";
    expect(isSandboxRelaySite()).toBe(false);
  });

  it("is false when URL is unset, empty, or unparseable -- fails closed (never assumes a match)", () => {
    for (const value of [undefined, "", "not a url", RELAY_HOSTNAME]) {
      if (value === undefined) delete process.env.URL;
      else process.env.URL = value;
      expect(isSandboxRelaySite()).toBe(false);
    }
  });
});

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

// 2026-11-05: isCheckoutAllowed() is now an explicit ALLOWLIST -- true only
// when BOTH the exact relay hostname AND the exact flag are present. Every
// case below is the exact list required by this round's security
// correction.
describe("isCheckoutAllowed", () => {
  it("exact relay URL + exact flag = allowed", () => {
    process.env.URL = `https://${RELAY_HOSTNAME}`;
    process.env.D4L_NETOPIA_SANDBOX_RELAY = "true";
    expect(isCheckoutAllowed()).toBe(true);
  });

  it("relay URL without the flag = blocked", () => {
    process.env.URL = `https://${RELAY_HOSTNAME}`;
    delete process.env.D4L_NETOPIA_SANDBOX_RELAY;
    expect(isCheckoutAllowed()).toBe(false);
  });

  it("relay URL with TRUE/1/yes (near-miss, non-exact) = blocked", () => {
    for (const nearMiss of ["TRUE", "1", "yes", "True", ""]) {
      process.env.URL = `https://${RELAY_HOSTNAME}`;
      process.env.D4L_NETOPIA_SANDBOX_RELAY = nearMiss;
      expect(isCheckoutAllowed()).toBe(false);
    }
  });

  it("diet4lifeconcept.ro + flag = blocked", () => {
    process.env.URL = `https://${PRODUCTION_HOSTNAME}`;
    process.env.D4L_NETOPIA_SANDBOX_RELAY = "true";
    expect(isCheckoutAllowed()).toBe(false);
  });

  it("www.diet4lifeconcept.ro + flag = blocked", () => {
    process.env.URL = `https://www.${PRODUCTION_HOSTNAME}`;
    process.env.D4L_NETOPIA_SANDBOX_RELAY = "true";
    expect(isCheckoutAllowed()).toBe(false);
  });

  it("unknown netlify.app project + flag = blocked", () => {
    process.env.URL = "https://some-other-project.netlify.app";
    process.env.D4L_NETOPIA_SANDBOX_RELAY = "true";
    expect(isCheckoutAllowed()).toBe(false);
  });

  it("deploy-preview hostname + flag = blocked", () => {
    process.env.URL = `https://deploy-preview-12--${RELAY_HOSTNAME}`;
    process.env.D4L_NETOPIA_SANDBOX_RELAY = "true";
    expect(isCheckoutAllowed()).toBe(false);
  });

  it("missing/malformed URL + flag = blocked", () => {
    process.env.D4L_NETOPIA_SANDBOX_RELAY = "true";
    for (const value of [undefined, "", "not a url", RELAY_HOSTNAME]) {
      if (value === undefined) delete process.env.URL;
      else process.env.URL = value;
      expect(isCheckoutAllowed()).toBe(false);
    }
  });

  it("localhost + flag = blocked outside tests exercising it explicitly (no special-case carve-out exists in the function itself)", () => {
    process.env.URL = "http://localhost:8888";
    process.env.D4L_NETOPIA_SANDBOX_RELAY = "true";
    expect(isCheckoutAllowed()).toBe(false);
  });

  it("the relay hostname is allowed regardless of CONTEXT (its primary branch is unavoidably labeled \"production\" by Netlify) or path/case in URL", () => {
    process.env.URL = `https://${RELAY_HOSTNAME.toUpperCase()}/webhook`;
    process.env.CONTEXT = "production";
    process.env.D4L_NETOPIA_SANDBOX_RELAY = "true";
    expect(isCheckoutAllowed()).toBe(true);
  });

  it("CONTEXT can never substitute for the real checks -- claiming non-production doesn't help the production hostname or help without the flag", () => {
    process.env.URL = `https://${PRODUCTION_HOSTNAME}`;
    process.env.CONTEXT = "branch-deploy";
    delete process.env.D4L_NETOPIA_SANDBOX_RELAY;
    expect(isCheckoutAllowed()).toBe(false);
  });
});
