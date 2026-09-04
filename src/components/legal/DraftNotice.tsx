import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Single flag controlling every legal-copy draft banner on the site.
// Flip to true only once the exact text below has been approved --
// never mark it approved as a side effect of an unrelated change.
export const LEGAL_COPY_APPROVED = false;

export function DraftNotice() {
  const { language } = useLanguage();
  const ro = language === "ro";

  if (LEGAL_COPY_APPROVED) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3.5 mb-10 text-amber-900">
      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
      <p className="text-sm leading-relaxed">
        {ro
          ? "Text provizoriu, intern — nu reprezintă versiunea finală aprobată legal."
          : "Provisional, internal text — not the final, legally approved version."}
      </p>
    </div>
  );
}
