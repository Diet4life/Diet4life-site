import { Link } from "wouter";
import { motion } from "framer-motion";
import { Scale, Salad, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const TOPICS = [
  {
    slug: "nutritie-echilibrata",
    icon: Salad,
    titleRo: "Nutriție echilibrată",
    titleEn: "Balanced nutrition",
    excerptRo: "Cum arată în viața reală o alimentație echilibrată — fără cântărit, fără interdicții, cu exemple din bucătăria de zi cu zi.",
    excerptEn: "What balanced eating actually looks like in real life — no weighing, no forbidden foods, with everyday meal examples.",
    available: true,
  },
  {
    slug: "controlul-greutatii",
    icon: Scale,
    titleRo: "Controlul greutății",
    titleEn: "Weight control",
    excerptRo: "De ce controlul greutății nu este doar despre a mânca mai puțin — și ce influențează cu adevărat cântarul.",
    excerptEn: "Why weight control isn't just about eating less — and what actually influences the scale.",
    available: true,
  },
];

export default function NutriHub() {
  const { language } = useLanguage();
  const ro = language === "ro";

  return (
    <div className="min-h-screen bg-background">
      <section className="py-16 md:py-24 bg-secondary/20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block text-xs font-semibold tracking-wide uppercase text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
              NutriHub
            </span>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-5 text-balance">
              {ro ? "Explorează pe subiecte" : "Explore by topic"}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {ro
                ? "Articole scrise pentru pacientul obișnuit — informație corectă medical, fără moralizare și fără reguli rigide."
                : "Articles written for the everyday patient — medically accurate information, without moralizing or rigid rules."}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="grid sm:grid-cols-2 gap-6">
            {TOPICS.map((topic, i) => {
              const Icon = topic.icon;
              return (
                <motion.div
                  key={topic.slug}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link
                    href={`/nutrihub/${topic.slug}`}
                    className="group flex flex-col h-full rounded-2xl bg-card border border-border p-8 hover:border-primary/40 hover:shadow-md transition-all"
                    data-testid={`link-nutrihub-topic-${topic.slug}`}
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h2 className="font-serif font-bold text-foreground text-xl mb-2">
                      {ro ? topic.titleRo : topic.titleEn}
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {ro ? topic.excerptRo : topic.excerptEn}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                      {ro ? "Citește articolul" : "Read the article"}
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
