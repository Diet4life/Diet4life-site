import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { services } from "./services";

// 2026-11-09: the live `products` table and this file are two independently
// maintained sources describing the same checkout-enabled services -- the
// real risk flagged by this round's Services-page checkout-CTA audit: some
// service cards showed "Acest produs nu este disponibil" because the DB
// side had never caught up with this catalog (there is no automated sync,
// and `scripts/seed-services-products.sql` -- the only script that has ever
// created these rows -- has to be run by hand against the live/branch DB).
//
// This test can't reach the live DB from here (no network path, same
// constraint as everywhere else in this project -- see CLAUDE.md), so it
// can't prove the live table is correct. What it CAN do is catch the other
// half of that risk in CI: whenever the SEED SCRIPT ITSELF drifts from this
// catalog -- a renamed slug, a changed price, a service added to one file
// but not the other -- this test fails before either file reaches a real
// deploy. Re-running the (already-correct, idempotent) seed script against
// the live/branch DB is still the one remaining manual step this test
// cannot replace.
//
// Parses the SQL file's fixed, single-statement `INSERT ... VALUES (...), (...)`
// shape directly (never executes any SQL) -- good enough for this one
// hand-written, simple-tuple seed file with no embedded single quotes in
// its string literals (confirmed below), not a general-purpose SQL parser.
interface SeedRow {
  slug: string;
  name: string;
  priceCents: number;
  currency: string;
  productType: string;
  active: boolean;
}

function parseSeedRows(): SeedRow[] {
  const sqlPath = join(import.meta.dirname, "../../../scripts/seed-services-products.sql");
  const sql = readFileSync(sqlPath, "utf8");
  // Column order in the seed script's INSERT:
  // (slug, name, short_description, description, price_cents, currency, product_type, active, is_demo)
  const tupleRe =
    /\(\s*'([^']*)'\s*,\s*'([^']*)'\s*,\s*'[^']*'\s*,\s*'[^']*'\s*,\s*(\d+)\s*,\s*'([A-Z]+)'\s*,\s*'([a-z_]+)'\s*,\s*(true|false)\s*,\s*(?:true|false)\s*\)/g;
  const rows: SeedRow[] = [];
  let match: RegExpExecArray | null;
  while ((match = tupleRe.exec(sql))) {
    const [, slug, name, priceCents, currency, productType, active] = match;
    rows.push({ slug, name, priceCents: Number(priceCents), currency, productType, active: active === "true" });
  }
  return rows;
}

describe("seed-services-products.sql <-> src/lib/catalog/services.ts synchronization", () => {
  const seedRows = parseSeedRows();

  it("the parser actually found rows -- a regex/format change in the SQL file should fail loudly here, not silently match zero rows", () => {
    expect(seedRows.length).toBeGreaterThan(0);
  });

  it("every catalog service with purchaseMode 'checkout' has a matching seed row with the exact same slug", () => {
    const checkoutIds = services.filter((s) => s.purchaseMode === "checkout").map((s) => s.id);
    const seedSlugs = new Set(seedRows.map((r) => r.slug));
    for (const id of checkoutIds) {
      expect(seedSlugs.has(id), `catalog service "${id}" has no matching row in seed-services-products.sql`).toBe(true);
    }
  });

  it("every seed row's name/price/currency/productType/active matches its catalog counterpart exactly", () => {
    for (const service of services) {
      if (service.purchaseMode !== "checkout") continue;
      const row = seedRows.find((r) => r.slug === service.id);
      expect(row, `no seed row for "${service.id}"`).toBeDefined();
      if (!row) continue;
      expect(row.name).toBe(service.name.ro);
      expect(row.priceCents).toBe(service.priceCents);
      expect(row.currency).toBe(service.currency);
      expect(row.productType).toBe(service.productType);
      expect(row.active).toBe(true);
    }
  });

  it("the seed script has no row for an id that isn't in the catalog at all (no orphaned/stale product the catalog no longer advertises)", () => {
    const catalogIds = new Set(services.map((s) => s.id));
    for (const row of seedRows) {
      expect(catalogIds.has(row.slug), `seed-services-products.sql has a row for "${row.slug}" with no catalog entry`).toBe(true);
    }
  });

  it("every catalog service id is a valid checkout slug shape (lowercase, hyphenated, matches the URL used in /checkout/:slug)", () => {
    for (const service of services) {
      expect(service.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });
});
