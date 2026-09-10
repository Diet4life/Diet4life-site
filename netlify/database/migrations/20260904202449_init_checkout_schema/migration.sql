CREATE TYPE "confirmation_email_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "customer_type" AS ENUM('individual', 'company');--> statement-breakpoint
CREATE TYPE "delivery_status" AS ENUM('pending', 'ready', 'delivered', 'failed');--> statement-breakpoint
CREATE TYPE "invoice_status" AS ENUM('not_required', 'pending', 'issued', 'failed');--> statement-breakpoint
CREATE TYPE "order_status" AS ENUM('pending_payment', 'payment_processing', 'paid', 'payment_failed', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "product_type" AS ENUM('digital_product', 'nutrition_service', 'consultation');--> statement-breakpoint
CREATE TABLE "billing_details" (
	"id" serial PRIMARY KEY,
	"order_id" integer NOT NULL UNIQUE,
	"person_type" "customer_type" NOT NULL,
	"first_name" text,
	"last_name" text,
	"company_name" text,
	"tax_id" text,
	"trade_registry_number" text,
	"country" text DEFAULT 'România' NOT NULL,
	"county" text NOT NULL,
	"city" text NOT NULL,
	"street_address" text NOT NULL,
	"building_details" text,
	"postal_code" text,
	"email" text NOT NULL,
	"phone" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY,
	"order_number" text NOT NULL UNIQUE,
	"public_status_token" text NOT NULL UNIQUE,
	"product_id" integer NOT NULL,
	"product_name_snapshot" text NOT NULL,
	"price_snapshot_cents" integer NOT NULL,
	"currency" text NOT NULL,
	"customer_type" "customer_type" NOT NULL,
	"status" "order_status" DEFAULT 'pending_payment'::"order_status" NOT NULL,
	"invoice_status" "invoice_status" DEFAULT 'not_required'::"invoice_status" NOT NULL,
	"confirmation_email_status" "confirmation_email_status" DEFAULT 'pending'::"confirmation_email_status" NOT NULL,
	"delivery_status" "delivery_status",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "patient_details" (
	"id" serial PRIMARY KEY,
	"order_id" integer NOT NULL UNIQUE,
	"same_as_buyer" boolean DEFAULT true NOT NULL,
	"first_name" text,
	"last_name" text,
	"email" text,
	"phone" text
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY,
	"order_id" integer NOT NULL,
	"provider" text NOT NULL,
	"provider_transaction_id" text NOT NULL UNIQUE,
	"provider_status" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"currency" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_event_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY,
	"slug" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"short_description" text NOT NULL,
	"description" text NOT NULL,
	"price_cents" integer NOT NULL,
	"currency" text DEFAULT 'RON' NOT NULL,
	"product_type" "product_type" NOT NULL,
	"active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "billing_details" ADD CONSTRAINT "billing_details_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id");--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_id_products_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id");--> statement-breakpoint
ALTER TABLE "patient_details" ADD CONSTRAINT "patient_details_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id");--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_orders_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id");