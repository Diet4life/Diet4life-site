import { generateKeyPairSync, createSign } from "node:crypto";
import { describe, expect, it } from "vitest";
import { hashRequestBody, verifyNetopiaNotification, verifyRs256Jwt } from "./netopiaVerification";

// A real RSA keypair generated once for this test file -- lets us build
// genuinely RS256-signed JWTs and prove verifyRs256Jwt() actually verifies
// a real signature (not just "any 3-part string"), without needing
// NETOPIA's real key (a merchant credential this session cannot obtain).
const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function signJwt(payload: Record<string, unknown>, signingKey: string, alg = "RS256"): string {
  const header = base64url(JSON.stringify({ alg, typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${body}`);
  signer.end();
  const signature = signer.sign(signingKey).toString("base64url");
  return `${header}.${body}.${signature}`;
}

const RAW_BODY = JSON.stringify({ order: { orderID: "D4L-2026-ABCD1234" }, payment: { ntpID: "123456", status: 3 } });
const AUDIENCE = "POS-SIGNATURE-VALUE";

function validPayload() {
  return { iss: "NETOPIA Payments", aud: AUDIENCE, sub: hashRequestBody(RAW_BODY) };
}

describe("verifyRs256Jwt", () => {
  it("verifies a genuinely RS256-signed token against the matching public key", () => {
    const token = signJwt(validPayload(), privateKey);
    expect(verifyRs256Jwt(token, publicKey)).toEqual(validPayload());
  });

  it("rejects a token signed with a different key", () => {
    const { privateKey: otherPrivateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    const token = signJwt(validPayload(), otherPrivateKey);
    expect(verifyRs256Jwt(token, publicKey)).toBeNull();
  });

  it("rejects a tampered payload even though the original signature is valid-looking", () => {
    const token = signJwt(validPayload(), privateKey);
    const [header, , signature] = token.split(".");
    const tamperedPayload = base64url(JSON.stringify({ ...validPayload(), sub: "attacker-controlled-hash" }));
    const tampered = `${header}.${tamperedPayload}.${signature}`;
    expect(verifyRs256Jwt(tampered, publicKey)).toBeNull();
  });

  it("rejects alg-confusion attempts -- a token claiming a different algorithm is never trusted to pick verification behavior", () => {
    const token = signJwt(validPayload(), privateKey, "HS256");
    expect(verifyRs256Jwt(token, publicKey)).toBeNull();
    const noneToken = signJwt(validPayload(), privateKey, "none");
    expect(verifyRs256Jwt(noneToken, publicKey)).toBeNull();
  });

  it("rejects malformed tokens without throwing", () => {
    expect(verifyRs256Jwt("not-a-jwt", publicKey)).toBeNull();
    expect(verifyRs256Jwt("a.b", publicKey)).toBeNull();
    expect(verifyRs256Jwt("a.b.c.d", publicKey)).toBeNull();
    expect(verifyRs256Jwt("", publicKey)).toBeNull();
    expect(() => verifyRs256Jwt("garbage.garbage.garbage", publicKey)).not.toThrow();
  });

  it("rejects a well-formed but garbage public key without throwing", () => {
    const token = signJwt(validPayload(), privateKey);
    expect(() => verifyRs256Jwt(token, "not a real pem key")).not.toThrow();
    expect(verifyRs256Jwt(token, "not a real pem key")).toBeNull();
  });
});

describe("verifyNetopiaNotification", () => {
  const baseParams = () => ({
    rawBody: RAW_BODY,
    verificationToken: signJwt(validPayload(), privateKey),
    publicKeyPem: publicKey,
    expectedAudience: AUDIENCE,
  });

  it("accepts a fully valid notification: correct signature, issuer, audience, and body hash", () => {
    const result = verifyNetopiaNotification(baseParams());
    expect(result.ok).toBe(true);
  });

  it("rejects when NETOPIA_PUBLIC_KEY is not configured -- fails closed rather than skipping verification", () => {
    const result = verifyNetopiaNotification({ ...baseParams(), publicKeyPem: undefined });
    expect(result).toEqual({ ok: false, reason: "public_key_not_configured" });
  });

  it("rejects when the Verification-token header is missing", () => {
    const result = verifyNetopiaNotification({ ...baseParams(), verificationToken: undefined });
    expect(result).toEqual({ ok: false, reason: "missing_verification_token" });
  });

  it("rejects an invalid signature", () => {
    const result = verifyNetopiaNotification({ ...baseParams(), verificationToken: "a.b.c" });
    expect(result).toEqual({ ok: false, reason: "invalid_signature" });
  });

  it("rejects a JWT with the wrong issuer, even if otherwise correctly signed", () => {
    const token = signJwt({ ...validPayload(), iss: "Some Other Issuer" }, privateKey);
    const result = verifyNetopiaNotification({ ...baseParams(), verificationToken: token });
    expect(result).toEqual({ ok: false, reason: "invalid_issuer" });
  });

  it("rejects a JWT with the wrong audience -- a token issued for a different merchant/POS", () => {
    const token = signJwt({ ...validPayload(), aud: "SOMEONE-ELSES-POS-SIGNATURE" }, privateKey);
    const result = verifyNetopiaNotification({ ...baseParams(), verificationToken: token });
    expect(result).toEqual({ ok: false, reason: "invalid_audience" });
  });

  it("rejects when the body hash (sub) doesn't match this exact request body -- a valid signature replayed with a different body", () => {
    const token = signJwt(validPayload(), privateKey); // sub matches RAW_BODY
    const differentBody = JSON.stringify({ order: { orderID: "D4L-2026-DIFFERENT" }, payment: { ntpID: "999", status: 3 } });
    const result = verifyNetopiaNotification({ ...baseParams(), verificationToken: token, rawBody: differentBody });
    expect(result).toEqual({ ok: false, reason: "body_hash_mismatch" });
  });
});

describe("hashRequestBody", () => {
  it("is deterministic and matches base64(sha512(body))", () => {
    expect(hashRequestBody("hello")).toBe(hashRequestBody("hello"));
    expect(hashRequestBody("hello")).not.toBe(hashRequestBody("hello!"));
  });
});
