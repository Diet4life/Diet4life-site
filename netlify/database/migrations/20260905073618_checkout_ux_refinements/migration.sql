ALTER TABLE "billing_details" ADD COLUMN "full_name" text;--> statement-breakpoint
ALTER TABLE "billing_details" ADD COLUMN "country_code" text DEFAULT 'RO' NOT NULL;--> statement-breakpoint
ALTER TABLE "patient_details" ADD COLUMN "full_name" text;--> statement-breakpoint
ALTER TABLE "billing_details" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "billing_details" DROP COLUMN "last_name";--> statement-breakpoint
ALTER TABLE "billing_details" DROP COLUMN "country";--> statement-breakpoint
ALTER TABLE "patient_details" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "patient_details" DROP COLUMN "last_name";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "invoice_status" SET DEFAULT 'pending'::"invoice_status";