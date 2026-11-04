import { useEffect, useState } from "react";
import { Loader2, HelpCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatusStates } from "@/components/checkout/StatusStates";
import { pollOrderStatus, type OrderLookup } from "@/lib/checkout/pollOrderStatus";
import type { PublicOrderStatus } from "@/lib/checkout/types";

async function fetchOrderStatus(query: string): Promise<OrderLookup> {
  try {
    const res = await fetch(`/.netlify/functions/orders-status?${query}`, { cache: "no-store" });
    if (res.status === 404) return { kind: "not-found" };
    if (!res.ok) return { kind: "error" };
    return { kind: "found", order: (await res.json()) as PublicOrderStatus };
  } catch {
    return { kind: "error" };
  }
}

// Reads the order via one of two query params, both strictly read-only
// lookups on orders-status.ts (never order paid-status, never billing/
// patient data): the public_status_token we ourselves request as
// ?token=... in payments-initiate.ts's redirectUrl, preferred whenever
// present, or ?orderId=<order_number> as a fallback -- confirmed necessary
// on a real sandbox payment, where NETOPIA's hosted-page return redirect
// dropped our ?token= entirely and substituted its own ?orderId= instead.
//
// The order is re-read a bounded number of times while it is still awaiting
// NETOPIA's verified notify callback (see pollOrderStatus.ts), so a payment
// confirmed a few seconds after the browser returns still shows as paid.
export default function CheckoutReturn() {
  const { language } = useLanguage();
  const ro = language === "ro";
  const [state, setState] = useState<"loading" | "missing-identifier" | "not-found" | PublicOrderStatus>("loading");
  // true while pollOrderStatus() will still re-read the order (bounded).
  const [polling, setPolling] = useState(false);
  // Bumped by "Verifică din nou" to start one more bounded refresh round.
  const [round, setRound] = useState(0);

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
    setPolling(true);
    void pollOrderStatus({
      fetchStatus: () => fetchOrderStatus(query),
      isCancelled: () => cancelled,
      onUpdate: (lookup, stillPolling) => {
        setPolling(stillPolling);
        if (lookup.kind === "found") setState(lookup.order);
        else if (lookup.kind === "not-found") setState("not-found");
        // A transient error keeps whatever was shown before; if nothing was
        // found at all by the last attempt, fall back to "not-found".
        else if (!stillPolling) setState((prev) => (prev === "loading" ? "not-found" : prev));
      },
    });
    return () => {
      cancelled = true;
    };
  }, [round]);

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

        {typeof state === "object" && (
          <StatusStates
            order={state}
            confirmation={polling ? "checking" : "delayed"}
            onRefresh={() => setRound((r) => r + 1)}
          />
        )}
      </div>
    </div>
  );
}
