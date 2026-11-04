// Verifies the authenticity of a NETOPIA Payments API v2 IPN (server-to-
// server payment notification). Pure/DB-free -- no network, no database --
// so it's fully unit-testable in isolation.
//
// The mechanism below was reconstructed from NETOPIA's Python SDK error
// messages (referencing a JWT with "iss" and "sub" claims, RSA public-key
// verification) and a working, published open-source Node.js NETOPIA
// integration's documented verifyNotification() flow. This sandbox's
// network egress to netopia-payments.com / doc.netopia-payments.com
// remains blocked for the entire duration of this project, so none of this
// was independently confirmed against NETOPIA's primary spec -- treat it
// as a well-researched implementation of a real, documented mechanism
// (asymmetric JWT signature + issuer/audience/body-hash checks), not a
// placeholder. It fails closed by design: until NETOPIA_PUBLIC_KEY is set
// to the real PEM NETOPIA provides (a merchant-account credential this
// session cannot obtain or invent), every notification is rejected as
// unverified -- no order can ever be marked paid.
//
// Documented shape: NETOPIA sends the notification body as JSON
// ({order: {...}, payment: {...}}) and separately signs a JWT carrying:
//   iss: "NETOPIA Payments"          -- must match exactly
//   aud: <our own POS signature>     -- binds the JWT to this merchant
//                                       account; a JWT issued for a
//                                       different NETOPIA merchant cannot
//                                       be replayed against us
//   sub: base64(SHA-512(raw body))   -- binds the JWT to this exact
//                                       request body; the signature alone
//                                       isn't enough, since NETOPIA's
//                                       signature format is otherwise
//                                       payload-independent metadata
// delivered in a "Verification-token" request header, signed with
// NETOPIA's private key. All four checks (signature, iss, aud, sub) must
// pass for a notification to be trusted.
//
// NETOPIA signs these tokens with RS512 (RSA + SHA-512) -- the default `alg`
// in NETOPIA's own SDKs, and confirmed by a real sandbox notification on
// 2026-11-04 that was rejected as invalid_signature while this file still
// accepted RS256 only. RS256 stays accepted too; both are RSA public-key
// algorithms, so neither can be abused for alg-confusion. `aud` may arrive
// as a string or as an array containing our POS signature.

import { createHash, createVerify } from "node:crypto";

// Verifies an RS512/RS256 JWT against the given RSA public key (PEM). The
// token's "alg" header only selects between these two RSA algorithms from
// a fixed allowlist -- anything else (HS256, "none", ...) is rejected, so
// the classic alg-confusion / signature-stripping attacks don't apply.
// Returns the decoded payload only if the signature verifies; never throws.
const ALLOWED_JWT_ALGORITHMS: Record<string, string> = {
  RS512: "RSA-SHA512",
  RS256: "RSA-SHA256",
};

export function verifyRsaJwt(token: string, publicKeyPem: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, signatureB64] = parts;

  let header: unknown;
  try {
    header = JSON.parse(Buffer.from(headerB64, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  const alg = header && typeof header === "object" ? (header as Record<string, unknown>).alg : undefined;
  const digest = typeof alg === "string" && Object.prototype.hasOwnProperty.call(ALLOWED_JWT_ALGORITHMS, alg) ? ALLOWED_JWT_ALGORITHMS[alg] : undefined;
  if (!digest) return null;

  let signature: Buffer;
  try {
    signature = Buffer.from(signatureB64, "base64url");
  } catch {
    return null;
  }
  if (signature.length === 0) return null;

  let signatureValid = false;
  try {
    const verifier = createVerify(digest);
    verifier.update(`${headerB64}.${payloadB64}`);
    verifier.end();
    signatureValid = verifier.verify(publicKeyPem, signature);
  } catch {
    return null; // malformed public key, malformed signature bytes, etc.
  }
  if (!signatureValid) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    return payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

// base64(SHA-512(rawBody)) -- matches the "sub" claim's documented format.
export function hashRequestBody(rawBody: Buffer | string): string {
  return createHash("sha512").update(rawBody).digest("base64");
}

export interface NetopiaVerificationParams {
  rawBody: Buffer | string;
  verificationToken: string | undefined;
  publicKeyPem: string | undefined;
  expectedAudience: string; // our own NETOPIA_POS_SIGNATURE
}

export type NetopiaVerificationResult =
  | { ok: true; payload: Record<string, unknown> }
  | { ok: false; reason: "public_key_not_configured" | "missing_verification_token" | "invalid_signature" | "invalid_issuer" | "invalid_audience" | "body_hash_mismatch" };

const EXPECTED_ISSUER = "NETOPIA Payments";

// Runs every check described in the file header comment, in order, and
// short-circuits on the first failure. Never throws, never logs anything
// itself (the caller decides what's safe to log) -- see
// payments-netopia-notify.ts for the only place this is called from.
export function verifyNetopiaNotification(params: NetopiaVerificationParams): NetopiaVerificationResult {
  if (!params.publicKeyPem) return { ok: false, reason: "public_key_not_configured" };
  if (!params.verificationToken) return { ok: false, reason: "missing_verification_token" };

  const payload = verifyRsaJwt(params.verificationToken, params.publicKeyPem);
  if (!payload) return { ok: false, reason: "invalid_signature" };

  if (payload.iss !== EXPECTED_ISSUER) return { ok: false, reason: "invalid_issuer" };
  const aud = payload.aud;
  const audienceMatches =
    !!params.expectedAudience &&
    (aud === params.expectedAudience || (Array.isArray(aud) && aud.includes(params.expectedAudience)));
  if (!audienceMatches) return { ok: false, reason: "invalid_audience" };

  const expectedSub = hashRequestBody(params.rawBody);
  if (payload.sub !== expectedSub) return { ok: false, reason: "body_hash_mismatch" };

  return { ok: true, payload };
}
