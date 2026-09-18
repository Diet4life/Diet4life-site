import { and, eq } from "drizzle-orm";
import { getDb } from "@/server/db/client";
import { billingDetails, orders, patientDetails, products } from "../../../db/schema";
import { generateOrderNumber, generatePublicStatusToken } from "@/server/security/publicToken";
import { isProductionContext } from "@/server/environment";
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

function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "23505";
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
