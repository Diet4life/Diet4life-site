import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Router } from "wouter";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { StatusStates } from "./StatusStates";
import type { PublicOrderStatus } from "@/lib/checkout/types";

function order(status: PublicOrderStatus["status"]): PublicOrderStatus {
  return {
    orderNumber: "D4L-2026-012F7470",
    status,
    productName: "Consultație de nutriție",
    productType: "consultation",
    totalCents: 30000,
    currency: "RON",
    invoiceStatus: "pending",
    deliveryStatus: null,
  } as PublicOrderStatus;
}

function render(o: PublicOrderStatus, confirmation?: "checking" | "delayed") {
  return renderToStaticMarkup(
    <Router ssrPath="/checkout/retur">
      <LanguageProvider>
        <StatusStates order={o} confirmation={confirmation} onRefresh={() => {}} />
      </LanguageProvider>
    </Router>,
  );
}

const NO_PAYMENT = "Nu a fost efectuată nicio plată";

describe("StatusStates (return page card)", () => {
  it("paid order: shows the post-payment confirmation, never pending or 'no payment' copy", () => {
    const html = render(order("paid"));
    expect(html).toContain("Plata confirmată");
    expect(html).not.toContain("Plată în așteptare");
    expect(html).not.toContain(NO_PAYMENT);
  });

  it("pending while the bounded refresh runs: says it's waiting for NETOPIA, never 'no payment was made'", () => {
    const html = render(order("pending_payment"), "checking");
    expect(html).toContain("Plată în așteptare");
    expect(html).toContain("Așteptăm confirmarea plății de la NETOPIA");
    expect(html).not.toContain(NO_PAYMENT);
    expect(html).not.toContain("nu este activă în această versiune de test");
  });

  it("pending after the refresh gave up: warns not to repeat the payment and offers a re-check, never 'no payment was made'", () => {
    const html = render(order("payment_processing"), "delayed");
    expect(html).toContain("nu o repeta");
    expect(html).toContain("Verifică din nou");
    expect(html).not.toContain(NO_PAYMENT);
  });

  it("failed and cancelled stay distinct from pending and from each other", () => {
    const failed = render(order("payment_failed"));
    const cancelled = render(order("cancelled"));
    expect(failed).toContain("Plată eșuată");
    expect(cancelled).toContain("Anulată");
    for (const html of [failed, cancelled]) {
      expect(html).not.toContain("Plată în așteptare");
      expect(html).not.toContain("Plata confirmată");
    }
  });
});
