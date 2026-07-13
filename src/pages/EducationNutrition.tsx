import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ArrowLeft,
  Apple,
  Flame,
  Dumbbell,
  Droplets,
  Scale,
  CalendarCheck,
  Download,
  ChevronRight,
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
    icon: Apple,
    title: { ro: "Principiile de bază ale nutriției echilibrate", en: "Basic principles of balanced nutrition" },
    excerpt: {
      ro: "O alimentație echilibrată furnizează toți nutrienții esențiali de care corpul are nevoie: proteine, carbohidrați, grăsimi sănătoase, vitamine și minerale. Aflați cum să construiți un farfurie sănătoasă folosind regula 50/25/25.",
      en: "A balanced diet provides all the essential nutrients the body needs: proteins, carbohydrates, healthy fats, vitamins, and minerals. Learn how to build a healthy plate using the 50/25/25 rule.",
    },
    tag: { ro: "Ghid fundamental", en: "Core guide" },
    readTime: "5 min",
    badgeColor: "bg-primary/10 text-primary",
  },
  {
    icon: Flame,
    title: { ro: "Calorii — ce sunt și cum le numărăm", en: "Calories — what they are and how to count them" },
    excerpt: {
      ro: "Caloriile sunt unitățile de energie din alimente. Înțelegerea necesarului caloric zilnic este esența oricărui plan nutrițional. Explorăm conceptul de TDEE, BMR și deficit caloric.",
      en: "Calories are units of energy in food. Understanding daily caloric needs is the essence of any nutrition plan. We explore the concept of TDEE, BMR, and caloric deficit.",
    },
    tag: { ro: "Energie & Metabolism", en: "Energy & Metabolism" },
    readTime: "7 min",
    badgeColor: "bg-accent/10 text-accent",
  },
  {
    icon: Dumbbell,
    title: { ro: "Proteinele — rolul esențial în organism", en: "Proteins — their essential role in the body" },
    excerpt: {
      ro: "Proteinele construiesc și repară țesuturile, produc enzime și hormoni, susțin sistemul imunitar. Afla de câtă proteină ai nevoie zilnic și care sunt cele mai bune surse alimentare.",
      en: "Proteins build and repair tissues, produce enzymes and hormones, and support the immune system. Find out how much protein you need daily and what the best food sources are.",
    },
    tag: { ro: "Macronutrienți", en: "Macronutrients" },
    readTime: "6 min",
    badgeColor: "bg-primary/10 text-primary",
  },
  {
    icon: Droplets,
    title: { ro: "Hidratarea — pilonul uitat al sănătății", en: "Hydration — the forgotten pillar of health" },
    excerpt: {
      ro: "Corpul uman este 60% apă. Deshidratarea afectează concentrarea, metabolismul și energia. Descoperă câtă apă ai nevoie cu adevărat și cum să-ți optimizezi hidratarea zilnică.",
      en: "The human body is 60% water. Dehydration affects concentration, metabolism, and energy. Find out how much water you really need and how to optimize your daily hydration.",
    },
    tag: { ro: "Hidratare", en: "Hydration" },
    readTime: "4 min",
    badgeColor: "bg-blue-100 text-blue-600",
  },
  {
    icon: Scale,
    title: { ro: "Macronutrienți explicați — proteine, carbohidrați, grăsimi", en: "Macronutrients explained — proteins, carbs, fats" },
    excerpt: {
      ro: "Fiecare macronutrient îndeplinește funcții vitale distincte. Un echilibru optim între cele trei grupe determină energie constantă, o compoziție corporală favorabilă și o sănătate metabolică bună.",
      en: "Each macronutrient fulfills distinct vital functions. An optimal balance between the three groups determines steady energy, favorable body composition, and good metabolic health.",
    },
    tag: { ro: "Macronutrienți", en: "Macronutrients" },
    readTime: "8 min",
    badgeColor: "bg-accent/10 text-accent",
  },
  {
    icon: BookOpen,
    title: { ro: "Ghid practic: cum citești etichetele alimentare", en: "Practical guide: how to read food labels" },
    excerpt: {
      ro: "Etichetele nutriționale conțin informații valoroase, dar pot fi confuze. Învățați să decodificați tabelul valorilor nutriționale, lista de ingrediente și procentele zilnice recomandate.",
      en: "Nutrition labels contain valuable information but can be confusing. Learn to decode the nutrition facts table, ingredient list, and recommended daily percentages.",
    },
    tag: { ro: "Practic", en: "Practical" },
    readTime: "5 min",
    badgeColor: "bg-primary/10 text-primary",
  },
];

