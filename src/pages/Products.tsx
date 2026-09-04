import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/checkout/types";

function formatPrice(cents: number, currency: string) {
  return `${(cents / 100).toFixed(0)} ${currency === "RON" ? "lei" : currency}`;
}

// Renders only real, active products from the products table (products-list
// filters WHERE active = true server-side). No placeholder/fictitious
// products are ever shown here -- when the catalog is empty, that's what
// the empty state below is for.
export default function Products() {
  const { language } = useLanguage();
  const ro = language === "ro";

  const [products, setProducts] = useState<Product[] | "loading" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/.netlify/functions/products-list")
      .then((res) => {
        if (!res.ok) throw new Error("failed");
        return res.json() as Promise<Product[]>;
      })
      .then((data) => {
        if (!cancelled) setProducts(data.filter((p) => p.productType === "digital_product"));
      })
      .catch(() => {
        if (!cancelled) setProducts("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="py-24 bg-secondary/20 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            {ro ? "Produse Digitale" : "Digital Products"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {ro
              ? "Materiale educative, ghiduri și planuri pe care le poți descărca imediat pentru a începe călătoria ta."
              : "Educational materials, guides, and plans that you can download immediately to start your journey."}
          </p>
        </div>

        {products === "loading" && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {products === "error" && (
          <p className="text-center text-muted-foreground">
            {ro ? "Produsele nu au putut fi încărcate momentan." : "Products could not be loaded right now."}
          </p>
        )}

        {Array.isArray(products) && products.length === 0 && (
          <p className="text-center text-muted-foreground max-w-md mx-auto">
            {ro
              ? "Produsele digitale vor fi disponibile în curând."
              : "Digital products will be available soon."}
          </p>
        )}

        {Array.isArray(products) && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border flex flex-col group hover:shadow-md transition-shadow"
              >
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-serif font-bold text-card-foreground mb-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6 flex-1 font-light leading-relaxed">
                    {product.shortDescription}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-bold text-foreground">
                      {formatPrice(product.priceCents, product.currency)}
                    </span>
                    <Button asChild data-testid={`button-buy-${product.slug}`}>
                      <Link href={`/checkout/${product.slug}`}>
                        <Download className="w-4 h-4 mr-2" />
                        {ro ? "Cumpără" : "Buy"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
