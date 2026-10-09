import { Link } from "wouter";
import { Scale, Compass, RotateCcw, ArrowRight, Utensils, HeartPulse, Footprints, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArticleH2, ArticleP, ArticleLead, ArticleQuote } from "@/components/nutrihub/ArticleShell";
import { ArticleShellPremium } from "@/components/nutrihub/ArticleShellPremium";

// ─── "Mai mult decât un număr pe cântar" (was "Dincolo de cifră") +
// "Semne de progres care nu apar pe cântar" (was "Ce mai merită urmărit?")
// -- pilot visual modules, this article only (never touch
// ArticleShellPremium.tsx, never add these to the other 5 articles). Both
// titles were renamed off the reference mockup's own wording, per explicit
// instruction -- grounded instead in this article's own repeated phrase
// "cifra de pe cântar" (sec-5/sec-6). Every item's caption is a short
// paraphrase of a sentence that already exists in this exact article's body
// below -- see the mapping table presented to the user before this round's
// implementation. No new facts, numbers, or claims. Visual recipe is
// WeightFactorsGrid.tsx's own (unused elsewhere): bg-card border-border
// tile + bg-primary/10 icon circle -- zero new tokens. Romanian-only, same
// as every other string in this file (this page early-returns for any
// other language, see below -- no English copy exists for this article).
const BEYOND_THE_NUMBER = [
  {
    icon: Scale,
    label: "Cifra",
    note: "Greutatea de pe cântar nu reflectă doar țesutul adipos — poate varia temporar din alte motive.",
  },
  {
    icon: Compass,
    label: "Contextul",
    note: "Contează și ce ți-a fost greu, programul tău și barierele reale din viața de zi cu zi.",
  },
  {
    icon: RotateCcw,
    label: "Interpretarea",
    note: "Un platou nu înseamnă că ai greșit — înseamnă că situația trebuie reevaluată în ansamblu.",
  },
  {
    icon: ArrowRight,
    label: "Pasul următor",
    note: "De la structura meselor până la organizare și recunoașterea foamei — pașii diferă de la persoană la persoană.",
  },
];

const WHAT_ELSE_MATTERS = [
  {
    icon: Utensils,
    label: "Comportamente alimentare",
    note: "Cum alegi, organizezi și te raportezi la mese, nu doar ce mănânci.",
  },
  {
    icon: HeartPulse,
    label: "Sănătate",
    note: "Starea generală de sănătate, nu doar cifra de pe cântar.",
  },
  {
    icon: Footprints,
    label: "Funcționalitate",
    note: "Cât de bine te simți și funcționezi în activitățile zilnice.",
  },
  {
    icon: Sparkles,
    label: "Calitatea vieții",
    note: "Cum influențează schimbările viața ta de zi cu zi, pe termen lung.",
  },
];

