import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { services as checkoutCatalog } from "@/lib/catalog/services";
import { useDocumentHead } from "@/hooks/use-document-head";

// Services.tsx is the single purchase entry point: each card's CTA links to
// real checkout (/checkout/:slug) when the matching catalog entry
// (src/lib/catalog/services.ts) is purchaseMode "checkout", or falls back
// to /contact for anything still "contact" -- so re-scoping an item back to
// contact-only later is a one-line catalog change, no JSX edit needed here.
// UNCHANGED this round, per explicit instruction.
function serviceCtaHref(id: string): string {
  const entry = checkoutCatalog.find((s) => s.id === id);
  return entry?.purchaseMode === "checkout" ? `/checkout/${id}` : "/contact";
}

// Same outer column as Home/Despre mine's own PAGE_COLUMN (max-w-[1200px] +
// matching padding) -- duplicated here rather than imported, since importing
// it would require adding an export to Home.tsx, which this round's brief
// (like every prior page's) says not to touch. Keep the three copies in sync
// by hand if Home's ever changes.
const PAGE_COLUMN = "max-w-[1200px] mx-auto px-[18px] min-[380px]:px-5 lg:px-8";

// periodRo/periodEn are optional this round: Consultație Nutrițională and
// Monitorizare Nutrițională no longer carry any period badge at all, since
// their only period was expressed in minutes ("45-60 minute" / "30 minute")
// and that's exactly what was asked to be removed, with nothing put in its
// place. Every period expressed in days/weeks/months is untouched.
interface ServiceOffering {
  id: string;
  nameRo: string;
  nameEn: string;
  price: number;
  periodRo?: string;
  periodEn?: string;
  periodSubRo?: string;
  periodSubEn?: string;
  shortRo: string;
  shortEn: string;
  includeLabelRo: string;
  includeLabelEn: string;
  includeRo: string[];
  includeEn: string[];
  showAnalysisLink?: boolean;
  hasWhatsApp?: boolean;
  noteRo?: string;
  noteEn?: string;
}

const CTA_RO = "Alege serviciul";
const CTA_EN = "Choose this service";
const SUB_CTA_RO = "Vei continua către plata securizată.";
const SUB_CTA_EN = "You'll continue to secure checkout.";

// Said once, after the services that mention WhatsApp, instead of on each
// of their cards separately -- same information, no longer repeated 2-3x.
const WHATSAPP_NOTE_RO =
  "Clarificările pe WhatsApp nu reprezintă monitorizare continuă și nu presupun răspuns în timp real.";
const WHATSAPP_NOTE_EN =
  "WhatsApp clarifications are not continuous monitoring and do not imply real-time replies.";

