import { type ReactNode } from "react";
import { Link } from "wouter";
import { CheckCircle2, Clock, XCircle, AlertTriangle, type LucideIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { PostPaymentOnboarding } from "@/components/checkout/PostPaymentOnboarding";
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

// Renders every order state. "paid" only ever comes from the database,
// set by the verified NETOPIA notify callback -- never inferred from the
// browser or the redirect URL.
// `confirmation` only matters for pending_payment / payment_processing:
// "checking" while CheckoutReturn.tsx's bounded refresh is still re-reading
// the order, "delayed" once it gave up without a settled status. Neither
// state ever claims that no payment was made -- the visitor may well have
// paid on NETOPIA's page and the verified callback simply hasn't landed yet.
export function StatusStates({
  order,
  confirmation = "delayed",
  onRefresh,
}: {
  order: PublicOrderStatus;
  confirmation?: "checking" | "delayed";
  onRefresh?: () => void;
}) {
  const { language } = useLanguage();
  const ro = language === "ro";

  if (order.status === "paid") {
    const isDigital = order.productType === "digital_product";

    // nutrition_service / consultation: the full onboarding flow (journal,
    // analize, "we'll be in touch about the date") replaces the generic
    // success card entirely -- it already carries its own "Plata a fost
    // confirmată" heading. digital_product keeps the original, unrelated
    // "download the product" card below, untouched.
    if (!isDigital) {
      return <PostPaymentOnboarding orderNumber={order.orderNumber} />;
    }

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
          ro
            ? "Mulțumim pentru comandă. Factura și confirmarea comenzii au fost trimise pe e-mail."
            : "Thank you for your order. The invoice and order confirmation have been sent by e-mail."
        }
      >
        <Button disabled className="rounded-xl">
          {ro ? "Descarcă produsul (în curând)" : "Download product (coming soon)"}
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

  // pending_payment | payment_processing -- waiting for NETOPIA's verified
  // notify callback. Never "Plata a fost efectuată" (not confirmed yet), and
  // never "Nu a fost efectuată nicio plată" (it may already have been made).
  const checking = confirmation === "checking";
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
        checking
          ? ro
            ? "Așteptăm confirmarea plății de la NETOPIA. Pagina se actualizează automat."
            : "We're waiting for NETOPIA to confirm the payment. This page updates automatically."
          : ro
            ? "Încă nu am primit confirmarea plății de la NETOPIA. Dacă ai finalizat plata, nu o repeta — confirmarea poate întârzia câteva minute."
            : "We haven't received NETOPIA's payment confirmation yet. If you completed the payment, don't repeat it — confirmation can take a few minutes."
      }
    >
      {!checking && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {onRefresh && (
            <Button onClick={onRefresh} className="rounded-xl" data-testid="button-status-refresh">
              {ro ? "Verifică din nou" : "Check again"}
            </Button>
          )}
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/contact">{ro ? "Contactează-ne" : "Contact us"}</Link>
          </Button>
        </div>
      )}
    </StatusCard>
  );
}
