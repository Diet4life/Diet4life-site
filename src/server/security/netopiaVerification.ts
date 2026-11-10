// Verifies the authenticity of a NETOPIA Payments API v2 IPN (server-to-
// server payment notification). Pure/DB-free -- no network, no database --
// so it's fully unit-testable in isolation.
//
// 2026-11-04: this file was rewritten against NETOPIA's own official,
// published SDK source -- not reconstructed from indirect sources anymore.
// pypi.org and registry.npmjs.org (unlike netopia-payments.com itself,
// still blocked from this sandbox) were reachable, and both the official
// Python SDK (`netopia-sdk`, github.com/netopiapayments/python-sdk,
// published by "NETOPIA Payments" <support@netopia.ro>) and the official
// JavaScript SDK (`netopia-payment2`, github.com/netopiapayments/
// javascript-sdk) were downloaded directly from their registries and their
// IPN-verification source (ipn.py / ipn.js) read in full. Every check below
// is matched against what both of those files actually do, not inferred:
//   - Default/expected algorithm: RS512 (both SDKs' own default `alg`).
//     RS256 is also accepted here, as before -- both are RSA public-key
//     algorithms, so neither enables alg-confusion, and nothing in either
//     official SDK suggests RS256 is invalid, only that RS512 is the
//     default when the token's own header doesn't say otherwise.
//   - iss must be exactly "NETOPIA Payments" (matches
//     `InvalidIssuerError`/`decoded.iss !== 'NETOPIA Payments'` in both SDKs).
//   - aud: both official SDKs index `aud[0]` unconditionally (i.e. they
//     assume aud always arrives as an array) and compare that single value
//     against the merchant's own POS signature. This file does the same
//     (`Array.isArray(aud) ? aud[0] : aud`), except it also handles aud
//     arriving as a bare string correctly (the official JS SDK's own
//     `aud[0]` would silently take just the *first character* of a string
//     audience, which is almost certainly a latent bug in their reference
//     code, not a behavior to copy here).
//   - sub = base64(SHA-512(raw body)), SHA-512 digested as raw bytes then
//     standard base64-encoded (not base64url) -- this exact construction
//     is confirmed byte-for-byte in both official SDKs'
//     `_compute_hash`/hash logic (`hashlib.sha512(...).digest()` ->
//     `base64.b64encode(...)` in Python; `crypto.createHash('sha512')
//     .update(rawData).digest('base64')` in JS). This file's
//     hashRequestBody() already matched this before this round; confirmed
//     correct, unchanged.
//   - The JWS signing input is the standard `base64url(header) + "." +
//     base64url(payload)` -- neither SDK does anything NETOPIA-specific
//     here; they both delegate to a standard JWT library (PyJWT /
//     jsonwebtoken), which only ever signs/verifies that exact string.
//
// What neither official SDK does, that this file still deliberately keeps
// (a real security improvement over both references, not a deviation from
// the spec): a fixed algorithm allowlist (RS512/RS256 only) decided BEFORE
// touching the public key, rather than trusting whatever `alg` the
// token's own header claims the way both official SDKs do
// (`header.get("alg", self.alg)` / `jwtHeader.alg || this.alg`, then
// handing that attacker-influenced string straight to the JWT library's
// own `algorithms=[...]` allowlist-of-one). Accepting an attacker-chosen
// algorithm name, even constrained to one slot, is the shape of the
// classic alg-confusion bug; picking from a fixed allowlist first removes
// that shape entirely. "none", HS256, and anything else are rejected
// before the public key is ever touched.
import { createHash, createPublicKey, createVerify, X509Certificate, type KeyObject } from "node:crypto";

// Verifies an RS512/RS256 JWT against the given RSA public key (PEM).
// Returns a tagged result instead of null so the caller (and ultimately
// payments-netopia-notify.ts's logs) can tell WHICH structural step failed
// -- never by returning anything secret, only one of a fixed set of safe
// reason codes. Never throws.
const ALLOWED_JWT_ALGORITHMS: Record<string, string> = {
  RS512: "RSA-SHA512",
  RS256: "RSA-SHA256",
};

type JwtVerifyResult =
  | { ok: true; payload: Record<string, unknown> }
  | { ok: false; reason: "malformed_verification_token" | "unsupported_algorithm" | "invalid_public_key" | "signature_verification_failed" };