// Every card now shows exactly 4 benefits, always visible (no mobile
// collapse, no accordion, no toggle) -- approved text, condensed from the
// previous longer "include" lists. Only durations expressed in minutes were
// removed ("45-60 minute", "30 minute", "de aproximativ 20 de minute");
// every day/week/month period, every service name, every price, and the
// number of check-ins (1, 3) are unchanged.
const services: ServiceOffering[] = [
  {
    id: "primii-pasi",
    nameRo: "Primii Pași",
    nameEn: "First Steps",
    price: 200,
    periodRo: "21 zile",
    periodEn: "21 days",
    periodSubRo: "7 zile de jurnal + 14 zile de aplicare",
    periodSubEn: "7 days of food diary + 14 days of implementation",
    shortRo:
      "Pentru persoanele care vor să își înțeleagă mai bine alimentația actuală și să primească recomandări concrete.",
    shortEn:
      "For people who want to better understand their current diet and receive clear, practical recommendations.",
    includeLabelRo: "Cum se desfășoară",
    includeLabelEn: "How it works",
    includeRo: [
      "Completarea unui jurnal alimentar timp de 7 zile.",
      "Analiza alimentației actuale și recomandări trimise pe WhatsApp.",
      "14 zile pentru aplicarea recomandărilor primite pe WhatsApp; în această perioadă, se recomandă continuarea jurnalului alimentar.",
      "Feedback și, dacă este necesar, ajustări la final.",
    ],
    includeEn: [
      "Completing a food diary for 7 days.",
      "Analysis of your current diet and recommendations sent via WhatsApp.",
      "14 days to apply the recommendations received via WhatsApp; continuing the food diary during this period is recommended.",
      "Feedback and, if necessary, final adjustments.",
    ],
    hasWhatsApp: true,
  },
  {
    id: "consultatie-nutritionala",
    nameRo: "Consultație Nutrițională",
    nameEn: "Nutrition Consultation",
    price: 300,
    shortRo:
      "Pentru persoanele care au nevoie de o evaluare completă și de recomandări nutriționale adaptate nevoilor și obiectivelor lor.",
    shortEn:
      "For people who need a complete assessment and nutritional recommendations tailored to their needs and goals.",
    includeLabelRo: "Include",
    includeLabelEn: "Includes",
    includeRo: [
      "Completarea unui jurnal alimentar timp de 7 zile, înaintea consultației.",
      "Evaluarea alimentației actuale, a istoricului și a principalelor dificultăți.",
      "Revizuirea analizelor medicale relevante disponibile.",
      "Recomandări personalizate și plan alimentar orientativ pentru 7 zile.",
    ],
    includeEn: [
      "Completion of a 7-day food diary before the consultation.",
      "Reviewing your current eating habits, history, and main difficulties.",
      "Reviewing your relevant available medical test results.",
      "Tailored recommendations and an orientative 7-day meal plan.",
    ],
    showAnalysisLink: true,
    noteRo: "Consultația nu include monitorizare ulterioară.",
    noteEn: "The consultation does not include follow-up monitoring.",
  },
  {
    id: "program-6-saptamani",
    nameRo: "Program Nutrițional 6 săptămâni",
    nameEn: "6-Week Nutrition Program",
    price: 480,
    periodRo: "6 săptămâni",
    periodEn: "6 weeks",
    shortRo:
      "Pentru persoanele care, pe lângă consultația inițială, au nevoie de urmărirea evoluției și de ajustarea recomandărilor pe parcursul celor 6 săptămâni.",
    shortEn:
      "For people who, in addition to the initial consultation, need progress follow-up and adjustments to their recommendations throughout the six weeks.",
    includeLabelRo: "Include",
    includeLabelEn: "Includes",
    includeRo: [
      "Completarea unui jurnal alimentar timp de 7 zile, înaintea consultației inițiale.",
      "Consultație nutrițională inițială, cu evaluarea jurnalului alimentar, a istoricului și a analizelor medicale relevante disponibile.",
      "O monitorizare pentru evaluarea evoluției și a dificultăților întâmpinate.",
      "Ajustarea recomandărilor în funcție de evoluție.",
      "Clarificări punctuale pe WhatsApp pe parcursul celor 6 săptămâni.",
    ],
    includeEn: [
      "Completion of a 7-day food diary before the initial consultation.",
      "Initial nutrition consultation, including a review of the food diary, medical history and relevant available medical test results.",
      "One follow-up to assess progress and any difficulties encountered.",
      "Adjustments to the recommendations based on progress.",
      "Brief clarifications via WhatsApp throughout the six weeks.",
    ],
    hasWhatsApp: true,
  },
  {
    id: "program-3-luni",
    nameRo: "Program Nutrițional 3 luni",
    nameEn: "3-Month Nutrition Program",
    price: 850,
    periodRo: "3 luni",
    periodEn: "3 months",
    shortRo:
      "Pentru persoanele care au nevoie de urmărirea evoluției pe o perioadă mai lungă, cu reevaluări periodice și ajustarea recomandărilor pe parcursul celor 3 luni.",
    shortEn:
      "For people who need longer-term progress follow-up, with regular reassessments and adjustments to their recommendations throughout the three months.",
    includeLabelRo: "Include",
    includeLabelEn: "Includes",
    includeRo: [
      "Completarea unui jurnal alimentar timp de 7 zile, înaintea consultației inițiale.",
      "Consultație nutrițională inițială, cu evaluarea jurnalului alimentar, a istoricului și a analizelor medicale relevante disponibile.",
      "Trei monitorizări pentru evaluarea evoluției și a dificultăților întâmpinate, aproximativ una pe lună.",
      "Ajustarea recomandărilor după fiecare monitorizare, în funcție de evoluție.",
      "Clarificări punctuale pe WhatsApp între monitorizări.",
    ],
    includeEn: [
      "Completion of a 7-day food diary before the initial consultation.",
      "Initial nutrition consultation, including a review of the food diary, medical history and relevant available medical test results.",
      "Three follow-ups to assess progress and any difficulties encountered, approximately one per month.",
      "Adjustments to the recommendations after each follow-up, based on progress.",
      "Brief clarifications via WhatsApp between follow-ups.",
    ],
    hasWhatsApp: true,
  },
];