const guides = [
  {
    title: { ro: "Ghid complet: Planificarea meselor pe 7 zile", en: "Complete guide: 7-day meal planning" },
    pages: "24",
    badge: { ro: "PDF gratuit", en: "Free PDF" },
  },
  {
    title: { ro: "Tabel de referință macronutrienți", en: "Macronutrient reference table" },
    pages: "8",
    badge: { ro: "Descărcabil", en: "Downloadable" },
  },
  {
    title: { ro: "Jurnal alimentar — șablon săptămânal", en: "Food diary — weekly template" },
    pages: "12",
    badge: { ro: "Printabil", en: "Printable" },
  },
];

export default function EducationNutrition() {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/8 via-background to-secondary/40">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <Link href="/education" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8" data-testid="link-back-education">
              <ArrowLeft className="w-4 h-4" />
              {t("edu.backhub")}
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                {language === "ro" ? "Adulți" : "Adults"}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-5">
              {t("nutredu.title")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              {t("nutredu.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro */}
      <section className="py-12 border-b">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-secondary/50 rounded-2xl p-8 flex gap-6 items-start">
            <BookOpen className="w-8 h-8 text-primary shrink-0 mt-1" />
            <p className="text-muted-foreground leading-relaxed text-lg">
              {language === "ro"
                ? "Educația nutrițională este fundamentul oricărei schimbări durabile. Înțelegând cum funcționează alimentele în corpul nostru, putem face alegeri mai bune în fiecare zi. Articolele noastre sunt scrise de nutriționiști clinicieni și revizuite periodic."
                : "Nutrition education is the foundation of any lasting change. By understanding how food works in our bodies, we can make better choices every day. Our articles are written by clinical nutritionists and periodically reviewed."}
            </p>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-10">
            {language === "ro" ? "Articole & Ghiduri" : "Articles & Guides"}
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
                  className="group bg-card rounded-2xl border border-border p-7 h-full flex flex-col gap-4 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all duration-300"
                  data-testid={`card-article-${i}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl bg-muted/60 flex items-center justify-center">
                      <article.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${article.badgeColor}`}>
                      {language === "ro" ? article.tag.ro : article.tag.en}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif font-bold text-foreground text-lg mb-2 group-hover:text-primary transition-colors leading-snug">
                      {language === "ro" ? article.title.ro : article.title.en}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                      {language === "ro" ? article.excerpt.ro : article.excerpt.en}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                    <span className="text-xs text-muted-foreground">{article.readTime} {language === "ro" ? "lectură" : "read"}</span>
                    <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      {t("edu.readmore")} <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Downloadable guides */}
      <section className="py-16 bg-muted/20 border-t">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-8">
            {language === "ro" ? "Ghiduri descărcabile" : "Downloadable guides"}
          </h2>
          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {guides.map((guide, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="bg-card rounded-2xl border border-border p-6 flex flex-col gap-4 hover:border-primary/40 hover:shadow-md transition-all duration-300 cursor-pointer" data-testid={`card-guide-${i}`}>
                  <div className="flex items-center justify-between">
                    <Download className="w-6 h-6 text-primary" />
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary">
                      {language === "ro" ? guide.badge.ro : guide.badge.en}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground leading-snug">
                    {language === "ro" ? guide.title.ro : guide.title.en}
                  </h3>
                  <p className="text-xs text-muted-foreground">{guide.pages} {language === "ro" ? "pagini" : "pages"}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <div className="rounded-2xl bg-primary/8 border border-primary/20 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-serif font-bold text-foreground text-xl mb-1">
                {language === "ro" ? "Vrei un plan personalizat?" : "Want a personalized plan?"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {language === "ro"
                  ? "Ghidurile generale sunt un punct de start. Un plan creat special pentru tine face diferența."
                  : "General guides are a starting point. A plan created specifically for you makes the difference."}
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Button asChild className="rounded-full" data-testid="button-nutredu-consult">
                <Link href="/contact">
                  <CalendarCheck className="w-4 h-4 mr-2" />
                  {t("edu.cta.consult")}
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full" data-testid="button-nutredu-products">
                <Link href="/products">{t("edu.cta.download")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
