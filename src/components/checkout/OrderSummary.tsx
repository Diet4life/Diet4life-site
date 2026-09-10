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
      <div className="pb-4 border-b border-border space-y-2">
        <p className="font-medium text-foreground" data-testid="text-order-product-name">
          {product.name}
        </p>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{ro ? "Cantitate" : "Quantity"}</span>
          <span>1</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{ro ? "Preț" : "Price"}</span>
          <span className="font-medium text-foreground" data-testid="text-order-line-total">
            {formatPrice(product.priceCents, product.currency)}
          </span>
        </div>
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
