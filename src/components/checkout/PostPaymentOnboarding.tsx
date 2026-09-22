import { Link } from "wouter";
import { CheckCircle2, Circle, NotebookPen, ClipboardCheck, CalendarClock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useJournalProgress } from "@/hooks/use-journal-progress";

// Post-payment onboarding, shown only for nutrition_service/consultation
// orders (StatusStates.tsx decides that -- digital_product keeps its own,
// unrelated "download" messaging). Deliberately styled apart from the
// site's usual primary-green/accent-blue tokens -- zinc/emerald, scoped to
// this component only, per explicit request for this specific page to read
// as calm and premium rather than "medical form." ACCENT below is the
// literal hex she gave (#2F4F4F), not Tailwind's own emerald-800
// (#065F46) -- she listed both as if equivalent; the hex is used as the
// more specific, deliberate value.
const ACCENT = "#2F4F4F";

// "Încarcă analizele" in the original spec would have meant building a
// real upload-to-site widget for medical test results -- directly
// contradicting this project's standing, twice-already-reconfirmed policy
// ("NU crea sistem de upload. NU stoca analizele pe site.", see
// Consultatii.tsx's Analize medicale step). Resolved (no strong preference
// given either way) in favor of keeping that policy: no file ever reaches
// this site. The CTA here is a plain mailto -- the same "send it directly,
// don't store it" pattern already used for the journal's own upload/email
// handoff elsewhere on Consultatii.tsx -- not a new upload mechanism.
const ANALYSIS_MAILTO =
  "mailto:contact@diet4lifeconcept.ro?subject=" + encodeURIComponent("Analize medicale - pregătire consultație");

export function PostPaymentOnboarding({ orderNumber }: { orderNumber: string }) {
  const { language } = useLanguage();
  const ro = language === "ro";
  const { isComplete: journalComplete } = useJournalProgress();

  const checklist = [
    { label: ro ? "Plata confirmată" : "Payment confirmed", done: true },
    { label: ro ? "Jurnal alimentar completat" : "Food journal completed", done: journalComplete },
    { label: ro ? "Analize pregătite / încărcate" : "Medical tests ready / sent", done: false },
    { label: ro ? "Data consultației stabilită" : "Consultation date set", done: false },
  ];

  return (
    <div className="mt-10 text-left">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 sm:p-8">
        <h2 className="font-serif font-bold text-xl text-zinc-900 mb-2">
          {ro ? "Plata a fost confirmată" : "Payment confirmed"}
        </h2>
        <p className="text-zinc-600 text-sm leading-relaxed mb-1">
          {ro
            ? "Mulțumim! Următorul pas este să pregătim consultația ta."
            : "Thank you! The next step is preparing for your consultation."}
        </p>
        <p className="text-zinc-600 text-sm leading-relaxed mb-8">
          {ro
            ? "Pentru ca întâlnirea noastră să fie cât mai utilă, te rugăm să parcurgi pașii de mai jos înainte de consultație."
            : "So our meeting is as useful as possible, please go through the steps below before your consultation."}
        </p>

        <ol className="space-y-8">
          <li className="flex gap-4">
            <span
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
              style={{ backgroundColor: ACCENT }}
            >
              1
            </span>
            <div>
              <h3 className="font-semibold text-zinc-900 flex items-center gap-2 mb-1">
                <NotebookPen className="w-4 h-4" style={{ color: ACCENT }} />
                {ro ? "Completează jurnalul alimentar" : "Complete your food journal"}
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed mb-3">
                {ro
                  ? "Notează mesele, gustările și informațiile solicitate în jurnal. Aceste date ne vor ajuta să înțelegem mai bine obiceiurile tale alimentare."
                  : "Note your meals, snacks, and the information the journal asks for. This helps us understand your eating habits better."}
              </p>
              <Link
                href="/consultatii"
                className="inline-flex text-sm font-medium underline underline-offset-2 hover:no-underline"
                style={{ color: ACCENT }}
              >
                {ro ? "Completează jurnalul" : "Complete the journal"}
              </Link>
            </div>
          </li>

          <li className="flex gap-4">
            <span
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
              style={{ backgroundColor: ACCENT }}
            >
              2
            </span>
            <div>
              <h3 className="font-semibold text-zinc-900 flex items-center gap-2 mb-1">
                <ClipboardCheck className="w-4 h-4" style={{ color: ACCENT }} />
                {ro ? "Pregătește analizele medicale disponibile" : "Prepare any available medical test results"}
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed mb-1">
                {ro
                  ? "Dacă ai analize medicale recente, le poți trimite înainte de consultație sau, dacă preferi, le poți păstra pentru a le discuta direct în timpul consultației."
                  : "If you have recent medical test results, you can send them before your consultation or, if you prefer, keep them to discuss directly during the appointment."}
              </p>
              <p className="text-sm text-zinc-600 leading-relaxed mb-3">
                {ro
                  ? "Nu este necesar să faci analize noi doar pentru această etapă. Dacă vor fi utile investigații suplimentare, vom discuta acest lucru împreună."
                  : "You don't need to get new tests just for this step. If further tests would help, we'll discuss that together."}
              </p>
              <a
                href={ANALYSIS_MAILTO}
                className="inline-flex text-sm font-medium underline underline-offset-2 hover:no-underline"
                style={{ color: ACCENT }}
              >
                {ro ? "Trimite-le pe email (opțional)" : "Send them by email (optional)"}
              </a>
            </div>
          </li>

          <li className="flex gap-4">
            <span
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
              style={{ backgroundColor: ACCENT }}
            >
              3
            </span>
            <div>
              <h3 className="font-semibold text-zinc-900 flex items-center gap-2 mb-1">
                <CalendarClock className="w-4 h-4" style={{ color: ACCENT }} />
                {ro ? "Stabilim data consultației" : "We'll set the consultation date"}
              </h3>
              <p className="text-sm text-zinc-600 leading-relaxed">
                {ro
                  ? "După confirmarea plății, vei fi contactat pentru stabilirea datei și orei consultației. În cadrul consultației vom discuta istoricul tău medical și alimentar, obiectivele tale și toate informațiile necesare pentru evaluare."
                  : "After payment confirmation, you'll be contacted to set the date and time of your consultation. During the consultation we'll discuss your medical and eating history, your goals, and everything needed for the assessment."}
              </p>
            </div>
          </li>
        </ol>
      </div>

      {/* Checklist -- items 2-4 have no reliable server-side signal (no
          scheduling system, no upload-to-site, and the journal has no
          per-order link -- see useJournalProgress()'s comment), so this is
          a calm status summary, not a tracked form. */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 px-6 py-5">
        <ul className="space-y-2.5">
          {checklist.map((item) => (
            <li key={item.label} className="flex items-center gap-2.5 text-sm">
              {item.done ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: ACCENT }} />
              ) : (
                <Circle className="w-4 h-4 shrink-0 text-zinc-300" />
              )}
              <span className={item.done ? "text-zinc-900 font-medium" : "text-zinc-500"}>{item.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 text-xs text-zinc-400 text-center">
        {ro ? `Comanda ${orderNumber}` : `Order ${orderNumber}`}
      </p>
    </div>
  );
}
