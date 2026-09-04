import { Loader2, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/checkout/types";

function formatPrice(cents: number, currency: string) {
  return `${(cents / 100).toFixed(0)} ${currency === "RON" ? "lei" : currency}`;
}

// Phase 1: no payment provider is wired up yet (see project notes -- NETOPIA
// integration is explicitly Phase 2). The CTA is honest about that instead
// of showing a "Plătește securizat" claim with nothing behind it -- it
// creates the order (pending_payment) and continues to the status page,
// which will accurately keep showing "pending" until a real payment
// integration exists. Swap `copy` below once Phase 2 lands.
export function PaymentButton({
  product,
  submitting,
}: {
  product: Product;
  submitting: boolean;
}) {
  const { language } = useLanguage();
  const ro = language === "ro";

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
          ? `Trimite comanda — ${formatPrice(product.priceCents, product.currency)}`
          : `Submit order — ${formatPrice(product.priceCents, product.currency)}`}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="w-3.5 h-3.5" />
        {ro
          ? "Plata online va fi disponibilă în curând — comanda ta este înregistrată acum."
          : "Online payment is coming soon — your order is being registered now."}
      </p>
    </div>
  );
}
