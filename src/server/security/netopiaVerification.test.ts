import { execFileSync } from "node:child_process";
import { generateKeyPairSync, createSign } from "node:crypto";
import { mkdtempSync, writeFileSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  canonicalizeCertificatePem,
  classifyPublicKeyPemShape,
  diagnosePublicKeyCertificate,
  hashRequestBody,
  normalizePemKey,
  verifyNetopiaNotification,
  verifyRsaJwt,
} from "./netopiaVerification";

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

// The certificate's Base64 body with every whitespace character removed --
// used to build deliberately-malformed variants (wrong line length, no line
// breaks at all, extra blocks, ...) from known-good bytes rather than typing
// out fake Base64 by hand.
const CERT_BODY_COMPACT = CERTIFICATE_PEM.replace(/-----BEGIN CERTIFICATE-----/, "")
  .replace(/-----END CERTIFICATE-----/, "")
  .replace(/\s+/g, "");

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

// 2026-11-11: the real root cause of a SECOND live invalid_public_key
// rejection, against a .cer independently re-confirmed valid by `openssl
// x509 -noout -subject -issuer -serial` -- the certificate itself was never
// the problem; something about its round trip through a Netlify env var
// (CRLF, a lone CR, escaped \r\n, mixed real+escaped breaks, or stray
// whitespace inside the Base64 body) produced bytes the previous, narrower
// fallback never normalized. Every case below is one of the exact input
// shapes the task asked to reproduce.
describe("canonicalizeCertificatePem", () => {
  const expectedCanonical = (() => {
    const lines: string[] = [];
    for (let i = 0; i < CERT_BODY_COMPACT.length; i += 64) lines.push(CERT_BODY_COMPACT.slice(i, i + 64));
    return `-----BEGIN CERTIFICATE-----\n${lines.join("\n")}\n-----END CERTIFICATE-----\n`;
  })();

  it("a valid certificate with normal (real LF) newlines canonicalizes to the exact same bytes", () => {
    expect(canonicalizeCertificatePem(CERTIFICATE_PEM)).toEqual({ ok: true, pem: expectedCanonical });
  });

  it("CRLF line endings canonicalize to the identical result", () => {
    const crlf = CERTIFICATE_PEM.replace(/\n/g, "\r\n");
    expect(canonicalizeCertificatePem(crlf)).toEqual({ ok: true, pem: expectedCanonical });
  });

  it("lone CR (old Mac-style) line endings canonicalize to the identical result", () => {
    const crOnly = CERTIFICATE_PEM.replace(/\n/g, "\r");
    expect(canonicalizeCertificatePem(crOnly)).toEqual({ ok: true, pem: expectedCanonical });
  });

  it("literal escaped \\n sequences (no real newlines at all) canonicalize to the identical result", () => {
    const literalN = CERTIFICATE_PEM.replace(/\n/g, "\\n");
    expect(canonicalizeCertificatePem(literalN)).toEqual({ ok: true, pem: expectedCanonical });
  });

  it("literal escaped \\r\\n sequences canonicalize to the identical result", () => {
    const literalRN = CERTIFICATE_PEM.replace(/\n/g, "\\r\\n");
    expect(canonicalizeCertificatePem(literalRN)).toEqual({ ok: true, pem: expectedCanonical });
  });

  it("a mix of real and escaped newlines (only some lines re-wrapped) canonicalizes to the identical result", () => {
    // Deliberately built, not generated: the first half of the lines keep
    // their real newlines, joined to the second half via one literal \n
    // escape sequence instead -- exactly the shape a partially-re-wrapped
    // multi-line value would have.
    const rawLines = CERTIFICATE_PEM.split("\n");
    const half = Math.floor(rawLines.length / 2);
    const mixed = `${rawLines.slice(0, half).join("\n")}\\n${rawLines.slice(half).join("\n")}`;
    expect(canonicalizeCertificatePem(mixed)).toEqual({ ok: true, pem: expectedCanonical });
  });

  it("surrounding whitespace (leading/trailing blank lines and spaces) is trimmed and canonicalizes to the identical result", () => {
    const padded = `\n\n   ${CERTIFICATE_PEM}\t\n\n  `;
    expect(canonicalizeCertificatePem(padded)).toEqual({ ok: true, pem: expectedCanonical });
  });

  it("a Base64 body split by spaces and tabs instead of newlines canonicalizes to the identical result", () => {
    const spaced = `-----BEGIN CERTIFICATE-----\n${CERT_BODY_COMPACT.replace(/(.{8})/g, "$1 \t")}\n-----END CERTIFICATE-----\n`;
    expect(canonicalizeCertificatePem(spaced)).toEqual({ ok: true, pem: expectedCanonical });
  });

  it("an incomplete certificate block (BEGIN with no END) is rejected, not silently accepted", () => {
    const incomplete = `-----BEGIN CERTIFICATE-----\n${CERT_BODY_COMPACT}\n`;
    expect(canonicalizeCertificatePem(incomplete)).toEqual({ ok: false, reason: "incomplete_certificate_block" });
  });

  it("an incomplete certificate block (END with no BEGIN) is rejected", () => {
    const incomplete = `${CERT_BODY_COMPACT}\n-----END CERTIFICATE-----\n`;
    expect(canonicalizeCertificatePem(incomplete)).toEqual({ ok: false, reason: "incomplete_certificate_block" });
  });

  it("two complete certificate blocks concatenated together are rejected, not silently resolved to the first/last one", () => {
    const twoBlocks = `${CERTIFICATE_PEM}\n${CERTIFICATE_PEM}`;
    expect(canonicalizeCertificatePem(twoBlocks)).toEqual({ ok: false, reason: "multiple_certificate_blocks" });
  });

  it("invalid Base64 characters in the body are rejected outright -- never silently stripped", () => {
    const corrupted = `-----BEGIN CERTIFICATE-----\n${CERT_BODY_COMPACT.slice(0, 10)}!!!not-base64!!!${CERT_BODY_COMPACT.slice(10)}\n-----END CERTIFICATE-----\n`;
    expect(canonicalizeCertificatePem(corrupted)).toEqual({ ok: false, reason: "invalid_base64_body" });
  });

  it("an empty certificate body is rejected", () => {
    expect(canonicalizeCertificatePem("-----BEGIN CERTIFICATE-----\n\n-----END CERTIFICATE-----\n")).toEqual({
      ok: false,
      reason: "empty_certificate_body",
    });
  });

  it("input with no certificate marker at all is rejected", () => {
    expect(canonicalizeCertificatePem("just some random text, not a PEM at all")).toEqual({
      ok: false,
      reason: "no_certificate_marker",
    });
  });

  it("never throws on any malformed input", () => {
    for (const input of ["", "-----BEGIN CERTIFICATE-----", "-----END CERTIFICATE-----", "\\n\\r\\n", "----BEGIN CERTIFICATE----"]) {
      expect(() => canonicalizeCertificatePem(input)).not.toThrow();
    }
  });
});

