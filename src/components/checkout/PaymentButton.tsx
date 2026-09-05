import { Loader2, ShieldCheck, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { isProductionBuild } from "@/lib/checkout/environment";
import type { Product } from "@/lib/checkout/types";

function formatPrice(cents: number, currency: string) {
  return `${(cents / 100).toFixed(0)} ${currency === "RON" ? "lei" : currency}`;
}

// Phase 1: no payment provider is wired up yet (NETOPIA is explicitly
// Phase 2). CTA says "Continuă către plată", not "Plătește securizat" --
// swap to the latter, and add Visa/Mastercard + processor details below,
// only once Phase 2 actually wires NETOPIA.
//
// In production this button doesn't render at all -- checkout would create
// a "pending_payment" order with nothing behind it, which reads as a
// working purchase flow to a real visitor. It stays fully functional in
// deploy previews and local dev so the flow can keep being tested. The
// authoritative block is server-side (orderService.ts's createOrder());
// this is only the UI half of that same guard.
export function PaymentButton({
  product,
  submitting,
}: {
  product: Product;
  submitting: boolean;
}) {
  const { language } = useLanguage();
  const ro = language === "ro";

  if (isProductionBuild()) {
    return (
      <div
        className="rounded-xl border border-border bg-secondary/30 px-5 py-4 text-center"
        data-testid="payment-disabled-production"
      >
        <p className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
          <Clock className="w-4 h-4" />
          {ro ? "Plățile online nu sunt încă disponibile." : "Online payments aren't available yet."}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {ro
            ? "Revino în curând sau contactează-ne pentru a finaliza comanda."
            : "Please check back soon, or contact us to complete your order."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="w-full rounded-xl gap-2"
        data-testid="button-submit-order"
      >
        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
        {ro
          ? `Continuă către plată — ${formatPrice(product.priceCents, product.currency)}`
          : `Continue to payment — ${formatPrice(product.priceCents, product.currency)}`}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="w-3.5 h-3.5" />
        {ro ? "Plata online va fi procesată securizat." : "Online payment will be processed securely."}
      </p>
    </div>
  );
}
