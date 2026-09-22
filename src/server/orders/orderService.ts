import { and, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { billingDetails, orders, patientDetails, payments, products } from "../../../db/schema";
import { generateOrderNumber, generatePublicStatusToken } from "@/server/security/publicToken";
import { isProductionContext } from "@/server/environment";
import { resolveMonotonicOrderStatus, type OrderStatus } from "./netopiaStatusMapping";
import type { BillingInput, PatientInput } from "@/lib/checkout/schemas";

export class ProductNotFoundError extends Error {}
export class PatientDetailsRequiredError extends Error {}
// Phase 1 has no real payment provider yet -- order creation is
// intentionally refused in the production context so nobody can complete a
// checkout that looks operational but never actually charges anything.
// Deploy previews and local/dev keep working normally for testing. Remove
// this guard once Phase 2 wires a real NETOPIA callback.
export class CheckoutDisabledInProductionError extends Error {}

function billingRow(orderId: number, billing: BillingInput) {
  const shared = {
    orderId,
    personType: billing.personType,
    countryCode: billing.countryCode,
    county: billing.county,
    city: billing.city,
    streetAddress: billing.streetAddress,
    buildingDetails: billing.buildingDetails ?? null,
    postalCode: billing.postalCode ?? null,
    email: billing.email,
    phone: billing.phone,
  };

  if (billing.personType === "individual") {
    return {
      ...shared,
      fullName: billing.fullName,
      companyName: null,
      taxId: null,
      tradeRegistryNumber: null,
    };
  }

  return {
    ...shared,
    fullName: null,
    companyName: billing.companyName,
    taxId: billing.taxId,
    tradeRegistryNumber: billing.tradeRegistryNumber ?? null,
  };
}

function patientRow(orderId: number, patient: PatientInput) {
  return {
    orderId,
    sameAsBuyer: patient.sameAsBuyer,
    fullName: patient.sameAsBuyer ? null : patient.fullName ?? null,
    email: patient.sameAsBuyer ? null : patient.email ?? null,
    phone: patient.sameAsBuyer ? null : patient.phone ?? null,
  };
}

// Checks both err.code directly (the raw pg driver error shape) and
// err.cause.code -- drizzle-orm@1.0.0-beta wraps every query error in a
// DrizzleQueryError whose own .code is undefined, with the real pg error
// (the one carrying .code === "23505") nested at .cause. Found via a real
// scratch-Postgres duplicate-insert test while implementing
// recordNetopiaNotification()'s idempotency path -- the original
// top-level-only check silently never matched, so a genuine duplicate
// notification threw instead of being caught as "duplicate". This also
// retroactively fixes createOrder()'s order_number/public_status_token
// collision-retry loop below, which had the same latent bug (never
// exercised before, since a random-token collision is astronomically
// unlikely to occur in ordinary testing).
function isUniqueViolation(err: unknown): boolean {
  const hasCode23505 = (value: unknown): boolean =>
    typeof value === "object" && value !== null && (value as { code?: string }).code === "23505";
  return hasCode23505(err) || hasCode23505((err as { cause?: unknown } | null)?.cause);
}

export async function listActiveProducts() {
  const db = getDb();
  const conditions = [eq(products.active, true)];
  // Demo/test rows (is_demo=true) are visible in dev/deploy-preview for QA,
  // never in production -- even if `active` was mistakenly left true.
  if (isProductionContext()) {
    conditions.push(eq(products.isDemo, false));
  }
  return db.select().from(products).where(and(...conditions));
}

export interface CreateOrderInput {
  productSlug: string;
  billing: BillingInput;
  patient?: PatientInput;
}

// The single place order prices are decided. The browser never supplies a
// price -- it is always read fresh from the products table here.
export async function createOrder(input: CreateOrderInput) {
  if (isProductionContext()) {
    throw new CheckoutDisabledInProductionError(
      "Online checkout is not yet available in production (no payment provider is wired up)",
    );
  }

  const db = getDb();

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.slug, input.productSlug), eq(products.active, true)));

  if (!product) {
    throw new ProductNotFoundError(`Unknown or inactive product: ${input.productSlug}`);
  }

  const needsPatient = product.productType !== "digital_product";
  if (needsPatient && !input.patient) {
    throw new PatientDetailsRequiredError("patient details are required for this product type");
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const [order] = await db
        .insert(orders)
        .values({
          orderNumber: generateOrderNumber(),
          publicStatusToken: generatePublicStatusToken(),
          productId: product.id,
          productNameSnapshot: product.name,
          priceSnapshotCents: product.priceCents,
          currency: product.currency,
          customerType: input.billing.personType,
          status: "pending_payment",
          invoiceStatus: "pending",
          confirmationEmailStatus: "pending",
          deliveryStatus: product.productType === "digital_product" ? "pending" : null,
        })
        .returning();

      await db.insert(billingDetails).values(billingRow(order.id, input.billing));

      if (needsPatient && input.patient) {
        await db.insert(patientDetails).values(patientRow(order.id, input.patient));
      }

      return order;
    } catch (err) {
      lastError = err;
      if (isUniqueViolation(err)) continue; // order_number/public_status_token collision, retry
      throw err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("failed to create order");
}

