// The checkout submit flow, extracted from Checkout.tsx so the exact
// execution path (order creation -> payment initiation -> navigation) can
// be tested without a browser. Checkout.tsx calls this and only maps the
// returned result to a toast or a navigation.
//
// Before this module existed, any payments-initiate failure (non-2xx,
// network error, missing/odd paymentURL) silently redirected to
// /checkout/retur, which renders the "pending_payment" card. That made a
// failed initiation look like a successfully registered pending payment.
// Now a failure comes back as `initiate_failed`, and the caller shows it as
// an error.

export type CheckoutSubmitResult =
  // Checkout is disabled for this build (the real production site). No
  // request was made at all.
  | { kind: "disabled" }
  // orders-create failed. No order exists.
  | { kind: "order_failed" }
  // The order exists (pending_payment) but payment initiation failed. The
  // browser must NOT be sent to the pending page as if all were fine.
  | { kind: "initiate_failed"; publicStatusToken: string }
  // Initiation succeeded and returned a NETOPIA sandbox payment page.
  | { kind: "redirect"; url: string };

export interface SubmitCheckoutDeps {
  fetch: typeof fetch;
  /** isCheckoutDisabledInBuild() in the real app. */
  checkoutDisabled: boolean;
}

// Only NETOPIA's sandbox hosted payment page is an acceptable redirect
// target. Anything else (another host, http://, a relative path, garbage)
// counts as an initiation failure, so a bad or unexpected server response
// can never become an open redirect.
//
// Note the two different sandbox hostnames: the API call goes to
// secure.sandbox.netopia-payments.com (dot), but the hosted card page
// NETOPIA returns in payment.paymentURL is on
// secure-sandbox.netopia-payments.com (hyphen), e.g.
// https://secure-sandbox.netopia-payments.com/ui/card?p=... The first
// version of this check only allowed the dot form and rejected every real
// sandbox paymentURL.
const NETOPIA_SANDBOX_PAYMENT_HOSTS = new Set([
  "secure-sandbox.netopia-payments.com",
  "secure.sandbox.netopia-payments.com",
  "sandbox.netopia-payments.com",
]);

export function isNetopiaSandboxPaymentUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && NETOPIA_SANDBOX_PAYMENT_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export async function submitCheckout(payload: unknown, deps: SubmitCheckoutDeps): Promise<CheckoutSubmitResult> {
  if (deps.checkoutDisabled) return { kind: "disabled" };

  let publicStatusToken: string;
  try {
    const res = await deps.fetch("/.netlify/functions/orders-create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { kind: "order_failed" };
    const data = (await res.json()) as { publicStatusToken?: unknown };
    if (typeof data.publicStatusToken !== "string" || !data.publicStatusToken) return { kind: "order_failed" };
    publicStatusToken = data.publicStatusToken;
  } catch {
    return { kind: "order_failed" };
  }

  try {
    const res = await deps.fetch("/.netlify/functions/payments-initiate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ publicStatusToken }),
    });
    if (res.ok) {
      const data = (await res.json()) as { paymentURL?: unknown };
      if (isNetopiaSandboxPaymentUrl(data.paymentURL)) {
        return { kind: "redirect", url: data.paymentURL };
      }
    }
  } catch {
    // reported below as initiate_failed
  }
  return { kind: "initiate_failed", publicStatusToken };
}