// Kept structurally separate from `services` (own section, own eyebrow),
// per the earlier explicit "must read as visually separate from the 4
// new-patient services" instruction -- not just a data-shape difference.
const MONITORING: ServiceOffering = {
  id: "monitorizare-nutritionala",
  nameRo: "Monitorizare Nutrițională",
  nameEn: "Nutritional Monitoring",
  price: 200,
  shortRo: "Pentru pacienții care au avut deja o consultație și au nevoie de o reevaluare punctuală a evoluției.",
  shortEn: "For patients who have already had a consultation and need a one-time reassessment of their progress.",
  includeLabelRo: "Include",
  includeLabelEn: "Includes",
  includeRo: [
    "Verificarea modului în care au fost aplicate recomandările anterioare.",
    "Reevaluarea progresului și a dificultăților apărute.",
    "Revizuirea planului alimentar, dacă este necesar.",
    "Recomandări scrise actualizate pentru perioada următoare.",
  ],
  includeEn: [
    "Checking how the previously set recommendations were applied.",
    "Reassessing your progress and any difficulties that came up.",
    "Reviewing your meal plan, if needed.",
    "Updated written recommendations for the period ahead.",
  ],
};

// Replaces the previous two separate blocks ("Cum alegi?", a definition
// list above the cards, and "Ce se întâmplă după plată?", below them) with
// one short "Cum funcționează" section. "Cum alegi?" is dropped outright --
// its distinguishing info (name, price, who it's for, what's included) is
// now directly visible on every card, so the separate list only duplicated
// it. "Ce se întâmplă după plată?" is kept, renamed, content unchanged --
// no new text was written for this section.
const HOW_IT_WORKS_STEPS = [
  { ro: "Plata este confirmată.", en: "Your payment is confirmed." },
  { ro: "Primești indicațiile pentru pregătirea serviciului ales.", en: "You receive instructions for preparing your chosen service." },
  {
    ro: "Dacă este cazul, completezi jurnalul alimentar și pregătești analizele medicale pe care le ai deja.",
    en: "If applicable, you fill in your food journal and prepare any medical test results you already have.",
  },
  {
    ro: "Te contactăm pentru stabilirea următorului pas.",
    en: "We contact you to arrange the next step.",
  },
];