// Defends against the single most common real-world cause of "a correctly-
// formatted RSA PEM key mysteriously fails to parse": the key was pasted
// into a single-line env var field (Netlify's dashboard, a .env file edited
// by hand, ...) with its real newlines replaced by the two literal
// characters "\" + "n" instead of an actual line break. Node's PEM parser
// requires real newlines between "-----BEGIN ... KEY-----" and
// "-----END ... KEY-----"; a key with escaped "\n" sequences instead fails
// to parse with an opaque OpenSSL error that gives no hint about the real
// cause. Only normalizes when the string has PEM markers but no real
// newline at all between them (a key that already has real newlines is
// left completely untouched, so this can never corrupt an already-valid
// key). Never throws; returns the input unchanged if normalization isn't
// applicable.
export function normalizePemKey(pem: string): string {
  if (!pem.includes("-----BEGIN") || pem.includes("\n")) return pem;
  if (!pem.includes("\\n")) return pem;
  return pem.replace(/\\n/g, "\n");
}

// 2026-11-09: root cause of a real sandbox notification being rejected as
// invalid_public_key even though the configured NETOPIA_PUBLIC_KEY was a
// genuinely valid PEM (OpenSSL parses it; Node's own `new
// X509Certificate(pem)` and `.publicKey` succeed). NETOPIA's sandbox
// credential is distributed as a `.cer` X.509 CERTIFICATE PEM block, not a
// bare SPKI "PUBLIC KEY" PEM block -- and `crypto.createPublicKey()` does
// NOT accept a "-----BEGIN CERTIFICATE-----" block at all (it only parses
// "PUBLIC KEY"/"RSA PUBLIC KEY"/"PRIVATE KEY" encodings). The previous
// resolution logic called createPublicKey() unconditionally, so it threw on
// the *first* attempt for a structural reason that has nothing to do with
// newline-escaping -- and the \n-normalization fallback then failed for the
// exact same reason, since converting escaped newlines never changes the
// PEM's type. The result was indistinguishable from a genuinely corrupt key.
//
// Fix: explicit, type-aware parsing. A PEM containing "-----BEGIN
// CERTIFICATE-----" is parsed with `new X509Certificate(pem)` and its
// `.publicKey` (a KeyObject Node's Verify.verify() accepts directly) is
// used; anything else still goes through createPublicKey() exactly as
// before, so "PUBLIC KEY" PEM support is unchanged. Tried against several
// candidate forms of the same string, in order, stopping at the first that
// parses -- the byte-identical raw value first (so an already-valid PEM,
// certificate or not, is never mutated), then surrounding whitespace
// trimmed (a copy-paste-into-a-dashboard artifact), then (only if neither
// of those has a real newline) the existing \n-literal normalization. Never
// throws; returns undefined if nothing parses.
function resolveConfiguredPublicKey(rawPem: string): KeyObject | undefined {
  const candidates: string[] = [rawPem];
  const trimmed = rawPem.trim();
  if (trimmed !== rawPem) candidates.push(trimmed);
  const normalized = normalizePemKey(trimmed);
  if (normalized !== trimmed) candidates.push(normalized);

  for (const candidate of candidates) {
    const key = tryParsePublicKeyPem(candidate);
    if (key) return key;
  }
  return undefined;
}

function tryParsePublicKeyPem(pem: string): KeyObject | undefined {
  if (pem.includes("-----BEGIN CERTIFICATE-----")) {
    try {
      return new X509Certificate(pem).publicKey;
    } catch {
      return undefined;
    }
  }
  try {
    return createPublicKey(pem);
  } catch {
    return undefined;
  }
}

export type PublicKeyPemShape = "x509_certificate" | "public_key_or_other" | "no_begin_marker";

// Safe, secret-free structural classification -- never returns or logs the
// key's actual bytes, only which PEM shape was detected in it. For
// diagnostics only (see payments-netopia-notify.ts's rejection log line);
// never used for the accept/reject decision itself, which is always
// resolveConfiguredPublicKey()/verifyRsaJwt() below.
export function classifyPublicKeyPemShape(pem: string): PublicKeyPemShape {
  if (pem.includes("-----BEGIN CERTIFICATE-----")) return "x509_certificate";
  if (pem.includes("-----BEGIN")) return "public_key_or_other";
  return "no_begin_marker";
}

