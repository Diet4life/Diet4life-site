import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  ShieldCheck,
  Baby,
  Gamepad2,
  ArrowRight,
  GraduationCap,
  Users,
  FileText,
  Sparkles,
  CalendarCheck,
  Download,
  HeartHandshake,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: "easeOut" },
  }),
};

const subcategories = [
  {
    href: "/education/nutrition",
    icon: BookOpen,
    color: "bg-primary/10 text-primary",
    border: "border-primary/20 hover:border-primary/50",
    badgeColor: "bg-primary/10 text-primary",
    titleKey: "edu.card.nutredu.title",
    descKey: "edu.card.nutredu.desc",
    badge: { ro: "Adulți", en: "Adults" },
    articles: 12,
  },
  {
    href: "/education/prevention",
    icon: ShieldCheck,
    color: "bg-accent/10 text-accent",
    border: "border-accent/20 hover:border-accent/50",
    badgeColor: "bg-accent/10 text-accent",
    titleKey: "edu.card.prevention.title",
    descKey: "edu.card.prevention.desc",
    badge: { ro: "Sănătate", en: "Health" },
    articles: 9,
  },
  {
    href: "/education/kids",
    icon: Baby,
    color: "bg-orange-100 text-orange-600",
    border: "border-orange-200 hover:border-orange-400",
    badgeColor: "bg-orange-100 text-orange-600",
    titleKey: "edu.card.kids.title",
    descKey: "edu.card.kids.desc",
    badge: { ro: "Copii 2–12 ani", en: "Children 2–12" },
    articles: 8,
  },
  {
    href: "/education/fun",
    icon: Gamepad2,
    color: "bg-violet-100 text-violet-600",
    border: "border-violet-200 hover:border-violet-400",
    badgeColor: "bg-violet-100 text-violet-600",
    titleKey: "edu.card.fun.title",
    descKey: "edu.card.fun.desc",
    badge: { ro: "Interactiv", en: "Interactive" },
    articles: 6,
  },
];

const stats = [
  { icon: FileText, valueKey: "35+", labelKey: "edu.stats.articles" },
  { icon: Download, valueKey: "12", labelKey: "edu.stats.guides" },
  { icon: Users, valueKey: "2,400+", labelKey: "edu.stats.patients" },
];

export default function Education() {
  const { t, language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-secondary/60 via-background to-muted/40">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-12 right-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-accent/8 blur-2xl" />
        </div>
        <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <GraduationCap className="w-4 h-4" />
              {language === "ro" ? "Centrul Educațional Diet4Life" : "Diet4Life Education Center"}
            </span>
          </motion.div>
          <motion.h1
            className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t("edu.hero.title")}
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t("edu.hero.subtitle")}
          </motion.p>
          <motion.div
            className="flex flex-wrap gap-3 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button asChild className="rounded-full px-7" data-testid="button-edu-consult">
              <Link href="/contact">
                <CalendarCheck className="w-4 h-4 mr-2" />
                {t("edu.cta.consult")}
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-7" data-testid="button-edu-download">
              <Link href="/products">
                <Download className="w-4 h-4 mr-2" />
                {t("edu.cta.download")}
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y bg-muted/30 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-3 gap-6 text-center">
            {stats.map((s, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <p className="text-3xl font-bold text-primary font-serif">{s.valueKey}</p>
                <p className="text-sm text-muted-foreground mt-1">{t(s.labelKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why it matters */}
      <section className="py-20 container mx-auto px-4 max-w-4xl">
        <motion.div
          className="grid md:grid-cols-2 gap-12 items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h2 className="text-3xl font-serif font-bold text-foreground mb-5">{t("edu.intro.title")}</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">{t("edu.intro.text")}</p>
            <Button asChild variant="outline" className="rounded-full" data-testid="button-edu-plan">
              <Link href="/contact">
                <HeartHandshake className="w-4 h-4 mr-2" />
                {t("edu.cta.contact")}
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: BookOpen, label: { ro: "Bazat pe dovezi", en: "Evidence-based" } },
              { icon: ShieldCheck, label: { ro: "Prevenție activă", en: "Active prevention" } },
              { icon: Baby, label: { ro: "Conținut pentru copii", en: "Content for children" } },
              { icon: Sparkles, label: { ro: "Scalabil spre Academie", en: "Scalable Academy" } },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-2xl bg-muted/40 border border-border flex flex-col items-center gap-3 text-center">
                <item.icon className="w-7 h-7 text-primary" />
                <span className="text-sm font-medium text-foreground">{language === "ro" ? item.label.ro : item.label.en}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Subcategory cards */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.h2
            className="text-3xl font-serif font-bold text-foreground text-center mb-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {language === "ro" ? "Explorează Categoriile" : "Explore Categories"}
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-center mb-12 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {language === "ro"
              ? "Patru domenii esențiale pentru o nutriție completă și o viață sănătoasă."
              : "Four essential areas for complete nutrition and a healthy life."}
          </motion.p>
          <div className="grid sm:grid-cols-2 gap-6">
            {subcategories.map((cat, i) => (
              <motion.div
                key={cat.href}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link href={cat.href}>
                  <div
                    className={`group h-full bg-card rounded-2xl border-2 ${cat.border} p-7 flex flex-col gap-5 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md`}
                    data-testid={`card-education-${cat.href.split("/").pop()}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${cat.color}`}>
                        <cat.icon className="w-7 h-7" />
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${cat.badgeColor}`}>
                        {language === "ro" ? cat.badge.ro : cat.badge.en}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {t(cat.titleKey)}
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{t(cat.descKey)}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        {cat.articles} {language === "ro" ? "articole" : "articles"}
                      </span>
                      <span className="text-primary text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        {t("edu.readmore")}
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="py-20 container mx-auto px-4 max-w-4xl">
        <motion.div
          className="rounded-3xl bg-primary px-8 py-14 text-center text-primary-foreground"
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <GraduationCap className="w-12 h-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-3xl font-serif font-bold mb-4">
            {language === "ro" ? "Viitorul este Nutrition Academy" : "The Future is Nutrition Academy"}
          </h2>
          <p className="text-primary-foreground/80 max-w-lg mx-auto mb-8 leading-relaxed">
            {language === "ro"
              ? "Această secțiune va evolua într-o platformă completă de cursuri și programe online. Urmează-ne pentru lansare."
              : "This section will evolve into a full online course and program platform. Follow us for the launch."}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild variant="secondary" className="rounded-full px-7" data-testid="button-edu-academy-consult">
              <Link href="/contact">{t("edu.cta.consult")}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-7 bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-edu-academy-products">
              <Link href="/products">{t("edu.cta.download")}</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
