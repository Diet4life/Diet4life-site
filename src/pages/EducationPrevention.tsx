import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  ArrowLeft,
  Heart,
  Activity,
  Stethoscope,
  TrendingDown,
  Clock,
  CalendarCheck,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const articles = [
  {
    icon: TrendingDown,
    title: { ro: "Prevenirea obezității — strategii pe termen lung", en: "Preventing obesity — long-term strategies" },
    excerpt: {
      ro: "Obezitatea este o boală cronică multifactorială. Prevenția eficientă implică schimbări de comportament alimentar, activitate fizică regulată și gestionarea stresului. Descoperă abordarea holistică.",
      en: "Obesity is a multifactorial chronic disease. Effective prevention involves changes in eating behavior, regular physical activity, and stress management. Discover the holistic approach.",
    },
    tag: { ro: "Obezitate", en: "Obesity" },
    readTime: "8 min",
    badgeColor: "bg-accent/10 text-accent",
  },
  {
    icon: Activity,
    title: { ro: "Sănătatea metabolică — mai mult decât greutatea", en: "Metabolic health — more than just weight" },
    excerpt: {
      ro: "Poți fi la greutate normală și să ai o sănătate metabolică precară. Înțelege indicatorii cheie: glicemia, trigliceridele, colesterolul HDL, tensiunea arterială și circumferința abdominală.",
      en: "You can be at a normal weight and still have poor metabolic health. Understand key indicators: blood sugar, triglycerides, HDL cholesterol, blood pressure, and waist circumference.",
    },
    tag: { ro: "Metabolism", en: "Metabolism" },
    readTime: "7 min",
    badgeColor: "bg-primary/10 text-primary",
  },
  {
    icon: Stethoscope,
    title: { ro: "Educația pacientului bariatric — înainte și după operație", en: "Bariatric patient education — before and after surgery" },
    excerpt: {
      ro: "Pregătirea nutrițională înainte de chirurgia bariatrică este la fel de importantă ca intervenția în sine. Descoperă ce trebuie să știi, ce să mănânci și cum să te adaptezi pe termen lung.",
      en: "Nutritional preparation before bariatric surgery is as important as the procedure itself. Find out what you need to know, what to eat, and how to adapt long-term.",
    },
    tag: { ro: "Bariatric", en: "Bariatric" },
    readTime: "10 min",
    badgeColor: "bg-accent/10 text-accent",
  },
  {
    icon: Clock,
    title: { ro: "Obiceiuri sănătoase durabile — cum să nu mai recidivezi", en: "Lasting healthy habits — how to avoid relapse" },
    excerpt: {
      ro: "Cele mai bune diete sunt cele pe care le poți menține toată viața. Înțelege psihologia schimbării de comportament, tehnicile de mindful eating și construirea de rutine alimentare solide.",
      en: "The best diets are the ones you can maintain for life. Understand the psychology of behavior change, mindful eating techniques, and building solid eating routines.",
    },
    tag: { ro: "Stil de viață", en: "Lifestyle" },
    readTime: "6 min",
    badgeColor: "bg-primary/10 text-primary",
  },
  {
    icon: Heart,
    title: { ro: "Nutriția și sănătatea cardiovasculară", en: "Nutrition and cardiovascular health" },
    excerpt: {
      ro: "Bolile cardiovasculare sunt în mare parte prevenibile prin dietă. Dieta mediteraneană, reducerea sodiului, grăsimile trans și fibrele solubile — tot ce trebuie să știi despre mâncat pentru inima ta.",
      en: "Cardiovascular diseases are largely preventable through diet. The Mediterranean diet, sodium reduction, trans fats, and soluble fiber — everything you need to know about eating for your heart.",
    },
    tag: { ro: "Cardiovascular", en: "Cardiovascular" },
    readTime: "7 min",
    badgeColor: "bg-red-100 text-red-600",
  },
  {
    icon: AlertCircle,
    title: { ro: "Diabetul de tip 2 — prevenție prin nutriție", en: "Type 2 diabetes — prevention through nutrition" },
    excerpt: {
      ro: "Prediabetul și diabetul de tip 2 pot fi în multe cazuri prevenite sau inversate prin modificarea dietei și stilului de viață. Înțelege indexul glicemic, insulinorezistența și rolul fibrei.",
      en: "Prediabetes and type 2 diabetes can in many cases be prevented or reversed through dietary and lifestyle modification. Understand glycemic index, insulin resistance, and the role of fiber.",
    },
    tag: { ro: "Diabet", en: "Diabetes" },
    readTime: "9 min",
    badgeColor: "bg-orange-100 text-orange-600",
  },
];

