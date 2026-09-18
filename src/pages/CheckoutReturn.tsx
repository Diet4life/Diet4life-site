import { useEffect, useState } from "react";
import { Loader2, HelpCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatusStates } from "@/components/checkout/StatusStates";
import type { PublicOrderStatus } from "@/lib/checkout/types";

// Reads the order via one of two query params, both strictly read-only
// lookups on orders-status.ts (never order paid-status, never billing/
// patient data): the public_status_token we ourselves request as
// ?token=... in payments-initiate.ts's redirectUrl, preferred whenever
// present, or ?orderId=<order_number> as a fallback -- confirmed necessary
// on a real sandbox payment, where NETOPIA's hosted-page return redirect
// dropped our ?token= entirely and substituted its own ?orderId= instead.
export default function CheckoutReturn() {
  const { language } = useLanguage();
  const ro = language === "ro";
  const [state, setState] = useState<"loading" | "missing-identifier" | "not-found" | PublicOrderStatus>("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const orderId = params.get("orderId");
    const query = token
      ? `token=${encodeURIComponent(token)}`
      : orderId
        ? `orderId=${encodeURIComponent(orderId)}`
        : null;
    if (!query) {
      setState("missing-identifier");
      return;
    }
    let cancelled = false;
    fetch(`/.netlify/functions/orders-status?${query}`)
      .then((res) => {
        if (res.status === 404) return null;
        if (!res.ok) throw new Error("failed");
        return res.json() as Promise<PublicOrderStatus>;
      })
      .then((data) => {
        if (cancelled) return;
        setState(data ?? "not-found");
      })
      .catch(() => {
        if (!cancelled) setState("not-found");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="py-16 sm:py-24 min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {state === "loading" && (
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {(state === "missing-identifier" || state === "not-found") && (
          <div className="rounded-2xl border border-border bg-card shadow-sm p-8 sm:p-10 text-center">
            <HelpCircle className="w-14 h-14 text-muted-foreground mx-auto mb-5" />
            <h1 className="font-serif font-bold text-2xl text-foreground mb-2">
              {ro ? "Nu am găsit această comandă" : "We couldn't find this order"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {ro
                ? "Link-ul poate fi incorect sau expirat."
                : "The link may be incorrect or expired."}
            </p>
          </div>
        )}

        {typeof state === "object" && <StatusStates order={state} />}
      </div>
    </div>
  );
}
