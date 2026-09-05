import { Loader2, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/checkout/types";

function formatPrice(cents: number, currency: string) {
  return `${(cents / 100).toFixed(0)} ${currency === "RON" ? "lei" : currency}`;
}

// Phase 1: no payment provider is wired up yet (NETOPIA is explicitly
// Phase 2). CTA says "Continuă către plată", not "Plătește securizat" --
// swap to the latter, and add Visa/Mastercard + processor details below,
// only once Phase 2 actually wires NETOPIA. Submitting creates the order
// (pending_payment) and continues to the status page, which will
// accurately keep showing "pending" until a real payment integration
// exists.
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
