// Order-confirmation email for nutrition_service / consultation orders --
// the first order-confirmation email this codebase has ever sent (Phase 1's
// PaymentButton.tsx copy always said this was coming "later"; see
// CLAUDE.md). Sent exactly once per order, from
// netlify/functions/payments-netopia-notify.ts, only after a verified
// NETOPIA notification has moved the order to "paid" for the first time --
// never speculatively, never from anything browser-supplied. Mirrors the
// same Resend-over-fetch pattern already used by contact-submit.ts (no
// SDK dependency).
//
// digital_product orders are deliberately out of scope here -- see
// StatusStates.tsx's comment; that product type keeps its original,
// unrelated "download coming soon" copy, which this function is never
// called for.

export interface OrderConfirmationContext {
  orderNumber: string;
  productName: string;
  recipientName: string;
  recipientEmail: string;
}

// Resolves who the email actually goes to: the patient, when one was named
// and isn't the buyer; the buyer otherwise. Pure, exported for testing.
// Never invents a name/email -- falls back to whichever of the two is
// present, and is the caller's responsibility to only call this with a row
// that has at least a buyer email (always true -- billing_details.email is
// NOT NULL in the schema).
export function resolveConfirmationRecipient(row: {
  billingFullName: string | null;
  billingCompanyName: string | null;
  billingEmail: string;
  patientSameAsBuyer: boolean | null;
  patientFullName: string | null;
  patientEmail: string | null;
}): { name: string; email: string } {
  const buyerName = row.billingFullName ?? row.billingCompanyName ?? "";
  if (row.patientSameAsBuyer === false && row.patientEmail) {
    return { name: row.patientFullName ?? buyerName, email: row.patientEmail };
  }
  return { name: buyerName, email: row.billingEmail };
}

const JOURNAL_URL = "https://diet4lifeconcept.ro/consultatii";

// Pure, exported for testing -- no network access, no env reads.
export function buildOrderConfirmationEmail(ctx: OrderConfirmationContext): {
  subject: string;
  text: string;
} {
  const subject = `Diet4Life — Plata a fost confirmată (${ctx.orderNumber})`;

  const text = [
    `Salut${ctx.recipientName ? " " + ctx.recipientName : ""},`,
    "",
    `Plata pentru "${ctx.productName}" a fost confirmată. Mulțumim!`,
    "",
    "Următorul pas este să pregătim consultația ta. Te rugăm să parcurgi pașii de mai jos înainte de consultație:",
    "",
    "1. Completează jurnalul alimentar",
    "Notează mesele, gustările și informațiile solicitate în jurnal — ne ajută să înțelegem mai bine obiceiurile tale alimentare.",
    `Completează jurnalul: ${JOURNAL_URL}`,
    "",
    "2. Pregătește analizele medicale disponibile",
    "Dacă ai analize medicale recente, pregătește-le pentru consultație. Le vom putea discuta împreună în timpul întâlnirii.",
    "Nu este necesar să faci analize noi doar pentru această etapă. Dacă vor fi utile investigații suplimentare, vom discuta acest lucru împreună.",
    "",
    "3. Stabilim data consultației",
    "Vei fi contactat pentru stabilirea datei și orei consultației. În cadrul consultației vom discuta istoricul tău medical și alimentar, obiectivele tale și toate informațiile necesare pentru evaluare.",
    "",
    `Comanda: ${ctx.orderNumber}`,
    "",
    "Cu drag,",
    "Echipa Diet4Life Concept",
  ].join("\n");

  return { subject, text };
}

const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_ADDRESS = "Diet4Life Concept <contact@diet4lifeconcept.ro>";

// Impure -- the only function in this file that touches the network. Never
// throws on a delivery failure (returns false instead) so the caller can
// record confirmationEmailStatus = "failed" without crashing the notify
// handler over an email problem.
export async function sendOrderConfirmationEmail(ctx: OrderConfirmationContext): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !ctx.recipientEmail) return false;

  const { subject, text } = buildOrderConfirmationEmail(ctx);

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [ctx.recipientEmail],
        subject,
        text,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
