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
    id: "ghidaj-whatsapp",
    name: { ro: "Ghidaj WhatsApp", en: "WhatsApp Guidance" },
    priceCents: 20000,
    currency: "RON",
    purchaseMode: "contact",
  },
  {
    id: "consultatie-nutritionala",
    name: { ro: "Consultație nutrițională", en: "Nutrition Consultation" },
    priceCents: 30000,
    currency: "RON",
    purchaseMode: "contact",
  },
  {
    id: "pachet-echilibru",
    name: { ro: "Pachet Echilibru", en: "Balance Package" },
    priceCents: 60000,
    currency: "RON",
    purchaseMode: "contact",
  },
  {
    id: "pachet-transformare",
    name: { ro: "Pachet Transformare", en: "Transformation Package" },
    priceCents: 90000,
    currency: "RON",
    purchaseMode: "contact",
  },
];