// Shared by getOrderByPublicToken() and getOrderByOrderNumber() below --
// both must expose exactly the same minimal, public fields regardless of
// which identifier resolved the row. Never billing_details/patient_details.
const PUBLIC_ORDER_STATUS_FIELDS = {
  orderNumber: orders.orderNumber,
  status: orders.status,
  productName: orders.productNameSnapshot,
  priceSnapshotCents: orders.priceSnapshotCents,
  currency: orders.currency,
  invoiceStatus: orders.invoiceStatus,
  deliveryStatus: orders.deliveryStatus,
  productType: products.productType,
};

// Resolves an order strictly by its public_status_token. Returns only the
// minimum the checkout-result UI needs; billing_details/patient_details are
// never included.
export async function getOrderByPublicToken(token: string) {
  const db = getDb();
  const [row] = await db
    .select(PUBLIC_ORDER_STATUS_FIELDS)
    .from(orders)
    .innerJoin(products, eq(orders.productId, products.id))
    .where(eq(orders.publicStatusToken, token));

  return row ?? null;
}

// Resolves an order by its human-facing order_number -- the "orderID"
// NETOPIA echoes back on its hosted-page return redirect. Added because,
// on a real sandbox payment, NETOPIA's redirect to redirectUrl dropped the
// ?token=<public_status_token> we requested entirely and substituted its
// own ?orderId=<order_number> instead (see CheckoutReturn.tsx and
// netlify/functions/orders-status.ts's resolveOrderIdentifier()).
//
// order_number is still NOT a security boundary for payment authorization
// -- it never has been and still isn't -- but this is a strictly read-only
// lookup that returns the exact same minimal, public fields as
// getOrderByPublicToken() above (no billing/patient data). There is no
// write path here at all: only a verified server-side NETOPIA notify may
// ever change order.status (payments-netopia-notify.ts, still a stub,
// still never marks anything paid).
export async function getOrderByOrderNumber(orderNumber: string) {
  const db = getDb();
  const [row] = await db
    .select(PUBLIC_ORDER_STATUS_FIELDS)
    .from(orders)
    .innerJoin(products, eq(orders.productId, products.id))
    .where(eq(orders.orderNumber, orderNumber));

  return row ?? null;
}

// Resolves an order (also strictly by public_status_token) with the billing
// fields a payment-provider request needs to be built. Separate from
// getOrderByPublicToken() above because that one is deliberately minimal for
// the public status UI -- this one is for payments-initiate.ts only, never
// returned to the browser as-is. Still excludes patient_details (never
// relevant to a payment request) and never includes medical data (there is
// none in this schema).
//
// county/postalCode/streetAddress/buildingDetails were added alongside
// email/phone/firstName-lastName/city so NETOPIA's required Address schema
// (state/postalCode/details) can be filled from data checkout already
// collects, instead of inventing placeholder values -- no schema/migration
// change, this is still a read of existing billing_details columns.
export async function getOrderForPaymentInitiation(token: string) {
  const db = getDb();
  const [row] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      productName: orders.productNameSnapshot,
      priceSnapshotCents: orders.priceSnapshotCents,
      currency: orders.currency,
      billingPersonType: billingDetails.personType,
      billingFullName: billingDetails.fullName,
      billingCompanyName: billingDetails.companyName,
      billingEmail: billingDetails.email,
      billingPhone: billingDetails.phone,
      billingCity: billingDetails.city,
      billingCountryCode: billingDetails.countryCode,
      billingCounty: billingDetails.county,
      billingPostalCode: billingDetails.postalCode,
      billingStreetAddress: billingDetails.streetAddress,
      billingBuildingDetails: billingDetails.buildingDetails,
    })
    .from(orders)
    .innerJoin(billingDetails, eq(billingDetails.orderId, orders.id))
    .where(eq(orders.publicStatusToken, token));

  return row ?? null;
}

