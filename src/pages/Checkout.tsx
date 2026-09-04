import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { BillingForm } from "@/components/checkout/BillingForm";
import { PatientForm } from "@/components/checkout/PatientForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { ConsentSection } from "@/components/checkout/ConsentSection";
import { PaymentButton } from "@/components/checkout/PaymentButton";
import { checkoutSubmissionSchema, type CheckoutSubmissionInput } from "@/lib/checkout/schemas";
import type { Product } from "@/lib/checkout/types";

export default function Checkout() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const ro = language === "ro";
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | "loading" | "not-found">("loading");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setProduct("loading");
    fetch("/.netlify/functions/products-list")
      .then((res) => {
        if (!res.ok) throw new Error("failed to load products");
        return res.json() as Promise<Product[]>;
      })
      .then((products) => {
        if (cancelled) return;
        const match = products.find((p) => p.slug === slug);
        setProduct(match ?? "not-found");
      })
      .catch(() => {
        if (!cancelled) setProduct("not-found");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const form = useForm<CheckoutSubmissionInput>({
    resolver: zodResolver(checkoutSubmissionSchema),
    defaultValues: {
      productSlug: slug,
      billing: {
        personType: "individual",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        country: "România",
        county: "",
        city: "",
        streetAddress: "",
        buildingDetails: "",
        postalCode: "",
      },
      patient: {
        sameAsBuyer: true,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
      },
      consent: {
        termsAccepted: undefined as unknown as true,
        privacyAcknowledged: undefined as unknown as true,
      },
    },
  });

  if (product === "loading") {
    return (
      <div className="py-24 min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (product === "not-found") {
    return (
      <div className="py-24 min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-serif font-bold text-2xl text-foreground mb-3">
          {ro ? "Acest produs nu este disponibil" : "This product is not available"}
        </h1>
        <p className="text-muted-foreground max-w-sm">
          {ro
            ? "Este posibil să fi fost retras sau linkul nu mai este valabil."
            : "It may have been withdrawn, or the link is no longer valid."}
        </p>
      </div>
    );
  }

  const needsPatient = product.productType !== "digital_product";

  async function onSubmit(values: CheckoutSubmissionInput) {
    setSubmitting(true);
    try {
      const payload = {
        productSlug: values.productSlug,
        billing: values.billing,
        patient: needsPatient ? values.patient : undefined,
        consent: values.consent,
      };
      const res = await fetch("/.netlify/functions/orders-create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error("order_create_failed");
      }
      const data = (await res.json()) as { publicStatusToken: string };
      window.location.href = `/checkout/retur?token=${encodeURIComponent(data.publicStatusToken)}`;
    } catch {
      toast({
        title: ro ? "A apărut o problemă" : "Something went wrong",
        description: ro
          ? "Comanda nu a putut fi înregistrată. Te rugăm să încerci din nou."
          : "The order could not be registered. Please try again.",
        variant: "destructive",
      });
      setSubmitting(false);
    }
  }

  return (
    <div className="py-16 md:py-24 bg-background min-h-screen">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
            {ro ? "Finalizează comanda" : "Complete your order"}
          </h1>
          <p className="text-muted-foreground">{product.name}</p>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <section>
              <h2 className="font-serif font-bold text-lg text-foreground mb-5">
                {ro ? "Date pentru factură" : "Billing details"}
              </h2>
              <BillingForm />
            </section>

            {needsPatient && (
              <section>
                <h2 className="font-serif font-bold text-lg text-foreground mb-5">
                  {ro ? "Beneficiarul serviciului" : "Service beneficiary"}
                </h2>
                <PatientForm />
              </section>
            )}

            <section>
              <OrderSummary product={product} />
            </section>

            <section>
              <ConsentSection />
            </section>

            <section>
              <PaymentButton product={product} submitting={submitting} />
            </section>
          </form>
        </Form>
      </div>
    </div>
  );
}
