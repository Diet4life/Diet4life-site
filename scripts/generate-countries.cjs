// Generates src/lib/checkout/countries.generated.ts from two vetted,
// independently-maintained data sources -- this script is NOT run at build
// time, it's a one-off generator whose output is checked into the repo.
// Re-run with `node scripts/generate-countries.cjs` if either source package
// is upgraded and the underlying ISO/address data has changed.
//
// Source 1 -- country list + localized names + ISO 3166-1 numeric code:
//   i18n-iso-countries (npm), which ships the ISO 3166-1 alpha-2 code list,
//   translated names per locale (RO and EN used here), and an
//   alpha2ToNumeric() lookup for the ISO 3166-1 *numeric* code (e.g. "RO" ->
//   "642") -- needed because NETOPIA's Address schema requires `country` as
//   a numeric ISO code, not the alpha-2 code the rest of this codebase (and
//   the DB's billing_details.country_code column) uses everywhere else.
//   All 250 alpha-2 codes in the installed version have a numeric mapping
//   (verified directly -- zero missing), so no fallback is needed.
//
// Source 2 -- "does this country require a postal code" metadata:
//   lib-address (npm), a wrapper around Google's own address-metadata
//   dataset (the same data used by Google Pay / Android / Chrome address
//   autofill). Each country file's `require` field lists the address
//   fields Google's own data considers required for a valid address in
//   that country, using single-letter codes; postal code is required
//   exactly when that string contains "Z".
//
// Fallback rule (deliberate, matches the explicit "don't guess" instruction):
// if a country code has no entry at all in lib-address's dataset, postal
// code is treated as NOT required -- we only mark it required when we have
// positive, sourced confirmation that the destination country's own address
// format calls for one. We never infer requiredness from absence of data.
const fs = require("fs");
const path = require("path");

const countries = require("i18n-iso-countries");
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));
countries.registerLocale(require("i18n-iso-countries/langs/ro.json"));

const libAddressDir = path.join(__dirname, "..", "node_modules", "lib-address", "countries");

const alpha2Codes = Object.keys(countries.getAlpha2Codes()).sort();

const entries = alpha2Codes.map((code) => {
  const ro = countries.getName(code, "ro");
  const en = countries.getName(code, "en");
  const numeric = countries.alpha2ToNumeric(code);

  let postalRequired = false;
  const dataPath = path.join(libAddressDir, `${code}.json`);
  if (fs.existsSync(dataPath)) {
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
    postalRequired = typeof data.require === "string" && data.require.includes("Z");
  }

  return { code, ro, en, numeric, postalRequired };
});

const missing = entries.filter((e) => !e.ro || !e.en || !e.numeric);
if (missing.length > 0) {
  console.error("Missing localized name or numeric code for:", missing);
  process.exit(1);
}

const requiredCount = entries.filter((e) => e.postalRequired).length;

const header = `// GENERATED FILE -- do not hand-edit.
// Produced by scripts/generate-countries.cjs from:
//   - i18n-iso-countries@${require("i18n-iso-countries/package.json").version} (ISO 3166-1 alpha-2 codes + RO/EN names)
//   - lib-address@${require("lib-address/package.json").version} (Google address-metadata: postal code requiredness)
// Regenerate with \`node scripts/generate-countries.cjs\` after upgrading either package.
//
// ${entries.length} countries/territories total, ${requiredCount} with a confirmed postal-code requirement.
// Countries with no lib-address entry, or whose entry doesn't list postal
// code as required, default to postalRequired: false -- never guessed true.

export interface CountryEntry {
  code: string;
  ro: string;
  en: string;
  numeric: string;
  postalRequired: boolean;
}

export const GENERATED_COUNTRIES: CountryEntry[] = ${JSON.stringify(entries, null, 2)};
`;

const outPath = path.join(__dirname, "..", "src", "lib", "checkout", "countries.generated.ts");
fs.writeFileSync(outPath, header);
console.log(`Wrote ${entries.length} countries (${requiredCount} with postalRequired: true) to ${outPath}`);