// End-to-end reproductions through verifyRsaJwt() -- proves the
// canonicalization function is actually wired into the real verification
// path, not just correct in isolation.
describe("verifyRsaJwt -- certificate canonicalization end to end", () => {
  const reproductions: Array<[string, (pem: string) => string]> = [
    ["CRLF", (pem) => pem.replace(/\n/g, "\r\n")],
    ["lone CR", (pem) => pem.replace(/\n/g, "\r")],
    ["literal \\n", (pem) => pem.replace(/\n/g, "\\n")],
    ["literal \\r\\n", (pem) => pem.replace(/\n/g, "\\r\\n")],
    ["surrounding whitespace", (pem) => `\n  ${pem}  \n`],
    ["body split by spaces/tabs", (pem) => pem.replace(/\n(?!-----)/g, " \t")],
  ];

  for (const [label, transform] of reproductions) {
    it(`a genuinely RS512-signed notification still verifies when the configured certificate has ${label}`, () => {
      const token = signJwt(validPayload(), privateKey, "RS512");
      const transformed = transform(CERTIFICATE_PEM);
      expect(verifyRsaJwt(token, transformed)).toEqual({ ok: true, payload: validPayload() });
    });
  }

  it("an incomplete certificate block still fails closed as invalid_public_key, never as a false accept", () => {
    const token = signJwt(validPayload(), privateKey, "RS512");
    const incomplete = `-----BEGIN CERTIFICATE-----\n${CERT_BODY_COMPACT}\n`;
    expect(verifyRsaJwt(token, incomplete)).toEqual({ ok: false, reason: "invalid_public_key" });
  });

  it("two concatenated certificate blocks still fail closed as invalid_public_key", () => {
    const token = signJwt(validPayload(), privateKey, "RS512");
    const twoBlocks = `${CERTIFICATE_PEM}\n${CERTIFICATE_PEM}`;
    expect(verifyRsaJwt(token, twoBlocks)).toEqual({ ok: false, reason: "invalid_public_key" });
  });

  it("invalid Base64 characters in the body still fail closed as invalid_public_key", () => {
    const token = signJwt(validPayload(), privateKey, "RS512");
    const corrupted = `-----BEGIN CERTIFICATE-----\n!!!not-base64!!!${CERT_BODY_COMPACT}\n-----END CERTIFICATE-----\n`;
    expect(verifyRsaJwt(token, corrupted)).toEqual({ ok: false, reason: "invalid_public_key" });
  });

  it("a canonicalizable but WRONG certificate (different keypair) still fails as signature_verification_failed, never acceptance -- canonicalization never weakens the actual security check", () => {
    const { privateKey: otherPrivateKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    const dir = mkdtempSync(join(tmpdir(), "netopia-test-wrong-cert-"));
    const keyPath = join(dir, "key.pem");
    const certPath = join(dir, "cert.pem");
    writeFileSync(keyPath, otherPrivateKey);
    execFileSync("openssl", ["req", "-x509", "-key", keyPath, "-subj", "/CN=wrong-cert", "-days", "1", "-out", certPath], { stdio: "pipe" });
    const wrongCertPem = readFileSync(certPath, "utf8");

    // Signed with the ORIGINAL key, verified against a different,
    // perfectly well-formed certificate -- canonicalization succeeds, the
    // certificate parses fine, but the signature must still not match.
    const token = signJwt(validPayload(), privateKey, "RS512");
    expect(verifyRsaJwt(token, wrongCertPem.replace(/\n/g, "\r\n"))).toEqual({ ok: false, reason: "signature_verification_failed" });
  });
});

describe("diagnosePublicKeyCertificate", () => {
  it("reports not_certificate_shaped for a non-certificate PEM", () => {
    expect(diagnosePublicKeyCertificate(publicKey)).toBe("not_certificate_shaped");
  });

  it("reports not_certificate_shaped for garbage with no CERTIFICATE marker at all", () => {
    expect(diagnosePublicKeyCertificate("not a pem at all")).toBe("not_certificate_shaped");
  });

  it("reports the specific canonicalization failure reason for an incomplete block", () => {
    const incomplete = `-----BEGIN CERTIFICATE-----\n${CERT_BODY_COMPACT}\n`;
    expect(diagnosePublicKeyCertificate(incomplete)).toBe("canonicalization_failed:incomplete_certificate_block");
  });

  it("reports the specific canonicalization failure reason for multiple blocks", () => {
    expect(diagnosePublicKeyCertificate(`${CERTIFICATE_PEM}\n${CERTIFICATE_PEM}`)).toBe("canonicalization_failed:multiple_certificate_blocks");
  });

  it("reports the specific canonicalization failure reason for invalid Base64", () => {
    const corrupted = `-----BEGIN CERTIFICATE-----\n!!!not-base64!!!${CERT_BODY_COMPACT}\n-----END CERTIFICATE-----\n`;
    expect(diagnosePublicKeyCertificate(corrupted)).toBe("canonicalization_failed:invalid_base64_body");
  });

  it("reports certificate_parses_ok for a genuinely valid certificate, in any of the reproduced shapes", () => {
    expect(diagnosePublicKeyCertificate(CERTIFICATE_PEM)).toBe("certificate_parses_ok");
    expect(diagnosePublicKeyCertificate(CERTIFICATE_PEM.replace(/\n/g, "\r\n"))).toBe("certificate_parses_ok");
    expect(diagnosePublicKeyCertificate(CERTIFICATE_PEM.replace(/\n/g, "\\n"))).toBe("certificate_parses_ok");
  });

  it("never throws on any input", () => {
    for (const input of ["", "garbage", CERTIFICATE_PEM, publicKey, "-----BEGIN CERTIFICATE-----"]) {
      expect(() => diagnosePublicKeyCertificate(input)).not.toThrow();
    }
  });
});
