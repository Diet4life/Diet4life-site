import { useLanguage } from "@/contexts/LanguageContext";
import type { Product } from "@/lib/checkout/types";

function formatPrice(cents: number, currency: string) {
  return `${(cents / 100).toFixed(0)} ${currency === "RON" ? "lei" : currency}`;
}

export function OrderSummary({ product }: { product: Product }) {
  const { language } = useLanguage();
  const ro = language === "ro";

  return (
    <div className="rounded-2xl border border-border bg-secondary/20 p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
        {ro ? "Comanda ta" : "Your order"}
      </h2>
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-border">
        <div>
          <p className="font-medium text-foreground" data-testid="text-order-product-name">
            {product.name}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5">1 × {formatPrice(product.priceCents, product.currency)}</p>
        </div>
        <p className="font-semibold text-foreground whitespace-nowrap" data-testid="text-order-line-total">
          {formatPrice(product.priceCents, product.currency)}
        </p>
      </div>
      <div className="flex items-center justify-between pt-4">
        <p className="font-serif font-bold text-lg text-foreground">{ro ? "Total" : "Total"}</p>
        <p className="font-serif font-bold text-lg text-primary" data-testid="text-order-total">
          {formatPrice(product.priceCents, product.currency)}
        </p>
      </div>
    </div>
  );
}
