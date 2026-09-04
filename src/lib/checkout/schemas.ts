import { z } from "zod";

// ---- billing --------------------------------------------------------------
// "Pentru cine se emite factura?" -- persoană fizică vs. persoană
// juridică/PFA. CNP is deliberately never a field here.

const addressFields = {
  country: z.string().min(1).default("România"),
  county: z.string().min(1, "Județul / sectorul este obligatoriu"),
  city: z.string().min(1, "Localitatea este obligatorie"),
  streetAddress: z.string().min(1, "Strada și numărul sunt obligatorii"),
  buildingDetails: z.string().optional(),
  postalCode: z.string().optional(),
};

export const individualBillingSchema = z.object({
  personType: z.literal("individual"),
  firstName: z.string().min(1, "Prenumele este obligatoriu"),
  lastName: z.string().min(1, "Numele este obligatoriu"),
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

export const billingSchema = z.discriminatedUnion("personType", [
  individualBillingSchema,
  companyBillingSchema,
]);

export type BillingInput = z.infer<typeof billingSchema>;

// ---- patient ----------------------------------------------------------
// Only rendered for nutrition_service / consultation products. No medical
// fields exist anywhere in this schema, by design.

export const patientSchema = z
  .object({
    sameAsBuyer: z.boolean(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.sameAsBuyer) return;
    if (!data.firstName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["firstName"], message: "Prenumele pacientului este obligatoriu" });
    }
    if (!data.lastName) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["lastName"], message: "Numele pacientului este obligatoriu" });
    }
    if (!data.email || !z.string().email().safeParse(data.email).success) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["email"], message: "Adresa de e-mail a pacientului nu este validă" });
    }
    if (!data.phone || data.phone.length < 6) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message: "Numărul de telefon al pacientului nu este valid" });
    }
  });

export type PatientInput = z.infer<typeof patientSchema>;

// ---- consents -----------------------------------------------------------

export const consentSchema = z.object({
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Trebuie să accepți Termenii și condițiile" }),
  }),
  privacyAcknowledged: z.literal(true, {
    errorMap: () => ({ message: "Trebuie să confirmi că ai citit Politica de confidențialitate" }),
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
