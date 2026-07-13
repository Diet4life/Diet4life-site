import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Baby,
  ArrowLeft,
  Salad,
  Milk,
  Wheat,
  Cookie,
  Star,
  CalendarCheck,
  Download,
  ChevronRight,
  HeartHandshake,
  Sprout,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const ageGroups = [
  {
    range: { ro: "0–12 luni", en: "0–12 months" },
    title: { ro: "Diversificarea alimentară", en: "Food diversification" },
    desc: {
      ro: "Laptele matern sau formula rămân principale. Diversificarea începe la 4–6 luni cu piureuri simple. Introduceți un singur aliment nou la 3–5 zile.",
      en: "Breast milk or formula remain primary. Diversification begins at 4–6 months with simple purees. Introduce a single new food every 3–5 days.",
    },
    color: "bg-orange-50 border-orange-200",
    iconColor: "text-orange-500",
    icon: Milk,
  },
  {
    range: { ro: "1–3 ani", en: "1–3 years" },
    title: { ro: "Toddler — explorarea gusturilor", en: "Toddler — taste exploration" },
    desc: {
      ro: "Perioada critică pentru formarea preferințelor alimentare. Oferiți varietate, nu forțați. Evitați zahărul adăugat și sarea. Texturile variate ajută dezvoltarea.",
      en: "Critical period for forming food preferences. Offer variety, don't force. Avoid added sugar and salt. Varied textures aid development.",
    },
    color: "bg-yellow-50 border-yellow-200",
    iconColor: "text-yellow-600",
    icon: Sprout,
  },
  {
    range: { ro: "4–7 ani", en: "4–7 years" },
    title: { ro: "Preșcolar & școlar mic", en: "Preschool & early school" },
    desc: {
      ro: "Micul dejun este esențial pentru concentrare. Gustările sănătoase între mese susțin energia. Implicați copilul în pregătirea mâncării pentru a construi curiozitate față de alimente sănătoase.",
      en: "Breakfast is essential for concentration. Healthy snacks between meals sustain energy. Involve the child in meal preparation to build curiosity about healthy foods.",
    },
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
    icon: Salad,
  },
  {
    range: { ro: "8–12 ani", en: "8–12 years" },
    title: { ro: "Școlar mare — autonomie alimentară", en: "Older school-age — food autonomy" },
    desc: {
      ro: "Copiii încep să facă alegeri proprii. Educați-i despre etichetele alimentare, publicitate și alegerile sănătoase. Necesarul de calciu și fier crește odată cu creșterea în înălțime.",
      en: "Children start making their own choices. Educate them about food labels, advertising, and healthy choices. Calcium and iron needs increase with height growth.",
    },
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-600",
    icon: Star,
  },
];

const mealIdeas = [
  {
    name: { ro: "Mic dejun echilibrat", en: "Balanced breakfast" },
    items: { ro: "Ovaz cu fructe, lapte, miere", en: "Oats with fruit, milk, honey" },
    icon: Wheat,
    color: "bg-amber-50 text-amber-600 border-amber-200",
  },
  {
    name: { ro: "Gustare inteligentă", en: "Smart snack" },
    items: { ro: "Morcovi, hummus, fructe uscate", en: "Carrots, hummus, dried fruit" },
    icon: Cookie,
    color: "bg-orange-50 text-orange-600 border-orange-200",
  },
  {
    name: { ro: "Prânz colorat", en: "Colorful lunch" },
    items: { ro: "Orez, pui, legume, supă", en: "Rice, chicken, vegetables, soup" },
    icon: Salad,
    color: "bg-green-50 text-green-600 border-green-200",
  },
  {
    name: { ro: "Cină ușoară", en: "Light dinner" },
    items: { ro: "Omletă, pâine integrală, avocado", en: "Omelette, whole grain bread, avocado" },
    icon: Star,
    color: "bg-violet-50 text-violet-600 border-violet-200",
  },
];

const tips = [
  {
    ro: "Oferiți cel puțin 5 culori pe farfurie în fiecare zi",
    en: "Offer at least 5 colors on the plate every day",
  },
  {
    ro: "Evitați recompensele cu dulciuri — creează asocieri negative",
    en: "Avoid rewarding with sweets — it creates negative associations",
  },
  {
    ro: "Copiii refuză în medie un aliment nou de 10–15 ori înainte să-l accepte",
    en: "Children reject a new food an average of 10–15 times before accepting it",
  },
  {
    ro: "Mâncatul în familie crește diversitatea alimentară cu 30%",
    en: "Family eating increases food diversity by 30%",
  },
  {
    ro: "Implicați copilul în cumpărături și gătit de la vârste mici",
    en: "Involve children in shopping and cooking from an early age",
  },
  {
    ro: "Limitați sucurile — chiar și cele naturale — la max. 120 ml/zi",
    en: "Limit juices — even natural ones — to max. 120 ml/day",
  },
];

