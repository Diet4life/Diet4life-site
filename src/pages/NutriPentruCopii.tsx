import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Link } from "wouter";
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

function NutriHighlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-5 py-2.5 text-sm font-medium text-primary">
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
    <div className="bg-amber-50/60">
      {/* Hero */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 text-balance">
              {ro ? "Nutri pentru copii" : "Nutri for Kids"}
            </h1>
            <p className="text-xl text-primary font-medium mb-6">
              {ro ? "Educația nutrițională poate începe prin joacă." : "Nutrition education can start through play."}
            </p>
            <div className="text-muted-foreground leading-relaxed text-lg space-y-4 mb-8 max-w-2xl mx-auto">
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
        </div>
      </section>

      {/* De ce am creat Nutri */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl font-serif font-bold text-foreground text-center mb-8">
              {ro ? "De ce am creat Nutri" : "Why I created Nutri"}
            </h2>
            <div className="text-muted-foreground leading-relaxed space-y-4 mb-10">
              <p>
                {ro
                  ? "Când am devenit mamă, am început să privesc alimentația copiilor și dintr-o perspectivă diferită."
                  : "When I became a mother, I started looking at children's nutrition from a different perspective too."}
              </p>
              <p>
                {ro
                  ? "Ca dietetician, știam deja cât de importante sunt diversitatea alimentară, echilibrul și obiceiurile construite încă din copilărie. Dar odată cu diversificarea propriului copil, toate aceste lucruri au devenit mult mai concrete."
                  : "As a dietitian, I already knew how important food diversity, balance, and habits built in childhood are. But once my own child started on solid foods, all of this became much more concrete."}
              </p>
              <p>
                {ro
                  ? "Am văzut câtă răbdare presupune uneori introducerea unui aliment nou. Un gust poate fi refuzat. O textură poate părea ciudată. Un aliment acceptat într-o zi poate fi respins în alta."
                  : "I saw how much patience introducing a new food sometimes takes. A taste can be refused. A texture can seem strange. A food accepted one day can be rejected the next."}
              </p>
              <p>
                {ro
                  ? "Am început să observ și mai atent ceea ce se întâmplă în jur: părinți îngrijorați pentru că cei mici refuză legumele, copii reticenți la alimente noi și foarte multe mesaje despre ce „trebuie” sau „nu trebuie” să mănânce un copil."
                  : "I started noticing, even more closely, what happens around us: parents worried because their little ones refuse vegetables, children hesitant about new foods, and a lot of messages about what a child \"should\" or \"shouldn't\" eat."}
              </p>
              <p>{ro ? "Și m-am gândit că educația nutrițională poate începe altfel." : "And I thought nutrition education could start differently."}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              <div className="rounded-2xl border border-border bg-card p-6">
                <ul className="space-y-3">
                  {[
                    ro ? "Nu cu reguli rigide." : "Not with rigid rules.",
                    ro ? "Nu cu presiune." : "Not with pressure.",
                    ro ? "Nu cu ideea unei farfurii perfecte." : "Not with the idea of a perfect plate.",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <X className="w-4 h-4 text-muted-foreground/60 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 flex items-center">
                <div className="flex items-start gap-2.5 text-sm font-medium text-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  {ro
                    ? "Ci cu joacă, culoare, curiozitate și descoperire."
                    : "But with play, color, curiosity, and discovery."}
                </div>
              </div>
            </div>

            <p className="text-center font-serif font-bold text-foreground text-lg">
              {ro ? "Așa a apărut Nutri." : "That's how Nutri came to be."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Ce învață copiii alături de Nutri */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-serif font-bold text-foreground text-center mb-12">
            {ro ? "Ce învață copiii alături de Nutri" : "What kids learn alongside Nutri"}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LEARN_CARDS.map((card, i) => (
              <motion.div
                key={card.titleRo}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl bg-card border border-border p-6"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <card.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif font-bold text-foreground text-lg mb-2">{ro ? card.titleRo : card.titleEn}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{ro ? card.textRo : card.textEn}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Filosofia Nutri */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-serif font-bold text-foreground mb-6">{ro ? "Filosofia Nutri" : "Nutri's Philosophy"}</h2>
          <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto mb-10">
            {ro
              ? "Nu vreau ca un copil să crească întrebându-se permanent dacă un aliment este „bun” sau „rău”."
              : "I don't want a child to grow up constantly wondering whether a food is \"good\" or \"bad\"."}
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-12 text-left">
            {PHILOSOPHY_QUESTIONS.map((q) => (
              <div key={q.ro} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
                <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="font-medium text-foreground">{ro ? q.ro : q.en}</p>
              </div>
            ))}
          </div>

          <p className="text-2xl font-serif font-bold text-foreground mb-2">
            {ro ? "Alimentația echilibrată nu înseamnă perfecțiune." : "Balanced eating doesn't mean perfection."}
          </p>
          <p className="text-muted-foreground">
            {ro
              ? "Înseamnă varietate, curiozitate, flexibilitate și învățare în timp."
              : "It means variety, curiosity, flexibility, and learning over time."}
          </p>
        </div>
      </section>

      {/* Produse */}
      <section id="resurse-nutri" className="py-16 md:py-20 scroll-mt-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-3xl font-serif font-bold text-foreground text-center mb-3">
            {ro ? "Explorează lumea lui Nutri" : "Explore Nutri's world"}
          </h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-12">
            {ro
              ? "Fiecare resursă Nutri are un scop simplu: să îi ajute pe copii să învețe ceva util despre mâncare în timp ce se joacă și explorează."
              : "Every Nutri resource has one simple goal: to help children learn something useful about food while they play and explore."}
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {NUTRI_PRODUCTS.map((product) => (
              <div key={product.titleRo} className="rounded-2xl bg-card border border-border p-6 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <product.icon className="w-6 h-6 text-primary" />
                  </div>
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
                <p className="text-sm text-muted-foreground leading-relaxed mt-2 flex-1">
                  {ro ? product.descRo : product.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Și pentru părinți */}
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-foreground mb-6">{ro ? "Și pentru părinți" : "And for parents too"}</h2>
          <div className="text-muted-foreground leading-relaxed space-y-4 mb-8">
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
          <p className="text-muted-foreground leading-relaxed mt-6 max-w-lg mx-auto">
            {ro
              ? "Avem nevoie să îi ajutăm să devină curioși, să înțeleagă mai bine mâncarea și să construiască, în timp, o relație sănătoasă cu ea."
              : "We need to help them become curious, understand food better, and build a healthy relationship with it over time."}
          </p>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-6">
            {ro ? "Descoperă cărțile și activitățile Nutri" : "Discover Nutri's books and activities"}
          </h2>
          <button
            type="button"
            onClick={() => scrollToId("resurse-nutri")}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 active:scale-[0.97] text-primary-foreground font-medium px-8 h-12 transition-all"
            data-testid="button-explore-nutri-resources"
          >
            {ro ? "Explorează resursele Nutri" : "Explore Nutri's resources"}
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-sm text-muted-foreground mt-5 tracking-wide">Learn • Explore • Understand • Choose</p>
        </div>
      </section>
    </div>
  );
}
