import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { CheckCircle2, ArrowRight, MessageCircle, Stethoscope, CalendarCheck2, CalendarRange } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ServiceOffering {
  id: string;
  icon: typeof MessageCircle;
  nameRo: string;
  nameEn: string;
  price: number;
  periodRo: string;
  periodEn: string;
  shortRo: string;
  shortEn: string;
  includeLabelRo: string;
  includeLabelEn: string;
  includeRo: string[];
  includeEn: string[];
  calendarLabelRo?: string;
  calendarLabelEn?: string;
  calendarRo?: string[];
  calendarEn?: string[];
  noteRo?: string;
  noteEn?: string;
  ctaRo: string;
  ctaEn: string;
  recommended?: boolean;
}

const services: ServiceOffering[] = [
  {
    id: "ghidaj-whatsapp",
    icon: MessageCircle,
    nameRo: "Ghidaj WhatsApp",
    nameEn: "WhatsApp Guidance",
    price: 200,
    periodRo: "21 zile",
    periodEn: "21 days",
    shortRo:
      "Pentru persoanele care vor să își înțeleagă mai bine alimentația actuală și să primească recomandări concrete, fără o consultație completă.",
    shortEn:
      "For people who want to better understand their current eating habits and get concrete recommendations, without a full consultation.",
    includeLabelRo: "Cum se desfășoară",
    includeLabelEn: "How it works",
    includeRo: [
      "îmi trimiți un jurnal alimentar pe 7 zile;",
      "analizez alimentația actuală;",
      "estimez necesarul energetic și stabilesc un aport orientativ pentru obiectiv;",
      "primești recomandări și modificări pe WhatsApp;",
      "în următoarele 14 zile aplici recomandările și continui jurnalul;",
      "la final primești feedback și ajustări pe WhatsApp.",
    ],
    includeEn: [
      "you send me a 7-day food journal;",
      "I analyze your current eating habits;",
      "I estimate your energy needs and set an orientative intake for your goal;",
      "you receive recommendations and adjustments on WhatsApp;",
      "over the following 14 days you apply the recommendations and continue the journal;",
      "at the end you receive feedback and adjustments on WhatsApp.",
    ],
    noteRo: "Comunicare: clarificări punctuale pe WhatsApp, fără monitorizare zilnică în timp real.",
    noteEn: "Communication: point-in-time clarifications on WhatsApp, without real-time daily monitoring.",
    ctaRo: "Alege acest serviciu",
    ctaEn: "Choose this service",
  },
  {
    id: "consultatie-nutritionala",
    icon: Stethoscope,
    nameRo: "Consultație nutrițională",
    nameEn: "Nutrition Consultation",
    price: 300,
    periodRo: "45–60 minute",
    periodEn: "45–60 minutes",
    shortRo: "Pentru persoanele care au nevoie de o evaluare completă și de o strategie nutrițională personalizată.",
    shortEn: "For people who need a complete assessment and a personalized nutrition strategy.",
    includeLabelRo: "Include",
    includeLabelEn: "Includes",
    includeRo: [
      "evaluarea alimentației actuale și a istoricului relevant;",
      "evaluarea obiectivelor și a principalelor dificultăți;",
      "revizuirea analizelor medicale disponibile, atunci când există patologii sau situații care necesită acest lucru;",
      "recomandări nutriționale adaptate contextului medical;",
      "stabilirea necesarului energetic și a obiectivelor;",
      "strategie de intervenție;",
      "plan alimentar orientativ pentru 7 zile, adaptat obiectivelor și preferințelor;",
      "recomandări practice și pașii următori.",
    ],
    includeEn: [
      "assessment of your current eating habits and relevant history;",
      "assessment of your goals and main difficulties;",
      "review of available medical test results, when there are conditions or situations that require it;",
      "nutritional recommendations adapted to the medical context;",
      "establishing energy needs and goals;",
      "intervention strategy;",
      "an orientative 7-day meal plan, adapted to your goals and preferences;",
      "practical recommendations and next steps.",
    ],
    noteRo: "Important: consultația nu include monitorizare ulterioară.",
    noteEn: "Important: the consultation does not include follow-up monitoring.",
    ctaRo: "Programează o consultație",
    ctaEn: "Book a consultation",
  },
  {
    id: "pachet-echilibru",
    icon: CalendarCheck2,
    nameRo: "Pachet Echilibru",
    nameEn: "Balance Package",
    price: 600,
    periodRo: "6 săptămâni",
    periodEn: "6 weeks",
    shortRo: "Pentru persoanele care au nevoie de evaluare, intervenție și ajustări pe parcurs.",
    shortEn: "For people who need assessment, intervention, and adjustments along the way.",
    recommended: true,
    includeLabelRo: "Include",
    includeLabelEn: "Includes",
    includeRo: [
      "consultație inițială de 45–60 minute;",
      "evaluarea alimentației și a contextului relevant;",
      "revizuirea analizelor medicale, dacă există patologii;",
      "recomandări adaptate rezultatelor analizelor și situației clinice;",
      "calcul necesar energetic și obiective;",
      "plan alimentar pentru 7 zile;",
      "jurnal alimentar;",
      "2 monitorizări de aproximativ 20 minute;",
      "ajustarea recomandărilor și a planului, dacă este necesar;",
      "feedback asupra progresului;",
      "clarificări punctuale pe WhatsApp între monitorizări.",
    ],
    includeEn: [
      "an initial 45–60 minute consultation;",
      "assessment of your eating habits and relevant context;",
      "review of medical test results, if there are conditions;",
      "recommendations adapted to test results and clinical situation;",
      "energy needs and goals calculation;",
      "a 7-day meal plan;",
      "a food journal;",
      "2 check-ins of about 20 minutes each;",
      "adjusting recommendations and the plan, if needed;",
      "feedback on progress;",
      "point-in-time clarifications on WhatsApp between check-ins.",
    ],
    calendarLabelRo: "Calendar orientativ",
    calendarLabelEn: "Orientative calendar",
    calendarRo: [
      "Săptămâna 0 — consultație inițială",
      "Săptămâna 2 — monitorizare 1, aproximativ 20 minute",
      "Săptămâna 4 — monitorizare 2, aproximativ 20 minute",
      "până la finalul săptămânii 6 — aplicarea ajustărilor și clarificări punctuale",
    ],
    calendarEn: [
      "Week 0 — initial consultation",
      "Week 2 — check-in 1, about 20 minutes",
      "Week 4 — check-in 2, about 20 minutes",
      "until the end of week 6 — applying adjustments and point-in-time clarifications",
    ],
    ctaRo: "Alege Pachetul Echilibru",
    ctaEn: "Choose the Balance Package",
  },
  {
    id: "pachet-transformare",
    icon: CalendarRange,
    nameRo: "Pachet Transformare",
    nameEn: "Transformation Package",
    price: 900,
    periodRo: "3 luni",
    periodEn: "3 months",
    shortRo: "Pentru persoanele care au nevoie de intervenție mai amplă și monitorizare pe termen mai lung.",
    shortEn: "For people who need a broader intervention and longer-term monitoring.",
    includeLabelRo: "Include",
    includeLabelEn: "Includes",
    includeRo: [
      "consultație inițială de 45–60 minute;",
      "evaluarea detaliată a alimentației și istoricului relevant;",
      "revizuirea analizelor medicale la pacienții cu patologii;",
      "recomandări adaptate situației clinice și analizelor disponibile;",
      "calcul necesar energetic și stabilirea obiectivelor;",
      "plan alimentar personalizat pentru 7 zile;",
      "jurnal alimentar;",
      "monitorizări periodice;",
      "ajustarea planului și recomandărilor pe parcurs;",
      "feedback asupra progresului;",
      "clarificări punctuale pe WhatsApp între ședințe.",
    ],
    includeEn: [
      "an initial 45–60 minute consultation;",
      "a detailed assessment of your eating habits and relevant history;",
      "review of medical test results for patients with conditions;",
      "recommendations adapted to the clinical situation and available test results;",
      "energy needs calculation and setting goals;",
      "a personalized 7-day meal plan;",
      "a food journal;",
      "periodic check-ins;",
      "adjusting the plan and recommendations along the way;",
      "feedback on progress;",
      "point-in-time clarifications on WhatsApp between sessions.",
    ],
    calendarLabelRo: "Calendar",
    calendarLabelEn: "Calendar",
    calendarRo: [
      "Săptămâna 0 — consultație inițială",
      "Săptămâna 2 — monitorizare 1",
      "Săptămâna 4 — monitorizare 2",
      "Săptămâna 8 — monitorizare 3",
      "Săptămâna 12 — monitorizare finală",
    ],
    calendarEn: [
      "Week 0 — initial consultation",
      "Week 2 — check-in 1",
      "Week 4 — check-in 2",
      "Week 8 — check-in 3",
      "Week 12 — final check-in",
    ],
    ctaRo: "Alege Pachetul Transformare",
    ctaEn: "Choose the Transformation Package",
  },
];

