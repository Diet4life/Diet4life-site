import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Search,
  Clock,
  Minus,
  Heart,
  ShieldCheck,
  BadgeCheck,
  BookOpenCheck,
  Scale,
  Salad,
  Calculator as CalculatorIcon,
  NotebookPen,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const quickQuestions = [
  { icon: Clock, ro: "De ce nu slăbesc deși mănânc puțin?", en: "Why am I not losing weight even though I eat little?" },
  { icon: Minus, ro: "Sunt toate caloriile la fel?", en: "Are all calories the same?" },
  { icon: Heart, ro: "Cum arată o masă echilibrată?", en: "What does a balanced meal look like?" },
];

const nutriHubTopics = [
  { icon: Scale, ro: "Controlul greutății", en: "Weight control", slug: "controlul-greutatii" },
  { icon: Salad, ro: "Nutriție echilibrată", en: "Balanced nutrition", slug: "nutritie-echilibrata" },
];

export default function Home() {
  const { language } = useLanguage();
  const ro = language === "ro";
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-secondary/40 overflow-hidden pt-7 pb-9 md:pt-14 md:pb-14 lg:pt-20 lg:pb-20">
        <div className="max-w-[1200px] mx-auto px-[18px] min-[380px]:px-5 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_0.9fr] gap-2 lg:gap-[68px] items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="font-serif font-bold text-foreground text-[32px] min-[390px]:text-[35px] lg:text-[57px] leading-[1.08] lg:leading-[1.06] tracking-[-0.01em] max-w-[340px] lg:max-w-[560px] mb-3 lg:mb-4">
                {ro ? "Nutriția începe cu " : "Nutrition starts with "}
                <span className="text-primary">{ro ? "întrebarea potrivită." : "the right question."}</span>
              </h1>

              <p className="text-base lg:text-[18px] leading-[1.5] lg:leading-[1.55] text-muted-foreground max-w-[360px] lg:max-w-[520px] mb-[21px] lg:mb-7">
                {ro
                  ? "Caută răspunsuri clare, bazate pe dovezi, despre nutriție și greutate — fără reguli rigide și fără soluții universale."
                  : "Search for clear, evidence-based answers about nutrition and weight — without rigid rules or one-size-fits-all solutions."}
              </p>

              <form onSubmit={(e) => e.preventDefault()} className="relative mb-4 lg:mb-6 lg:max-w-[540px]">
                <label htmlFor="home-search" className="sr-only">
                  {ro ? "Scrie sau alege o întrebare de pornire" : "Type or pick a starting question"}
                </label>
                <input
                  id="home-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={ro ? "Scrie sau alege o întrebare de pornire..." : "Type or pick a starting question..."}
                  className="w-full h-[54px] lg:h-[58px] pl-4 pr-[60px] lg:pr-[64px] rounded-[14px] border border-border bg-background text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow"
                  data-testid="input-home-search"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 h-[48px] w-[48px] lg:h-[50px] lg:w-[50px] rounded-[11px] bg-primary hover:bg-primary/90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 text-white flex items-center justify-center transition-all"
                  data-testid="button-home-search"
                  aria-label={ro ? "Caută" : "Search"}
                >
                  <Search className="w-5 h-5 lg:w-[22px] lg:h-[22px]" />
                </button>
              </form>

              <p className="text-[13px] lg:text-sm font-medium text-muted-foreground mb-2.5 lg:mb-[14px]">
                {ro ? "Începe cu una dintre acestea" : "Start with one of these"}
              </p>
              <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2 lg:gap-2.5 mb-[21px] lg:mb-6">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSearch(ro ? q.ro : q.en)}
                    className={`${i === 0 ? "col-span-2" : ""} min-h-11 lg:min-h-[42px] flex items-center gap-2 px-3 py-2.5 lg:px-[14px] rounded-xl border border-border bg-background hover:border-primary/30 hover:shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all text-left`}
                    data-testid={`button-quick-question-${i}`}
                  >
                    <q.icon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm lg:text-[15px] font-medium text-foreground">{ro ? q.ro : q.en}</span>
                  </button>
                ))}
              </div>

              <Link
                href="/nutrihub"
                className="inline-flex items-center justify-center w-full min-[380px]:w-auto min-[380px]:min-w-[220px] h-[50px] lg:h-[52px] px-6 rounded-[13px] bg-primary hover:bg-primary/90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 text-white font-semibold text-[15px] lg:text-base transition-all"
                data-testid="button-explore-nutrihub"
              >
                {ro ? "Explorează NutriHub" : "Explore NutriHub"}
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="mt-[18px] lg:mt-0"
            >
              <div className="rounded-[20px] lg:rounded-3xl overflow-hidden shadow-sm aspect-square w-full max-w-[380px] md:max-w-[420px] lg:max-w-[520px] mx-auto lg:mx-0">
                <picture>
                  <source srcSet="/images/hero.webp" type="image/webp" />
                  <img
                    src="/images/hero.jpg"
                    alt="Diet4Life"
                    width={1254}
                    height={1254}
                    loading="eager"
                    className="w-full h-full object-cover"
                  />
                </picture>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="py-6 border-y bg-background">
        <div className="container mx-auto px-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-primary" />
            {ro ? "Informații bazate pe dovezi" : "Evidence-based information"}
          </span>
          <span className="hidden sm:inline text-border">·</span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            {ro ? "Nutriționist dietetician autorizat" : "Licensed dietitian-nutritionist"}
          </span>
          <span className="hidden sm:inline text-border">·</span>
          <span className="flex items-center gap-2">
            <BookOpenCheck className="w-4 h-4 text-primary" />
            {ro ? "Resurse educaționale revizuite periodic" : "Regularly reviewed educational resources"}
          </span>
        </div>
      </section>

      {/* Explorează pe subiecte (NutriHub) */}
      <section id="nutrihub" className="py-20 bg-secondary/20 scroll-mt-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground text-center mb-12">
            {ro ? "Explorează pe subiecte" : "Explore by topic"}
          </h2>
          <div className="grid sm:grid-cols-2 max-w-2xl mx-auto gap-6">
            {nutriHubTopics.map((topic, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link
                  href={`/nutrihub/${topic.slug}`}
                  className="block rounded-2xl bg-card border border-border p-8 text-center hover:border-primary/30 hover:shadow-md transition-all"
                  data-testid={`card-nutrihub-topic-${i}`}
                >
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <topic.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif font-bold text-foreground text-lg">
                    {ro ? topic.ro : topic.en}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Servicii scurt */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <span className="inline-block text-xs font-bold tracking-wide uppercase text-primary bg-primary/15 border border-primary/20 px-3 py-1 rounded-full mb-4">
            {ro ? "Sprijin personalizat" : "Personalized support"}
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-5 text-balance">
            {ro ? "Când informația generală nu este suficientă" : "When general information isn't enough"}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
            {ro
              ? "Dacă ai nevoie de recomandări adaptate situației tale, putem lucra împreună într-o consultație nutrițională individuală. Camelia Amuza, nutriționist-dietetician autorizat."
              : "If you need recommendations tailored to your situation, we can work together in an individual nutrition consultation. Camelia Amuza, licensed dietitian-nutritionist."}
          </p>
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 active:scale-[0.97] text-primary-foreground font-medium px-8 h-12 transition-all"
            data-testid="button-see-services"
          >
            {ro ? "Vezi serviciile" : "See services"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Nutri pentru copii */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block text-xs font-bold tracking-wide uppercase text-primary bg-primary/15 border border-primary/20 px-3 py-1 rounded-full mb-4">
                {ro ? "Pentru cei mici" : "For little ones"}
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3 text-balance">
                {ro ? "Descoperă lumea lui Nutri" : "Discover Nutri's world"}
              </h2>
              <p className="text-sm text-muted-foreground mb-5">
                {ro
                  ? "Nutri este un proiect educațional Diet4Life, creat pentru a-i ajuta pe cei mici să descopere alimentația prin joacă."
                  : "Nutri is a Diet4Life educational project, created to help little ones discover food through play."}
              </p>
              <div className="text-base md:text-lg text-muted-foreground leading-relaxed md:leading-relaxed space-y-5 mb-6">
                <p>
                  {ro
                    ? "Nutri este o mică bufniță curioasă creată pentru a-i ajuta pe copii să descopere alimentele, culorile din farfurie și principiile unei alimentații variate și echilibrate."
                    : "Nutri is a curious little owl created to help children discover foods, the colors on their plate, and the principles of varied, balanced eating."}
                </p>
                <p>
                  {ro
                    ? "Prin cărți, jocuri și activități, cei mici învață să exploreze alimente noi, să recunoască grupele alimentare și, treptat, să înțeleagă ce oferă fiecare aliment organismului."
                    : "Through books, games, and activities, children learn to explore new foods, recognize food groups, and gradually understand what each food gives their body."}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-5 py-3 text-sm font-semibold text-primary mb-6">
                <Sparkles className="w-4 h-4 shrink-0" />
                {ro
                  ? "Fără presiune. Fără farfurii perfecte. Cu multă curiozitate."
                  : "No pressure. No perfect plates. Lots of curiosity."}
              </div>
              <div>
                <Link
                  href="/nutri-pentru-copii"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 text-primary-foreground font-medium px-8 h-12 transition-all"
                  data-testid="button-discover-nutri"
                >
                  {ro ? "Descoperă lumea lui Nutri" : "Discover Nutri's world"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <p className="text-xs text-muted-foreground mt-3">
                  {ro
                    ? "Cărți • Activități • Jocuri • Resurse pentru părinți"
                    : "Books • Activities • Games • Resources for parents"}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <img
                src="/images/nutri-hero.png"
                alt={ro ? "Nutri, personajul Diet4Life pentru copii" : "Nutri, the Diet4Life character for kids"}
                className="w-full h-auto rounded-3xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Aplică în viața reală */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground text-center mb-12">
            {ro ? "Aplică în viața reală" : "Apply it in real life"}
          </h2>
          <div className="grid sm:grid-cols-2 gap-6 mb-6">
            <Link
              href="/calculator"
              className="group rounded-2xl border border-border bg-card p-7 hover:shadow-md hover:border-primary/30 transition-all"
              data-testid="link-apply-calculator"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <CalculatorIcon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif font-bold text-foreground text-lg mb-2">
                {ro ? "Calculator necesar caloric" : "Calorie needs calculator"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {ro
                  ? "Află orientativ câte calorii ai nevoie, pornind de la profilul tău."
                  : "Get an estimate of how many calories you need, based on your profile."}
              </p>
              <span className="text-primary text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                {ro ? "Deschide calculatorul" : "Open the calculator"} <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link
              href="/consultatii"
              className="group rounded-2xl border border-border bg-card p-7 hover:shadow-md hover:border-primary/30 transition-all"
              data-testid="link-apply-journal"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <NotebookPen className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif font-bold text-foreground text-lg mb-2">
                {ro ? "Jurnal alimentar" : "Food journal"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {ro
                  ? "Înțelege-ți obiceiurile alimentare, notând ce mănânci zi de zi."
                  : "Understand your eating habits by tracking what you eat day to day."}
              </p>
              <span className="text-primary text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                {ro ? "Deschide jurnalul" : "Open the journal"} <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {ro
              ? "Instrumentele au rol educațional și nu oferă diagnostic medical."
              : "These tools are educational and do not provide a medical diagnosis."}
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-background border-t">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
            {ro ? "Ai găsit răspunsurile pe care le căutai?" : "Did you find the answers you were looking for?"}
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {ro
              ? "Dacă încă ai întrebări sau îți dorești recomandări adaptate istoricului, obiectivelor și stilului tău de viață, mi-ar face plăcere să ne cunoaștem și să construim împreună un plan potrivit pentru tine."
              : "If you still have questions or want recommendations tailored to your history, goals, and lifestyle, I'd love to get to know you and build a plan that fits you together."}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 active:scale-[0.97] text-white font-medium px-8 h-12 transition-all"
            data-testid="button-lets-meet"
          >
            <Heart className="w-4 h-4" />
            {ro ? "Hai să ne cunoaștem" : "Let's get to know each other"}
          </Link>
        </div>
      </section>
    </div>
  );
}
