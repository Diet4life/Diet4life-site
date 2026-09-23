import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Clock,
  Minus,
  Heart,
  Apple,
  ShieldCheck,
  BadgeCheck,
  BookOpenCheck,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// Real article links, not a search -- the hero's fake search box was
// removed per the finalized hero decision (it looked functional but
// executed no real search, which the audit flagged as a trust issue).
// "wide" (col-span-2 on the mobile 2-col grid) is used both for the
// question that wraps to 3 lines otherwise, and for the last, slug-less
// "coming soon" item so it reads as its own full-width row rather than
// leaving an awkward single-cell gap next to it.
const heroTopicLinks = [
  { icon: Apple, ro: "Ce alimente ar trebui să aleg?", en: "What foods should I choose?", slug: null as string | null, wide: true },
  { icon: Minus, ro: "Cum arată o masă echilibrată?", en: "What does a balanced meal look like?", slug: "nutritie-echilibrata" },
  { icon: Heart, ro: "Câtă proteină am nevoie?", en: "How much protein do I need?", slug: "cata-proteina-am-nevoie" },
  { icon: Clock, ro: "De ce nu slăbesc deși mănânc puțin?", en: "Why am I not losing weight even though I eat little?", slug: "controlul-greutatii", wide: true },
];

export default function Home() {
  const { language } = useLanguage();
  const ro = language === "ro";

  return (
    <div
      className="flex flex-col"
      style={{
        // Page-scoped palette correction (approved hex direction), applied
        // as local CSS custom-property overrides on Home only -- never
        // touches the shared :root tokens, so Services/NutriHub/Calculator/
        // checkout/header/footer are unaffected. Only --primary,
        // --muted-foreground, --background and --card actually differed
        // meaningfully from the approved values; --foreground and --rodie
        // were already a near-exact match and are left alone.
        "--background": "37 62% 96%", // #FBF6EE
        "--card": "38 73% 97%", // #FDF9F2 -- "suprafețe deschise"
        "--primary": "141 33% 27%", // #2F5D3F
        "--muted-foreground": "22 16% 41%", // #7A6559 -- was a cool sage-gray, now warm taupe
      } as any}
    >
      {/* Hero -- background now comes from the page-scoped --background
          override above (exact #FBF6EE) so the photo's own feathered edges
          (baked into hero.jpg/hero.webp, see the composite script) dissolve
          into it with no visible seam, and the rest of the page's
          bg-background sections match it exactly too.

          Grid is 3 top-level items in DOM order (text-top, image, chips) so
          mobile needs zero reordering -- it's already eyebrow/H1/subtitle/
          CTA -> image -> chips by default single-column stacking. Desktop
          restores the original 2-column split via explicit placement: col 1
          gets text-top (row 1) + chips (row 2), col 2 gets the image
          spanning both rows, centered. */}
      <section className="relative bg-background overflow-hidden pt-7 pb-9 md:pt-14 md:pb-14 lg:pt-20 lg:pb-20">
        <div className="max-w-[1200px] mx-auto px-[18px] min-[380px]:px-5 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_0.9fr] lg:grid-rows-[auto_auto] lg:gap-x-[68px] items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-start-1 lg:row-start-1"
            >
              {/* Editorial kicker -- no pill/background/border, a thin rule
                  instead of a badge shape. */}
              <span className="inline-flex items-center gap-2 text-[11px] lg:text-xs font-semibold tracking-[0.13em] lg:tracking-[0.16em] uppercase text-[hsl(var(--rodie))] mb-4">
                <span className="inline-block w-4 h-px bg-[hsl(var(--rodie))]" aria-hidden="true" />
                {ro ? "Nutriție. Fără mituri." : "Nutrition. No myths."}
              </span>

              <h1 className="font-serif font-bold text-foreground text-[32px] min-[390px]:text-[34px] lg:text-[57px] leading-[1.03] lg:leading-[1.06] tracking-[-0.01em] max-w-[340px] lg:max-w-[560px] mb-2 lg:mb-4">
                {ro ? "În spatele fiecărui aliment există " : "Behind every food, there's "}
                <span className="text-primary">{ro ? "o întrebare." : "a question."}</span>
              </h1>

              <p className="text-base lg:text-[18px] leading-[1.4] lg:leading-[1.55] font-medium lg:font-normal text-muted-foreground max-w-[360px] lg:max-w-[520px] mb-[21px] lg:mb-7">
                {ro
                  ? "Înțelege mai bine ce mănânci, cum îți construiești mesele și ce alegeri se potrivesc nevoilor și obiectivelor tale."
                  : "Understand what you eat, how you build your meals, and what choices fit your needs and goals."}
              </p>

              <div className="flex flex-col min-[380px]:flex-row gap-2 lg:gap-3">
                <Link
                  href="/nutrihub"
                  className="inline-flex items-center justify-center min-[380px]:min-w-[200px] lg:min-w-[234px] h-[46px] lg:h-[52px] px-6 rounded-[13px] bg-primary hover:bg-primary/90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 text-white font-semibold text-[15px] lg:text-base transition-all whitespace-nowrap"
                  data-testid="button-explore-nutrihub"
                >
                  {ro ? "Explorează NutriHub" : "Explore NutriHub"}
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center min-[380px]:min-w-[180px] h-[46px] lg:h-[52px] px-6 rounded-[13px] border border-border bg-background hover:border-primary/30 hover:shadow-sm active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 text-foreground font-semibold text-[15px] lg:text-base transition-all whitespace-nowrap"
                  data-testid="button-see-services-hero"
                >
                  {ro ? "Vezi serviciile" : "See services"}
                </Link>
              </div>
            </motion.div>

            {/* Image -- moved up in mobile DOM order (right after the CTAs,
                before the topic chips) so it lands as a scroll-stopper
                earlier, not after everything else. No card: no border, no
                shadow, no radius, no aspect-square clip -- the feathered
                edge baked into the file is what integrates it. */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
              className="mt-4 mb-7 lg:my-0 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:self-start"
            >
              <picture>
                <source srcSet="/images/hero.webp" type="image/webp" />
                <img
                  src="/images/hero.jpg"
                  alt={ro ? "Rodie tăiată, fotografie editorială Diet4Life" : "Cut pomegranate, Diet4Life editorial photograph"}
                  width={1086}
                  height={1086}
                  loading="eager"
                  className="w-full h-auto max-w-[360px] md:max-w-[480px] lg:max-w-none lg:w-[700px] xl:w-[820px] mx-auto lg:mx-0 lg:ml-auto lg:-mr-10 xl:-mr-20"
                />
              </picture>

              {/* Editorial caption, not a card -- no background/border/shadow,
                  small and airy so it doesn't compete with the hero copy. */}
              <div className="w-full md:max-w-[480px] md:mx-auto lg:max-w-[380px] lg:mx-0 lg:ml-auto lg:mr-9 xl:mr-16 mt-3 lg:mt-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-[hsl(var(--rodie))] mb-1.5">
                  {ro ? "De ce rodia?" : "Why pomegranate?"}
                </p>
                <p className="text-sm leading-[1.5] text-muted-foreground">
                  {ro
                    ? "Pentru că este un exemplu bun că un aliment poate fi interesant fără să fie „magic”. Conține polifenoli și antocianine, dar ceea ce contează pentru sănătatea ta este alimentația în ansamblu, nu un singur „superaliment”."
                    : "Because it's a good example that a food can be interesting without being \"magic\". It contains polyphenols and anthocyanins, but what matters for your health is your diet as a whole, not a single \"superfood\"."}
                </p>
              </div>
            </motion.div>

            <div className="lg:col-start-1 lg:row-start-2">
              <p className="text-[13px] lg:text-sm font-medium text-muted-foreground mb-2.5 lg:mb-[14px]">
                {ro ? "Câteva întrebări de la care poți porni" : "A few questions to start with"}
              </p>
              <div className="grid grid-cols-2 lg:flex lg:flex-wrap gap-2 lg:gap-2.5">
                {heroTopicLinks.map((q, i) => {
                  const itemClassName = `${q.wide ? "col-span-2" : ""} min-h-11 lg:min-h-[42px] flex items-center gap-2 px-3 py-2.5 lg:px-[14px] rounded-xl border border-border transition-all text-left ${
                    q.slug
                      ? "bg-background hover:border-primary/30 hover:shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                      : "bg-background/60 cursor-default"
                  }`;
                  const content = (
                    <>
                      <q.icon className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm lg:text-[15px] font-medium text-foreground">{ro ? q.ro : q.en}</span>
                      {!q.slug && (
                        <span className="ml-auto shrink-0 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
                          {ro ? "În curând" : "Soon"}
                        </span>
                      )}
                    </>
                  );
                  return q.slug ? (
                    <Link key={i} href={`/nutrihub/${q.slug}`} className={itemClassName} data-testid={`link-hero-topic-${i}`}>
                      {content}
                    </Link>
                  ) : (
                    <div key={i} className={itemClassName} data-testid={`link-hero-topic-${i}`} aria-disabled="true">
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
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

      {/* Din răspunsuri, în practică (was "Aplică în viața reală" -- moved
          to right after the hero/trust bar, renamed). Visual finalization,
          final round: the 2 final images she supplied directly (tool-
          journal.png / tool-calculator.png) replace the earlier mockups.
          Cards use a subtle border + faint card background (not a heavy
          shadow, not rotated) so the images read as integrated into the
          section rather than pasted on top of it. Mobile order (Calculator
          first, then Jurnal) falls out of plain DOM order in the
          single-column stack, no extra ordering needed. */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground text-center mb-3 text-balance">
            {ro ? "Din răspunsuri, în practică" : "From answers to practice"}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-14">
            {ro
              ? "Instrumente simple care te ajută să înțelegi mai bine nevoile și obiceiurile tale."
              : "Simple tools to help you better understand your needs and habits."}
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <Link
              href="/calculator"
              className="group flex flex-col h-full rounded-2xl border border-border bg-card/60 p-5 md:p-6 transition-colors hover:border-primary/30"
              data-testid="link-apply-calculator"
            >
              <div className="rounded-xl overflow-hidden mb-6">
                <picture>
                  <source srcSet="/images/tool-calculator.webp" type="image/webp" />
                  <img
                    src="/images/tool-calculator.png"
                    alt={ro ? "Rezultatul nutrițional calculat de calculatorul Diet4Life" : "The nutritional result calculated by the Diet4Life calculator"}
                    className="w-full h-auto"
                    loading="lazy"
                    width={1448}
                    height={1086}
                  />
                </picture>
              </div>
              <h3 className="font-serif font-semibold text-foreground text-xl mb-2">
                {ro ? "Calculator necesar caloric" : "Calorie needs calculator"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1">
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
              className="group flex flex-col h-full rounded-2xl border border-border bg-card/60 p-5 md:p-6 transition-colors hover:border-primary/30"
              data-testid="link-apply-journal"
            >
              <div className="rounded-xl overflow-hidden mb-6">
                <picture>
                  <source srcSet="/images/tool-journal.webp" type="image/webp" />
                  <img
                    src="/images/tool-journal.png"
                    alt={ro ? "Pagina 1 a jurnalului alimentar Diet4Life" : "Page 1 of the Diet4Life food journal"}
                    className="w-full h-auto"
                    loading="lazy"
                    width={1448}
                    height={1086}
                  />
                </picture>
              </div>
              <h3 className="font-serif font-semibold text-foreground text-xl mb-2">
                {ro ? "Jurnal alimentar" : "Food journal"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1">
                {ro
                  ? "Observă ce mănânci, cum mănânci și ce tipare apar în timp."
                  : "Notice what you eat, how you eat, and the patterns that emerge over time."}
              </p>
              <span className="text-primary text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                {ro ? "Deschide jurnalul" : "Open the journal"} <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-12">
            {ro
              ? "Instrumentele au rol educațional și nu oferă diagnostic medical."
              : "These tools are educational and do not provide a medical diagnosis."}
          </p>
        </div>
      </section>

      {/* Nutri pentru copii -- moved to right after "Din răspunsuri, în
          practică", intro copy replaced per this round's brief. Mascot
          image untouched. */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase text-primary mb-4">
                <span className="inline-block w-4 h-px bg-primary" aria-hidden="true" />
                {ro ? "Pentru cei mici" : "For little ones"}
              </span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-3 text-balance">
                {ro ? "Nutriția poate începe și prin joacă." : "Nutrition can start with play, too."}
              </h2>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6">
                {ro
                  ? "Prin povești, jocuri și activități, copiii pot descoperi alimentele într-un mod curios, relaxat și potrivit vârstei lor."
                  : "Through stories, games, and activities, children can discover food in a curious, relaxed way that fits their age."}
              </p>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-5 py-3 text-sm font-semibold text-primary mb-6">
                <Sparkles className="w-4 h-4 shrink-0" />
                {ro
                  ? "Fără presiune. Fără farfurii perfecte. Cu multă curiozitate."
                  : "No pressure. No perfect plates. Lots of curiosity."}
              </div>
              <div>
                <Link
                  href="/nutri-pentru-copii"
                  className="inline-flex items-center justify-center gap-2 h-[50px] lg:h-[52px] px-6 rounded-[13px] bg-primary hover:bg-primary/90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 text-primary-foreground font-semibold text-[15px] lg:text-base transition-all"
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

      {/* Când ai nevoie de ceva adaptat ție (was "Servicii scurt" --
          renamed, moved to be the last section before the footer) */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <span className="inline-flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase text-primary mb-4">
            <span className="inline-block w-4 h-px bg-primary" aria-hidden="true" />
            {ro ? "Sprijin personalizat" : "Personalized support"}
            <span className="inline-block w-4 h-px bg-primary" aria-hidden="true" />
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-5 text-balance">
            {ro ? "Când ai nevoie de ceva adaptat ție" : "When you need something tailored to you"}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-8">
            {ro
              ? "Informațiile generale pot fi un punct bun de plecare. Dacă ai nevoie de recomandări adaptate istoricului, obiectivelor și stilului tău de viață, putem lucra împreună într-o consultație nutrițională individuală."
              : "General information can be a good starting point. If you need recommendations tailored to your history, goals, and lifestyle, we can work together in an individual nutrition consultation."}
          </p>
          <Link
            href="/services"
            className="inline-flex items-center justify-center gap-2 h-[50px] lg:h-[52px] px-6 rounded-[13px] bg-primary hover:bg-primary/90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 text-primary-foreground font-semibold text-[15px] lg:text-base transition-all"
            data-testid="button-see-services"
          >
            {ro ? "Vezi serviciile" : "See services"}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
