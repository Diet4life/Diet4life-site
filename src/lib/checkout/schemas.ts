import { z } from "zod";
import { DEFAULT_COUNTRY_CODE, VALID_COUNTRY_CODES, isPostalCodeRequired } from "@/lib/checkout/countries";

// ---- billing --------------------------------------------------------------
// "Pentru cine se emite factura?" -- persoană fizică vs. persoană
// juridică/PFA. CNP is deliberately never a field here.

const addressFields = {
  // ISO 3166-1 alpha-2. Required and selectable -- Diet4Life can sell
  // internationally, this is never hidden or hardcoded to Romania.
  countryCode: z
    .string()
    .refine((v) => VALID_COUNTRY_CODES.has(v), "Selectează o țară")
    .default(DEFAULT_COUNTRY_CODE),
  county: z.string().min(1, "Acest câmp este obligatoriu"),
  city: z.string().min(1, "Localitatea este obligatorie"),
  streetAddress: z.string().min(1, "Adresa este obligatorie"),
  buildingDetails: z.string().optional(),
  postalCode: z.string().optional(),
};

export const individualBillingSchema = z.object({
  personType: z.literal("individual"),
  fullName: z.string().min(1, "Numele și prenumele sunt obligatorii"),
  email: z.string().email("Adresa de e-mail nu este validă"),
  phone: z.string().min(6, "Numărul de telefon nu este valid"),
  ...addressFields,
});

export const companyBillingSchema = z.object({
  personType: z.literal("company"),
  companyName: z.string().min(1, "Denumirea firmei este obligatorie"),
  taxId: z.string().min(1, "CUI/CIF este obligatoriu"),
  tradeRegistryNumber: z.string().optional(),
  email: z.string().email("Adresa de e-mail nu este validă"),
  phone: z.string().min(6, "Numărul de telefon nu este valid"),
  ...addressFields,
});

export const billingSchema = z
  .discriminatedUnion("personType", [individualBillingSchema, companyBillingSchema])
  .superRefine((data, ctx) => {
    // Required only for countries where a postal code is a normal part of a
    // billing address (see countries.ts) -- not a blanket requirement, and
    // no per-country format regex, so a real international address is
    // never rejected for "looking wrong".
    if (isPostalCodeRequired(data.countryCode) && !data.postalCode?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["postalCode"],
        message: "Codul poștal este obligatoriu pentru țara selectată",
      });
    }
  });

export type BillingInput = z.infer<typeof billingSchema>;

// ---- patient ----------------------------------------------------------
// Only rendered for nutrition_service / consultation products. No medical
// fields exist anywhere in this schema, by design.

export const patientSchema = z
  .object({
    sameAsBuyer: z.boolean(),
    fullName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.sameAsBuyer) return;
    if (!data.fullName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["fullName"], message: "Numele și prenumele sunt obligatorii" });
    }
    if (!data.email || !z.string().email().safeParse(data.email).success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: "Adresa de e-mail nu este validă" });
    }
    if (!data.phone || data.phone.length < 6) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message: "Numărul de telefon nu este valid" });
    }
  });

export type PatientInput = z.infer<typeof patientSchema>;

// ---- consents -----------------------------------------------------------
// Only Terms & Conditions require an explicit checkbox. The Privacy Policy
// is surfaced as informational text with a link (ConsentSection.tsx) --
// continuing the order is treated as acknowledgement, not a separate
// mandatory checkbox.

export const consentSchema = z.object({
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Trebuie să accepți Termenii și condițiile" }),
  }),
});

export type ConsentInput = z.infer<typeof consentSchema>;

// ---- full checkout submission --------------------------------------------

export const checkoutSubmissionSchema = z.object({
  productSlug: z.string().min(1),
  billing: billingSchema,
  patient: patientSchema.optional(), // absent for digital_product
  consent: consentSchema,
});

export type CheckoutSubmissionInput = z.infer<typeof checkoutSubmissionSchema>;
