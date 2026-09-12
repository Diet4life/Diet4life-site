import type { PurchaseMode } from "@/lib/checkout/types";

// Architecture-ready catalog for Services.tsx's nutrition_service /
// consultation offerings. Every item defaults to purchaseMode: "contact"
// (its current, unchanged behavior -- CTA links to /contact) until it is
// individually approved for checkout. Flipping an item to "checkout" is a
// data-only change here; Services.tsx itself is not wired to read this file
// yet (see Phase 1 report -- kept out of scope since nothing here changes
// its current behavior).

export interface ServiceOffering {
  id: string;
  name: { ro: string; en: string };
  priceCents: number;
  currency: string;
  purchaseMode: PurchaseMode;
}

export const services: ServiceOffering[] = [
  {
    id: "ghidaj-nutritional",
    name: { ro: "Ghidaj Nutrițional", en: "Nutritional Guidance" },
    priceCents: 20000,
    currency: "RON",
    purchaseMode: "contact",
  },
  {
    id: "consultatie-nutritionala",
    name: { ro: "Consultație Nutrițională", en: "Nutrition Consultation" },
    priceCents: 30000,
    currency: "RON",
    purchaseMode: "contact",
  },
  {
    id: "program-6-saptamani",
    name: { ro: "Program Nutrițional 6 săptămâni", en: "6-Week Nutrition Program" },
    priceCents: 60000,
    currency: "RON",
    purchaseMode: "contact",
  },
  {
    id: "program-3-luni",
    name: { ro: "Program Nutrițional 3 luni", en: "3-Month Nutrition Program" },
    priceCents: 90000,
    currency: "RON",
    purchaseMode: "contact",
  },
  {
    id: "monitorizare-nutritionala",
    name: { ro: "Monitorizare nutrițională", en: "Nutritional Monitoring" },
    priceCents: 18000,
    currency: "RON",
    purchaseMode: "contact",
  },
];
