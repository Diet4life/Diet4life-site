import { z } from "zod";

// Shared between the Contact form (client) and contact-submit.ts (server) --
// the server never trusts client-side validation alone, it re-parses the
// same schema. No "goal" field -- deliberately removed for data minimisation
// (redundant with the free-text message, and the least necessary field tied
// to identity).
export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(2, "Numele trebuie să aibă cel puțin 2 caractere").max(100),
  email: z.string().trim().email("Adresa de email nu este validă").max(254),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Mesajul trebuie să aibă cel puțin 10 caractere").max(2000),
});

export type ContactSubmissionInput = z.infer<typeof contactSubmissionSchema>;
