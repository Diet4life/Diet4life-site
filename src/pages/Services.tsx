import { Fragment, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { CheckCircle2, ArrowRight, ChevronDown, MessageCircle, Stethoscope, CalendarCheck2, CalendarRange, ClipboardCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { services as checkoutCatalog } from "@/lib/catalog/services";

// Services.tsx is the single purchase entry point: each card's CTA links to
// real checkout (/checkout/:slug) when the matching catalog entry
// (src/lib/catalog/services.ts) is purchaseMode "checkout", or falls back
// to /contact for anything still "contact" -- so re-scoping an item back to
// contact-only later is a one-line catalog change, no JSX edit needed here.
function serviceCtaHref(id: string): string {
  const entry = checkoutCatalog.find((s) => s.id === id);
  return entry?.purchaseMode === "checkout" ? `/checkout/${id}` : "/contact";
}

interface ServiceOffering {
  id: string;
  icon: typeof MessageCircle;
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
  noteRo?: string;
  noteEn?: string;
  ctaRo: string;
  ctaEn: string;
  recommended?: boolean;
}

const ANALYSIS_LINE_RO =
  "revizuirea analizelor medicale recente disponibile, dacă există, pentru a adapta recomandările nutriționale la contextul metabolic și nutrițional;";
const ANALYSIS_LINE_EN =
  "reviewing your recent available medical test results, if any, to adapt nutritional recommendations to your metabolic and nutritional context;";

const services: ServiceOffering[] = [
  {
    id: "primii-pasi",
    icon: MessageCircle,
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
      "jurnal alimentar 7 zile;",
      "analizarea alimentației actuale;",
      "estimarea necesarului energetic și stabilirea unui aport orientativ;",
      "primești recomandări și modificări pe WhatsApp;",
      "în următoarele 14 zile aplici recomandările și continui jurnalul;",
      "la final primești feedback și ajustări pe WhatsApp.",
    ],
    includeEn: [
      "a 7-day food journal;",
      "reviewing your current eating habits;",
      "estimating your energy needs and setting an orientative intake;",
      "you receive recommendations and adjustments on WhatsApp;",
      "over the following 14 days you apply the recommendations and continue the journal;",
      "at the end you receive feedback and adjustments on WhatsApp.",
    ],
    noteRo: "Clarificări punctuale pe WhatsApp, fără monitorizare zilnică în timp real.",
    noteEn: "Point-in-time clarifications on WhatsApp, without real-time daily monitoring.",
    ctaRo: "Alege serviciul",
    ctaEn: "Choose this service",
  },
  {
    id: "consultatie-nutritionala",
    icon: Stethoscope,
    nameRo: "Consultație Nutrițională",
    nameEn: "Nutrition Consultation",
    price: 300,
    periodRo: "45–60 minute",
    periodEn: "45–60 minutes",
    shortRo: "Pentru persoanele care au nevoie de o evaluare completă și de o strategie nutrițională personalizată.",
    shortEn: "For people who need a complete assessment and a personalized nutrition strategy.",
    includeLabelRo: "Include",
    includeLabelEn: "Includes",
    includeRo: [
      "jurnal alimentar 7 zile;",
      "evaluarea alimentației actuale și a istoricului relevant;",
      "evaluarea obiectivelor și a principalelor dificultăți;",
      ANALYSIS_LINE_RO,
      "stabilirea necesarului energetic și a obiectivelor;",
      "recomandări nutriționale adaptate;",
      "plan alimentar orientativ pentru 7 zile;",
      "recomandări practice și pașii următori.",
    ],
    includeEn: [
      "a 7-day food journal;",
      "assessment of your current eating habits and relevant history;",
      "assessing your goals and main difficulties;",
      ANALYSIS_LINE_EN,
      "determining your energy needs and goals;",
      "tailored nutritional recommendations;",
      "an orientative 7-day meal plan;",
      "practical recommendations and next steps.",
    ],
    showAnalysisLink: true,
    noteRo: "Consultația nu include monitorizare ulterioară.",
    noteEn: "The consultation does not include follow-up monitoring.",
    ctaRo: "Alege serviciul",
    ctaEn: "Choose this service",
  },
  {
    id: "program-6-saptamani",
    icon: CalendarCheck2,
    nameRo: "Program Nutrițional 6 săptămâni",
    nameEn: "6-Week Nutrition Program",
    price: 480,
    periodRo: "6 săptămâni",
    periodEn: "6 weeks",
    shortRo: "Pentru persoanele care au nevoie de evaluare, intervenție și ajustări pe parcurs.",
    shortEn: "For people who need assessment, intervention, and adjustments along the way.",
    recommended: true,
    includeLabelRo: "Include",
    includeLabelEn: "Includes",
    includeRo: [
      "consultație inițială de 45–60 minute;",
      "jurnal alimentar 7 zile;",
      "evaluarea alimentației și contextului relevant;",
      ANALYSIS_LINE_RO,
      "stabilirea necesarului energetic și a obiectivelor;",
      "plan alimentar pentru 7 zile;",
      "1 monitorizare de aproximativ 20 minute;",
      "ajustarea recomandărilor, dacă este necesar;",
      "clarificări punctuale pe WhatsApp.",
    ],
    includeEn: [
      "an initial 45–60 minute consultation;",
      "a 7-day food journal;",
      "assessment of your eating habits and relevant context;",
      ANALYSIS_LINE_EN,
      "determining your energy needs and goals;",
      "a 7-day meal plan;",
      "1 check-in of about 20 minutes;",
      "adjusting recommendations, if needed;",
      "point-in-time clarifications on WhatsApp.",
    ],
    showAnalysisLink: true,
    noteRo: "Clarificările pe WhatsApp nu înseamnă monitorizare continuă sau răspuns în timp real.",
    noteEn: "WhatsApp clarifications do not mean continuous monitoring or real-time replies.",
    ctaRo: "Alege serviciul",
    ctaEn: "Choose this service",
  },
  {
    id: "program-3-luni",
    icon: CalendarRange,
    nameRo: "Program Nutrițional 3 luni",
    nameEn: "3-Month Nutrition Program",
    price: 850,
    periodRo: "3 luni",
    periodEn: "3 months",
    shortRo: "Pentru persoanele care au nevoie de intervenție mai amplă și monitorizare pe termen mai lung.",
    shortEn: "For people who need a broader intervention and longer-term monitoring.",
    includeLabelRo: "Include",
    includeLabelEn: "Includes",
    includeRo: [
      "consultație inițială de 45–60 minute;",
      "jurnal alimentar 7 zile;",
      "evaluarea alimentației și istoricului relevant;",
      ANALYSIS_LINE_RO,
      "stabilirea necesarului energetic și a obiectivelor;",
      "plan alimentar pentru 7 zile;",
      "3 monitorizări de aproximativ 20 minute;",
      "aproximativ una pe lună;",
      "ajustarea recomandărilor pe parcurs;",
      "feedback asupra progresului;",
      "clarificări punctuale pe WhatsApp între monitorizări.",
    ],
    includeEn: [
      "an initial 45–60 minute consultation;",
      "a 7-day food journal;",
      "assessment of your eating habits and relevant history;",
      ANALYSIS_LINE_EN,
      "determining your energy needs and goals;",
      "a 7-day meal plan;",
      "3 check-ins of about 20 minutes each;",
      "about one check-in per month;",
      "adjustments along the way;",
      "feedback on your progress;",
      "point-in-time clarifications on WhatsApp between check-ins.",
    ],
    showAnalysisLink: true,
    noteRo: "Clarificările pe WhatsApp nu înseamnă monitorizare continuă sau răspuns în timp real.",
    noteEn: "WhatsApp clarifications do not mean continuous monitoring or real-time replies.",
    ctaRo: "Alege serviciul",
    ctaEn: "Choose this service",
  },
];

const MONITORING = {
  nameRo: "Monitorizare Nutrițională",
  nameEn: "Nutritional Monitoring",
  subtitleRo: "Pentru pacienții care au avut deja o consultație și au nevoie de o reevaluare punctuală.",
  subtitleEn: "For patients who have already had a consultation and need a one-time reassessment.",
  price: 200,
  ctaRo: "Alege serviciul",
  ctaEn: "Choose this service",
};

const MOBILE_VISIBLE_ITEMS = 3;

export default function Services() {
  const { language } = useLanguage();
  const ro = language === "ro";
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <div className="py-24 bg-secondary/30 min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-5">
            {ro ? "Alege nivelul de sprijin de care ai nevoie." : "Choose the level of support you need."}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {ro
              ? "De la feedback punctual pe jurnalul alimentar până la monitorizare pe termen mai lung, fiecare serviciu are o structură clară și un nivel diferit de suport."
              : "From point-in-time feedback on your food journal to longer-term monitoring, each service has a clear structure and a different level of support."}
          </p>
        </motion.div>

        {/* Services grid: 2x2 on desktop, single column on mobile */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {services.map((service, i) => {
            const Icon = service.icon;
            const includeItems = ro ? service.includeRo : service.includeEn;
            const visibleItems = includeItems.slice(0, MOBILE_VISIBLE_ITEMS);
            const restItems = includeItems.slice(MOBILE_VISIBLE_ITEMS);
            const isExpanded = !!expanded[service.id];
            // On mobile, everything past the first few bullets (remaining items,
            // the analysis link, the WhatsApp note) is collapsed behind a toggle.
            // On desktop (lg+) it's always shown, exactly as before -- this class
            // combo is the only thing controlling that: "hidden lg:block" when
            // collapsed, "block" (visible everywhere) once expanded.
            const extraVisibilityClass = isExpanded ? "block" : "hidden lg:block";
            const hasExtra = restItems.length > 0 || service.showAnalysisLink || (service.noteRo && service.noteEn);
            return (
              <Fragment key={service.id}>
              <motion.div
                className="relative min-w-0"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {service.recommended && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    {ro ? "Recomandat" : "Recommended"}
                  </Badge>
                )}
                <Card className={`h-full min-w-0 ${service.recommended ? "border-primary shadow-md" : "border-border"}`}>
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="font-serif font-bold text-2xl text-foreground mb-1">
                      {ro ? service.nameRo : service.nameEn}
                    </h2>
                    <p className="text-3xl font-bold text-primary mb-1">{service.price} lei</p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {ro ? service.periodRo : service.periodEn}
                    </p>
                    {service.periodSubRo && service.periodSubEn && (
                      <p className="text-xs text-muted-foreground mb-4">
                        {ro ? service.periodSubRo : service.periodSubEn}
                      </p>
                    )}
                    <p className={`text-muted-foreground leading-relaxed text-sm mb-6 ${service.periodSubRo ? "" : "mt-4"}`}>
                      {ro ? service.shortRo : service.shortEn}
                    </p>

                    <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground mb-3">
                      {ro ? service.includeLabelRo : service.includeLabelEn}
                    </h3>
                    <ul className="space-y-2 mb-2">
                      {visibleItems.map((item, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm text-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <div className={extraVisibilityClass}>
                      {restItems.length > 0 && (
                        <ul className="space-y-2 mb-2">
                          {restItems.map((item, j) => (
                            <li key={j} className="flex items-start gap-2.5 text-sm text-foreground">
                              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              {item}
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
                          {ro
                            ? "Vezi analizele recomandate înainte de consultație"
                            : "See the recommended tests before your consultation"}
                        </Link>
                      )}
                      {!service.showAnalysisLink && <div className="mb-6" />}

                      {service.noteRo && service.noteEn && (
                        <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                          {ro ? service.noteRo : service.noteEn}
                        </p>
                      )}
                    </div>

                    {hasExtra && (
                      <button
                        type="button"
                        onClick={() => setExpanded(prev => ({ ...prev, [service.id]: !prev[service.id] }))}
                        className="lg:hidden flex items-center gap-1.5 text-xs font-semibold text-primary mb-6 -mt-2"
                      >
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                        {isExpanded
                          ? (ro ? "Ascunde detaliile" : "Hide details")
                          : (ro ? "Vezi toate detaliile" : "See all details")}
                      </button>
                    )}

                    <Button
                      asChild
                      size="lg"
                      variant={service.recommended ? "default" : "outline"}
                      className="rounded-xl gap-2 w-full mt-auto"
                    >
                      <Link href={serviceCtaHref(service.id)}>
                        {ro ? service.ctaRo : service.ctaEn}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Monitorizare Nutrițională — minimal, name + price only.
                  Inserted right after Consultație Nutrițională (index 1) so
                  the visual order is Primii Pași, Consultație, Monitorizare,
                  Program 6 săptămâni, Program 3 luni. md:col-span-2 makes it
                  span the full grid row on desktop; on mobile the grid is
                  already single-column, so it just falls in place as the
                  3rd stacked card. */}
              {i === 1 && (
                <motion.div
                  className="md:col-span-2"
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="border-border">
                    <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-foreground">
                          {ro ? MONITORING.nameRo : MONITORING.nameEn}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {ro ? MONITORING.subtitleRo : MONITORING.subtitleEn}
                        </p>
                      </div>
                      <span className="text-xl font-bold text-primary sm:hidden">{MONITORING.price} lei</span>
                      <div className="flex items-center gap-4">
                        <span className="hidden sm:inline text-xl font-bold text-primary">{MONITORING.price} lei</span>
                        <Button asChild variant="outline" className="rounded-xl gap-2 w-full sm:w-auto">
                          <Link href={serviceCtaHref("monitorizare-nutritionala")}>
                            {ro ? MONITORING.ctaRo : MONITORING.ctaEn}
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              </Fragment>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center rounded-2xl bg-primary/8 border border-primary/20 py-10 px-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-serif font-bold text-foreground mb-3">
            {ro ? "Nu știi de unde să începi?" : "Not sure where to start?"}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm leading-relaxed">
            {ro
              ? "Contactează-ne și îți vom recomanda cel mai potrivit serviciu pentru situația ta."
              : "Contact us and we'll recommend the most suitable service for your situation."}
          </p>
          <Button asChild size="lg" className="rounded-xl gap-2">
            <Link href="/contact">
              {ro ? "Contactează-ne" : "Contact us"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
