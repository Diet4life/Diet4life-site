import type { ProductType, PurchaseMode } from "@/lib/checkout/types";

// Catalog for Services.tsx's nutrition_service / consultation offerings.
// All 5 are now purchaseMode: "checkout" -- approved for real checkout in
// the "single entry point" round (Services.tsx consumes this file directly
// to decide each card's CTA destination; see Services.tsx's `services`
// array, matched by `id`). `productType` matches db/schema.ts's
// product_type enum and decides Checkout.tsx's needsPatient flag (always
// true for both values here) and which orders get the post-payment
// onboarding flow in StatusStates.tsx (anything not "digital_product").
//
// IMPORTANT: flipping purchaseMode here is a data-only change in this file
// -- it does NOT by itself make a service purchasable. Each `id` below must
// also exist as a real, active row in the `products` DB table with a
// matching `slug` (see the SQL handed over separately -- this sandbox has
// no network path to the live/branch Netlify DB, so those rows could not be
// inserted from here).

export interface ServiceOffering {
  id: string;
  name: { ro: string; en: string };
  priceCents: number;
  currency: string;
  purchaseMode: PurchaseMode;
  productType: ProductType;
}

export const services: ServiceOffering[] = [
  {
    id: "primii-pasi",
    name: { ro: "Primii Pași", en: "First Steps" },
    priceCents: 20000,
    currency: "RON",
    purchaseMode: "checkout",
    productType: "nutrition_service",
  },
  {
    id: "consultatie-nutritionala",
    name: { ro: "Consultație Nutrițională", en: "Nutrition Consultation" },
    priceCents: 30000,
    currency: "RON",
    purchaseMode: "checkout",
    productType: "consultation",
  },
  {
    id: "monitorizare-nutritionala",
    name: { ro: "Monitorizare Nutrițională", en: "Nutritional Monitoring" },
    priceCents: 20000,
    currency: "RON",
    purchaseMode: "checkout",
    productType: "nutrition_service",
  },
  {
    id: "program-6-saptamani",
    name: { ro: "Program Nutrițional 6 săptămâni", en: "6-Week Nutrition Program" },
    priceCents: 48000,
    currency: "RON",
    purchaseMode: "checkout",
    productType: "consultation",
  },
  {
    id: "program-3-luni",
    name: { ro: "Program Nutrițional 3 luni", en: "3-Month Nutrition Program" },
    priceCents: 85000,
    currency: "RON",
    purchaseMode: "checkout",
    productType: "consultation",
  },
];
