import { useEffect, useState } from "react";
import { Loader2, HelpCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatusStates } from "@/components/checkout/StatusStates";
import type { PublicOrderStatus } from "@/lib/checkout/types";

// Reads the order strictly via the public_status_token query param -- never
// order_number/id. This is also where a real NETOPIA redirect will land in
// Phase 2; for now it reflects whatever the order's real status is
// (pending_payment, since no payment provider exists yet).
export default function CheckoutReturn() {
  const { language } = useLanguage();
  const ro = language === "ro";
  const [state, setState] = useState<"loading" | "missing-token" | "not-found" | PublicOrderStatus>("loading");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setState("missing-token");
      return;
    }
    let cancelled = false;
    fetch(`/.netlify/functions/orders-status?token=${encodeURIComponent(token)}`)
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
    <div className="py-24 min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {state === "loading" && (
          <div className="flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {(state === "missing-token" || state === "not-found") && (
          <div className="text-center">
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
