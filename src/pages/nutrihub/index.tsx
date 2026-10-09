import { useState } from "react";
import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

// Custom Diet4Life-branded photo, supplied directly by the user for this
// exact slot (not Adobe Stock) -- replaces the earlier licensed Adobe Stock
// asset 414109933 (omega-3 food sources), which must not be reused anywhere
// else per her explicit instruction. Shows a varied flat-lay spanning every
// food group (cereals, legumes, dairy, eggs, fish, vegetables, fruit, nuts)
// -- supports this article's real message (source and nutritional profile
// matter, not just the energy number) -- deliberately NOT a "treat vs.
// perfect meal" opposition.
const FEATURED_IMAGE_SRC = "/images/nutrihub/nutrihub-calorii-featured.webp";

// Same outer column as Home/Despre mine/Servicii's own PAGE_COLUMN (kept in
// sync by hand -- importing would require exporting it from one of those
// page files, which their own briefs said not to touch).
const PAGE_COLUMN = "max-w-[1200px] mx-auto px-[18px] min-[380px]:px-5 lg:px-8";

// NutriHub's own palette: deliberately NOT the warm cream used by
// Home/Despre/Servicii -- the spec for this page calls for a whiter,
// more "editorial publication" background, with the same warm cream
// (#FDF9F2) reused only as an occasional soft surface (the featured-
// article block below), not as the page background. --primary and
// --muted-foreground are the exact same values already established on
// Home/Despre/Servicii (#2F5D3F / #7A6559) -- this page reuses them
// rather than inventing new ones. Mirrored in ArticleShell.tsx so an
// article page reads as a continuation of this page, not a jump back
// to the warmer palette.
const NUTRIHUB_PAGE_STYLE = {
  "--background": "0 0% 100%", // #FFFFFF
  "--card": "0 0% 98%", // zinc-50
  "--border": "220 9% 89%", // zinc-200-ish
  "--foreground": "146 10% 14%", // #1F2622
  "--primary": "141 33% 27%", // #2F5D3F
  "--muted-foreground": "22 16% 41%", // #7A6559
} as any;

// Each image is a real, locally-saved photo -- no placeholders, no external
// URLs. nutritie-echilibrata and cate-calorii-am-nevoie now use custom
// Diet4Life-branded photos supplied directly by the user for these exact
// slots (not Adobe Stock); the other 3 (controlul-greutatii, cata-proteina-
// am-nevoie, fibrele-alimentare) are licensed Adobe Stock assets, cropped/
// converted to WebP locally. The 2 Adobe Stock assets these branded photos
// replaced (452259472 and 303927153) must not be reused anywhere else per
// explicit instruction. Each image is a distinct composition -- no image or
// crop is reused across two different articles.
const ARTICLES = [
  {
    slug: "nutritie-echilibrata",
    image: "/images/nutrihub/nutritie-echilibrata-masa-variata.webp",
    imageAlt: "Masă variată cu legume, salată, cereale, leguminoase, pește, pâine și fructe",
    categoryRo: "NUTRIȚIE ECHILIBRATĂ",
    categoryEn: "Balanced nutrition",
    titleRo: "Nutriție echilibrată: cum arată în viața reală?",
    titleEn: "Balanced nutrition: what it actually looks like",
    descriptionRo: "Cum construim o alimentație echilibrată, fără reguli rigide și fără să complicăm inutil lucrurile.",
    descriptionEn: "How we build a balanced diet, without rigid rules or unnecessary complication.",
  },
  {
    slug: "controlul-greutatii",
    image: "/images/nutrihub/controlul-greutatii-jurnal-centimetru.webp",
    imageAlt: "Jurnal alimentar deschis, un centimetru și legume proaspete pe o masă de lemn",
    categoryRo: "CONTROLUL GREUTĂȚII",
    categoryEn: "Weight control",
    titleRo: "Controlul greutății: de ce nu se reduce la „mănâncă mai puțin”",
    titleEn: "Weight control: why it's not just \"eat less\"",
    descriptionRo: "Greutatea nu ține doar de cât mănânci. Contează contextul, sațietatea și schimbările pe care le poți menține.",
    descriptionEn: "Weight isn't only about how much you eat. Context, satiety, and sustainable changes matter too.",
  },
  {
    slug: "cata-proteina-am-nevoie",
    image: "/images/nutrihub/proteina-surse-variate.webp",
    imageAlt: "Surse variate de proteină: ouă fierte, brânză proaspătă, migdale, castraveți și fructe de pădure",
    categoryRo: "MACRONUTRIENȚI",
    categoryEn: "Macronutrients",
    titleRo: "De ce este importantă proteina și de câtă avem nevoie?",
    titleEn: "Why protein matters and how much you actually need",
    descriptionRo: "Ce rol are proteina, cum diferă sursele alimentare și de ce necesarul nu este același pentru toată lumea.",
    descriptionEn: "What role protein plays, how food sources differ, and why the need isn't the same for everyone.",
  },
  {
    slug: "cate-calorii-am-nevoie",
    image: "/images/nutrihub/necesar-caloric-masa-cotidiana.webp",
    imageAlt: "Masă cotidiană cu paste, legume și chifteluțe, alături de apă și un fruct",
    categoryRo: "ENERGIE ȘI NECESAR CALORIC",
    categoryEn: "Energy & caloric needs",
    titleRo: "Câte calorii am nevoie, de fapt?",
    titleEn: "How many calories do I actually need?",
    descriptionRo: "Necesarul caloric poate fi estimat, dar nu este o cifră fixă. Află ce îl influențează și cum trebuie interpretat.",
    descriptionEn: "Caloric need can be estimated, but it isn't a fixed number. Find out what influences it and how to interpret it.",
  },
  {
    slug: "fibrele-alimentare",
    image: "/images/nutrihub/fibre-alimentare-surse.webp",
    imageAlt: "Surse de fibre alimentare: ovăz, leguminoase, pâine integrală, banane și legume cu frunze",
    categoryRo: "FIBRE ALIMENTARE",
    categoryEn: "Dietary fiber",
    titleRo: "Fibrele alimentare: de ce sunt importante",
    titleEn: "Dietary fiber: why it matters",
    descriptionRo: "Ce sunt fibrele, unde le găsim, cât avem nevoie și de ce toleranța poate diferi de la o persoană la alta.",
    descriptionEn: "What fiber is, where to find it, how much you need, and why tolerance can differ from person to person.",
  },
];

