import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { useDocumentHead } from "@/hooks/use-document-head";
import {
  Palette,
  LayoutGrid,
  Sparkles,
  FlaskConical,
  Heart,
  X,
  Check,
  HelpCircle,
  BookOpen,
  PuzzleIcon,
  CalendarRange,
  Users,
  ArrowRight,
} from "lucide-react";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Same outer column as Home/Despre mine/Servicii's own PAGE_COLUMN (kept in
// sync by hand -- importing would require exporting it from one of those
// page files, which their own briefs said not to touch).
const PAGE_COLUMN = "max-w-[1200px] mx-auto px-[18px] min-[380px]:px-5 lg:px-8";

function NutriHighlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-2 md:px-5 md:py-3 text-xs md:text-sm font-semibold text-primary">
      <Sparkles className="w-4 h-4 shrink-0" />
      {children}
    </div>
  );
}

const LEARN_CARDS = [
  {
    icon: Palette,
    titleRo: "Să adauge culoare în farfurie",
    titleEn: "Add color to the plate",
    textRo: "Copiii descoperă fructe, legume și alte alimente diferite și învață că varietatea poate face parte firesc din mesele lor.",
    textEn: "Children discover fruits, vegetables, and other different foods, and learn that variety can naturally be part of their meals.",
  },
  {
    icon: LayoutGrid,
    titleRo: "Să recunoască grupele alimentare",
    titleEn: "Recognize food groups",
    textRo: "Pe măsură ce cresc, pot învăța să diferențieze principalele categorii de alimente și să înțeleagă că organismul are nevoie de surse diferite de nutrienți.",
    textEn: "As they grow, they can learn to tell apart the main food categories and understand that the body needs different sources of nutrients.",
  },
  {
    icon: Sparkles,
    titleRo: "Să exploreze alimente noi",
    titleEn: "Explore new foods",
    textRo: "Uneori primul pas nu este să mănânci un aliment nou, ci doar să îl privești, să îl atingi, să îl miroși sau să îl guști. Și asta este tot o formă de învățare.",
    textEn: "Sometimes the first step isn't eating a new food, but just looking at it, touching it, smelling it, or tasting it. And that's a form of learning too.",
  },
  {
    icon: FlaskConical,
    titleRo: "Să înțeleagă, treptat, nutrienții",
    titleEn: "Gradually understand nutrients",
    textRo: "Proteine, carbohidrați, grăsimi, fibre, vitamine, minerale și apă pot fi explicate simplu, pe înțelesul copiilor, fără să pierdem corectitudinea informației.",
    textEn: "Protein, carbohydrates, fat, fiber, vitamins, minerals, and water can be explained simply, in terms children understand, without losing accuracy.",
  },
  {
    icon: Heart,
    titleRo: "Să construiască obiceiuri pentru viață",
    titleEn: "Build habits for life",
    textRo: "Scopul nu este ca un copil să mănânce „perfect”, ci să învețe treptat să facă alegeri mai variate și mai echilibrate.",
    textEn: "The goal isn't for a child to eat \"perfectly\", but to gradually learn to make more varied and balanced choices.",
  },
];

const PHILOSOPHY_QUESTIONS = [
  { ro: "Ce culori am astăzi în farfurie?", en: "What colors do I have on my plate today?" },
  { ro: "Din ce categorie face parte acest aliment?", en: "What category does this food belong to?" },
  { ro: "Ce îi oferă organismului meu?", en: "What does it give my body?" },
  { ro: "Este ceva nou pe care îl pot descoperi?", en: "Is this something new I can discover?" },
];

