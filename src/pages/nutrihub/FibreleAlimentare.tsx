import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArticleShell, ArticleH2, ArticleP, ArticleCallout, ArticleList } from "@/components/nutrihub/ArticleShell";

export default function FibreleAlimentare() {
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
    <ArticleShell
      category="Macronutrienți"
      title="Fibrele alimentare: cât ai nevoie și de ce nu trebuie să exagerezi"
      subtitle="Fibrele au ajuns un subiect popular pe rețelele sociale, sub eticheta „fibermaxxing”. Reperul recomandat rămâne, însă, mult mai simplu decât sugerează trendul — și crescut brusc, poate face mai mult rău decât bine."
      readTime="4 min citire"
      updated="Actualizat: septembrie 2026"
      tldr="Reperul recomandat este de cel puțin 25 g fibre pe zi (OMS/EFSA), din surse variate — cereale integrale, leguminoase, fructe și legume. Fibrele susțin digestia, senzația de sațietate și sănătatea metabolică, dar o creștere bruscă și foarte mare a aportului, fără hidratare suficientă, poate produce balonare și disconfort digestiv, nu beneficii suplimentare."
      keyTakeaways={[
        "Reperul recomandat este de minimum 25 g fibre/zi (OMS/EFSA).",
        "Sursele variate contează mai mult decât un singur aliment „bogat în fibre”.",
        "O creștere bruscă a aportului de fibre poate cauza balonare, gaze și disconfort.",
        "Fibrele au nevoie de apă suficientă pentru a-și face treaba corect în tranzitul intestinal.",
        "Mai multe fibre nu înseamnă automat „mai sănătos” — există un prag dincolo de care apar doar disconfort și, la cantități foarte mari, o absorbție redusă a unor minerale.",
      ]}
      faq={[
        {
          q: "Ce este „fibermaxxing”?",
          a: "Un trend apărut pe rețelele sociale care încurajează un aport foarte mare de fibre, uneori de câteva ori peste reperul recomandat. Nu este susținut de dovezi ca fiind necesar sau sigur pentru toată lumea, mai ales dacă aportul crește brusc.",
        },
        {
          q: "De ce mă balonez când mănânc mai multe fibre?",
          a: "De obicei pentru că aportul a crescut prea brusc, fără o hidratare suficientă. Fibrele fermentează parțial în colon, iar o creștere rapidă poate produce temporar gaze și balonare, mai ales dacă intestinul nu era obișnuit cu cantitatea respectivă.",
        },
        {
          q: "Fibrele solubile și cele insolubile sunt diferite?",
          a: "Da. Fibrele solubile (ovăz, mere, leguminoase) formează un gel care încetinește digestia și poate ajuta la controlul glicemiei și al colesterolului. Fibrele insolubile (tărâțe, coajă de legume, cereale integrale) adaugă volum scaunului și susțin tranzitul. Ambele tipuri sunt utile — de aceea variația surselor contează.",
        },
        {
          q: "Suplimentele de fibre înlocuiesc fibrele din alimente?",
          a: "Pot ajuta temporar la acoperirea unui deficit, dar nu oferă și celelalte beneficii ale alimentelor bogate în fibre — vitamine, minerale, antioxidanți și varietate. Alimentele întregi rămân sursa preferată.",
        },
        {
          q: "Cum îmi cresc aportul de fibre fără disconfort?",
          a: "Treptat, pe parcursul mai multor săptămâni, nu dintr-o dată — și cu suficientă apă. O creștere graduală permite florei intestinale să se adapteze.",
        },
      ]}
      related={[
        { label: "Nutriție echilibrată: cum arată în viața reală?", href: "/nutrihub/nutritie-echilibrata" },
        { label: "Controlul greutății: de ce nu este doar despre a mânca mai puțin", href: "/nutrihub/controlul-greutatii" },
        { label: "Câtă proteină am nevoie?", href: "/nutrihub/cata-proteina-am-nevoie" },
        { label: "Câte calorii am nevoie, de fapt?", href: "/nutrihub/cate-calorii-am-nevoie" },
        { label: "Sunt toate caloriile la fel?" },
        { label: "Produsele pentru slăbit: ce se întâmplă după ce nu le mai folosești?" },
      ]}
      sources="Reperul de minimum 25 g fibre/zi folosit în acest articol respectă recomandările Organizației Mondiale a Sănătății și ale EFSA — aceeași valoare folosită de calculatorul „De cât am nevoie?” de pe acest site."
    >
      <section>
        <ArticleH2>Cât de multe fibre ai nevoie, de fapt?</ArticleH2>
        <ArticleP>
          Reperul folosit pe acest site, aliniat cu recomandările OMS și EFSA, este de minimum 25 g fibre pe zi pentru un adult. Este o cantitate accesibilă printr-o alimentație variată — nu presupune alimente exotice sau suplimente.
        </ArticleP>
        <ArticleP>
          Majoritatea oamenilor consumă, în realitate, mai puțin decât acest reper — nu pentru că fibrele ar fi greu de obținut, ci pentru că alimentația de zi cu zi conține adesea prea puține cereale integrale, leguminoase, fructe și legume.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>De ce contează fibrele</ArticleH2>
        <ArticleList
          items={[
            "Susțin un tranzit intestinal regulat.",
            "Contribuie la senzația de sațietate după masă.",
            "Pot ajuta la controlul glicemiei postprandiale, mai ales fibrele solubile.",
            "Susțin sănătatea microbiotei intestinale — multe fibre servesc drept „hrană” pentru bacteriile benefice din colon.",
            "Sunt asociate, în populații cu un aport constant adecvat, cu un risc cardiovascular mai mic.",
          ]}
        />
      </section>

      <section>
        <ArticleH2>„Fibermaxxing”: de ce mai mult nu înseamnă automat mai bine</ArticleH2>
        <ArticleP>
          Pe rețelele sociale a apărut un trend care încurajează un aport foarte mare de fibre — uneori de câteva ori peste reperul recomandat, adesea din suplimente sau alimente ultra-procesate „bogate în fibre”, adăugate rapid în alimentație.
        </ArticleP>
        <ArticleP>Problema nu este că fibrele ar fi dăunătoare, ci modul brusc și excesiv în care sunt introduse:</ArticleP>
        <ArticleList
          items={[
            "O creștere bruscă a aportului poate produce balonare, gaze și disconfort abdominal.",
            "Fără suficientă apă, fibrele își pierd o parte din eficiență și pot agrava, nu ameliora, tranzitul.",
            "La cantități foarte mari, susținute pe termen lung, fibrele pot reduce absorbția anumitor minerale (de exemplu fier, zinc, calciu).",
          ]}
        />
        <ArticleCallout>
          Obiectivul nu este „cât mai multe fibre posibil”, ci un aport constant, suficient și confortabil pentru sistemul digestiv — de obicei în jurul reperului de 25 g/zi, ajustat individual.
        </ArticleCallout>
      </section>

      <section>
        <ArticleH2>Surse bune de fibre</ArticleH2>
        <ArticleP>Varietatea contează mai mult decât un singur aliment „minune”:</ArticleP>
        <ArticleList
          items={[
            "Cereale integrale — ovăz, orez brun, pâine integrală",
            "Leguminoase — fasole, linte, năut",
            "Fructe, cu coajă acolo unde este comestibilă",
            "Legume, cât mai variate ca tip și culoare",
            "Nuci și semințe",
          ]}
        />
      </section>

      <section>
        <ArticleH2>Cum crești aportul fără disconfort</ArticleH2>
        <ArticleList
          items={[
            "Crește aportul treptat, pe parcursul câtorva săptămâni, nu dintr-o dată.",
            "Bea suficientă apă pe parcursul zilei — fibrele au nevoie de lichid pentru a funcționa corect.",
            "Distribuie sursele de fibre pe parcursul zilei, nu doar la o singură masă.",
            "Preferă alimentele întregi în locul suplimentelor, ca sursă principală.",
          ]}
        />
        <ArticleP>
          Dacă ai o afecțiune digestivă diagnosticată (de exemplu sindrom de colon iritabil), reperele generale pot necesita ajustare individuală — discută cu un specialist înainte de a crește semnificativ aportul de fibre.
        </ArticleP>
      </section>
    </ArticleShell>
  );
}