export function verifyRsaJwt(token: string, publicKeyPem: string): JwtVerifyResult {
  const parts = token.split(".");
  if (parts.length !== 3) return { ok: false, reason: "malformed_verification_token" };
  const [headerB64, payloadB64, signatureB64] = parts;

  let header: unknown;
  try {
    header = JSON.parse(Buffer.from(headerB64, "base64url").toString("utf8"));
  } catch {
    return { ok: false, reason: "malformed_verification_token" };
  }
  const alg = header && typeof header === "object" ? (header as Record<string, unknown>).alg : undefined;
  const digest = typeof alg === "string" && Object.prototype.hasOwnProperty.call(ALLOWED_JWT_ALGORITHMS, alg) ? ALLOWED_JWT_ALGORITHMS[alg] : undefined;
  if (!digest) return { ok: false, reason: "unsupported_algorithm" };

  let signature: Buffer;
  try {
    signature = Buffer.from(signatureB64, "base64url");
  } catch {
    return { ok: false, reason: "malformed_verification_token" };
  }
  if (signature.length === 0) return { ok: false, reason: "malformed_verification_token" };

  // Validate/resolve the public key ON ITS OWN, before ever attempting a
  // signature check against it -- this is what lets a malformed/mis-pasted
  // or wrong-PEM-type NETOPIA_PUBLIC_KEY surface as "invalid_public_key" in
  // the logs instead of being indistinguishable from a genuinely wrong
  // signature. Handles an X.509 CERTIFICATE PEM (NETOPIA's real sandbox
  // credential shape) via X509Certificate, and a PUBLIC KEY (or other
  // createPublicKey-supported) PEM exactly as before -- see
  // resolveConfiguredPublicKey()'s header comment.
  const resolvedKey = resolveConfiguredPublicKey(publicKeyPem);
  if (!resolvedKey) return { ok: false, reason: "invalid_public_key" };

  let signatureValid = false;
  try {
    const verifier = createVerify(digest);
    verifier.update(`${headerB64}.${payloadB64}`);
    verifier.end();
    signatureValid = verifier.verify(resolvedKey, signature);
  } catch {
    // The key already parsed on its own above, so an exception here means
    // the signature bytes themselves are the wrong shape for this key
    // (e.g. wrong key size) -- not a public-key-configuration problem.
    return { ok: false, reason: "signature_verification_failed" };
  }
  if (!signatureValid) return { ok: false, reason: "signature_verification_failed" };

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
    if (!payload || typeof payload !== "object") return { ok: false, reason: "malformed_verification_token" };
    return { ok: true, payload: payload as Record<string, unknown> };
  } catch {
    return { ok: false, reason: "malformed_verification_token" };
  }
}

// base64(SHA-512(rawBody)) -- matches the "sub" claim's documented format,
// confirmed byte-for-byte against both official SDKs' own hash
// construction (see this file's header comment). Unchanged this round.
export function hashRequestBody(rawBody: Buffer | string): string {
  return createHash("sha512").update(rawBody).digest("base64");
}

export interface NetopiaVerificationParams {
  rawBody: Buffer | string;
  verificationToken: string | undefined;
  publicKeyPem: string | undefined;
  expectedAudience: string; // our own NETOPIA_POS_SIGNATURE
}

export type NetopiaVerificationReason =
  | "public_key_not_configured"
  | "missing_verification_token"
  | "malformed_verification_token"
  | "unsupported_algorithm"
  | "invalid_public_key"
  | "signature_verification_failed"
  | "invalid_issuer"
  | "invalid_audience"
  | "body_hash_mismatch";

export type NetopiaVerificationResult =
  | { ok: true; payload: Record<string, unknown> }
  | { ok: false; reason: NetopiaVerificationReason };

const EXPECTED_ISSUER = "NETOPIA Payments";

// Runs every check described in the file header comment, in order, and
// short-circuits on the first failure. Never throws, never logs anything
// itself (the caller decides what's safe to log, and only ever logs the
// `reason` string -- never the token, the key, or the body) -- see
// payments-netopia-notify.ts for the only place this is called from.
export function verifyNetopiaNotification(params: NetopiaVerificationParams): NetopiaVerificationResult {
  if (!params.publicKeyPem) return { ok: false, reason: "public_key_not_configured" };
  if (!params.verificationToken) return { ok: false, reason: "missing_verification_token" };

  const jwtResult = verifyRsaJwt(params.verificationToken, params.publicKeyPem);
  if (!jwtResult.ok) return jwtResult;
  const payload = jwtResult.payload;

  if (payload.iss !== EXPECTED_ISSUER) return { ok: false, reason: "invalid_issuer" };

  // Both official SDKs index aud[0] unconditionally, i.e. they expect aud
  // to always arrive as an array -- see this file's header comment. A bare
  // string audience is also handled correctly here (compared whole,
  // not char-by-char), in case NETOPIA ever sends it that way.
  const aud = payload.aud;
  const actualAud = Array.isArray(aud) ? aud[0] : aud;
  const audienceMatches = !!params.expectedAudience && actualAud === params.expectedAudience;
  if (!audienceMatches) return { ok: false, reason: "invalid_audience" };

  const expectedSub = hashRequestBody(params.rawBody);
  if (payload.sub !== expectedSub) return { ok: false, reason: "body_hash_mismatch" };

  return { ok: true, payload };
}
