// Shared checkout/order types. Mirrors the enum values defined in
// db/schema.ts, but declared independently so frontend code never imports
// the Drizzle schema (which pulls in server-only DB dependencies).

export type ProductType = "digital_product" | "nutrition_service" | "consultation";

export type PurchaseMode = "checkout" | "contact";

export type CustomerType = "individual" | "company";

export type OrderStatus =
  | "pending_payment"
  | "payment_processing"
  | "paid"
  | "payment_failed"
  | "cancelled"
  | "refunded";

export type InvoiceStatus = "not_required" | "pending" | "issued" | "failed";

export type ConfirmationEmailStatus = "pending" | "sent" | "failed";

export type DeliveryStatus = "pending" | "ready" | "delivered" | "failed" | null;

export interface Product {
  id: number;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  priceCents: number;
  currency: string;
  productType: ProductType;
  active: boolean;
}

export interface PublicOrderStatus {
  orderNumber: string;
  status: OrderStatus;
  productName: string;
  productType: ProductType;
  totalCents: number;
  currency: string;
  invoiceStatus: InvoiceStatus;
  deliveryStatus: DeliveryStatus;
}