export default function Services() {
  const { language } = useLanguage();
  const ro = language === "ro";

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
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                className="relative"
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
                <Card className={`h-full ${service.recommended ? "border-primary shadow-md" : "border-border"}`}>
                  <CardContent className="p-8 flex flex-col h-full">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="font-serif font-bold text-2xl text-foreground mb-1">
                      {ro ? service.nameRo : service.nameEn}
                    </h2>
                    <p className="text-3xl font-bold text-primary mb-1">{service.price} lei</p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                      {ro ? service.periodRo : service.periodEn}
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm mb-6">
                      {ro ? service.shortRo : service.shortEn}
                    </p>

                    <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground mb-3">
                      {ro ? service.includeLabelRo : service.includeLabelEn}
                    </h3>
                    <ul className="space-y-2 mb-6">
                      {(ro ? service.includeRo : service.includeEn).map((item, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-sm text-foreground">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    {service.calendarRo && service.calendarEn && (
                      <>
                        <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground mb-3">
                          {ro ? service.calendarLabelRo : service.calendarLabelEn}
                        </h3>
                        <ul className="space-y-1.5 mb-6 text-sm text-muted-foreground">
                          {(ro ? service.calendarRo : service.calendarEn).map((item, j) => (
                            <li key={j}>{item}</li>
                          ))}
                        </ul>
                      </>
                    )}

                    {service.noteRo && service.noteEn && (
                      <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                        {ro ? service.noteRo : service.noteEn}
                      </p>
                    )}

                    <Button
                      asChild
                      size="lg"
                      variant={service.recommended ? "default" : "outline"}
                      className="rounded-xl gap-2 w-full mt-auto"
                    >
                      <Link href="/contact">
                        {ro ? service.ctaRo : service.ctaEn}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
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
