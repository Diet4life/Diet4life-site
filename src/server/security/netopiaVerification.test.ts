import { execFileSync } from "node:child_process";
import { generateKeyPairSync, createSign } from "node:crypto";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { classifyPublicKeyPemShape, hashRequestBody, normalizePemKey, verifyNetopiaNotification, verifyRsaJwt } from "./netopiaVerification";

// A real RSA keypair generated once for this test file -- lets us build
// genuinely RS256/RS512-signed JWTs and prove verifyRsaJwt() actually
// verifies a real signature (not just "any 3-part string"), without needing
// NETOPIA's real key (a merchant credential this session cannot obtain).
const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

// 2026-11-09: a real self-signed X.509 certificate PEM wrapping the exact
// same RSA keypair above, built once via the system `openssl` CLI -- this
// is the PEM shape NETOPIA's real sandbox credential actually is (a `.cer`
// certificate, not a bare SPKI "PUBLIC KEY" PEM), and it's what exposed the
// invalid_public_key bug: createPublicKey() can't parse a "-----BEGIN
// CERTIFICATE-----" block at all, only `new X509Certificate(pem)` can. Since
// the certificate embeds the same public key as `publicKey` above, any
// signature verifiable against `publicKey` must also verify against this
// certificate's `.publicKey` -- that equivalence is exactly what these
// tests check.
const CERTIFICATE_PEM = (() => {
  const dir = mkdtempSync(join(tmpdir(), "netopia-test-cert-"));
  const keyPath = join(dir, "key.pem");
  const certPath = join(dir, "cert.pem");
  writeFileSync(keyPath, privateKey);
  execFileSync("openssl", ["req", "-x509", "-key", keyPath, "-subj", "/CN=netopia-sandbox-test", "-days", "1", "-out", certPath], {
    stdio: "pipe",
  });
  return readFileSync(certPath, "utf8");
})();

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function signJwt(payload: Record<string, unknown>, signingKey: string, alg = "RS256"): string {
  const header = base64url(JSON.stringify({ alg, typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  const signer = createSign(alg === "RS512" ? "RSA-SHA512" : "RSA-SHA256");
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

describe("verifyRsaJwt", () => {
  it("verifies a genuinely RS256-signed token against the matching public key", () => {
    const token = signJwt(validPayload(), privateKey);
    expect(verifyRsaJwt(token, publicKey)).toEqual({ ok: true, payload: validPayload() });
  });

  it("verifies an RS512-signed token -- the algorithm NETOPIA actually uses for IPN Verification-token", () => {
    const token = signJwt(validPayload(), privateKey, "RS512");
    expect(verifyRsaJwt(token, publicKey)).toEqual({ ok: true, payload: validPayload() });
  });

  it("rejects a token signed with a different key", () => {
    const { privateKey: otherPrivateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    const token = signJwt(validPayload(), otherPrivateKey);
    expect(verifyRsaJwt(token, publicKey)).toEqual({ ok: false, reason: "signature_verification_failed" });
  });

  it("rejects a tampered payload even though the original signature is valid-looking", () => {
    const token = signJwt(validPayload(), privateKey);
    const [header, , signature] = token.split(".");
    const tamperedPayload = base64url(JSON.stringify({ ...validPayload(), sub: "attacker-controlled-hash" }));
    const tampered = `${header}.${tamperedPayload}.${signature}`;
    expect(verifyRsaJwt(tampered, publicKey)).toEqual({ ok: false, reason: "signature_verification_failed" });
  });

  it("rejects an RS512 header over an RS256 signature (algorithm and signature must match)", () => {
    const [, body, sig] = signJwt(validPayload(), privateKey, "RS256").split(".");
    const header = base64url(JSON.stringify({ alg: "RS512", typ: "JWT" }));
    expect(verifyRsaJwt(`${header}.${body}.${sig}`, publicKey)).toEqual({ ok: false, reason: "signature_verification_failed" });
  });

  it("rejects alg-confusion attempts -- a token claiming a different algorithm is never trusted to pick verification behavior", () => {
    const token = signJwt(validPayload(), privateKey, "HS256");
    expect(verifyRsaJwt(token, publicKey)).toEqual({ ok: false, reason: "unsupported_algorithm" });
    const noneToken = signJwt(validPayload(), privateKey, "none");
    expect(verifyRsaJwt(noneToken, publicKey)).toEqual({ ok: false, reason: "unsupported_algorithm" });
  });

  it("rejects malformed tokens without throwing", () => {
    expect(verifyRsaJwt("not-a-jwt", publicKey)).toEqual({ ok: false, reason: "malformed_verification_token" });
    expect(verifyRsaJwt("a.b", publicKey)).toEqual({ ok: false, reason: "malformed_verification_token" });
    expect(verifyRsaJwt("a.b.c.d", publicKey)).toEqual({ ok: false, reason: "malformed_verification_token" });
    expect(verifyRsaJwt("", publicKey)).toEqual({ ok: false, reason: "malformed_verification_token" });
    expect(() => verifyRsaJwt("garbage.garbage.garbage", publicKey)).not.toThrow();
  });

  it("rejects a well-formed but garbage public key without throwing, as invalid_public_key -- distinguishable from a wrong signature", () => {
    const token = signJwt(validPayload(), privateKey);
    expect(() => verifyRsaJwt(token, "not a real pem key")).not.toThrow();
    expect(verifyRsaJwt(token, "not a real pem key")).toEqual({ ok: false, reason: "invalid_public_key" });
  });

  it("tolerates a public key whose real newlines were replaced with literal \\n (a common env-var-paste corruption)", () => {
    const token = signJwt(validPayload(), privateKey);
    const escapedKey = publicKey.replace(/\n/g, "\\n");
    expect(verifyRsaJwt(token, escapedKey)).toEqual({ ok: true, payload: validPayload() });
  });

  // 2026-11-09: the real root cause -- NETOPIA's actual sandbox credential
  // is an X.509 CERTIFICATE PEM, not a bare PUBLIC KEY PEM, and
  // createPublicKey() alone can never parse that shape.
  describe("X.509 CERTIFICATE PEM (NETOPIA's real sandbox credential shape)", () => {
    it("verifies a genuinely RS512-signed token against a valid X.509 certificate's embedded public key, unmodified", () => {
      const token = signJwt(validPayload(), privateKey, "RS512");
      expect(verifyRsaJwt(token, CERTIFICATE_PEM)).toEqual({ ok: true, payload: validPayload() });
    });

    it("also verifies RS256 against the certificate", () => {
      const token = signJwt(validPayload(), privateKey, "RS256");
      expect(verifyRsaJwt(token, CERTIFICATE_PEM)).toEqual({ ok: true, payload: validPayload() });
    });

    it("tolerates a certificate PEM whose real newlines were replaced with literal \\n", () => {
      const token = signJwt(validPayload(), privateKey, "RS512");
      const escapedCert = CERTIFICATE_PEM.replace(/\n/g, "\\n");
      expect(verifyRsaJwt(token, escapedCert)).toEqual({ ok: true, payload: validPayload() });
    });

    it("tolerates surrounding whitespace around an otherwise-valid certificate PEM", () => {
      const token = signJwt(validPayload(), privateKey, "RS512");
      const padded = `\n\n  ${CERTIFICATE_PEM}  \n\t\n`;
      expect(verifyRsaJwt(token, padded)).toEqual({ ok: true, payload: validPayload() });
    });

    it("tolerates surrounding whitespace combined with escaped newlines", () => {
      const token = signJwt(validPayload(), privateKey, "RS512");
      const padded = `   ${CERTIFICATE_PEM.replace(/\n/g, "\\n")}   `;
      expect(verifyRsaJwt(token, padded)).toEqual({ ok: true, payload: validPayload() });
    });

    it("still rejects a signature from the wrong key, even presented as a valid certificate", () => {
      const { privateKey: otherPrivateKey } = generateKeyPairSync("rsa", {
        modulusLength: 2048,
        publicKeyEncoding: { type: "spki", format: "pem" },
        privateKeyEncoding: { type: "pkcs8", format: "pem" },
      });
      const token = signJwt(validPayload(), otherPrivateKey, "RS512");
      expect(verifyRsaJwt(token, CERTIFICATE_PEM)).toEqual({ ok: false, reason: "signature_verification_failed" });
    });
  });

  describe("malformed / unsupported public key input", () => {
    it("rejects a 'CERTIFICATE' marker with garbage body as invalid_public_key, never throwing", () => {
      const token = signJwt(validPayload(), privateKey);
      const garbageCert = "-----BEGIN CERTIFICATE-----\nnot-real-base64\n-----END CERTIFICATE-----";
      expect(() => verifyRsaJwt(token, garbageCert)).not.toThrow();
      expect(verifyRsaJwt(token, garbageCert)).toEqual({ ok: false, reason: "invalid_public_key" });
    });

    it("rejects an empty string as invalid_public_key, never throwing", () => {
      const token = signJwt(validPayload(), privateKey);
      expect(() => verifyRsaJwt(token, "")).not.toThrow();
      expect(verifyRsaJwt(token, "")).toEqual({ ok: false, reason: "invalid_public_key" });
    });
  });
});

describe("classifyPublicKeyPemShape", () => {
  it("classifies a certificate PEM as x509_certificate", () => {
    expect(classifyPublicKeyPemShape(CERTIFICATE_PEM)).toBe("x509_certificate");
  });

  it("classifies a certificate PEM as x509_certificate even with escaped newlines or surrounding whitespace", () => {
    expect(classifyPublicKeyPemShape(CERTIFICATE_PEM.replace(/\n/g, "\\n"))).toBe("x509_certificate");
    expect(classifyPublicKeyPemShape(`  ${CERTIFICATE_PEM}  `)).toBe("x509_certificate");
  });

  it("classifies a PUBLIC KEY PEM as public_key_or_other", () => {
    expect(classifyPublicKeyPemShape(publicKey)).toBe("public_key_or_other");
  });

  it("classifies anything without a PEM BEGIN marker as no_begin_marker", () => {
    expect(classifyPublicKeyPemShape("not a pem key at all")).toBe("no_begin_marker");
    expect(classifyPublicKeyPemShape("")).toBe("no_begin_marker");
  });
});

describe("normalizePemKey", () => {
  it("replaces literal \\n with real newlines when the key has PEM markers but no real newline", () => {
    const escaped = publicKey.replace(/\n/g, "\\n");
    expect(normalizePemKey(escaped)).toBe(publicKey);
  });

  it("leaves an already-correct key (real newlines) completely untouched", () => {
    expect(normalizePemKey(publicKey)).toBe(publicKey);
  });

  it("leaves a non-PEM string untouched", () => {
    expect(normalizePemKey("not a pem key")).toBe("not a pem key");
  });

  it("leaves a PEM-like string with no escaped newlines untouched (nothing to normalize)", () => {
    const noEscapes = "-----BEGIN PUBLIC KEY-----garbage-----END PUBLIC KEY-----";
    expect(normalizePemKey(noEscapes)).toBe(noEscapes);
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

  it("accepts a fully valid RS512 notification -- NETOPIA's actual default algorithm", () => {
    const token = signJwt(validPayload(), privateKey, "RS512");
    const result = verifyNetopiaNotification({ ...baseParams(), verificationToken: token });
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

  it("rejects a malformed token with a granular reason, not a generic invalid_signature", () => {
    const result = verifyNetopiaNotification({ ...baseParams(), verificationToken: "a.b.c" });
    expect(result).toEqual({ ok: false, reason: "malformed_verification_token" });
  });

  it("rejects a genuinely wrong signature with signature_verification_failed", () => {
    const { privateKey: otherPrivateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    const token = signJwt(validPayload(), otherPrivateKey);
    const result = verifyNetopiaNotification({ ...baseParams(), verificationToken: token });
    expect(result).toEqual({ ok: false, reason: "signature_verification_failed" });
  });

  it("rejects an HMAC (alg-confusion) token with unsupported_algorithm, never attempting RSA verification", () => {
    const token = signJwt(validPayload(), privateKey, "HS256");
    const result = verifyNetopiaNotification({ ...baseParams(), verificationToken: token });
    expect(result).toEqual({ ok: false, reason: "unsupported_algorithm" });
  });

  it("rejects an unsigned (alg=none) token", () => {
    const token = signJwt(validPayload(), privateKey, "none");
    const result = verifyNetopiaNotification({ ...baseParams(), verificationToken: token });
    expect(result).toEqual({ ok: false, reason: "unsupported_algorithm" });
  });

  it("rejects a JWT with the wrong issuer, even if otherwise correctly signed", () => {
    const token = signJwt({ ...validPayload(), iss: "Some Other Issuer" }, privateKey);
    const result = verifyNetopiaNotification({ ...baseParams(), verificationToken: token });
    expect(result).toEqual({ ok: false, reason: "invalid_issuer" });
  });

  it("accepts a token whose aud is an array containing our POS signature as its first element (NETOPIA's real shape)", () => {
    const token = signJwt({ ...validPayload(), aud: [AUDIENCE] }, privateKey, "RS512");
    const result = verifyNetopiaNotification({ rawBody: RAW_BODY, verificationToken: token, publicKeyPem: publicKey, expectedAudience: AUDIENCE });
    expect(result.ok).toBe(true);
  });

  it("accepts a token whose aud is a bare string matching our POS signature", () => {
    const token = signJwt({ ...validPayload(), aud: AUDIENCE }, privateKey, "RS512");
    const result = verifyNetopiaNotification({ rawBody: RAW_BODY, verificationToken: token, publicKeyPem: publicKey, expectedAudience: AUDIENCE });
    expect(result.ok).toBe(true);
  });

  it("rejects an aud array whose first element does not match our POS signature", () => {
    const token = signJwt({ ...validPayload(), aud: ["SOMEONE-ELSE"] }, privateKey, "RS512");
    const result = verifyNetopiaNotification({ rawBody: RAW_BODY, verificationToken: token, publicKeyPem: publicKey, expectedAudience: AUDIENCE });
    expect(result).toEqual({ ok: false, reason: "invalid_audience" });
  });

  it("rejects when our own POS signature is unset, even if aud is empty too", () => {
    const token = signJwt({ ...validPayload(), aud: "" }, privateKey, "RS512");
    const result = verifyNetopiaNotification({ rawBody: RAW_BODY, verificationToken: token, publicKeyPem: publicKey, expectedAudience: "" });
    expect(result).toEqual({ ok: false, reason: "invalid_audience" });
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

  it("accepts a notification even when the configured public key has escaped \\n instead of real newlines", () => {
    const escapedKey = publicKey.replace(/\n/g, "\\n");
    const result = verifyNetopiaNotification({ ...baseParams(), publicKeyPem: escapedKey });
    expect(result.ok).toBe(true);
  });

  it("reports invalid_public_key (not a generic signature failure) when the configured key is genuinely unparsable", () => {
    const result = verifyNetopiaNotification({ ...baseParams(), publicKeyPem: "not a real pem key" });
    expect(result).toEqual({ ok: false, reason: "invalid_public_key" });
  });
});

describe("hashRequestBody", () => {
  it("is deterministic and matches base64(sha512(body))", () => {
    expect(hashRequestBody("hello")).toBe(hashRequestBody("hello"));
    expect(hashRequestBody("hello")).not.toBe(hashRequestBody("hello!"));
  });
});
