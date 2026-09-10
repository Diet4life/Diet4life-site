import { useLanguage } from "@/contexts/LanguageContext";
import { DraftNotice } from "@/components/legal/DraftNotice";

// Structural placeholder only -- created for the checkout flow to link to
// (item 5 of Phase 1). No legal text has been drafted or approved; do not
// treat anything below as production copy. See DraftNotice.tsx.
export default function Termeni() {
  const { language } = useLanguage();
  const ro = language === "ro";

  return (
    <div className="py-16 md:py-24 bg-background min-h-screen">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-8">
          {ro ? "Termeni și condiții" : "Terms and Conditions"}
        </h1>
        <DraftNotice />
        <p className="text-muted-foreground">
          {ro
            ? "Această pagină va conține termenii și condițiile aplicabile comenzilor plasate pe Diet4Life Concept."
            : "This page will contain the terms and conditions applicable to orders placed on Diet4Life Concept."}
        </p>
      </div>
    </div>
  );
}