// Read-only context for the post-payment confirmation email (see
// src/server/email/orderConfirmationEmail.ts) -- called separately from
// payments-netopia-notify.ts, after recordNetopiaNotification() below has
// already committed the paid transition, never as part of that same
// transaction (sending an email is not something a DB transaction should
// ever be able to roll back or block on). Deliberately excludes
// billing address fields (county/city/street/postal) -- the confirmation
// email only ever needs a name and an email address to send to, not a full
// billing address.
export async function getOrderConfirmationContext(orderNumber: string) {
  const db = getDb();
  const [row] = await db
    .select({
      orderNumber: orders.orderNumber,
      productName: orders.productNameSnapshot,
      productType: products.productType,
      billingFullName: billingDetails.fullName,
      billingCompanyName: billingDetails.companyName,
      billingEmail: billingDetails.email,
      patientSameAsBuyer: patientDetails.sameAsBuyer,
      patientFullName: patientDetails.fullName,
      patientEmail: patientDetails.email,
    })
    .from(orders)
    .innerJoin(products, eq(orders.productId, products.id))
    .innerJoin(billingDetails, eq(billingDetails.orderId, orders.id))
    .leftJoin(patientDetails, eq(patientDetails.orderId, orders.id))
    .where(eq(orders.orderNumber, orderNumber));

  return row ?? null;
}

// Sets orders.confirmation_email_status -- an existing column that has
// tracked nothing until now (no order-confirmation email infrastructure
// existed before this round; see CLAUDE.md). Never gates order.status --
// a failed email send does not undo a real payment, it's tracked
// separately here purely for support/debugging visibility.
export async function markConfirmationEmailStatus(
  orderNumber: string,
  status: "sent" | "failed",
): Promise<void> {
  const db = getDb();
  await db.update(orders).set({ confirmationEmailStatus: status }).where(eq(orders.orderNumber, orderNumber));
}

export interface RecordNetopiaNotificationInput {
  orderNumber: string; // NETOPIA's echoed-back "orderID" -- our order_number
  providerTransactionId: string; // NETOPIA's ntpID
  providerStatus: string; // raw provider status/code text, for support/debugging only
  mappedStatus: "paid" | "payment_failed" | "payment_processing";
  amountCents: number; // as reported by NETOPIA for this transaction
  // currency is deliberately NOT an input here -- it's read from the
  // order itself inside the same transaction below, rather than trusted
  // from the notification body (not confirmed to reliably carry one, and
  // an order's currency is already known once it's found by order_number).
}

export type RecordNetopiaNotificationResult =
  | { outcome: "order_not_found" }
  | { outcome: "duplicate" }
  | { outcome: "processed"; previousStatus: OrderStatus; newStatus: OrderStatus };

// The only place order.status may ever move to "paid" -- called exclusively
// from payments-netopia-notify.ts, and only after verifyNetopiaNotification()
// has confirmed the notification is authentically from NETOPIA (see
// src/server/security/netopiaVerification.ts). Nothing here trusts a
// browser-supplied value of any kind.
//
// Idempotency has two layers:
//   1. payments.provider_transaction_id is UNIQUE (see db/schema.ts) -- a
//      second delivery of the exact same NETOPIA transaction hits that
//      constraint and is reported back as "duplicate" without touching
//      orders.status again.
//   2. resolveMonotonicOrderStatus() (netopiaStatusMapping.ts) additionally
//      refuses to move an order out of a terminal status (paid/
//      payment_failed/cancelled/refunded), so even a *different* NETOPIA
//      transaction ID that maps to a worse-sounding status than the
//      order's current one (e.g. a late "processing" notification
//      arriving after an earlier "paid" one, possible with at-least-once
//      webhook delivery) can never regress an already-resolved order.
// Both the payments insert and the conditional orders update happen inside
// one transaction, so two near-simultaneous deliveries of the same
// transaction can't both "win" a race and double-apply a status change.
export async function recordNetopiaNotification(
  input: RecordNetopiaNotificationInput,
): Promise<RecordNetopiaNotificationResult> {
  const db = getDb();

  return db.transaction(async (tx) => {
    const [order] = await tx
      .select({ id: orders.id, status: orders.status, currency: orders.currency })
      .from(orders)
      .where(eq(orders.orderNumber, input.orderNumber));

    if (!order) {
      return { outcome: "order_not_found" };
    }

    try {
      await tx.insert(payments).values({
        orderId: order.id,
        provider: "netopia",
        providerTransactionId: input.providerTransactionId,
        providerStatus: input.providerStatus,
        amountCents: input.amountCents,
        currency: order.currency,
      });
    } catch (err) {
      if (isUniqueViolation(err)) {
        return { outcome: "duplicate" };
      }
      throw err;
    }

    const nextStatus = resolveMonotonicOrderStatus(order.status, input.mappedStatus);
    if (nextStatus !== null) {
      await tx
        .update(orders)
        .set({ status: nextStatus, paidAt: nextStatus === "paid" ? new Date() : undefined })
        .where(eq(orders.id, order.id));
    }

    return { outcome: "processed", previousStatus: order.status, newStatus: nextStatus ?? order.status };
  });
}
