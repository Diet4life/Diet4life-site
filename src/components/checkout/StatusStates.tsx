import { type ReactNode } from "react";
import { Link } from "wouter";
import { CheckCircle2, Clock, XCircle, AlertTriangle, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import type { PublicOrderStatus } from "@/lib/checkout/types";

function formatPrice(cents: number, currency: string) {
  return `${(cents / 100).toFixed(0)} ${currency === "RON" ? "lei" : currency}`;
}

// Shared card shell for every status branch below -- icon, a text+icon
// status pill (never color alone), title, product/amount, an explanation,
// and a CTA slot. Same shell on mobile and desktop; the page around it
// (CheckoutReturn.tsx) centers it and caps its width.
function StatusCard({
  icon: Icon,
  iconClassName,
  pillLabel,
  pillClassName,
  pillIcon: PillIcon,
  title,
  productName,
  amountLabel,
  explanation,
  children,
}: {
  icon: LucideIcon;
  iconClassName: string;
  pillLabel: string;
  pillClassName: string;
  pillIcon: LucideIcon;
  title: string;
  productName?: string;
  amountLabel?: string;
  explanation: string;
  children?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-8 sm:p-10 text-center">
      <Icon className={`w-14 h-14 mx-auto mb-4 ${iconClassName}`} />
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-4 ${pillClassName}`}
      >
        <PillIcon className="w-3.5 h-3.5" />
        {pillLabel}
      </span>
      <h1 className="font-serif font-bold text-2xl text-foreground mb-2">{title}</h1>
      {productName && <p className="text-muted-foreground">{productName}</p>}
      {amountLabel && <p className="text-sm text-muted-foreground mt-0.5">{amountLabel}</p>}
      <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-4">{explanation}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

// Phase 1: status will realistically stay "pending_payment" forever (no
// payment provider is wired up yet -- see PaymentButton.tsx). This renders
// every state the architecture defines so the structural flow can be
// reviewed end to end; "paid" only ever appears once Phase 2 adds a real,
// verified NETOPIA callback -- never inferred from the browser alone, and
// the pending-state copy is deliberately explicit that no payment exists
// yet, so it can never read as a confirmed purchase.
export function StatusStates({ order }: { order: PublicOrderStatus }) {
  const { language } = useLanguage();
  const ro = language === "ro";

  if (order.status === "paid") {
    const isDigital = order.productType === "digital_product";
    return (
      <StatusCard
        icon={CheckCircle2}
        iconClassName="text-primary"
        pillIcon={CheckCircle2}
        pillLabel={ro ? "Plătit" : "Paid"}
        pillClassName="bg-primary/10 text-primary"
        title={ro ? "Plata a fost efectuată cu succes" : "Payment successful"}
        productName={order.productName}
        explanation={
          isDigital
            ? ro
              ? "Mulțumim pentru comandă. Factura și confirmarea comenzii au fost trimise pe e-mail."
              : "Thank you for your order. The invoice and order confirmation have been sent by e-mail."
            : ro
              ? "Am primit comanda ta. Vei primi pe e-mail confirmarea și informațiile necesare pentru următorul pas."
              : "We've received your order. You'll receive the confirmation and next-step information by e-mail."
        }
      >
        <Button disabled className="rounded-xl">
          {isDigital
            ? ro ? "Descarcă produsul (în curând)" : "Download product (coming soon)"
            : ro ? "Continuă către formularul de evaluare (în curând)" : "Continue to the assessment form (coming soon)"}
        </Button>
      </StatusCard>
    );
  }

  if (order.status === "payment_failed" || order.status === "cancelled") {
    return (
      <StatusCard
        icon={XCircle}
        iconClassName="text-destructive"
        pillIcon={XCircle}
        pillLabel={order.status === "cancelled" ? (ro ? "Anulată" : "Cancelled") : ro ? "Plată eșuată" : "Payment failed"}
        pillClassName="bg-destructive/10 text-destructive"
        title={
          order.status === "cancelled"
            ? ro ? "Plata a fost anulată" : "Payment cancelled"
            : ro ? "Plata nu a putut fi procesată" : "Payment could not be processed"
        }
        productName={order.productName}
        explanation={ro ? "Nu s-a efectuat nicio taxare. Poți încerca din nou." : "You have not been charged. You can try again."}
      >
        <Button asChild className="rounded-xl">
          <Link href="/contact">{ro ? "Contactează-ne" : "Contact us"}</Link>
        </Button>
      </StatusCard>
    );
  }

  if (order.status === "refunded") {
    return (
      <StatusCard
        icon={AlertTriangle}
        iconClassName="text-muted-foreground"
        pillIcon={AlertTriangle}
        pillLabel={ro ? "Rambursată" : "Refunded"}
        pillClassName="bg-secondary text-muted-foreground"
        title={ro ? "Comandă rambursată" : "Order refunded"}
        productName={order.productName}
        explanation={ro ? "Suma a fost returnată. Dacă ai întrebări, ne poți contacta oricând." : "The amount has been refunded. Feel free to contact us with any questions."}
      >
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/contact">{ro ? "Contactează-ne" : "Contact us"}</Link>
        </Button>
      </StatusCard>
    );
  }

  // pending_payment | payment_processing -- Phase 1's only realistic state.
  // Copy is deliberately explicit and literal: no payment exists, none was
  // taken. Never "Plata a fost efectuată" / "Comanda este confirmată".
  return (
    <StatusCard
      icon={Clock}
      iconClassName="text-muted-foreground"
      pillIcon={Clock}
      pillLabel={ro ? "Plată în așteptare" : "Payment pending"}
      pillClassName="bg-secondary text-muted-foreground"
      title={ro ? "Comanda a fost înregistrată" : "The order has been registered"}
      productName={order.productName}
      amountLabel={formatPrice(order.totalCents, order.currency)}
      explanation={
        ro
          ? "Plata online nu este activă în această versiune de test. Nu a fost efectuată nicio plată."
          : "Online payment is not active in this test version. No payment has been made."
      }
    >
      <Button asChild variant="outline" className="rounded-xl">
        <Link href="/contact">{ro ? "Contactează-ne" : "Contact us"}</Link>
      </Button>
    </StatusCard>
  );
}
