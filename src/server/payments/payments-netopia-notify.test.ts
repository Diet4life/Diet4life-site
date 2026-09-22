import { createSign, generateKeyPairSync } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const recordNetopiaNotification = vi.fn();

// vi.mock is hoisted above every import in this file by vitest's
// transform -- only the DB-touching orderService function is mocked, so
// this test exercises the REAL JWT/RS256 verification path end to end,
// not a mocked one.
vi.mock("@/server/orders/orderService", () => ({
  recordNetopiaNotification: (...args: unknown[]) => recordNetopiaNotification(...args),
}));

import { extractNotificationFields, handler } from "../../../netlify/functions/payments-netopia-notify";
import { hashRequestBody } from "@/server/security/netopiaVerification";

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

const POS_SIGNATURE = "POS-SIGNATURE-VALUE";

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function signJwt(payload: Record<string, unknown>, signingKey: string): string {
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${body}`);
  signer.end();
  return `${header}.${body}.${signer.sign(signingKey).toString("base64url")}`;
}

function validJwtFor(rawBody: string, overrides: Record<string, unknown> = {}): string {
  return signJwt({ iss: "NETOPIA Payments", aud: POS_SIGNATURE, sub: hashRequestBody(rawBody), ...overrides }, privateKey);
}

function buildEvent(body: string, token: string | undefined, queryStringParameters: Record<string, string> | null = null) {
  return {
    httpMethod: "POST",
    body,
    isBase64Encoded: false,
    headers: token ? { "verification-token": token } : {},
    queryStringParameters,
  } as never;
}

const ENV_KEYS = ["NETOPIA_PUBLIC_KEY", "NETOPIA_POS_SIGNATURE", "CONTEXT"] as const;
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  recordNetopiaNotification.mockReset();
  for (const key of ENV_KEYS) saved[key] = process.env[key];
  process.env.NETOPIA_PUBLIC_KEY = publicKey;
  process.env.NETOPIA_POS_SIGNATURE = POS_SIGNATURE;
  delete process.env.CONTEXT;
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

const VALID_BODY = JSON.stringify({ order: { orderID: "D4L-2026-77354A78" }, payment: { ntpID: "ntp-123", status: 3, code: "00", amount: 300 } });

describe("payments-netopia-notify handler", () => {
  it("a valid, verified, successful notification marks the order paid", async () => {
    recordNetopiaNotification.mockResolvedValue({ outcome: "processed", previousStatus: "pending_payment", newStatus: "paid" });
    const res = await handler(buildEvent(VALID_BODY, validJwtFor(VALID_BODY)), { awsRequestId: "req-1" } as never, undefined as never);
    expect(res).toMatchObject({ statusCode: 200, body: JSON.stringify({ errorCode: 0 }) });
    expect(recordNetopiaNotification).toHaveBeenCalledWith({
      orderNumber: "D4L-2026-77354A78",
      providerTransactionId: "ntp-123",
      providerStatus: "00",
      mappedStatus: "paid",
      amountCents: 30000,
    });
  });

  it("an invalid/unverified notification (wrong issuer) cannot mark anything paid -- recordNetopiaNotification is never called", async () => {
    const forgedToken = signJwt({ iss: "Not NETOPIA", aud: POS_SIGNATURE, sub: hashRequestBody(VALID_BODY) }, privateKey);
    const res = await handler(buildEvent(VALID_BODY, forgedToken), { awsRequestId: "req-2" } as never, undefined as never);
    expect(res).toMatchObject({ statusCode: 400, body: JSON.stringify({ errorCode: 1 }) });
    expect(recordNetopiaNotification).not.toHaveBeenCalled();
  });

  it("a missing Verification-token header cannot mark anything paid", async () => {
    const res = await handler(buildEvent(VALID_BODY, undefined), { awsRequestId: "req-3" } as never, undefined as never);
    expect(res).toMatchObject({ statusCode: 400, body: JSON.stringify({ errorCode: 1 }) });
    expect(recordNetopiaNotification).not.toHaveBeenCalled();
  });

  it("a signature from the wrong key cannot mark anything paid", async () => {
    const { privateKey: wrongKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048,
      publicKeyEncoding: { type: "spki", format: "pem" },
      privateKeyEncoding: { type: "pkcs8", format: "pem" },
    });
    const badToken = signJwt({ iss: "NETOPIA Payments", aud: POS_SIGNATURE, sub: hashRequestBody(VALID_BODY) }, wrongKey);
    const res = await handler(buildEvent(VALID_BODY, badToken), { awsRequestId: "req-4" } as never, undefined as never);
    expect(res).toMatchObject({ statusCode: 400, body: JSON.stringify({ errorCode: 1 }) });
    expect(recordNetopiaNotification).not.toHaveBeenCalled();
  });

  it("a duplicate notification (already recorded) is acknowledged without re-processing", async () => {
    recordNetopiaNotification.mockResolvedValue({ outcome: "duplicate" });
    const res = await handler(buildEvent(VALID_BODY, validJwtFor(VALID_BODY)), { awsRequestId: "req-5" } as never, undefined as never);
    expect(res).toMatchObject({ statusCode: 200, body: JSON.stringify({ errorCode: 0 }) });
  });

  it("an unknown order is handled safely -- acknowledged (no retry storm), never throws", async () => {
    recordNetopiaNotification.mockResolvedValue({ outcome: "order_not_found" });
    const res = await handler(buildEvent(VALID_BODY, validJwtFor(VALID_BODY)), { awsRequestId: "req-6" } as never, undefined as never);
    expect(res).toMatchObject({ statusCode: 200, body: JSON.stringify({ errorCode: 0 }) });
  });

  it("a malformed (non-JSON) body is rejected safely even if the signature is technically valid for those exact bytes", async () => {
    const garbageBody = "not json at all";
    const res = await handler(buildEvent(garbageBody, validJwtFor(garbageBody)), { awsRequestId: "req-7" } as never, undefined as never);
    expect(res).toMatchObject({ statusCode: 400, body: JSON.stringify({ errorCode: 1 }) });
    expect(recordNetopiaNotification).not.toHaveBeenCalled();
  });

  it("valid JSON missing the required order/payment fields is rejected safely", async () => {
    const incompleteBody = JSON.stringify({ order: {}, payment: {} });
    const res = await handler(buildEvent(incompleteBody, validJwtFor(incompleteBody)), { awsRequestId: "req-8" } as never, undefined as never);
    expect(res).toMatchObject({ statusCode: 400, body: JSON.stringify({ errorCode: 1 }) });
    expect(recordNetopiaNotification).not.toHaveBeenCalled();
  });

  it("browser/query-string parameters cannot influence the outcome -- a forged ?status=paid alongside a genuinely invalid notification still fails", async () => {
    const forgedToken = signJwt({ iss: "Not NETOPIA", aud: POS_SIGNATURE, sub: hashRequestBody(VALID_BODY) }, privateKey);
    const res = await handler(
      buildEvent(VALID_BODY, forgedToken, { status: "paid", token: "attacker-supplied" }),
      { awsRequestId: "req-9" } as never,
      undefined as never,
    );
    expect(res).toMatchObject({ statusCode: 400, body: JSON.stringify({ errorCode: 1 }) });
    expect(recordNetopiaNotification).not.toHaveBeenCalled();
  });

  it("query-string parameters have zero effect even on an otherwise-valid, successful notification", async () => {
    recordNetopiaNotification.mockResolvedValue({ outcome: "processed", previousStatus: "pending_payment", newStatus: "paid" });
    const res = await handler(
      buildEvent(VALID_BODY, validJwtFor(VALID_BODY), { status: "cancelled", orderId: "someone-elses-order" }),
      { awsRequestId: "req-10" } as never,
      undefined as never,
    );
    expect(res).toMatchObject({ statusCode: 200, body: JSON.stringify({ errorCode: 0 }) });
    // The order/status actually acted on came from the verified body, not the query string.
    expect(recordNetopiaNotification).toHaveBeenCalledWith(expect.objectContaining({ orderNumber: "D4L-2026-77354A78", mappedStatus: "paid" }));
  });

  it("refuses to run at all under a real production context, even with an otherwise fully valid, verified notification -- checked before signature verification", async () => {
    process.env.CONTEXT = "production";
    const res = await handler(buildEvent(VALID_BODY, validJwtFor(VALID_BODY)), { awsRequestId: "req-prod" } as never, undefined as never);
    expect(res).toMatchObject({ statusCode: 503, body: JSON.stringify({ error: "notify_disabled" }) });
    expect(recordNetopiaNotification).not.toHaveBeenCalled();
  });

  it("never logs the verification token, the raw body, or anything billing-shaped", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    recordNetopiaNotification.mockResolvedValue({ outcome: "processed", previousStatus: "pending_payment", newStatus: "paid" });
    const token = validJwtFor(VALID_BODY);
    await handler(buildEvent(VALID_BODY, token), { awsRequestId: "req-11" } as never, undefined as never);

    const allLoggedText = [...logSpy.mock.calls, ...errorSpy.mock.calls].flat().join(" ");
    expect(allLoggedText).not.toContain(token);
    expect(allLoggedText.toLowerCase()).not.toMatch(/email|phone|billing|address|card|cvv/);

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });
});

describe("extractNotificationFields", () => {
  it("extracts orderNumber/providerTransactionId/status/code/amountCents from a well-formed body", () => {
    expect(extractNotificationFields(JSON.parse(VALID_BODY))).toEqual({
      orderNumber: "D4L-2026-77354A78",
      providerTransactionId: "ntp-123",
      status: 3,
      code: "00",
      amountCents: 30000,
    });
  });

  it("returns null for a non-object body", () => {
    expect(extractNotificationFields(null)).toBeNull();
    expect(extractNotificationFields("a string")).toBeNull();
    expect(extractNotificationFields(42)).toBeNull();
  });

  it("returns null when order or payment is missing", () => {
    expect(extractNotificationFields({ order: { orderID: "X" } })).toBeNull();
    expect(extractNotificationFields({ payment: { ntpID: "X" } })).toBeNull();
  });

  it("returns null when orderID or ntpID is missing or not a string", () => {
    expect(extractNotificationFields({ order: {}, payment: { ntpID: "X" } })).toBeNull();
    expect(extractNotificationFields({ order: { orderID: "X" }, payment: {} })).toBeNull();
    expect(extractNotificationFields({ order: { orderID: 123 }, payment: { ntpID: "X" } })).toBeNull();
  });

  it("defaults amountCents to 0 and code to undefined when absent, without throwing", () => {
    expect(extractNotificationFields({ order: { orderID: "X" }, payment: { ntpID: "Y" } })).toEqual({
      orderNumber: "X",
      providerTransactionId: "Y",
      status: undefined,
      code: undefined,
      amountCents: 0,
    });
  });
});
