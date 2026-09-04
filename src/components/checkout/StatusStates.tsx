import { Link } from "wouter";
import { CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import type { PublicOrderStatus } from "@/lib/checkout/types";

function formatPrice(cents: number, currency: string) {
  return `${(cents / 100).toFixed(0)} ${currency === "RON" ? "lei" : currency}`;
}

// Phase 1: status will realistically stay "pending_payment" forever (no
// payment provider is wired up yet -- see PaymentButton.tsx). This renders
// every state the architecture defines so the structural flow can be
// reviewed end to end; "paid" only ever appears once Phase 2 adds a real,
// verified NETOPIA callback -- never inferred from the browser alone.
export function StatusStates({ order }: { order: PublicOrderStatus }) {
  const { language } = useLanguage();
  const ro = language === "ro";

  if (order.status === "paid") {
    const isDigital = order.productType === "digital_product";
    return (
      <div className="text-center">
        <CheckCircle2 className="w-14 h-14 text-primary mx-auto mb-5" />
        <h1 className="font-serif font-bold text-2xl text-foreground mb-2">
          {ro ? "Plata a fost efectuată cu succes" : "Payment successful"}
        </h1>
        <p className="text-muted-foreground mb-1">{order.productName}</p>
        {isDigital ? (
          <>
            <p className="text-sm text-muted-foreground mb-6 mt-3">
              {ro
                ? "Mulțumim pentru comandă. Factura și confirmarea comenzii au fost trimise pe e-mail."
                : "Thank you for your order. The invoice and order confirmation have been sent by e-mail."}
            </p>
            <Button disabled className="rounded-xl">
              {ro ? "Descarcă produsul (în curând)" : "Download product (coming soon)"}
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6 mt-3">
              {ro
                ? "Am primit comanda ta. Vei primi pe e-mail confirmarea și informațiile necesare pentru următorul pas."
                : "We've received your order. You'll receive the confirmation and next-step information by e-mail."}
            </p>
            <Button disabled className="rounded-xl">
              {ro ? "Continuă către formularul de evaluare (în curând)" : "Continue to the assessment form (coming soon)"}
            </Button>
          </>
        )}
      </div>
    );
  }

  if (order.status === "payment_failed" || order.status === "cancelled") {
    return (
      <div className="text-center">
        <XCircle className="w-14 h-14 text-destructive mx-auto mb-5" />
        <h1 className="font-serif font-bold text-2xl text-foreground mb-2">
          {order.status === "cancelled"
            ? ro ? "Plata a fost anulată" : "Payment cancelled"
            : ro ? "Plata nu a putut fi procesată" : "Payment could not be processed"}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {ro ? "Nu s-a efectuat nicio taxare. Poți încerca din nou." : "You have not been charged. You can try again."}
        </p>
        <Button asChild className="rounded-xl">
          <Link href="/contact">{ro ? "Contactează-ne" : "Contact us"}</Link>
        </Button>
      </div>
    );
  }

  if (order.status === "refunded") {
    return (
      <div className="text-center">
        <AlertTriangle className="w-14 h-14 text-muted-foreground mx-auto mb-5" />
        <h1 className="font-serif font-bold text-2xl text-foreground mb-2">
          {ro ? "Comandă rambursată" : "Order refunded"}
        </h1>
        <p className="text-sm text-muted-foreground">{order.productName}</p>
      </div>
    );
  }

  // pending_payment | payment_processing
  return (
    <div className="text-center">
      <Clock className="w-14 h-14 text-muted-foreground mx-auto mb-5" />
      <h1 className="font-serif font-bold text-2xl text-foreground mb-2">
        {ro ? "Comanda ta a fost înregistrată" : "Your order has been registered"}
      </h1>
      <p className="text-muted-foreground mb-1">{order.productName}</p>
      <p className="text-sm text-muted-foreground mb-6">
        {formatPrice(order.totalCents, order.currency)} ·{" "}
        {ro ? "plată în așteptare" : "payment pending"}
      </p>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        {ro
          ? "Plata online va fi disponibilă în curând. Nu s-a efectuat nicio taxare."
          : "Online payment is coming soon. You have not been charged."}
      </p>
    </div>
  );
}
