// ISO 3166-1 alpha-2 codes with localized display names (RO/EN). The DB only
// ever stores the `code` (see db/schema.ts: billing_details.country_code) --
// this list exists purely to render a searchable, localized selector in the
// UI. Common short names are used (matching how most checkout UIs show
// countries), not official long-form UN names.
export interface Country {
  code: string;
  ro: string;
  en: string;
}

export const COUNTRIES: Country[] = [
  { code: "RO", ro: "România", en: "Romania" },
  { code: "MD", ro: "Republica Moldova", en: "Moldova" },
  { code: "AT", ro: "Austria", en: "Austria" },
  { code: "BE", ro: "Belgia", en: "Belgium" },
  { code: "BG", ro: "Bulgaria", en: "Bulgaria" },
  { code: "HR", ro: "Croația", en: "Croatia" },
  { code: "CY", ro: "Cipru", en: "Cyprus" },
  { code: "CZ", ro: "Cehia", en: "Czech Republic" },
  { code: "DK", ro: "Danemarca", en: "Denmark" },
  { code: "EE", ro: "Estonia", en: "Estonia" },
  { code: "FI", ro: "Finlanda", en: "Finland" },
  { code: "FR", ro: "Franța", en: "France" },
  { code: "DE", ro: "Germania", en: "Germany" },
  { code: "GR", ro: "Grecia", en: "Greece" },
  { code: "HU", ro: "Ungaria", en: "Hungary" },
  { code: "IE", ro: "Irlanda", en: "Ireland" },
  { code: "IT", ro: "Italia", en: "Italy" },
  { code: "LV", ro: "Letonia", en: "Latvia" },
  { code: "LT", ro: "Lituania", en: "Lithuania" },
  { code: "LU", ro: "Luxemburg", en: "Luxembourg" },
  { code: "MT", ro: "Malta", en: "Malta" },
  { code: "NL", ro: "Țările de Jos", en: "Netherlands" },
  { code: "PL", ro: "Polonia", en: "Poland" },
  { code: "PT", ro: "Portugalia", en: "Portugal" },
  { code: "SK", ro: "Slovacia", en: "Slovakia" },
  { code: "SI", ro: "Slovenia", en: "Slovenia" },
  { code: "ES", ro: "Spania", en: "Spain" },
  { code: "SE", ro: "Suedia", en: "Sweden" },
  { code: "GB", ro: "Regatul Unit", en: "United Kingdom" },
  { code: "CH", ro: "Elveția", en: "Switzerland" },
  { code: "NO", ro: "Norvegia", en: "Norway" },
  { code: "IS", ro: "Islanda", en: "Iceland" },
  { code: "AL", ro: "Albania", en: "Albania" },
  { code: "AD", ro: "Andorra", en: "Andorra" },
  { code: "BA", ro: "Bosnia și Herțegovina", en: "Bosnia and Herzegovina" },
  { code: "LI", ro: "Liechtenstein", en: "Liechtenstein" },
  { code: "MC", ro: "Monaco", en: "Monaco" },
  { code: "ME", ro: "Muntenegru", en: "Montenegro" },
  { code: "MK", ro: "Macedonia de Nord", en: "North Macedonia" },
  { code: "RS", ro: "Serbia", en: "Serbia" },
  { code: "SM", ro: "San Marino", en: "San Marino" },
  { code: "UA", ro: "Ucraina", en: "Ukraine" },
  { code: "VA", ro: "Vatican", en: "Vatican City" },
  { code: "BY", ro: "Belarus", en: "Belarus" },
  { code: "RU", ro: "Rusia", en: "Russia" },
  { code: "US", ro: "Statele Unite ale Americii", en: "United States" },
  { code: "CA", ro: "Canada", en: "Canada" },
  { code: "MX", ro: "Mexic", en: "Mexico" },
  { code: "AU", ro: "Australia", en: "Australia" },
  { code: "NZ", ro: "Noua Zeelandă", en: "New Zealand" },
  { code: "JP", ro: "Japonia", en: "Japan" },
  { code: "KR", ro: "Coreea de Sud", en: "South Korea" },
  { code: "CN", ro: "China", en: "China" },
  { code: "HK", ro: "Hong Kong", en: "Hong Kong" },
  { code: "TW", ro: "Taiwan", en: "Taiwan" },
  { code: "SG", ro: "Singapore", en: "Singapore" },
  { code: "MY", ro: "Malaysia", en: "Malaysia" },
  { code: "TH", ro: "Thailanda", en: "Thailand" },
  { code: "VN", ro: "Vietnam", en: "Vietnam" },
  { code: "PH", ro: "Filipine", en: "Philippines" },
  { code: "ID", ro: "Indonezia", en: "Indonesia" },
  { code: "IN", ro: "India", en: "India" },
  { code: "PK", ro: "Pakistan", en: "Pakistan" },
  { code: "BD", ro: "Bangladesh", en: "Bangladesh" },
  { code: "LK", ro: "Sri Lanka", en: "Sri Lanka" },
  { code: "NP", ro: "Nepal", en: "Nepal" },
  { code: "AE", ro: "Emiratele Arabe Unite", en: "United Arab Emirates" },
  { code: "SA", ro: "Arabia Saudită", en: "Saudi Arabia" },
  { code: "QA", ro: "Qatar", en: "Qatar" },
  { code: "KW", ro: "Kuweit", en: "Kuwait" },
  { code: "BH", ro: "Bahrain", en: "Bahrain" },
  { code: "OM", ro: "Oman", en: "Oman" },
  { code: "IL", ro: "Israel", en: "Israel" },
  { code: "TR", ro: "Turcia", en: "Turkey" },
  { code: "JO", ro: "Iordania", en: "Jordan" },
  { code: "LB", ro: "Liban", en: "Lebanon" },
  { code: "IQ", ro: "Irak", en: "Iraq" },
  { code: "IR", ro: "Iran", en: "Iran" },
  { code: "EG", ro: "Egipt", en: "Egypt" },
  { code: "MA", ro: "Maroc", en: "Morocco" },
  { code: "DZ", ro: "Algeria", en: "Algeria" },
  { code: "TN", ro: "Tunisia", en: "Tunisia" },
  { code: "LY", ro: "Libia", en: "Libya" },
  { code: "ZA", ro: "Africa de Sud", en: "South Africa" },
  { code: "NG", ro: "Nigeria", en: "Nigeria" },
  { code: "KE", ro: "Kenya", en: "Kenya" },
  { code: "GH", ro: "Ghana", en: "Ghana" },
  { code: "ET", ro: "Etiopia", en: "Ethiopia" },
  { code: "BR", ro: "Brazilia", en: "Brazil" },
  { code: "AR", ro: "Argentina", en: "Argentina" },
  { code: "CL", ro: "Chile", en: "Chile" },
  { code: "CO", ro: "Columbia", en: "Colombia" },
  { code: "PE", ro: "Peru", en: "Peru" },
  { code: "UY", ro: "Uruguay", en: "Uruguay" },
  { code: "VE", ro: "Venezuela", en: "Venezuela" },
  { code: "EC", ro: "Ecuador", en: "Ecuador" },
  { code: "BO", ro: "Bolivia", en: "Bolivia" },
  { code: "PY", ro: "Paraguay", en: "Paraguay" },
  { code: "CR", ro: "Costa Rica", en: "Costa Rica" },
  { code: "PA", ro: "Panama", en: "Panama" },
  { code: "DO", ro: "Republica Dominicană", en: "Dominican Republic" },
  { code: "CU", ro: "Cuba", en: "Cuba" },
  { code: "GT", ro: "Guatemala", en: "Guatemala" },
  { code: "HN", ro: "Honduras", en: "Honduras" },
  { code: "SV", ro: "El Salvador", en: "El Salvador" },
  { code: "NI", ro: "Nicaragua", en: "Nicaragua" },
  { code: "JM", ro: "Jamaica", en: "Jamaica" },
  { code: "KZ", ro: "Kazahstan", en: "Kazakhstan" },
  { code: "UZ", ro: "Uzbekistan", en: "Uzbekistan" },
  { code: "GE", ro: "Georgia", en: "Georgia" },
  { code: "AM", ro: "Armenia", en: "Armenia" },
  { code: "AZ", ro: "Azerbaidjan", en: "Azerbaijan" },
];

export const DEFAULT_COUNTRY_CODE = "RO";

export const VALID_COUNTRY_CODES = new Set(COUNTRIES.map((c) => c.code));

export function getCountryName(code: string, language: "ro" | "en"): string {
  const match = COUNTRIES.find((c) => c.code === code);
  if (!match) return code;
  return language === "ro" ? match.ro : match.en;
}

// Countries where a postal code isn't part of a normal billing address.
// Deliberately a short, well-known list rather than per-country regex
// validation -- everywhere else, postal code is required but accepted as
// free text (no format assumptions that could reject a real address).
const COUNTRIES_WITHOUT_POSTAL_CODE = new Set(["AE", "QA", "HK"]);

export function isPostalCodeRequired(countryCode: string): boolean {
  return !COUNTRIES_WITHOUT_POSTAL_CODE.has(countryCode);
}
