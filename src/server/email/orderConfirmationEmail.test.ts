import { describe, expect, it } from "vitest";
import { buildOrderConfirmationEmail, resolveConfirmationRecipient } from "./orderConfirmationEmail";

describe("resolveConfirmationRecipient", () => {
  const baseRow = {
    billingFullName: "Ion Popescu",
    billingCompanyName: null,
    billingEmail: "ion@example.com",
    patientSameAsBuyer: true,
    patientFullName: null,
    patientEmail: null,
  };

  it("uses the buyer when the patient is the same as the buyer", () => {
    expect(resolveConfirmationRecipient(baseRow)).toEqual({ name: "Ion Popescu", email: "ion@example.com" });
  });

  it("uses the patient when they differ from the buyer and have an email", () => {
    const row = {
      ...baseRow,
      patientSameAsBuyer: false,
      patientFullName: "Maria Ionescu",
      patientEmail: "maria@example.com",
    };
    expect(resolveConfirmationRecipient(row)).toEqual({ name: "Maria Ionescu", email: "maria@example.com" });
  });

  it("falls back to the buyer when the patient differs but has no email on file", () => {
    const row = { ...baseRow, patientSameAsBuyer: false, patientFullName: "Maria Ionescu", patientEmail: null };
    expect(resolveConfirmationRecipient(row)).toEqual({ name: "Ion Popescu", email: "ion@example.com" });
  });

  it("uses the company name for company billing when no patient is named", () => {
    const row = { ...baseRow, billingFullName: null, billingCompanyName: "Acme SRL" };
    expect(resolveConfirmationRecipient(row)).toEqual({ name: "Acme SRL", email: "ion@example.com" });
  });

  it("falls back to the buyer's own name when the differing patient has no name on file", () => {
    const row = { ...baseRow, patientSameAsBuyer: false, patientFullName: null, patientEmail: "maria@example.com" };
    expect(resolveConfirmationRecipient(row)).toEqual({ name: "Ion Popescu", email: "maria@example.com" });
  });
});

describe("buildOrderConfirmationEmail", () => {
  const ctx = {
    orderNumber: "D4L-2026-ABCD1234",
    productName: "Consultație Nutrițională",
    recipientName: "Ion Popescu",
    recipientEmail: "ion@example.com",
  };

  it("includes the order number, product name, and recipient's name", () => {
    const { subject, text } = buildOrderConfirmationEmail(ctx);
    expect(subject).toContain(ctx.orderNumber);
    expect(text).toContain(ctx.productName);
    expect(text).toContain(ctx.orderNumber);
    expect(text).toContain(ctx.recipientName);
  });

  it("includes all 3 onboarding steps (journal, analize, consultation date) and never claims a fixed appointment time", () => {
    const { text } = buildOrderConfirmationEmail(ctx);
    expect(text).toMatch(/jurnal/i);
    expect(text).toMatch(/analize/i);
    expect(text).toMatch(/data.*consulta[tț]iei/i);
    expect(text).not.toMatch(/\d{1,2}:\d{2}/); // no time-of-day ever invented
  });

  it("never says a booking/calendar step exists", () => {
    const { text } = buildOrderConfirmationEmail(ctx);
    expect(text.toLowerCase()).not.toContain("calendar");
  });

  it("is understandable standalone -- includes a real link for the journal step", () => {
    const { text } = buildOrderConfirmationEmail(ctx);
    expect(text).toContain("https://");
  });

  it("never mentions uploading or emailing medical test results -- no mailto for analize, no upload wording", () => {
    const { text } = buildOrderConfirmationEmail(ctx);
    expect(text).not.toContain("mailto:");
    expect(text.toLowerCase()).not.toMatch(/încarc|upload/);
    expect(text).toContain("Le vom putea discuta împreună în timpul întâlnirii.");
  });

  it("handles an empty recipient name gracefully, without a dangling comma/space", () => {
    const { text } = buildOrderConfirmationEmail({ ...ctx, recipientName: "" });
    expect(text.split("\n")[0]).toBe("Salut,");
  });
});
