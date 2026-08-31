import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse, Scale, ChevronDown, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const services = [
  {
    id: "consultation",
    icon: HeartPulse,
    color: "hsl(152 35% 40%)",
    bgColor: "hsl(152 35% 40% / 0.08)",
    title: {
      ro: "Consultație nutrițională personalizată",
      en: "Personalized Nutrition Consultation",
    },
    desc: {
      ro: "Evaluare completă și plan de nutriție adaptat stilului tău de viață și obiectivelor tale de sănătate.",
      en: "Complete assessment and nutrition plan tailored to your lifestyle and health goals.",
    },
    details: {
      ro: {
        intro:
          "Prima consultație reprezintă fundamentul întregului tău parcurs nutrițional. Aceasta include o evaluare aprofundată a stării tale de sănătate, a obiceiurilor alimentare, a istoricului medical și a obiectivelor personale.",
        includes: [
          "Anamneza nutrițională completă (60–90 minute)",
          "Analiza obiceiurilor alimentare și a stilului de viață",
          "Evaluarea parametrilor antropometrici",
          "Stabilirea obiectivelor realiste și personalizate",
          "Plan alimentar individualizat cu meniuri de săptămână",
          "Recomandări de suplimentare, dacă este cazul",
          "Ședințe de monitorizare lunare",
        ],
        duration: "60–90 min / ședință",
        format: "Cabinet sau online (Zoom / Teams)",
        cta: "Programează o consultație",
      },
      en: {
        intro:
          "The first consultation is the foundation of your entire nutritional journey. It includes an in-depth assessment of your health status, eating habits, medical history, and personal goals.",
        includes: [
          "Complete nutritional history (60–90 minutes)",
          "Analysis of dietary habits and lifestyle",
          "Anthropometric parameter evaluation",
          "Setting realistic, personalized goals",
          "Individualized meal plan with weekly menus",
          "Supplementation recommendations if needed",
          "Monthly monitoring sessions",
        ],
        duration: "60–90 min / session",
        format: "In-person or online (Zoom / Teams)",
        cta: "Book a consultation",
      },
    },
  },
  {
    id: "weightloss",
    icon: Scale,
    color: "hsl(210 40% 55%)",
    bgColor: "hsl(210 40% 55% / 0.08)",
    title: {
      ro: "Program de slăbire",
      en: "Weight Loss Program",
    },
    desc: {
      ro: "Abordare sustenabilă pentru scăderea în greutate, fără diete restrictive și cu rezultate pe termen lung.",
      en: "Sustainable approach to weight loss, without restrictive diets and with long-term results.",
    },
    details: {
      ro: {
        intro:
          "Programul nostru de slăbire nu este o dietă, ci o transformare graduală a stilului de viață. Ne concentrăm pe crearea unui deficit caloric sănătos, menținerea masei musculare și educarea pacientului pentru un comportament alimentar sănătos pe termen lung.",
        includes: [
          "Plan caloric și macronutritiv personalizat (ESPEN / OMS)",
          "Strategii de gestionare a foamei și a poftelor",
          "Ghid de citire a etichetelor alimentare",
          "Adaptarea planului la preferințe culturale și culinare",
          "Monitorizare bilunară a progresului",
          "Suport prin mesaje între ședințe",
          "Plan de menținere post-scădere ponderală",
        ],
        duration: "Program 3–6 luni",
        format: "Cabinet sau online",
        cta: "Începe programul",
      },
      en: {
        intro:
          "Our weight loss program is not a diet — it's a gradual lifestyle transformation. We focus on creating a healthy caloric deficit, preserving muscle mass, and educating patients for long-term healthy eating behaviors.",
        includes: [
          "Personalized caloric and macronutrient plan (ESPEN / WHO)",
          "Hunger and craving management strategies",
          "Food label reading guide",
          "Plan adapted to cultural and culinary preferences",
          "Bi-monthly progress monitoring",
          "Support via messages between sessions",
          "Post-weight-loss maintenance plan",
        ],
        duration: "3–6 month program",
        format: "In-person or online",
        cta: "Start the program",
      },
    },
  },
];

export default function Services() {
  const { language } = useLanguage();
  const [openId, setOpenId] = useState<string | null>(null);
  const ro = language === "ro";

  const toggle = (id: string) => setOpenId(openId === id ? null : id);

  return (
    <div className="py-24 bg-secondary/30 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-5">
            {ro ? "Serviciile Noastre" : "Our Services"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {ro
              ? "Abordări personalizate, bazate pe dovezi științifice, pentru a te ajuta să îți atingi obiectivele de sănătate în mod durabil."
              : "Personalized, evidence-based approaches to help you sustainably reach your health goals."}
          </p>
        </motion.div>

        {/* Service accordion cards */}
        <div className="flex flex-col gap-5">
          {services.map((service, index) => {
            const Icon = service.icon;
            const isOpen = openId === service.id;
            const d = service.details[ro ? "ro" : "en"];

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                className={`rounded-2xl border bg-card shadow-sm overflow-hidden transition-shadow ${isOpen ? "shadow-md border-primary/30" : "border-border hover:shadow-md"}`}
              >
                {/* Card header — always visible, clickable */}
                <button
                  className="w-full text-left px-8 py-7 flex items-center gap-5 group"
                  onClick={() => toggle(service.id)}
                  aria-expanded={isOpen}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-colors"
                    style={{
                      backgroundColor: isOpen ? service.color : service.bgColor,
                      color: isOpen ? "#fff" : service.color,
                    }}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-serif font-bold text-foreground mb-1">
                      {ro ? service.title.ro : service.title.en}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                      {ro ? service.desc.ro : service.desc.en}
                    </p>
                  </div>

                  <div
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center shrink-0 transition-all"
                    style={isOpen ? { backgroundColor: service.color, borderColor: service.color } : {}}
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180 text-white" : "text-muted-foreground"}`}
                    />
                  </div>
                </button>

                {/* Expanded details */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="details"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-8 pb-8 border-t border-border pt-6" style={{ borderColor: `${service.color}22` }}>

                        {/* Intro paragraph */}
                        <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
                          {d.intro}
                        </p>

                        {/* What's included */}
                        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                          {ro ? "Ce include" : "What's included"}
                        </h4>
                        <ul className="grid sm:grid-cols-2 gap-2.5 mb-6">
                          {d.includes.map((item, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                              <CheckCircle2
                                className="w-4 h-4 shrink-0 mt-0.5"
                                style={{ color: service.color }}
                              />
                              {item}
                            </li>
                          ))}
                        </ul>

                        {/* Meta info row */}
                        <div className="flex flex-wrap gap-4 mb-7">
                          <div
                            className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: service.bgColor, color: service.color }}
                          >
                            <span>⏱</span> {d.duration}
                          </div>
                          <div
                            className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full"
                            style={{ backgroundColor: service.bgColor, color: service.color }}
                          >
                            <span>📍</span> {d.format}
                          </div>
                        </div>

                        {/* CTA */}
                        <Button asChild className="rounded-xl gap-2">
                          <Link href="/contact">
                            {d.cta}
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="mt-14 text-center rounded-2xl bg-primary/8 border border-primary/20 py-10 px-8"
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
