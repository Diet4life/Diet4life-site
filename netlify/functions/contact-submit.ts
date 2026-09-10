import type { Handler } from "@netlify/functions";
import { contactSubmissionSchema } from "@/lib/contact/schema";

// Contact form is deliberately storage-free: Browser -> this function ->
// server-side validation -> honeypot check -> Resend API -> reply. Nothing
// is written to Netlify Database -- the message content only ever exists
// transiently in this function's memory and in Resend's delivery pipeline.
// Never log the message body, name, email, or phone in clear -- every log
// line below carries only a request id, a success/failure outcome, and a
// generic error type, for correlation/debugging only.
const RESEND_API_URL = "https://api.resend.com/emails";
const FROM_ADDRESS = "Diet4Life Contact <contact@diet4lifeconcept.ro>";
const TO_ADDRESS = "contact@diet4lifeconcept.ro";

export const handler: Handler = async (event, context) => {
  const requestId = context.awsRequestId;

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "method_not_allowed" }) };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(event.body ?? "{}");
  } catch {
    console.error(`contact-submit[${requestId}] failure invalid_json`);
    return { statusCode: 400, body: JSON.stringify({ error: "invalid_json" }) };
  }

  // Honeypot: a real visitor never fills this hidden field. If it's
  // present and non-empty, silently accept without sending anything --
  // no error, no signal back to whatever filled it in.
  if (
    typeof payload === "object" &&
    payload !== null &&
    "website" in payload &&
    typeof (payload as Record<string, unknown>).website === "string" &&
    (payload as Record<string, string>).website.length > 0
  ) {
    return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ ok: true }) };
  }

  const parsed = contactSubmissionSchema.safeParse(payload);
  if (!parsed.success) {
    console.error(`contact-submit[${requestId}] failure validation_failed`);
    return {
      statusCode: 400,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "validation_failed" }),
    };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(`contact-submit[${requestId}] failure email_not_configured`);
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "email_not_configured" }),
    };
  }

  const { name, email, phone, message } = parsed.data;

  const textBody = [`Nume: ${name}`, `Email: ${email}`, phone ? `Telefon: ${phone}` : null, "", "Mesaj:", message]
    .filter((line): line is string => line !== null)
    .join("\n");

  try {
    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [TO_ADDRESS],
        // Only ever set from an address that already passed zod's .email()
        // validation above -- never from unvalidated input.
        reply_to: email,
        subject: `Mesaj nou Diet4Life — ${name}`,
        text: textBody,
      }),
    });

    if (!res.ok) {
      console.error(`contact-submit[${requestId}] failure email_send_failed status=${res.status}`);
      return {
        statusCode: 502,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ error: "email_send_failed" }),
      };
    }

    console.log(`contact-submit[${requestId}] success`);
    return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify({ ok: true }) };
  } catch (error) {
    console.error(`contact-submit[${requestId}] failure network_error type=${error instanceof Error ? error.name : "unknown"}`);
    return {
      statusCode: 502,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "email_send_failed" }),
    };
  }
};
