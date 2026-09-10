import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArticleShell, ArticleH2, ArticleP, ArticleCallout, ArticleList } from "@/components/nutrihub/ArticleShell";

export default function CataProteinaAmNevoie() {
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
      title="Câtă proteină am nevoie, de fapt?"
      subtitle="0,8 g/kg corp/zi este reperul pe care îl vezi cel mai des online. Este corect pentru o persoană sănătoasă, sedentară — dar nu este reperul potrivit pentru toată lumea."
      readTime="4 min citire"
      updated="Actualizat: septembrie 2026"
      tldr="Pentru un adult sănătos, reperul general este de aproximativ 0,83 g proteină/kg corp/zi (EFSA). Persoanele de peste 65 de ani, cele active fizic sau care fac antrenamente de forță au, de regulă, nevoie de mai mult. Nu există un singur număr valabil pentru toată lumea, iar «tot mai multă proteină» nu este automat mai bine."
      keyTakeaways={[
        "Reperul EFSA pentru adulți sănătoși este de aproximativ 0,83 g proteină/kg corp/zi.",
        "Persoanele de peste 65 de ani au, de regulă, nevoie de mai multă proteină — aproximativ 1,0–1,2 g/kg corp/zi.",
        "Activitatea fizică, mai ales antrenamentele de forță, crește necesarul peste reperul general.",
        "O alimentație variată, cu surse animale și vegetale, acoperă de obicei necesarul fără suplimente.",
        "Cantități foarte mari de proteină, peste nevoia reală, nu aduc automat mai mult mușchi sau mai multă sănătate.",
      ]}
      faq={[
        {
          q: "Proteina vegetală este la fel de bună ca cea animală?",
          a: "Poate acoperi necesarul foarte bine, cu condiția ca sursele să fie variate (leguminoase, cereale integrale, semințe, soia) pe parcursul zilei, astfel încât să fie acoperit spectrul de aminoacizi esențiali.",
        },
        {
          q: "Trebuie să mănânc proteină imediat după antrenament?",
          a: "Fereastra strictă de „30 de minute” este exagerată în literatura recentă. Contează mai ales cantitatea totală de proteină din zi și distribuția ei rezonabilă pe mese, nu un moment exact după efort.",
        },
        {
          q: "Prea multă proteină îmi afectează rinichii?",
          a: "La persoane sănătoase, fără afecțiuni renale preexistente, aporturile ridicate de proteină nu au fost asociate cu afectare renală. La persoanele cu boală renală cronică, necesarul de proteină trebuie stabilit individual, cu un specialist.",
        },
        {
          q: "Am nevoie de pudră proteică?",
          a: "Nu, dacă alimentația acoperă deja necesarul. Pudra proteică este o formă convenabilă de a completa aportul atunci când este greu de atins doar din alimente, nu un ingredient obligatoriu.",
        },
        {
          q: "Copiii au nevoie de mai multă proteină decât adulții, raportat la kg corp?",
          a: "Da, în perioadele de creștere necesarul raportat la kilogram este mai mare decât la adult, dar în cifre absolute rămâne, de regulă, ușor de acoperit dintr-o alimentație variată. Nevoile exacte se stabilesc individual.",
        },
      ]}
      related={[
        { label: "Nutriție echilibrată: cum arată în viața reală?", href: "/nutrihub/nutritie-echilibrata" },
        { label: "Controlul greutății: de ce nu este doar despre a mânca mai puțin", href: "/nutrihub/controlul-greutatii" },
        { label: "Fibrele alimentare: cât ai nevoie și de ce nu trebuie să exagerezi", href: "/nutrihub/fibrele-alimentare" },
        { label: "Câte calorii am nevoie, de fapt?", href: "/nutrihub/cate-calorii-am-nevoie" },
        { label: "Sunt toate caloriile la fel?" },
        { label: "Ce este platoul ponderal?" },
      ]}
      sources="Reperele de proteină folosite în acest articol respectă recomandările EFSA (European Food Safety Authority) pentru populația adultă sănătoasă și pe cele ale ESPEN (European Society for Clinical Nutrition and Metabolism) pentru adulții de peste 65 de ani — aceleași valori folosite de calculatorul „De cât am nevoie?” de pe acest site."
    >
      <section>
        <ArticleH2>De unde vine reperul de 0,8 g/kg?</ArticleH2>
        <ArticleP>
          Cifra pe care o vezi cel mai des — 0,8 g proteină pe kilogram corp, pe zi — este reperul stabilit de organisme precum EFSA pentru un adult sănătos, sedentar. Pe acest site folosim reperul EFSA de 0,83 g/kg corp/zi, aceeași valoare folosită și de calculatorul „De cât am nevoie?”.
        </ArticleP>
        <ArticleP>
          Este cantitatea minimă care acoperă nevoile majorității adulților sănătoși, nu un plafon ideal pentru toată lumea. Pentru anumite grupuri, necesarul real este mai mare.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Cine are nevoie, de regulă, de mai multă proteină?</ArticleH2>
        <ArticleList
          items={[
            "Persoanele de peste 65 de ani — reperul folosit pe acest site este de 1,0–1,2 g/kg corp/zi (ESPEN), pentru a ajuta la menținerea masei musculare odată cu înaintarea în vârstă.",
            "Persoanele active fizic, mai ales cele care fac antrenamente de forță — necesarul poate depăși reperul general al adultului sedentar.",
            "Persoanele aflate în recuperare după anumite intervenții medicale sau afecțiuni — necesarul se stabilește individual, împreună cu un specialist.",
            "Femeile însărcinate sau care alăptează — necesarul crește față de perioada anterioară sarcinii, tot printr-o evaluare individuală.",
          ]}
        />
        <ArticleCallout>
          Aceste repere sunt puncte de plecare, nu prescripții exacte. Necesarul individual depinde de greutate, compoziție corporală, nivel de activitate, stare de sănătate și obiective — de aceea o evaluare individuală rămâne cea mai sigură cale spre un răspuns precis.
        </ArticleCallout>
      </section>

      <section>
        <ArticleH2>„Mai multă proteină” nu înseamnă automat „mai bine”</ArticleH2>
        <ArticleP>
          Proteina a devenit un subiect popular pe rețelele sociale, iar mesajul frecvent este că mai mult este mereu mai bine — pentru sațietate, mușchi sau slăbit. Realitatea este mai nuanțată.
        </ArticleP>
        <ArticleP>
          Odată ce necesarul este acoperit, un aport suplimentar de proteină nu produce automat mai mult mușchi — creșterea musculară depinde și de stimulul de antrenament, nu doar de aportul alimentar. Iar proteina în exces aduce, ca orice aliment, calorii — care contează la fel ca și cele din carbohidrați sau grăsimi pentru echilibrul energetic.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Surse bune de proteină</ArticleH2>
        <ArticleP>O alimentație variată acoperă, de regulă, necesarul fără suplimente:</ArticleP>
        <ArticleList
          items={[
            "Carne, pește și ouă",
            "Lactate — iaurt, brânzeturi, lapte",
            "Leguminoase — fasole, linte, năut, soia",
            "Cereale integrale",
            "Nuci și semințe",
          ]}
        />
        <ArticleP>
          Pentru alimentația bazată predominant pe surse vegetale, varietatea contează mai mult decât în cazul dietelor cu surse animale — combinarea mai multor tipuri de leguminoase, cereale și semințe pe parcursul zilei ajută la acoperirea spectrului complet de aminoacizi esențiali.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Cum aplic asta practic?</ArticleH2>
        <ArticleP>
          Nu este nevoie să cântărești fiecare masă și să calculezi grame de proteină la fiecare aliment. Este suficient să urmărești, în general, ca fiecare masă principală să conțină o sursă de proteină — carne, pește, ouă, lactate sau o combinație de leguminoase și cereale.
        </ArticleP>
        <ArticleP>
          Pentru un calcul personalizat al necesarului tău de proteină, pornind de la vârstă, greutate și nivel de activitate, poți folosi{" "}
          <Link href="/calculator" className="text-primary underline underline-offset-2">
            calculatorul „De cât am nevoie?”
          </Link>{" "}
          de pe acest site.
        </ArticleP>
      </section>
    </ArticleShell>
  );
}
