import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArticleShell, ArticleH2, ArticleP, ArticleCallout, ArticleList } from "@/components/nutrihub/ArticleShell";

export default function CateCaloriiAmNevoie() {
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
      category="Controlul greutății"
      title="Câte calorii am nevoie, de fapt?"
      subtitle="Nu există un singur număr «magic» valabil pentru toată lumea. Necesarul caloric este o estimare, construită din mai mulți factori, nu o cifră exactă și fixă pe viață."
      readTime="4 min citire"
      updated="Actualizat: septembrie 2026"
      tldr="Necesarul caloric zilnic este suma dintre energia de care organismul are nevoie în repaus (REE) și energia consumată prin activitate. Formulele și calculatoarele oferă o estimare bună, nu o cifră exactă — și necesarul se modifică odată cu greutatea, vârsta și nivelul de activitate. De aceea rezultatul unui calculator este un punct de plecare, nu un verdict."
      keyTakeaways={[
        "Necesarul caloric = energia de repaus (REE) × un factor de activitate (PAL).",
        "Formulele (ex. Mifflin–St Jeor) oferă o estimare, nu o măsurătoare exactă.",
        "Necesarul diferă de la persoană la persoană, chiar la aceeași vârstă, greutate și înălțime.",
        "Necesarul se modifică în timp — odată cu greutatea, vârsta, activitatea și alți factori.",
        "Un calculator online este un punct de plecare util, nu o cifră fixă de urmat rigid.",
      ]}
      faq={[
        {
          q: "De ce îmi dau două calculatoare diferite rezultate diferite?",
          a: "Pentru că folosesc formule sau constante ușor diferite (Mifflin–St Jeor, Harris-Benedict, factori de activitate diferiți). Diferențele de câteva sute de kcal între calculatoare sunt normale — niciunul nu îți măsoară direct metabolismul.",
        },
        {
          q: "Ce este PAL?",
          a: "Physical Activity Level — un factor prin care se înmulțește energia de repaus (REE) pentru a estima consumul zilnic total (TEE), în funcție de cât de activă este persoana pe parcursul zilei, nu doar la sport.",
        },
        {
          q: "Dacă mănânc exact necesarul calculat, rămân la aceeași greutate?",
          a: "Aproximativ, dar cifra este o estimare. Greutatea poate fluctua din alte motive (apă, digestie, ciclu menstrual) și necesarul real poate diferi ușor de estimarea formulei. Tendința pe termen lung contează mai mult decât o singură cifră.",
        },
        {
          q: "Necesarul caloric scade dacă slăbesc?",
          a: "Da — o masă corporală mai mică are, de regulă, nevoie de mai puțină energie pentru a fi susținută. De aceea necesarul recalculat periodic este mai util decât o cifră fixă calculată o singură dată.",
        },
        {
          q: "Este necesarul caloric același lucru cu «cât ar trebui să mănânc ca să slăbesc»?",
          a: "Nu. Necesarul caloric estimează cât consumă organismul într-o zi obișnuită. Un obiectiv de slăbit presupune, în plus, o discuție despre un deficit sustenabil — nu doar cifra de întreținere.",
        },
      ]}
      related={[
        { label: "Controlul greutății: de ce nu este doar despre a mânca mai puțin", href: "/nutrihub/controlul-greutatii" },
        { label: "Câtă proteină am nevoie?", href: "/nutrihub/cata-proteina-am-nevoie" },
        { label: "Nutriție echilibrată: cum arată în viața reală?", href: "/nutrihub/nutritie-echilibrata" },
        { label: "Sunt toate caloriile la fel?" },
        { label: "De ce nu slăbesc deși mănânc puțin?" },
        { label: "Ce este platoul ponderal?" },
      ]}
      sources="Articol documentat pe baza formulei Mifflin–St Jeor pentru estimarea energiei de repaus (REE) și a factorilor de activitate fizică (PAL) definiți de EFSA — aceleași formule și constante folosite de calculatorul „De cât am nevoie?” de pe acest site."
    >
      <section>
        <ArticleH2>Din ce este format necesarul caloric?</ArticleH2>
        <ArticleP>
          Necesarul caloric zilinic (TEE — total energy expenditure) este format din energia pe care organismul o consumă în repaus (REE — resting energy expenditure, adică energia necesară pentru funcțiile de bază: respirație, circulație, menținerea temperaturii corpului) și energia consumată prin activitate fizică și mișcarea zilnică.
        </ArticleP>
        <ArticleP>
          REE se estimează, de obicei, printr-o formulă precum Mifflin–St Jeor, pornind de la greutate, înălțime, vârstă și sex. Rezultatul se înmulțește apoi cu un factor de activitate (PAL — Physical Activity Level), care variază de la sedentar la foarte activ.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>De ce nu este o cifră exactă</ArticleH2>
        <ArticleP>
          Formulele precum Mifflin–St Jeor sunt construite pe baza unor medii statistice, nu pe o măsurătoare directă a metabolismului tău. Două persoane cu aceeași vârstă, greutate, înălțime și nivel de activitate pot avea, în realitate, necesaruri ușor diferite.
        </ArticleP>
        <ArticleP>De aceea rezultatul unui calculator (inclusiv al celui de pe acest site) este cel mai bine folosit ca:</ArticleP>
        <ArticleList
          items={[
            "un punct de plecare rezonabil, nu o cifră absolută;",
            "un reper care se recalculează periodic, nu o valoare fixă pe termen nelimitat;",
            "un instrument de orientare, nu un înlocuitor al unei evaluări individuale atunci când există un obiectiv medical specific.",
          ]}
        />
      </section>

      <section>
        <ArticleH2>Ce înseamnă, în practică, factorul de activitate (PAL)?</ArticleH2>
        <ArticleP>PAL nu se referă doar la sport — include mișcarea din întreaga zi:</ArticleP>
        <ArticleList
          items={[
            "Sedentar — muncă predominant așezată, mișcare puțină în timpul liber.",
            "Activitate moderată — muncă cu mișcare ocazională sau exerciții regulate, de câteva ori pe săptămână.",
            "Activ — muncă fizică sau exerciții frecvente, intense.",
            "Foarte activ — muncă fizică solicitantă combinată cu antrenamente frecvente.",
          ]}
        />
        <ArticleCallout>
          Multe persoane își supraestimează nivelul de activitate. Dacă nu ești sigur unde te încadrezi, calculatorul „De cât am nevoie?” de pe acest site include un ghid scurt pentru alegerea nivelului potrivit.
        </ArticleCallout>
      </section>

      <section>
        <ArticleH2>De ce se schimbă necesarul în timp</ArticleH2>
        <ArticleP>
          Necesarul caloric nu este o cifră fixă pe viață. Se modifică odată cu greutatea corporală (o masă corporală mai mică necesită, de regulă, mai puțină energie pentru a fi susținută), cu vârsta, cu nivelul de activitate și cu alte schimbări de sănătate sau stil de viață.
        </ArticleP>
        <ArticleP>
          De aceea, mai degrabă decât să te bazezi pe o singură cifră calculată cu ani în urmă, este util să recalculezi periodic necesarul, mai ales dacă greutatea sau nivelul de activitate s-au schimbat semnificativ.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Cum aflu necesarul meu?</ArticleH2>
        <ArticleP>
          Poți folosi{" "}
          <Link href="/calculator" className="text-primary underline underline-offset-2">
            calculatorul „De cât am nevoie?”
          </Link>{" "}
          de pe acest site, care estimează, pe lângă necesarul caloric, și proteina, carbohidrații, grăsimile, fibrele și apa recomandate — fără scor de tip „bine/rău” și fără o țintă unică impusă.
        </ArticleP>
        <ArticleP>
          Dacă ai o afecțiune medicală, ești însărcinată, alăptezi sau te afli într-o situație care necesită prudență, cea mai sigură cale este o evaluare individuală, nu doar un calculator online.
        </ArticleP>
      </section>
    </ArticleShell>
  );
}