export default function EducationKids() {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header — slightly warmer tone for kids section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-orange-50 via-background to-yellow-50/40">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <Link href="/education" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8" data-testid="link-back-education-kids">
              <ArrowLeft className="w-4 h-4" />
              {t("edu.backhub")}
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
                <Baby className="w-6 h-6 text-orange-500" />
              </div>
              <span className="text-sm font-medium text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
                {language === "ro" ? "Copii 2–12 ani" : "Children 2–12"}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-5">
              {t("kids.title")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              {t("kids.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro for parents */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 flex gap-6 items-start">
            <HeartHandshake className="w-8 h-8 text-orange-500 shrink-0 mt-1" />
            <p className="text-foreground leading-relaxed">
              {language === "ro"
                ? "Obiceiurile alimentare se formează în primii ani de viață și persistă în viața adultă. Părinții sunt cel mai important model alimentar pentru copii — nu prin ce le spun, ci prin ce mănâncă ei înșiși. Ghidurile noastre pentru părinți sunt practice, bazate pe dovezi și adaptate culturii locale."
                : "Eating habits are formed in the first years of life and persist into adulthood. Parents are the most important eating role model for children — not through what they say, but through what they themselves eat. Our guides for parents are practical, evidence-based, and adapted to local culture."}
            </p>
          </div>
        </div>
      </section>

      {/* Age groups */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-10">
            {language === "ro" ? "Ghid pe grupe de vârstă" : "Guide by age group"}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {ageGroups.map((group, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -3 }}
              >
                <div className={`rounded-2xl border-2 ${group.color} p-7 h-full flex flex-col gap-4 cursor-pointer hover:shadow-md transition-all duration-300`} data-testid={`card-agegroup-${i}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center`}>
                      <group.icon className={`w-5 h-5 ${group.iconColor}`} />
                    </div>
                    <span className={`text-sm font-bold ${group.iconColor}`}>
                      {language === "ro" ? group.range.ro : group.range.en}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-foreground text-lg leading-snug">
                    {language === "ro" ? group.title.ro : group.title.en}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {language === "ro" ? group.desc.ro : group.desc.en}
                  </p>
                  <div className="mt-auto pt-4 border-t border-border/40">
                    <span className="text-primary text-sm font-medium flex items-center gap-1">
                      {t("edu.readmore")} <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Meal ideas */}
      <section className="py-16 bg-muted/20 border-t">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-10">
            {language === "ro" ? "Idei de mese pentru copii" : "Meal ideas for children"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {mealIdeas.map((meal, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className={`rounded-2xl border-2 ${meal.color} p-5 text-center flex flex-col gap-3 items-center`} data-testid={`card-meal-${i}`}>
                  <meal.icon className="w-7 h-7" />
                  <h4 className="font-semibold text-sm text-foreground">
                    {language === "ro" ? meal.name.ro : meal.name.en}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {language === "ro" ? meal.items.ro : meal.items.en}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips for parents */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-8">
            {language === "ro" ? "Sfaturi practice pentru părinți" : "Practical tips for parents"}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {tips.map((tip, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="flex items-start gap-3 p-5 bg-card rounded-xl border border-border hover:border-orange-300 transition-colors">
                  <Star className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground leading-relaxed">
                    {language === "ro" ? tip.ro : tip.en}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-orange-50 border-t">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="md:flex items-center justify-between gap-8">
            <div className="mb-6 md:mb-0">
              <h3 className="font-serif font-bold text-foreground text-2xl mb-2">
                {language === "ro" ? "Plan nutrițional personalizat pentru copilul tău" : "Personalized nutrition plan for your child"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {language === "ro"
                  ? "Fiecare copil este unic. Consultația noastră pediatrică nutrițională creează un plan adaptat nevoilor specifice."
                  : "Every child is unique. Our pediatric nutritional consultation creates a plan adapted to specific needs."}
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Button asChild className="rounded-full" data-testid="button-kids-consult">
                <Link href="/contact">
                  <CalendarCheck className="w-4 h-4 mr-2" />
                  {t("edu.cta.consult")}
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full" data-testid="button-kids-download">
                <Link href="/products">
                  <Download className="w-4 h-4 mr-2" />
                  {t("edu.cta.download")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
