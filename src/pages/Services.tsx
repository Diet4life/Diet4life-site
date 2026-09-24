import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, ChevronDown, ClipboardCheck } from "lucide-react";
import { services as checkoutCatalog } from "@/lib/catalog/services";

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

interface ServiceOffering {
  id: string;
  nameRo: string;
  nameEn: string;
  price: number;
  periodRo: string;
  periodEn: string;
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

const CTA_RO = "Alege acest serviciu";
const CTA_EN = "Choose this service";
const SUB_CTA_RO = "Vei continua către plata securizată.";
const SUB_CTA_EN = "You'll continue to secure checkout.";

// Said once, after the services that mention WhatsApp, instead of on each
// of their cards separately -- same information, no longer repeated 2-3x.
const WHATSAPP_NOTE_RO =
  "Clarificările pe WhatsApp nu reprezintă monitorizare continuă și nu presupun răspuns în timp real.";
const WHATSAPP_NOTE_EN =
  "WhatsApp clarifications are not continuous monitoring and do not imply real-time replies.";

// Prices, ids, and checkout logic are unchanged from before this round --
// only copy (shortened per the editorial pass) and the removed per-card
// "recommended" flag/badge.
const services: ServiceOffering[] = [
  {
    id: "primii-pasi",
    nameRo: "Primii Pași",
    nameEn: "First Steps",
    price: 200,
    periodRo: "21 zile",
    periodEn: "21 days",
    periodSubRo: "7 zile jurnal + 14 zile aplicare",
    periodSubEn: "7 days journal + 14 days applying recommendations",
    shortRo:
      "Pentru persoanele care vor să își înțeleagă mai bine alimentația actuală și să primească recomandări concrete, fără o consultație completă.",
    shortEn:
      "For people who want to better understand their current eating habits and get concrete recommendations, without a full consultation.",
    includeLabelRo: "Cum se desfășoară",
    includeLabelEn: "How it works",
    includeRo: [
      "jurnal alimentar timp de 7 zile;",
      "analizarea alimentației actuale;",
      "estimarea necesarului energetic și stabilirea unui aport orientativ;",
      "primești recomandările pe WhatsApp;",
      "timp de 14 zile aplici recomandările și continui jurnalul;",
      "la final primești feedback și, dacă este necesar, ajustări.",
    ],
    includeEn: [
      "a 7-day food journal;",
      "reviewing your current eating habits;",
      "estimating your energy needs and setting an orientative intake;",
      "you receive the recommendations on WhatsApp;",
      "over 14 days you apply the recommendations and continue the journal;",
      "at the end you receive feedback and, if needed, adjustments.",
    ],
    hasWhatsApp: true,
  },
  {
    id: "consultatie-nutritionala",
    nameRo: "Consultație Nutrițională",
    nameEn: "Nutrition Consultation",
    price: 300,
    periodRo: "45–60 minute",
    periodEn: "45–60 minutes",
    shortRo:
      "Pentru persoanele care au nevoie de o evaluare completă și de recomandări nutriționale adaptate nevoilor și obiectivelor lor.",
    shortEn:
      "For people who need a complete assessment and nutritional recommendations tailored to their needs and goals.",
    includeLabelRo: "Include",
    includeLabelEn: "Includes",
    includeRo: [
      "jurnal alimentar timp de 7 zile;",
      "evaluarea alimentației actuale, a istoricului relevant și a principalelor dificultăți;",
      "revizuirea analizelor medicale recente disponibile, atunci când sunt relevante pentru recomandările nutriționale;",
      "estimarea necesarului energetic și stabilirea obiectivelor nutriționale;",
      "recomandări nutriționale personalizate și plan alimentar orientativ pentru 7 zile.",
    ],
    includeEn: [
      "a 7-day food journal;",
      "assessing your current eating habits, relevant history, and main difficulties;",
      "reviewing your recent available medical test results, when relevant to the nutritional recommendations;",
      "estimating your energy needs and setting your nutritional goals;",
      "tailored nutritional recommendations and an orientative 7-day meal plan.",
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
      "Pentru persoanele care, pe lângă consultația inițială, au nevoie de o perioadă de ghidaj și de o reevaluare pe parcurs.",
    shortEn:
      "For people who need, beyond the initial consultation, a period of guidance and a check-in along the way.",
    includeLabelRo: "Include Consultația Nutrițională, plus:",
    includeLabelEn: "Includes the Nutrition Consultation, plus:",
    includeRo: [
      "o monitorizare de aproximativ 20 de minute;",
      "ajustarea recomandărilor în funcție de evoluție;",
      "clarificări punctuale pe WhatsApp pe durata programului.",
    ],
    includeEn: [
      "1 check-in of about 20 minutes;",
      "adjusting recommendations based on your progress;",
      "point-in-time clarifications on WhatsApp during the program.",
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
      "Pentru persoanele care au nevoie de urmărire pe o perioadă mai lungă, cu reevaluări și ajustări succesive.",
    shortEn:
      "For people who need longer-term follow-up, with successive check-ins and adjustments.",
    includeLabelRo: "Include Consultația Nutrițională, plus:",
    includeLabelEn: "Includes the Nutrition Consultation, plus:",
    includeRo: [
      "trei monitorizări de aproximativ 20 de minute, aproximativ una pe lună;",
      "ajustarea recomandărilor pe parcurs;",
      "feedback asupra progresului;",
      "clarificări punctuale pe WhatsApp între monitorizări.",
    ],
    includeEn: [
      "3 check-ins of about 20 minutes each, roughly one per month;",
      "adjustments along the way;",
      "feedback on your progress;",
      "point-in-time clarifications on WhatsApp between check-ins.",
    ],
    hasWhatsApp: true,
  },
];

// Kept structurally separate from `services` (own section, own eyebrow),
// per this round's explicit "must read as visually separate from the 4
// new-patient services" instruction -- not just a data-shape difference.
const MONITORING: ServiceOffering = {
  id: "monitorizare-nutritionala",
  nameRo: "Monitorizare Nutrițională",
  nameEn: "Nutritional Monitoring",
  price: 200,
  periodRo: "30 minute",
  periodEn: "30 minutes",
  shortRo: "Pentru pacienții care au avut deja o consultație și au nevoie de o reevaluare punctuală a evoluției.",
  shortEn: "For patients who have already had a consultation and need a one-time reassessment of their progress.",
  includeLabelRo: "Include",
  includeLabelEn: "Includes",
  includeRo: [
    "verificarea modului în care au fost aplicate recomandările stabilite anterior;",
    "reevaluarea progresului și a eventualelor dificultăți apărute;",
    "revizuirea planului alimentar, dacă este necesar;",
    "recomandări scrise actualizate pentru perioada următoare.",
  ],
  includeEn: [
    "checking how the previously set recommendations were applied;",
    "reassessing your progress and any difficulties that came up;",
    "reviewing your meal plan, if needed;",
    "updated written recommendations for the period ahead.",
  ],
};

const HOW_TO_CHOOSE = [
  {
    nameRo: "Primii Pași",
    nameEn: "First Steps",
    descRo: "ghidaj inițial, fără consultație completă",
    descEn: "initial guidance, without a full consultation",
  },
  {
    nameRo: "Consultație Nutrițională",
    nameEn: "Nutrition Consultation",
    descRo: "evaluare completă, punctuală, fără monitorizare inclusă",
    descEn: "a complete, one-time assessment, without monitoring included",
  },
  {
    nameRo: "Program 6 săptămâni",
    nameEn: "6-Week Program",
    descRo: "consultație + 1 monitorizare",
    descEn: "consultation + 1 check-in",
  },
  {
    nameRo: "Program 3 luni",
    nameEn: "3-Month Program",
    descRo: "consultație + 3 monitorizări",
    descEn: "consultation + 3 check-ins",
  },
];

const AFTER_PAYMENT_STEPS = [
  { ro: "Plata este confirmată.", en: "Your payment is confirmed." },
  { ro: "Completezi jurnalul alimentar.", en: "You fill in your food journal." },
  {
    ro: "Pregătești analizele medicale pe care le ai deja pentru consultație.",
    en: "You prepare any medical test results you already have for the consultation.",
  },
  {
    ro: "Te contactăm pentru stabilirea datei și orei consultației.",
    en: "We contact you to schedule the date and time of your consultation.",
  },
];

const MOBILE_VISIBLE_ITEMS = 3;

// Shared visual language for every service card on this page (the 4 main
// ones + Monitorizare) -- rounded-2xl border + bg-card/60, no shadow, no
// icon circle, matching Home's "Din răspunsuri" / Despre mine's credibility
// blocks instead of the old shadcn Card/Badge/Button + CheckCircle2 +
// "Recomandat" badge treatment.
function ServiceCard({
  service,
  ro,
  expanded,
  onToggle,
}: {
  service: ServiceOffering;
  ro: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const includeItems = ro ? service.includeRo : service.includeEn;
  const visibleItems = includeItems.slice(0, MOBILE_VISIBLE_ITEMS);
  const restItems = includeItems.slice(MOBILE_VISIBLE_ITEMS);
  // On mobile, everything past the first few bullets (remaining items, the
  // analysis link, the note) is collapsed behind a toggle. On desktop
  // (lg+) it's always shown -- this class combo is the only thing
  // controlling that.
  const extraVisibilityClass = expanded ? "block" : "hidden lg:block";
  const hasExtra = restItems.length > 0 || service.showAnalysisLink || (service.noteRo && service.noteEn);

  return (
    <div className="h-full min-w-0 flex flex-col rounded-2xl border border-border bg-card/60 p-6">
      <h2 className="font-serif font-bold text-xl md:text-2xl text-foreground mb-1 text-balance">
        {ro ? service.nameRo : service.nameEn}
      </h2>
      <p className="mb-1">
        <span className="text-2xl md:text-3xl font-bold text-primary">{service.price} lei</span>
        <span className="text-muted-foreground"> · {ro ? service.periodRo : service.periodEn}</span>
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
      <ul className="space-y-2.5 max-lg:text-[17px] max-lg:leading-[1.55] lg:text-sm lg:leading-relaxed text-muted-foreground mb-2">
        {visibleItems.map((item, j) => (
          <li key={j} className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className={extraVisibilityClass}>
        {restItems.length > 0 && (
          <ul className="space-y-2.5 max-lg:text-[17px] max-lg:leading-[1.55] lg:text-sm lg:leading-relaxed text-muted-foreground mb-2">
            {restItems.map((item, j) => (
              <li key={j} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        {service.showAnalysisLink && (
          <Link
            href="/consultatii#analize"
            className="inline-flex items-center gap-1.5 text-xs text-primary underline underline-offset-2 mb-6 hover:no-underline"
          >
            <ClipboardCheck className="w-3.5 h-3.5 shrink-0" />
            {ro ? "Vezi analizele recomandate înainte de consultație" : "See the recommended tests before your consultation"}
          </Link>
        )}
        {!service.showAnalysisLink && <div className="mb-6" />}

        {service.noteRo && service.noteEn && (
          <p className="text-xs text-muted-foreground leading-relaxed mb-6">{ro ? service.noteRo : service.noteEn}</p>
        )}
      </div>

      {hasExtra && (
        <button
          type="button"
          onClick={onToggle}
          className="lg:hidden flex items-center gap-1.5 text-xs font-semibold text-primary mb-6 -mt-2"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          {expanded ? (ro ? "Ascunde detaliile" : "Hide details") : (ro ? "Vezi toate detaliile" : "See all details")}
        </button>
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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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
        {/* Header */}
        <motion.div
          className="max-w-2xl mx-auto text-center mb-10 md:mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase text-primary mb-4">
            <span className="inline-block w-4 h-px bg-primary" aria-hidden="true" />
            {ro ? "Servicii" : "Services"}
          </span>
          <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground leading-tight md:leading-normal mb-4 text-balance">
            {ro ? "Alege nivelul de sprijin de care ai nevoie." : "Choose the level of support you need."}
          </h1>
          <p className="text-muted-foreground max-lg:text-[17px] max-lg:leading-[1.55] lg:text-lg lg:leading-relaxed">
            {ro
              ? "De la un prim ghidaj până la monitorizare pe termen lung — fiecare serviciu are un nivel diferit de sprijin."
              : "From initial guidance to longer-term monitoring — each service offers a different level of support."}
          </p>
        </motion.div>

        {/* "Cum alegi?" -- short editorial block, not a table, not 4 more
            cards -- just a scannable definition list before the services. */}
        <motion.div
          className="max-w-3xl mx-auto mb-12 md:mb-16 rounded-2xl border border-border bg-card/60 p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif font-bold text-xl text-foreground mb-4">{ro ? "Cum alegi?" : "How do you choose?"}</h2>
          <ul className="space-y-2.5">
            {HOW_TO_CHOOSE.map((item, i) => (
              <li
                key={i}
                className="max-lg:text-[17px] max-lg:leading-[1.55] lg:text-sm lg:leading-relaxed text-muted-foreground"
              >
                <span className="font-semibold text-foreground">{ro ? item.nameRo : item.nameEn}</span>
                {" — "}
                {ro ? item.descRo : item.descEn}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Services grid: 2x2 on desktop, single column on mobile. */}
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <ServiceCard
                service={service}
                ro={ro}
                expanded={!!expanded[service.id]}
                onToggle={() => setExpanded((prev) => ({ ...prev, [service.id]: !prev[service.id] }))}
              />
            </motion.div>
          ))}
        </div>

        {/* Single shared WhatsApp note, after the services that mention
            WhatsApp (Primii Pași, both Programs) -- was repeated near-
            identically on up to 3 cards before. */}
        {services.some((s) => s.hasWhatsApp) && (
          <p className="max-w-5xl mx-auto text-xs text-muted-foreground text-center mt-6">{ro ? WHATSAPP_NOTE_RO : WHATSAPP_NOTE_EN}</p>
        )}

        {/* Monitorizare Nutrițională -- visually separate section for
            existing patients, not intercalated with the 4 new-patient
            services above. */}
        <motion.div
          className="max-w-5xl mx-auto mt-16 md:mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase text-primary mb-4">
            <span className="inline-block w-4 h-px bg-primary" aria-hidden="true" />
            {ro ? "Pentru pacienții existenți" : "For existing patients"}
          </span>
          <div className="max-w-2xl">
            <ServiceCard
              service={MONITORING}
              ro={ro}
              expanded={!!expanded[MONITORING.id]}
              onToggle={() => setExpanded((prev) => ({ ...prev, [MONITORING.id]: !prev[MONITORING.id] }))}
            />
          </div>
        </motion.div>

        {/* Ce se întâmplă după plată? */}
        <motion.div
          className="max-w-3xl mx-auto mt-16 md:mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif font-bold text-xl md:text-2xl text-foreground mb-5 text-balance">
            {ro ? "Ce se întâmplă după plată?" : "What happens after you pay?"}
          </h2>
          <ol className="space-y-3">
            {AFTER_PAYMENT_STEPS.map((step, i) => (
              <li key={i} className="flex items-start gap-3 max-lg:text-[17px] max-lg:leading-[1.55] lg:text-base lg:leading-relaxed text-muted-foreground">
                <span className="font-semibold text-primary shrink-0">{i + 1}.</span>
                <span>{ro ? step.ro : step.en}</span>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* Bottom CTA -- restyled to match Home/Despre mine's calm final
            section (no bordered/tinted box, plain centered text). */}
        <motion.div
          className="max-w-2xl mx-auto text-center mt-16 md:mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl md:text-4xl font-serif font-bold text-foreground leading-tight md:leading-normal mb-4 text-balance">
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
        </motion.div>
      </div>
    </div>
  );
}
