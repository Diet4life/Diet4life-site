import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Form } from "@/components/ui/form";
import { BillingForm } from "@/components/checkout/BillingForm";
import { PatientForm } from "@/components/checkout/PatientForm";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { ConsentSection } from "@/components/checkout/ConsentSection";
import { PaymentButton } from "@/components/checkout/PaymentButton";
import { checkoutSubmissionSchema, type CheckoutSubmissionInput } from "@/lib/checkout/schemas";
import { DEFAULT_COUNTRY_CODE } from "@/lib/checkout/countries";
import { isProductionBuild } from "@/lib/checkout/environment";
import type { Product } from "@/lib/checkout/types";

export default function Checkout() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const ro = language === "ro";
  const { toast } = useToast();
  // Matches the site's own lg breakpoint (1024px, e.g. Home.tsx's hero grid).
  const isDesktop = useMediaQuery("(min-width: 1024px)");

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
        fullName: "",
        email: "",
        phone: "",
        countryCode: DEFAULT_COUNTRY_CODE,
        county: "",
        city: "",
        streetAddress: "",
        buildingDetails: "",
        postalCode: "",
      },
      patient: {
        sameAsBuyer: true,
        fullName: "",
        email: "",
        phone: "",
      },
      consent: {
        termsAccepted: undefined as unknown as true,
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
    // Defense in depth -- PaymentButton doesn't render a submit control in
    // production at all, but this keeps onSubmit itself from ever calling
    // orders-create there (e.g. an Enter-key submit). The real, always-on
    // guard is server-side in orderService.ts's createOrder().
    if (isProductionBuild()) {
      toast({
        title: ro ? "Plățile online nu sunt încă disponibile" : "Online payments aren't available yet",
        description: ro
          ? "Revino în curând sau contactează-ne pentru a finaliza comanda."
          : "Please check back soon, or contact us to complete your order.",
      });
      return;
    }
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

  const billingSection = (
    <section>
      <h2 className="font-serif font-bold text-lg text-foreground mb-5">
        {ro ? "Date pentru factură" : "Billing details"}
      </h2>
      <BillingForm />
    </section>
  );

  const patientSection = needsPatient && (
    <section>
      <h2 className="font-serif font-bold text-lg text-foreground mb-5">
        {ro ? "Beneficiarul serviciului" : "Service beneficiary"}
      </h2>
      <PatientForm />
    </section>
  );

  const consentSection = (
    <section>
      <ConsentSection />
    </section>
  );

  const summaryCard = <OrderSummary product={product} />;
  const paymentCta = <PaymentButton product={product} submitting={submitting} />;

  return (
    <div className="py-16 md:py-24 bg-background min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
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
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {isDesktop ? (
              // Desktop: two columns. Left = form + consents. Right = a
              // sticky "Comanda ta" card that stays visible while the form
              // is filled in, ending with the payment CTA.
              <div className="grid grid-cols-[1fr_340px] gap-12 items-start">
                <div className="space-y-10">
                  {billingSection}
                  {patientSection}
                  {consentSection}
                </div>
                <div className="sticky top-24 space-y-4">
                  {summaryCard}
                  {paymentCta}
                </div>
              </div>
            ) : (
              // Mobile: single column. Order summary sits after the form,
              // before consents and the final CTA.
              <div className="space-y-10">
                {billingSection}
                {patientSection}
                <section>{summaryCard}</section>
                {consentSection}
                <section>{paymentCta}</section>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