export default function NutriHub() {
  const { language } = useLanguage();
  const ro = language === "ro";
  const prefersReducedMotion = useReducedMotion();
  const [featuredImageFailed, setFeaturedImageFailed] = useState(false);

  const reveal = (delay = 0) =>
    prefersReducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
          transition: { duration: 0.35, delay, ease: "easeOut" },
        };

  return (
    <div className="min-h-screen bg-background" style={NUTRIHUB_PAGE_STYLE}>
      {/* Hero -- minimal, left-aligned, no surrounding card/band */}
      <section className="pt-14 pb-10 md:pt-20 md:pb-14">
        <div className={PAGE_COLUMN}>
          <motion.div {...reveal()} className="max-w-2xl">
            <span className="text-xs font-semibold tracking-wide uppercase text-primary mb-4 block">
              NUTRIHUB
            </span>
            <h1 className="text-[34px] md:text-5xl font-serif font-bold text-foreground leading-[1.15] md:leading-tight mb-5 text-balance">
              {ro ? "Nutriție explicată clar." : "Nutrition explained clearly."}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {ro
                ? "Informație nutrițională bazată pe dovezi, explicată pentru viața reală — fără mituri și fără reguli inutile."
                : "Evidence-based nutrition information, explained for real life — no myths, no unnecessary rules."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured article -- editorial, visually distinct from the regular grid.
          The image container's aspect ratio (16:9) matches the sourced
          photo's own native ratio (1600x900) exactly, so object-cover never
          actually crops anything. This is the page's main/first large
          visual, so it's eager-loaded (not lazy). onError still falls back
          to a text-only layout if the file is ever missing.

          overflow-hidden was removed from the Link itself -- it was clipping
          the focus-visible ring (box-shadow-based) along with the image.
          The image now carries its own corner rounding directly (border-
          radius works natively on <img>, no wrapper/overflow-hidden needed
          to clip it) -- same visual result, ring no longer clipped. */}
      <section className="pb-10 md:pb-14">
        <div className={PAGE_COLUMN}>
          <motion.div {...reveal(0.05)}>
            <Link
              href="/nutrihub/sunt-toate-caloriile-la-fel"
              className="group grid md:grid-cols-[0.45fr_0.55fr] gap-0 rounded-2xl border border-border hover:-translate-y-0.5 active:scale-[0.98] transition-transform duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              style={{ backgroundColor: "#FDF9F2" }}
              data-testid="link-featured-article"
            >
              {!featuredImageFailed && (
                <div className="order-1 md:order-2 aspect-[16/9] min-w-0">
                  <img
                    src={FEATURED_IMAGE_SRC}
                    alt={ro ? "Selecție variată de alimente: cereale, leguminoase, lactate, ouă, pește, legume, fructe și nuci" : "A varied selection of foods: grains, legumes, dairy, eggs, fish, vegetables, fruit and nuts"}
                    width={1600}
                    height={900}
                    className="w-full h-full object-cover rounded-t-2xl md:rounded-t-none md:rounded-r-2xl"
                    loading="eager"
                    decoding="async"
                    onError={() => setFeaturedImageFailed(true)}
                  />
                </div>
              )}
              <div className={`order-2 md:order-1 px-6 py-8 md:px-12 md:py-14 flex flex-col justify-center ${featuredImageFailed ? "md:col-span-2" : ""}`}>
                {/* Upgraded from a plain uppercase label to a pill badge --
                    reuses the exact bg-primary/10 + text-primary + rounded-full
                    recipe already used for the BMI category badge in
                    Calculator.tsx, for stronger visual hierarchy. */}
                <span className="inline-block w-fit text-xs font-semibold tracking-wide uppercase text-primary bg-primary/10 rounded-full px-3 py-1 mb-4">
                  {ro ? "Energie și alegeri alimentare" : "Energy & food choices"}
                </span>
                <h2 className="text-2xl md:text-[32px] font-serif font-bold text-foreground leading-tight mb-3 max-w-2xl text-balance">
                  {ro ? "Sunt toate caloriile la fel?" : "Are all calories equal?"}
                </h2>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-5 max-w-xl">
                  {ro
                    ? "Aceeași energie poate arăta foarte diferit în farfurie. Contează și din ce alimente provin caloriile."
                    : "The same amount of energy can look very different on a plate. Where your calories come from matters too."}
                </p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  {ro ? "Citește articolul" : "Read the article"}
                  <span className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-[3px]">
                    →
                  </span>
                </span>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Remaining articles */}
      <section className="pb-16 md:pb-24">
        <div className={PAGE_COLUMN}>
          <motion.h2 {...reveal()} className="text-[28px] md:text-[32px] font-serif font-bold text-foreground mb-6 md:mb-8">
            {ro ? "Explorează NutriHub" : "Explore NutriHub"}
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-5 md:gap-6">
            {ARTICLES.map((article, i) => (
              <motion.div key={article.slug} {...reveal(0.05 + i * 0.05)}>
                <Link
                  href={`/nutrihub/${article.slug}`}
                  className="group flex flex-col h-full rounded-2xl border border-border bg-card hover:-translate-y-0.5 active:scale-[0.98] transition-transform duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  data-testid={`link-nutrihub-topic-${article.slug}`}
                >
                  {/* Real, distinct, licensed photo per article -- below the
                      fold on both desktop and mobile, so lazy-loaded.
                      overflow-hidden removed from the Link (it was clipping
                      the focus-visible ring); the image carries its own
                      rounded-t-2xl directly instead, matching the card's
                      own corner radius with the same visual result. */}
                  <img
                    src={article.image}
                    alt={article.imageAlt}
                    width={1600}
                    height={900}
                    className="w-full aspect-[16/9] object-cover rounded-t-2xl"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="flex flex-col flex-1 px-6 py-6 md:px-7 md:py-7">
                    <span className="text-xs font-semibold tracking-wide uppercase text-primary mb-2.5">
                      {ro ? article.categoryRo : article.categoryEn}
                    </span>
                    <h3 className="font-serif font-bold text-foreground text-xl md:text-2xl leading-snug mb-2.5 text-balance">
                      {ro ? article.titleRo : article.titleEn}
                    </h3>
                    <p className="text-sm md:text-base text-muted-foreground leading-relaxed flex-1 line-clamp-3">
                      {ro ? article.descriptionRo : article.descriptionEn}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      {ro ? "Citește articolul" : "Read the article"}
                      <span className="inline-block transition-transform duration-200 ease-out group-hover:translate-x-[3px]">
                        →
                      </span>
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