const NUTRI_PRODUCTS = [
  {
    icon: BookOpen,
    titleRo: "The Rainbow Plate",
    titleEn: "The Rainbow Plate",
    subtitleRo: "Coloring & Activity Book",
    subtitleEn: "Coloring & Activity Book",
    descRo: "Carte de colorat și activități despre culorile alimentelor și varietatea din farfurie.",
    descEn: "A coloring and activity book about food colors and the variety on a plate.",
    badgeRo: null as string | null,
    badgeEn: null as string | null,
  },
  {
    icon: FlaskConical,
    titleRo: "Understanding Nutrients with Nutri",
    titleEn: "Understanding Nutrients with Nutri",
    subtitleRo: null as string | null,
    subtitleEn: null as string | null,
    descRo: "O carte despre nutrienți explicați simplu și corect, pe înțelesul copiilor.",
    descEn: "A book about nutrients explained simply and accurately, in terms children understand.",
    badgeRo: "În curând",
    badgeEn: "Coming soon",
  },
  {
    icon: PuzzleIcon,
    titleRo: "Food Play Kit",
    titleEn: "Food Play Kit",
    subtitleRo: null as string | null,
    subtitleEn: null as string | null,
    descRo: "Activități cu farfurii, lunchbox, alimente și jocuri de asociere.",
    descEn: "Activities with plates, lunchboxes, foods, and matching games.",
    badgeRo: null as string | null,
    badgeEn: null as string | null,
  },
  {
    icon: CalendarRange,
    titleRo: "Visual Meal Planner",
    titleEn: "Visual Meal Planner",
    subtitleRo: null as string | null,
    subtitleEn: null as string | null,
    descRo: "Un mod vizual prin care copilul poate participa la planificarea meselor familiei.",
    descEn: "A visual way for a child to take part in planning the family's meals.",
    badgeRo: null as string | null,
    badgeEn: null as string | null,
  },
];

