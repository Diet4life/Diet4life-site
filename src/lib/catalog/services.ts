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
  originalPriceCents?: number;
  currency: string;
  purchaseMode: PurchaseMode;
}

export const services: ServiceOffering[] = [
  {
    id: "consultatie-nutritie",
    name: { ro: "Consultație de nutriție", en: "Nutrition consultation" },
    priceCents: 30000,
    currency: "RON",
    purchaseMode: "contact",
  },
  {
    id: "ghidaj-whatsapp-7zile",
    name: { ro: "Ghidaj WhatsApp pe 7 zile", en: "7-day WhatsApp guidance" },
    priceCents: 15000,
    currency: "RON",
    purchaseMode: "contact",
  },
  {
    id: "pachet-start",
    name: { ro: "Pachet Start", en: "Start Package" },
    priceCents: 45000,
    originalPriceCents: 50000,
    currency: "RON",
    purchaseMode: "contact",
  },
  {
    id: "pachet-echilibru",
    name: { ro: "Pachet Echilibru", en: "Balance Package" },
    priceCents: 75000,
    originalPriceCents: 85000,
    currency: "RON",
    purchaseMode: "contact",
  },
  {
    id: "pachet-transformare",
    name: { ro: "Pachet Transformare", en: "Transformation Package" },
    priceCents: 95000,
    originalPriceCents: 110000,
    currency: "RON",
    purchaseMode: "contact",
  },
];
