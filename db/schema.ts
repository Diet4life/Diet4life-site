import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// ---- enums --------------------------------------------------------------

export const productTypeEnum = pgEnum("product_type", [
  "digital_product",
  "nutrition_service",
  "consultation",
]);

export const customerTypeEnum = pgEnum("customer_type", [
  "individual",
  "company",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment",
  "payment_processing",
  "paid",
  "payment_failed",
  "cancelled",
  "refunded",
]);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "not_required",
  "pending",
  "issued",
  "failed",
]);

export const confirmationEmailStatusEnum = pgEnum("confirmation_email_status", [
  "pending",
  "sent",
  "failed",
]);

export const deliveryStatusEnum = pgEnum("delivery_status", [
  "pending",
  "ready",
  "delivered",
  "failed",
]);

// ---- products -------------------------------------------------------------
// Catalog of everything purchasable through checkout. Phase 1 only ever
// contains real digital_product rows (see src/lib/catalog/products.ts) --
// nutrition_service / consultation rows are added later, per item, only
// once a package is individually approved for checkout (purchaseMode).

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  shortDescription: text("short_description").notNull(),
  description: text("description").notNull(),
  priceCents: integer("price_cents").notNull(),
  currency: text("currency").notNull().default("RON"),
  productType: productTypeEnum("product_type").notNull(),
  active: boolean("active").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---- orders -----------------------------------------------------------
// public_status_token is the only identifier ever exposed to the browser
// for status lookups -- order_number is a human-readable/sequential label
// (invoice-facing) and must never be used to resolve order status.

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  publicStatusToken: text("public_status_token").notNull().unique(),

  productId: integer("product_id").notNull().references(() => products.id),
  productNameSnapshot: text("product_name_snapshot").notNull(),
  priceSnapshotCents: integer("price_snapshot_cents").notNull(),
  currency: text("currency").notNull(),

  customerType: customerTypeEnum("customer_type").notNull(),

  status: orderStatusEnum("status").notNull().default("pending_payment"),
  invoiceStatus: invoiceStatusEnum("invoice_status").notNull().default("pending"),
  confirmationEmailStatus: confirmationEmailStatusEnum("confirmation_email_status")
    .notNull()
    .default("pending"),
  deliveryStatus: deliveryStatusEnum("delivery_status"), // null unless digital_product

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});

// ---- billing_details ----------------------------------------------------
// Buyer / billing person. Never joined with patient_details in application
// code beyond the shared order_id foreign key -- no medical data here.

export const billingDetails = pgTable("billing_details", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),

  personType: customerTypeEnum("person_type").notNull(), // individual | company

  // individual
  fullName: text("full_name"),

  // company / PFA
  companyName: text("company_name"),
  taxId: text("tax_id"), // CUI/CIF
  tradeRegistryNumber: text("trade_registry_number"),

  // shared address block. country_code is ISO 3166-1 alpha-2 (e.g. "RO",
  // "DE", "US") -- the UI shows a localized country name, but the DB always
  // stores the standard code. county/city/street_address are reused for
  // every country; the checkout UI relabels them per country (Județ/State,
  // Localitate/City, Stradă/Address) without needing separate columns.
  countryCode: text("country_code").notNull().default("RO"),
  county: text("county").notNull(),
  city: text("city").notNull(),
  streetAddress: text("street_address").notNull(),
  buildingDetails: text("building_details"), // bloc/scară/apartament
  postalCode: text("postal_code"),

  email: text("email").notNull(),
  phone: text("phone").notNull(),
}, (table) => ({
  orderUnique: unique().on(table.orderId),
}));

// ---- patient_details ------------------------------------------------------
// Only present for nutrition_service / consultation orders. Zero medical
// fields by design -- name/email/phone only.

export const patientDetails = pgTable("patient_details", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),

  sameAsBuyer: boolean("same_as_buyer").notNull().default(true),
  fullName: text("full_name"),
  email: text("email"),
  phone: text("phone"),
}, (table) => ({
  orderUnique: unique().on(table.orderId),
}));

// ---- payments ---------------------------------------------------------
// Explicit fields only -- no raw provider payload is ever stored here.
// provider_transaction_id is the idempotency key for the (future) NETOPIA
// callback handler. Schema exists in Phase 1; no NETOPIA integration writes
// to this table yet.

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),

  provider: text("provider").notNull(), // e.g. 'netopia'
  providerTransactionId: text("provider_transaction_id").notNull().unique(),
  providerStatus: text("provider_status").notNull(),

  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  lastEventAt: timestamp("last_event_at", { withTimezone: true }).notNull().defaultNow(),
});