// Shared visual language for every service card on this page (the 4 main
// ones + Monitorizare) -- rounded-2xl border + bg-card/60, no shadow, no
// icon circle, matching Home's "Din răspunsuri" / Despre mine's credibility
// blocks. All 4 benefits are always visible (no mobile collapse, no
// accordion, no tabs) -- price and CTA are reachable with zero interaction
// beyond landing on the card. `mt-auto` on the CTA block keeps the button
// pinned to the bottom of the card regardless of how much text sits above
// it, so cards sharing a grid row stay visually balanced.
function ServiceCard({ service, ro }: { service: ServiceOffering; ro: boolean }) {
  const includeItems = ro ? service.includeRo : service.includeEn;

  return (
    <div className="h-full min-w-0 flex flex-col rounded-2xl border border-border bg-card/60 p-6">
      <h2 className="font-serif font-bold text-xl md:text-2xl text-foreground mb-1 text-balance">
        {ro ? service.nameRo : service.nameEn}
      </h2>
      <p className="mb-1">
        <span className="text-2xl md:text-3xl font-bold text-primary">{service.price} lei</span>
        {service.periodRo && service.periodEn && (
          <span className="text-muted-foreground"> · {ro ? service.periodRo : service.periodEn}</span>
        )}
      </p>
      {service.periodSubRo && service.periodSubEn && (
        <p className="text-xs text-muted-foreground mb-4">{ro ? service.periodSubRo : service.periodSubEn}</p>
      )}
      <p
        className={`text-muted-foreground text-left max-lg:text-[17px] max-lg:leading-[1.55] lg:text-sm lg:leading-relaxed mb-6 ${
          service.periodSubRo ? "" : "mt-4"
        }`}
      >
        {ro ? service.shortRo : service.shortEn}
      </p>

      <h3 className="text-sm font-semibold text-foreground mb-3">
        {ro ? service.includeLabelRo : service.includeLabelEn}
      </h3>
      <ul className="space-y-2.5 max-lg:text-[17px] max-lg:leading-[1.55] lg:text-sm lg:leading-relaxed text-muted-foreground mb-6">
        {includeItems.map((item, j) => (
          <li key={j} className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {service.showAnalysisLink && (
        <Link
          href="/consultatii#analize"
          className="inline-flex items-center gap-1.5 text-xs text-primary underline underline-offset-2 mb-6 hover:no-underline"
        >
          <ClipboardCheck className="w-3.5 h-3.5 shrink-0" />
          {ro ? "Vezi analizele recomandate înainte de consultație" : "See the recommended tests before your consultation"}
        </Link>
      )}

      {service.noteRo && service.noteEn && (
        <p className="text-xs text-muted-foreground leading-relaxed mb-6">{ro ? service.noteRo : service.noteEn}</p>
      )}

      <div className="mt-auto">
        <Link
          href={serviceCtaHref(service.id)}
          className="flex items-center justify-center gap-2 h-12 lg:h-[52px] px-6 rounded-[13px] bg-primary hover:bg-primary/90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 text-primary-foreground font-semibold text-[15px] lg:text-base transition-all w-full"
          data-testid={`button-service-${service.id}`}
        >
          {ro ? CTA_RO : CTA_EN}
          <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-xs text-muted-foreground text-center mt-2">{ro ? SUB_CTA_RO : SUB_CTA_EN}</p>
      </div>
    </div>
  );
}

export default function Services() {
  const { language } = useLanguage();
  const ro = language === "ro";

  useDocumentHead(
    ro ? "Servicii și prețuri | Diet4Life Concept" : "Services & Pricing | Diet4Life Concept",
    ro
      ? "Evaluare nutrițională, monitorizare și sprijin — alege nivelul potrivit pentru tine, cu prețuri clare, afișate direct."
      : "Nutrition assessment, monitoring and support — choose the right level for you, with clear, upfront pricing.",
    { canonical: "https://diet4lifeconcept.ro/services" }
  );

  return (
    <div
      className="flex flex-col py-16 md:py-20"
      style={{
        // Same page-scoped palette override as Home.tsx/About.tsx (kept in
        // sync by hand for the same reason as PAGE_COLUMN above) -- #FBF6EE
        // / #FDF9F2 / #2F5D3F / #7A6559, never touching the shared :root
        // tokens so other pages are unaffected.
        "--background": "37 62% 96%", // #FBF6EE
        "--card": "38 73% 97%", // #FDF9F2
        "--primary": "141 33% 27%", // #2F5D3F
        "--muted-foreground": "22 16% 41%", // #7A6559
      } as any}
    >
      <div className={PAGE_COLUMN}>
        {/* Header -- rendered directly in its final state, no entry
            animation. This page's commercial content must never depend on
            JS/scroll-triggered animation to become visible or readable. */}
        <div className="max-w-2xl mx-auto text-center mb-10 md:mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase text-primary mb-4">
            <span className="inline-block w-4 h-px bg-primary" aria-hidden="true" />
            {ro ? "Servicii" : "Services"}
          </span>
          <h1 className="text-[36px] lg:text-5xl font-serif font-bold text-foreground leading-tight lg:leading-normal mb-4 text-balance">
            {ro ? "Alege nivelul de sprijin de care ai nevoie." : "Choose the level of support you need."}
          </h1>
          <p className="text-muted-foreground max-lg:text-[17px] max-lg:leading-[1.55] lg:text-lg lg:leading-relaxed">
            {ro
              ? "De la o primă evaluare până la urmărire pe termen lung — fiecare serviciu oferă un nivel diferit de sprijin."
              : "From an initial assessment to longer-term follow-up — each service offers a different level of support."}
          </p>
        </div>

        {/* Services grid: price, description and all 4 benefits visible
            immediately, on every screen size -- 2x2 on desktop, single
            column on mobile. No entry animation on the cards themselves. */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} ro={ro} />
          ))}
        </div>

        {/* Single shared WhatsApp note, after the services that mention
            WhatsApp (Primii Pași, both Programs). */}
        {services.some((s) => s.hasWhatsApp) && (
          <p className="max-w-5xl mx-auto text-xs text-muted-foreground text-center mt-6">{ro ? WHATSAPP_NOTE_RO : WHATSAPP_NOTE_EN}</p>
        )}

        {/* Monitorizare Nutrițională -- visually separate section for
            existing patients, not intercalated with the 4 new-patient
            services above. */}
        <div className="max-w-5xl mx-auto mt-16 md:mt-20">
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase text-primary mb-4">
            <span className="inline-block w-4 h-px bg-primary" aria-hidden="true" />
            {ro ? "Pentru pacienții existenți" : "For existing patients"}
          </span>
          <div className="max-w-2xl">
            <ServiceCard service={MONITORING} ro={ro} />
          </div>
        </div>

        {/* Cum funcționează -- merges the previous "Cum alegi?" block (now
            redundant: every card already shows price/for-whom/benefits) and
            "Ce se întâmplă după plată?" into one short section. Step text
            is unchanged from the previous "Ce se întâmplă după plată?". */}
        <div className="max-w-3xl mx-auto mt-16 md:mt-20">
          <h2 className="font-serif font-bold text-xl md:text-2xl text-foreground mb-5 text-balance">
            {ro ? "Cum funcționează" : "How it works"}
          </h2>
          <ol className="max-lg:space-y-2 lg:space-y-3">
            {HOW_IT_WORKS_STEPS.map((step, i) => (
              <li key={i} className="flex items-start gap-3 max-lg:text-[17px] max-lg:leading-[1.55] lg:text-base lg:leading-relaxed text-muted-foreground">
                <span className="font-semibold text-primary shrink-0">{i + 1}.</span>
                <span>{ro ? step.ro : step.en}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Bottom CTA -- unchanged content. */}
        <div className="max-w-2xl mx-auto text-center mt-10 md:mt-20">
          <h2 className="text-[28px] md:text-4xl font-serif font-bold text-foreground leading-tight md:leading-normal mb-4 text-balance">
            {ro ? "Nu știi de unde să începi?" : "Not sure where to start?"}
          </h2>
          <p className="text-muted-foreground max-lg:text-[17px] max-lg:leading-[1.55] lg:text-lg lg:leading-relaxed mb-6">
            {ro
              ? "Contactează-ne și îți vom recomanda cel mai potrivit serviciu pentru situația ta."
              : "Contact us and we'll recommend the most suitable service for your situation."}
          </p>
          <Link
            href="/contact"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 h-12 lg:h-[52px] px-6 rounded-[13px] bg-primary hover:bg-primary/90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 text-primary-foreground font-semibold text-[15px] lg:text-base transition-all"
            data-testid="button-services-contact"
          >
            {ro ? "Contactează-ne" : "Contact us"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
