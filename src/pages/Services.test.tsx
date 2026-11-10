import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Router } from "wouter";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Services, { MONITORING, serviceCtaHref, services } from "./Services";
import { services as checkoutCatalog } from "@/lib/catalog/services";

// 2026-11-09: the Services/Servicii checkout-CTA audit. Every displayed
// service card must render a CTA that opens a working checkout for that
// exact service -- these tests render the real page (SSR, same pattern as
// StatusStates.test.tsx) and check the actual HTML, not just the data
// arrays, so a future change to the JSX itself (not just the data) would
// also be caught here.

function render() {
  return renderToStaticMarkup(
    <Router ssrPath="/services">
      <LanguageProvider>
        <Services />
      </LanguageProvider>
    </Router>,
  );
}

// Every paid service currently displayed on the page, per the audit's
// inventory (4 "new patient" cards + the separate Monitorizare section).
const ALL_DISPLAYED_SERVICE_IDS = [
  "primii-pasi",
  "consultatie-nutritionala",
  "program-6-saptamani",
  "program-3-luni",
  "monitorizare-nutritionala",
];

describe("Services page inventory", () => {
  it("displays exactly the 5 services covered by this audit -- the 4 cards plus the separate Monitorizare section, nothing missing, nothing extra", () => {
    const displayedIds = [...services.map((s) => s.id), MONITORING.id];
    expect(displayedIds.sort()).toEqual([...ALL_DISPLAYED_SERVICE_IDS].sort());
  });

  it("every displayed service has a matching checkout-catalog entry with purchaseMode 'checkout' -- a fixed-price service never silently falls back to /contact", () => {
    for (const id of ALL_DISPLAYED_SERVICE_IDS) {
      const entry = checkoutCatalog.find((s) => s.id === id);
      expect(entry, `missing catalog entry for "${id}"`).toBeDefined();
      expect(entry?.purchaseMode).toBe("checkout");
    }
  });
});

describe("serviceCtaHref", () => {
  it("resolves every advertised paid service to its own /checkout/:slug, never /contact", () => {
    for (const id of ALL_DISPLAYED_SERVICE_IDS) {
      expect(serviceCtaHref(id)).toBe(`/checkout/${id}`);
    }
  });

  it("falls back to /contact for an id with no catalog entry at all (never guesses a checkout URL for an unknown service)", () => {
    expect(serviceCtaHref("some-made-up-service")).toBe("/contact");
  });
});

describe("Services page rendering -- name, price, and CTA for every advertised service", () => {
  const html = render();

  for (const id of ALL_DISPLAYED_SERVICE_IDS) {
    const entry = checkoutCatalog.find((s) => s.id === id);
    if (!entry) throw new Error(`test fixture bug: no catalog entry for "${id}"`);

    it(`"${entry.name.ro}" (${id}): card shows the catalog name, the catalog price, and a CTA pointing at its own checkout slug`, () => {
      expect(html).toContain(entry.name.ro);
      expect(html).toContain(`${entry.priceCents / 100} lei`);
      expect(html).toContain(`href="/checkout/${id}"`);
      expect(html).toContain(`data-testid="button-service-${id}"`);
    });
  }

  it("the displayed price for every card is computed from the shared catalog's priceCents, not a separately hand-typed number", () => {
    const allEntries = [...services, MONITORING];
    for (const entry of allEntries) {
      const catalogEntry = checkoutCatalog.find((s) => s.id === entry.id);
      expect(catalogEntry).toBeDefined();
      expect(entry.price).toBe((catalogEntry?.priceCents ?? NaN) / 100);
      expect(entry.nameRo).toBe(catalogEntry?.name.ro);
      expect(entry.nameEn).toBe(catalogEntry?.name.en);
    }
  });

  // The exact names/prices visible on the live site today (per the task's
  // "use the names and prices already displayed" constraint) -- pinned
  // explicitly so a future catalog edit that accidentally changes one of
  // these is caught here, not discovered by a customer.
  it("pins the exact currently-advertised name/price pairs (regression guard -- never invent/change a price)", () => {
    const expected: Record<string, { name: string; price: number }> = {
      "primii-pasi": { name: "Primii Pași", price: 200 },
      "consultatie-nutritionala": { name: "Consultație Nutrițională", price: 300 },
      "program-6-saptamani": { name: "Program Nutrițional 6 săptămâni", price: 480 },
      "program-3-luni": { name: "Program Nutrițional 3 luni", price: 850 },
      "monitorizare-nutritionala": { name: "Monitorizare Nutrițională", price: 200 },
    };
    for (const entry of [...services, MONITORING]) {
      expect(entry.nameRo).toBe(expected[entry.id].name);
      expect(entry.price).toBe(expected[entry.id].price);
    }
  });
});
