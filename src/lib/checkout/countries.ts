// ISO 3166-1 alpha-2 codes with localized display names (RO/EN) and a
// per-country postal-code-requirement flag. The DB only ever stores the
// `code` (see db/schema.ts: billing_details.country_code) -- this list
// exists purely to render a searchable, localized selector in the UI.
//
// Data is generated, not hand-typed -- see scripts/generate-countries.cjs
// and countries.generated.ts for exactly which packages produced it and how
// to regenerate it.
import { GENERATED_COUNTRIES, type CountryEntry } from "./countries.generated";

export type Country = CountryEntry;

export const COUNTRIES: Country[] = [...GENERATED_COUNTRIES].sort((a, b) => a.ro.localeCompare(b.ro, "ro"));

export const DEFAULT_COUNTRY_CODE = "RO";

export const VALID_COUNTRY_CODES = new Set(COUNTRIES.map((c) => c.code));

export function getCountryName(code: string, language: "ro" | "en"): string {
  const match = COUNTRIES.find((c) => c.code === code);
  if (!match) return code;
  return language === "ro" ? match.ro : match.en;
}

// Whether a postal code should be a required field for this country's
// billing address. Sourced from Google's own address-metadata (via
// lib-address, see countries.generated.ts) rather than a hand-picked
// exception list: `postalRequired` is true only when that data positively
// confirms postal code is part of a normal address for the country. Any
// country missing from that dataset, or whose data doesn't call for one,
// defaults to false -- we never guess a requirement into existence.
export function isPostalCodeRequired(countryCode: string): boolean {
  const match = COUNTRIES.find((c) => c.code === countryCode);
  return match?.postalRequired ?? false;
}