const riskFactors = [
  { ro: "Sedentarism", en: "Sedentary lifestyle" },
  { ro: "Alimentație ultra-procesată", en: "Ultra-processed foods" },
  { ro: "Deficit de somn", en: "Sleep deficiency" },
  { ro: "Stres cronic", en: "Chronic stress" },
  { ro: "Hidratare insuficientă", en: "Insufficient hydration" },
  { ro: "Mese neregulate", en: "Irregular meal timing" },
];

export default function EducationPrevention() {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-accent/8 via-background to-secondary/40">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <Link href="/education" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8" data-testid="link-back-education-prev">
              <ArrowLeft className="w-4 h-4" />
              {t("edu.backhub")}
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-accent" />
              </div>
              <span className="text-sm font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
                {language === "ro" ? "Sănătate & Prevenție" : "Health & Prevention"}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-5">
              {t("prev.title")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              {t("prev.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Risk factors */}
      <section className="py-12 border-b bg-muted/20">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-xl font-serif font-bold text-foreground mb-6">
            {language === "ro" ? "Factori de risc modificabili" : "Modifiable risk factors"}
          </h2>
          <div className="flex flex-wrap gap-3">
            {riskFactors.map((factor, i) => (
              <motion.span
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border text-sm text-foreground"
              >
                <AlertCircle className="w-3.5 h-3.5 text-accent" />
                {language === "ro" ? factor.ro : factor.en}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-10">
            {language === "ro" ? "Articole de Prevenție" : "Prevention Articles"}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {articles.map((article, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -3 }}
              >
                <div
                  className="group bg-card rounded-2xl border border-border p-7 h-full flex flex-col gap-4 cursor-pointer hover:border-accent/40 hover:shadow-md transition-all duration-300"
                  data-testid={`card-prevention-article-${i}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl bg-muted/60 flex items-center justify-center">
                      <article.icon className="w-5 h-5 text-accent" />
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${article.badgeColor}`}>
                      {language === "ro" ? article.tag.ro : article.tag.en}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif font-bold text-foreground text-lg mb-2 group-hover:text-accent transition-colors leading-snug">
                      {language === "ro" ? article.title.ro : article.title.en}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                      {language === "ro" ? article.excerpt.ro : article.excerpt.en}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                    <span className="text-xs text-muted-foreground">{article.readTime} {language === "ro" ? "lectură" : "read"}</span>
                    <span className="text-accent text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      {t("edu.readmore")} <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bariatric special callout */}
      <section className="py-12 bg-muted/20 border-t border-b">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="rounded-2xl bg-card border-2 border-accent/25 p-8 md:flex gap-8 items-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0 mb-6 md:mb-0">
              <Stethoscope className="w-8 h-8 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif font-bold text-foreground text-2xl mb-3">
                {language === "ro" ? "Educație specializată pentru pacienții bariatrici" : "Specialized education for bariatric patients"}
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {language === "ro"
                  ? "Pacienții care au trecut prin chirurgie bariatrică au nevoi nutriționale unice. Programul nostru educațional bariatric acoperă toate etapele: pre-operator, post-operator imediat și long-term maintenance. Suport continuu din partea echipei noastre clinice."
                  : "Patients who have undergone bariatric surgery have unique nutritional needs. Our bariatric education program covers all stages: pre-operative, immediate post-operative, and long-term maintenance. Continuous support from our clinical team."}
              </p>
              <Button asChild className="rounded-full" data-testid="button-bariatric-consult">
                <Link href="/contact">
                  <CalendarCheck className="w-4 h-4 mr-2" />
                  {t("edu.cta.consult")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 container mx-auto px-4 max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
            {language === "ro" ? "Fă primul pas spre prevenție activă" : "Take the first step toward active prevention"}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            {language === "ro"
              ? "O consultație de evaluare inițială identifică factorii de risc și construiește un plan de prevenție personalizat."
              : "An initial assessment consultation identifies risk factors and builds a personalized prevention plan."}
          </p>
          <Button asChild size="lg" className="rounded-full px-10" data-testid="button-prevention-cta">
            <Link href="/contact">{t("edu.cta.consult")}</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