export default function NutriPentruCopii() {
  const { language } = useLanguage();
  const ro = language === "ro";

  useDocumentHead(
    ro
      ? "Nutri pentru copii | Educație nutrițională prin joacă | Diet4Life Concept"
      : "Nutri for Kids | Nutrition Education Through Play | Diet4Life Concept",
    ro
      ? "Descoperă Nutri, personajul Diet4Life creat pentru a-i ajuta pe copii să exploreze alimentele, culorile, grupele alimentare și nutriția prin joacă și activități."
      : "Meet Nutri, the Diet4Life character created to help children explore food, colors, food groups, and nutrition through play and activities."
  );

  return (
    <div
      className="flex flex-col"
      style={{
        // Same page-scoped palette override as Home/About/Services (kept in
        // sync by hand -- importing would require exporting it from one of
        // those page files, which their own briefs said not to touch).
        "--background": "37 62% 96%", // #FBF6EE
        "--card": "38 73% 97%", // #FDF9F2
        "--primary": "141 33% 27%", // #2F5D3F
        "--muted-foreground": "22 16% 41%", // #7A6559
      } as any}
    >
      {/* Hero -- text + the existing Nutri owl asset (already live on
          Home.tsx's teaser section, reused here rather than duplicated as a
          new asset), same borderless aspect-square crop treatment as that
          section so the identity image never sits inside a heavy card.
          Section padding tightened twice now (was pt-14 pb-10 md:pt-20
          md:pb-14, then pt-10 pb-8 md:pt-16 md:pb-10 -- still measured at
          80px/64px into the next section, over the 40-64/32-48px target
          for this kind of close, related-idea transition). Top keeps more
          room since this is the page's own start; bottom now matches the
          shared tighter inter-section rhythm below. */}
      <section className="pt-10 pb-5 md:pt-16 md:pb-7 bg-background">
        <div className={PAGE_COLUMN}>
          <div className="grid lg:grid-cols-[1fr_1fr] gap-5 lg:gap-[68px] items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase text-primary mb-3 md:mb-4">
                <span className="inline-block w-4 h-px bg-primary" aria-hidden="true" />
                {ro ? "Pentru cei mici" : "For little ones"}
              </span>
              <h1 className="text-[36px] lg:text-5xl font-serif font-bold text-foreground leading-tight lg:leading-normal mb-3 text-balance">
                {ro ? "Nutri pentru copii" : "Nutri for Kids"}
              </h1>
              <p className="text-lg md:text-xl text-primary font-medium mb-5">
                {ro ? "Educația nutrițională poate începe prin joacă." : "Nutrition education can start through play."}
              </p>
              <div className="text-base md:text-lg text-muted-foreground leading-relaxed space-y-4 mb-6">
                <p>
                  {ro
                    ? "Nutri este o mică bufniță curioasă, creată pentru a-i ajuta pe copii să descopere mâncarea într-un mod prietenos, vizual și fără presiune."
                    : "Nutri is a curious little owl, created to help children discover food in a friendly, visual way, without pressure."}
                </p>
                <p>
                  {ro
                    ? "Prin povești, jocuri și activități, Nutri îi însoțește pe cei mici în explorarea alimentelor, a culorilor din farfurie, a grupelor alimentare și, treptat, a noțiunilor simple despre nutrienți și rolul lor în organism."
                    : "Through stories, games, and activities, Nutri accompanies children as they explore foods, the colors on their plate, food groups, and gradually, simple ideas about nutrients and their role in the body."}
                </p>
              </div>
              <NutriHighlight>
                {ro
                  ? "Fără presiune. Fără farfurii perfecte. Cu multă curiozitate."
                  : "No pressure. No perfect plates. Lots of curiosity."}
              </NutriHighlight>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="aspect-square overflow-hidden max-w-[420px] mx-auto lg:max-w-none">
                {/* Soft edge-feather via CSS mask (the source PNG is an
                    official asset and is never edited/re-exported) -- a
                    radial fade that only reaches the image's outer corners.
                    Default radial-gradient sizing (ellipse, farthest-corner)
                    means the fade zone (85%-100%) starts well past the
                    square's mid-edge distance (~70.7% of that same radius),
                    so the owl -- which already sits with ~5% margin inside
                    this crop -- is never touched; only the empty cream
                    corners soften into the page background, taking the hard
                    rectangular edge off without a border/card/shadow. */}
                <img
                  src="/images/nutri-hero.png"
                  alt={ro ? "Nutri, personajul Diet4Life pentru copii" : "Nutri, the Diet4Life character for kids"}
                  className="w-full h-full object-cover"
                  style={{
                    maskImage: "radial-gradient(ellipse at center, black 85%, transparent 100%)",
                    WebkitMaskImage: "radial-gradient(ellipse at center, black 85%, transparent 100%)",
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* De ce am creat Nutri -- Nu cu / Ci cu contrast lightened from two
          bordered boxes to a plain muted list (left) vs. a single accent-
          bordered statement (right), same "subtle surface, not a card"
          direction as the rest of this pass. Section padding tightened
          again -- measured at 80px/64px into the next section, over the
          40-64/32-48px target -- to the page's shared tighter rhythm. */}
      <section className="py-5 md:py-7 bg-background">
        <div className={PAGE_COLUMN}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-[28px] md:text-4xl font-serif font-bold text-foreground text-center leading-tight md:leading-normal mb-8 text-balance">
              {ro ? "De ce am creat Nutri" : "Why I created Nutri"}
            </h2>
            <div className="text-base md:text-lg text-muted-foreground leading-relaxed space-y-4 mb-10">
              <p className="text-editorial">
                {ro
                  ? "Când am devenit mamă, am început să privesc alimentația copiilor și dintr-o perspectivă diferită."
                  : "When I became a mother, I started looking at children's nutrition from a different perspective too."}
              </p>
              <p className="text-editorial">
                {ro
                  ? "Ca dietetician, știam deja cât de importante sunt diversitatea alimentară, echilibrul și obiceiurile construite încă din copilărie. Dar odată cu diversificarea propriului copil, toate aceste lucruri au devenit mult mai concrete."
                  : "As a dietitian, I already knew how important food diversity, balance, and habits built in childhood are. But once my own child started on solid foods, all of this became much more concrete."}
              </p>
              <p className="text-editorial">
                {ro
                  ? "Am văzut câtă răbdare presupune uneori introducerea unui aliment nou. Un gust poate fi refuzat. O textură poate părea ciudată. Un aliment acceptat într-o zi poate fi respins în alta."
                  : "I saw how much patience introducing a new food sometimes takes. A taste can be refused. A texture can seem strange. A food accepted one day can be rejected the next."}
              </p>
              <p className="text-editorial">
                {ro
                  ? "Am început să observ și mai atent ceea ce se întâmplă în jur: părinți îngrijorați pentru că cei mici refuză legumele, copii reticenți la alimente noi și foarte multe mesaje despre ce „trebuie” sau „nu trebuie” să mănânce un copil."
                  : "I started noticing, even more closely, what happens around us: parents worried because their little ones refuse vegetables, children hesitant about new foods, and a lot of messages about what a child \"should\" or \"shouldn't\" eat."}
              </p>
              <p className="text-editorial">{ro ? "Și m-am gândit că educația nutrițională poate începe altfel." : "And I thought nutrition education could start differently."}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 mb-8 items-start">
              <ul className="space-y-3">
                {[
                  ro ? "Nu cu reguli rigide." : "Not with rigid rules.",
                  ro ? "Nu cu presiune." : "Not with pressure.",
                  ro ? "Nu cu ideea unei farfurii perfecte." : "Not with the idea of a perfect plate.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm md:text-base text-muted-foreground">
                    <X className="w-4 h-4 text-muted-foreground/60 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="border-l-2 border-primary pl-5">
                <p className="flex items-start gap-2.5 text-base md:text-lg font-semibold text-foreground">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  {ro
                    ? "Ci cu joacă, culoare, curiozitate și descoperire."
                    : "But with play, color, curiosity, and discovery."}
                </p>
              </div>
            </div>

            <p className="text-center font-serif font-bold text-foreground text-lg">
              {ro ? "Așa a apărut Nutri." : "That's how Nutri came to be."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Ce învață copiii alături de Nutri -- icon-circle + bordered cards
          replaced with plain editorial blocks (bare icon, no background,
          no border) so the grid reads as a list of ideas rather than a
          software feature grid. Section padding tightened again to match
          the shared tighter rhythm. */}
      <section className="py-5 md:py-7 bg-background">
        <div className={PAGE_COLUMN}>
          <h2 className="text-[28px] md:text-4xl font-serif font-bold text-foreground text-center leading-tight md:leading-normal mb-10 md:mb-12 text-balance">
            {ro ? "Ce învață copiii alături de Nutri" : "What kids learn alongside Nutri"}
          </h2>
          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {LEARN_CARDS.map((card, i) => (
              <motion.div
                key={card.titleRo}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
              >
                <card.icon className="w-7 h-7 text-primary mb-3" strokeWidth={1.75} />
                <h3 className="font-serif font-bold text-foreground text-lg mb-2">{ro ? card.titleRo : card.titleEn}</h3>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{ro ? card.textRo : card.textEn}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Filosofia Nutri -- the 4 question boxes lose their border/bg-card,
          now bare icon+text rows so the section reads lighter. Section
          padding tightened again to match the shared tighter rhythm. */}
      <section className="py-5 md:py-7 bg-background">
        <div className={PAGE_COLUMN}>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-[28px] md:text-4xl font-serif font-bold text-foreground leading-tight md:leading-normal mb-5 text-balance">
              {ro ? "Filosofia Nutri" : "Nutri's Philosophy"}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto mb-10">
              {ro
                ? "Nu vreau ca un copil să crească întrebându-se permanent dacă un aliment este „bun” sau „rău”."
                : "I don't want a child to grow up constantly wondering whether a food is \"good\" or \"bad\"."}
            </p>

            <div className="grid sm:grid-cols-2 gap-5 mb-12 text-left">
              {PHILOSOPHY_QUESTIONS.map((q) => (
                <div key={q.ro} className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="font-medium text-foreground text-base md:text-lg">{ro ? q.ro : q.en}</p>
                </div>
              ))}
            </div>

            <p className="text-2xl font-serif font-bold text-foreground mb-2">
              {ro ? "Alimentația echilibrată nu înseamnă perfecțiune." : "Balanced eating doesn't mean perfection."}
            </p>
            <p className="text-base md:text-lg text-muted-foreground">
              {ro
                ? "Înseamnă varietate, curiozitate, flexibilitate și învățare în timp."
                : "It means variety, curiosity, flexibility, and learning over time."}
            </p>
          </div>
        </div>
      </section>

      {/* Resurse Nutri -- same 4 items, same "În curând" status on the one
          not-yet-available title; still no price, no CTA, no link to
          /products -- these are not purchasable yet. Card treatment matches
          Services.tsx's own ServiceCard surface (border border-border
          bg-card/60) rather than the old solid bg-card + icon-circle combo,
          so this grid reads consistently with the rest of the premium
          visual system instead of as a separate, boxier style. Section
          padding tightened again to match the shared tighter rhythm. */}
      <section id="resurse-nutri" className="py-5 md:py-7 bg-background scroll-mt-20">
        <div className={PAGE_COLUMN}>
          <div className="max-w-5xl mx-auto">
            <h2 className="text-[28px] md:text-4xl font-serif font-bold text-foreground text-center leading-tight md:leading-normal mb-3 text-balance">
              {ro ? "Explorează lumea lui Nutri" : "Explore Nutri's world"}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground text-center max-w-xl mx-auto mb-12">
              {ro
                ? "Fiecare resursă Nutri are un scop simplu: să îi ajute pe copii să învețe ceva util despre mâncare în timp ce se joacă și explorează."
                : "Every Nutri resource has one simple goal: to help children learn something useful about food while they play and explore."}
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {NUTRI_PRODUCTS.map((product) => (
                <div key={product.titleRo} className="rounded-2xl border border-border bg-card/60 p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <product.icon className="w-7 h-7 text-primary" strokeWidth={1.75} />
                    {(ro ? product.badgeRo : product.badgeEn) && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                        {ro ? product.badgeRo : product.badgeEn}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-foreground text-lg">{ro ? product.titleRo : product.titleEn}</h3>
                  {(ro ? product.subtitleRo : product.subtitleEn) && (
                    <p className="text-xs font-medium text-primary uppercase tracking-wide mt-0.5 mb-2">
                      {ro ? product.subtitleRo : product.subtitleEn}
                    </p>
                  )}
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed mt-2 flex-1">
                    {ro ? product.descRo : product.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Și pentru părinți -- section padding tightened again to match the
          shared tighter rhythm. */}
      <section className="py-5 md:py-7 bg-background">
        <div className={PAGE_COLUMN}>
          <div className="max-w-2xl mx-auto text-center">
            <Users className="w-7 h-7 text-primary mx-auto mb-5" strokeWidth={1.75} />
            <h2 className="text-[28px] md:text-4xl font-serif font-bold text-foreground leading-tight md:leading-normal mb-6 text-balance">
              {ro ? "Și pentru părinți" : "And for parents too"}
            </h2>
            <div className="text-base md:text-lg text-muted-foreground leading-relaxed space-y-4 mb-8">
              <p>
                {ro
                  ? "Nutri este creat pentru copii, dar și pentru adulții care îi însoțesc."
                  : "Nutri is made for children, but also for the adults who accompany them."}
              </p>
              <p>
                {ro
                  ? "Pentru că mesele nu trebuie să devină permanent negocieri, teste sau surse de stres."
                  : "Because mealtimes shouldn't constantly become negotiations, tests, or a source of stress."}
              </p>
              <p>
                {ro
                  ? "Uneori este suficient să oferim copilului ocazia să observe, să exploreze și să învețe în ritmul lui."
                  : "Sometimes it's enough to give a child the chance to observe, explore, and learn at their own pace."}
              </p>
            </div>
            <NutriHighlight>
              {ro ? "Nu avem nevoie de copii care mănâncă perfect." : "We don't need children who eat perfectly."}
            </NutriHighlight>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mt-6 max-w-lg mx-auto">
              {ro
                ? "Avem nevoie să îi ajutăm să devină curioși, să înțeleagă mai bine mâncarea și să construiască, în timp, o relație sănătoasă cu ea."
                : "We need to help them become curious, understand food better, and build a healthy relationship with it over time."}
            </p>
          </div>
        </div>
      </section>

      {/* CTA final -- same scroll-to-resources behavior, button restyled to
          match the hand-built CTA pattern used on Home/Services (rounded
          corners, not a full pill; visible focus ring). Top padding
          tightened again to match the shared tighter rhythm; bottom keeps
          extra room as the page's own closing margin before the footer. */}
      <section className="pt-5 pb-14 md:pt-7 md:pb-16 bg-background">
        <div className={PAGE_COLUMN}>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-[28px] font-serif font-bold text-foreground mb-6 text-balance">
              {ro ? "Descoperă cărțile și activitățile Nutri" : "Discover Nutri's books and activities"}
            </h2>
            <button
              type="button"
              onClick={() => scrollToId("resurse-nutri")}
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-[13px] bg-primary hover:bg-primary/90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 text-primary-foreground font-semibold transition-all"
              data-testid="button-explore-nutri-resources"
            >
              {ro ? "Explorează resursele Nutri" : "Explore Nutri's resources"}
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-sm text-muted-foreground mt-5 tracking-wide">Learn • Explore • Understand • Choose</p>
          </div>
        </div>
      </section>
    </div>
  );
}
