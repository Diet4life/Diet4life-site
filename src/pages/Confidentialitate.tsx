import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/use-document-head";
import { DraftNotice } from "@/components/legal/DraftNotice";

// Structural placeholder only -- created for the checkout flow to link to
// (item 5 of Phase 1). No legal text has been drafted or approved; do not
// treat anything below as production copy. See DraftNotice.tsx.
export default function Confidentialitate() {
  const { language } = useLanguage();
  const ro = language === "ro";

  // noindex is temporary -- remove once the final, legally-approved text
  // replaces this placeholder (see DraftNotice.tsx / LEGAL_COPY_APPROVED).
  useDocumentHead(
    ro ? "Politica de confidențialitate | Diet4Life Concept" : "Privacy Policy | Diet4Life Concept",
    ro
      ? "Ce date colectăm, în ce scop și cum le protejăm pe Diet4Life Concept."
      : "What data we collect, for what purpose, and how we protect it on Diet4Life Concept.",
    { canonical: "https://diet4lifeconcept.ro/confidentialitate", noindex: true }
  );

  return (
    <div className="py-16 md:py-24 bg-background min-h-screen">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-8">
          {ro ? "Politica de confidențialitate" : "Privacy Policy"}
        </h1>
        <DraftNotice />
        <p className="text-muted-foreground">
          {ro
            ? "Această pagină va explica ce date colectăm, în ce scop și cum le protejăm."
            : "This page will explain what data we collect, for what purpose, and how we protect it."}
        </p>
      </div>
    </div>
  );
}