export default function ControlulGreutatii() {
  const { language } = useLanguage();

  if (language !== "ro") {
    return (
      <div className="min-h-screen bg-background py-24">
        <div className="container mx-auto px-4 max-w-xl text-center">
          <h1 className="text-2xl font-serif font-bold text-foreground mb-4">
            This article is currently available in Romanian only.
          </h1>
          <Link href="/nutrihub" className="text-primary underline underline-offset-2">
            Back to NutriHub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ArticleShellPremium
      category="CONTROLUL GREUTĂȚII"
      title="Controlul greutății: de ce nu se reduce la „mănâncă mai puțin”"
      related={[
        { label: "Nutriție echilibrată: cum arată în viața reală?", href: "/nutrihub/nutritie-echilibrata" },
        { label: "De ce este importantă proteina și de câtă avem nevoie?", href: "/nutrihub/cata-proteina-am-nevoie" },
        { label: "Câte calorii am nevoie, de fapt?", href: "/nutrihub/cate-calorii-am-nevoie" },
        { label: "Fibrele alimentare: de ce sunt importante", href: "/nutrihub/fibrele-alimentare" },
        { label: "Sunt toate caloriile la fel?", href: "/nutrihub/sunt-toate-caloriile-la-fel" },
      ]}
      sources={[
        "World Health Organization. Obesity and overweight. WHO, actualizare 2025.",
        "Wharton S, Lau DCW, Vallis M, et al. Obesity in adults: a clinical practice guideline. CMAJ. 2020;192:E875-E891. Canadian Adult Obesity Clinical Practice Guidelines.",
        "Obesity Canada. Medical Nutrition Therapy in Obesity Management. Canadian Adult Obesity Clinical Practice Guidelines; actualizare 2022.",
        "Busetto L, et al. EASO. A new framework for the diagnosis, staging and management of obesity in adults. Nature Medicine. 2024.",
        "Nunes CL, Casanova N, Francisco R, et al. Does adaptive thermogenesis occur after weight loss in adults? A systematic review. British Journal of Nutrition. 2022;127:451-469. DOI: 10.1017/S0007114521001094.",
        "van Baak MA, Mariman ECM. Obesity-induced and weight-loss-induced physiological factors affecting weight regain. Nature Reviews Endocrinology. 2023;19:655-670. DOI: 10.1038/s41574-023-00887-4.",
      ]}
    >
      {/* Editorial hero image -- real sourced photo (licensed Adobe Stock,
          saved locally), replacing the earlier gray placeholder. Neutral
          composition: notebook, pencil, measuring tape, fresh vegetables --
          no scale, no person, no displayed numbers/weight. Eager-loaded
          since it's the first large visual element on this page. */}
      <img
        src="/images/nutrihub/controlul-greutatii-jurnal-centimetru.webp"
        alt="Jurnal alimentar deschis, un centimetru și legume proaspete pe o masă de lemn"
        width={1600}
        height={900}
        className="w-full aspect-[16/9] object-cover rounded-2xl border border-border"
        loading="eager"
        decoding="async"
      />

      <section id="sec-0">
        <ArticleP>
          Poate ai auzit de multe ori recomandarea: „mănâncă mai puțin și mișcă-te mai mult”. Din punct de vedere
          energetic, pentru ca greutatea să scadă este nevoie ca, în timp, aportul de energie să fie mai mic decât
          energia consumată de organism.
        </ArticleP>
        <ArticleP>Dar asta nu înseamnă că procesul este simplu.</ArticleP>
        <ArticleP>
          Organizația Mondială a Sănătății descrie obezitatea ca pe o boală cronică și recidivantă, care apare prin
          interacțiunea mai multor factori: biologici, genetici, comportamentali, psihosociali și de mediu.
        </ArticleP>
        <ArticleP>
          Cu alte cuvinte, balanța energetică este importantă, dar nu explică singură de ce o persoană ajunge să ia
          în greutate, de ce îi este greu să slăbească sau de ce greutatea poate reveni.
        </ArticleP>
      </section>

      {/* Module "Mai mult decât un număr pe cântar" (was "Dincolo de
          cifră") -- repositioned here, after the intro paragraphs (sec-0)
          and before sec-1, to match the mockup's real structural order
          (image -> paragraphs -> module), per explicit instruction. Every
          caption paraphrases a sentence that already exists further down in
          this same article (sec-2, sec-5, sec-6). See the mapping shown
          before implementation. */}
      <div>
        <h2 className="font-serif font-bold text-foreground text-xl md:text-2xl mb-4">
          Mai mult decât un număr pe cântar
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {BEYOND_THE_NUMBER.map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-card p-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2.5">
                <item.icon className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-foreground leading-snug">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">{item.note}</p>
            </div>
          ))}
        </div>
      </div>

      <section id="sec-1">
        <ArticleH2>Deficitul energetic contează, dar nu spune toată povestea</ArticleH2>
        <ArticleP>Pentru scădere ponderală este nevoie de un deficit energetic. Asta rămâne valabil.</ArticleP>
        <ArticleP>
          Problema apare atunci când de aici concluzionăm că, dacă cineva nu slăbește, înseamnă pur și simplu că
          „mănâncă prea mult” sau că „nu are suficientă voință”.
        </ArticleP>
        <ArticleP>În viața reală, nu mâncăm doar pentru că ne este foame.</ArticleP>
        <ArticleP>
          Uneori alegem diferit când suntem obosiți, stresați, grăbiți, când avem un program haotic, când nu am mâncat
          suficient în prima parte a zilei sau când anumite alimente sunt pur și simplu cele mai la îndemână.
        </ArticleP>
        <ArticleP>De aceea, controlul greutății nu poate fi redus la un calcul de calorii.</ArticleP>
      </section>

      <section id="sec-2">
        <ArticleH2>Nu este suficient să știm ce mănânci</ArticleH2>
        <ArticleP>
          Un jurnal alimentar ne poate arăta ce și cât mănâncă o persoană. Dar uneori întrebarea mai importantă este:
        </ArticleP>
        <ArticleQuote>De ce ai ales acel aliment în acel moment?</ArticleQuote>
        <ArticleP>
          Poți avea un plan alimentar foarte bine făcut și totuși să îți fie greu să îl urmezi. Nu pentru că „nu ai
          voință”, ci pentru că viața reală nu arată ca un tabel.
        </ArticleP>
        <ArticleP>
          Pot exista zile aglomerate, mese luate pe fugă, perioade de oboseală, stres, foame mai mare, lipsă de
          organizare sau situații în care alegerile alimentare devin pur și simplu mai dificile.
        </ArticleP>
        <ArticleP>
          Ghidurile canadiene pentru managementul obezității recomandă tocmai de aceea o evaluare care să caute
          cauzele creșterii în greutate, barierele reale și contextul de viață al persoanei, nu doar să noteze
          greutatea și alimentele consumate.
        </ArticleP>
        <ArticleP>
          De aceea, într-o consultație nu este suficient să întrebăm doar „ce ai mâncat?”. Este important să
          înțelegem și ce ți-a fost greu, cât de foame îți era, cum arată programul tău și ce schimbări pot fi
          menținute realist.
        </ArticleP>
      </section>

      <section id="sec-3">
        <ArticleH2>Nu există o singură dietă potrivită tuturor</ArticleH2>
        <ArticleP>
          Poate ai încercat în trecut mai multe variante: o dietă foarte strictă, o perioadă fără pâine, fără
          dulciuri, fără cină sau un plan pe care l-ai urmat câteva săptămâni și apoi l-ai abandonat.
        </ArticleP>
        <ArticleP>
          Faptul că un anumit model alimentar funcționează pentru o persoană nu înseamnă că este cea mai bună soluție
          pentru toată lumea.
        </ArticleP>
        <ArticleP>
          Obesity Canada subliniază că nu există un singur model alimentar universal pentru managementul obezității.
          Recomandările ar trebui adaptate preferințelor, obiectivelor, contextului social și posibilității de a fi
          menținute pe termen lung.
        </ArticleP>
        <ArticleP>
          O intervenție care funcționează doar două săptămâni, dar nu poate fi integrată în viața de zi cu zi, are o
          utilitate limitată pe termen lung.
        </ArticleP>
      </section>

      <section id="sec-4">
        <ArticleH2>Contează și cum sunt construite mesele</ArticleH2>
        <ArticleP>Două mese cu același volum pot avea valori energetice foarte diferite.</ArticleP>
        <ArticleP>
          Alimentele cu densitate energetică mai mică pot permite un volum alimentar mai mare la un aport caloric mai
          redus. În practică, asta poate face ca o alimentație pentru controlul greutății să fie mai ușor de urmat
          decât una construită doar în jurul ideii de „porții cât mai mici”.
        </ArticleP>
        <ArticleP>
          De aceea contează structura mesei: prezența legumelor, a fructelor întregi, a surselor de proteină, a
          fibrelor și modul în care sunt alese și combinate alimentele.
        </ArticleP>
        <ArticleP>Scopul nu este să ajungem să mâncăm cât mai puțin.</ArticleP>
        <ArticleP>
          Scopul este să construim mese care oferă nutrienții necesari, contribuie la sațietate și pot fi menținute
          în viața reală.
        </ArticleP>
        <ArticleLead>Somnul și stresul fac și ele parte din context</ArticleLead>
        <ArticleP>
          Poate ai observat că după o noapte cu puțin somn îți este mai greu să îți organizezi mesele sau simți că
          alegi mai des alimente foarte palatabile.
        </ArticleP>
        <ArticleP>Sau poate există perioade în care stresul schimbă modul în care mănânci.</ArticleP>
        <ArticleP>
          Asta nu înseamnă că „stresul îngrașă” sau că dacă dormi mai mult vei slăbi automat.
        </ArticleP>
        <ArticleP>
          Înseamnă doar că alimentația nu există separat de restul vieții. Somnul, stresul și programul zilnic pot
          influența comportamentele alimentare și capacitatea de a menține anumite schimbări.
        </ArticleP>
        <ArticleP>
          De aceea, merită luate în calcul atunci când încercăm să înțelegem de ce un plan funcționează într-o
          perioadă și devine greu de urmat în alta.
        </ArticleP>
      </section>

      <section id="sec-5">
        <ArticleH2>De ce apare uneori un platou?</ArticleH2>
        <ArticleP>
          Poate ai trecut deja prin asta: la început greutatea scade, apoi, deși simți că faci aceleași lucruri,
          cântarul pare că se oprește.
        </ArticleP>
        <ArticleP>Asta nu înseamnă automat că „ți s-a blocat metabolismul”.</ArticleP>
        <ArticleP>
          Pe măsură ce greutatea scade, un corp mai mic are nevoie de mai puțină energie. La unele persoane poate
          apărea și o adaptare metabolică suplimentară, însă cercetările arată că amploarea acesteia este variabilă
          și nu explică singură toate platourile ponderale.
        </ArticleP>
        <ArticleP>
          În plus, greutatea de pe cântar nu reflectă doar țesutul adipos. Apa din organism, conținutul intestinal și
          alte variații normale pot modifica temporar cifra pe care o vezi.
        </ArticleP>
        <ArticleP>Un platou nu înseamnă automat că ai făcut ceva greșit. Înseamnă că situația trebuie reevaluată în ansamblu.</ArticleP>
      </section>

      <section id="sec-6">
        <ArticleH2>Slăbitul și menținerea nu sunt același lucru</ArticleH2>
        <ArticleP>Pentru multe persoane, partea cea mai dificilă nu este doar să piardă în greutate, ci să mențină rezultatul.</ArticleP>
        <ArticleP>
          După scăderea ponderală pot apărea modificări ale mecanismelor implicate în foame, sațietate și consum
          energetic, iar acestea pot favoriza recâștigul ponderal. Literatura actuală descrie recâștigul după slăbire
          ca pe un fenomen frecvent și cu o componentă fiziologică reală.
        </ArticleP>
        <ArticleP>Asta nu înseamnă că greutatea va reveni inevitabil.</ArticleP>
        <ArticleP>
          Înseamnă că menținerea trebuie privită ca o etapă în sine, care poate necesita monitorizare, ajustări și
          strategii diferite față de perioada de scădere.
        </ArticleP>
        <ArticleP>De aceea, obezitatea nu este o problemă care se rezolvă neapărat printr-o dietă de câteva săptămâni.</ArticleP>
        <ArticleLead>Ce înseamnă o abordare care poate funcționa în viața reală?</ArticleLead>
        <ArticleP>Înseamnă să nu pornim doar de la întrebarea:</ArticleP>
        <ArticleQuote>„Ce ar trebui să mănânci?”</ArticleQuote>
        <ArticleP>Ci și de la:</ArticleP>
        <ArticleQuote>„Ce te împiedică să faci asta în mod constant?”</ArticleQuote>
        <ArticleP>
          Poate fi nevoie să lucrăm la structura meselor. Alteori la organizare, recunoașterea foamei și sațietății,
          gestionarea situațiilor în care apar alegeri dificile sau găsirea unor variante alimentare pe care persoana
          chiar le poate menține.
        </ArticleP>
        <ArticleP>
          Obesity Canada recomandă o relație colaborativă cu pacientul și obiective adaptate valorilor, preferințelor
          și realității lui, nu doar urmărirea unei greutăți „ideale”.
        </ArticleP>
        <ArticleP>
          Succesul nu ar trebui măsurat doar prin cifra de pe cântar. Contează și îmbunătățirea comportamentelor
          alimentare, a sănătății, a funcționalității și a calității vieții.
        </ArticleP>
        <ArticleP>Pentru a slăbi, balanța energetică contează. Dar controlul greutății nu se reduce la „mănâncă mai puțin”.</ArticleP>
        <ArticleP>
          Este important să știm ce mănânci, dar și de ce apar anumite alegeri, când îți este mai greu, cum
          influențează viața de zi cu zi alimentația și ce schimbări poți menține pe termen lung.
        </ArticleP>
        <ArticleLead>
          Un plan alimentar îți poate spune ce să mănânci. O intervenție nutrițională bine construită trebuie să
          înțeleagă și persoana care îl va urma.
        </ArticleLead>
      </section>

      {/* Module "Semne de progres care nu apar pe cântar" (was "Ce mai
          merită urmărit?") -- the 4 items are the exact 4 concepts named in
          the article's own closing line above ("comportamentelor
          alimentare, a sănătății, a funcționalității și a calității
          vieții"), not invented. */}
      <div>
        <h2 className="font-serif font-bold text-foreground text-xl md:text-2xl mb-4">
          Semne de progres care nu apar pe cântar
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {WHAT_ELSE_MATTERS.map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-card p-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2.5">
                <item.icon className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-foreground leading-snug">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">{item.note}</p>
            </div>
          ))}
        </div>
      </div>
    </ArticleShellPremium>
  );
}
