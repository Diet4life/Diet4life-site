import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArticleShell, ArticleH2, ArticleP, ArticleCallout, ArticleList } from "@/components/nutrihub/ArticleShell";
import { PlateDiagram } from "@/components/nutrihub/PlateDiagram";

export default function NutritieEchilibrata() {
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
      category="NutriHub"
      title="Nutriție echilibrată: cum arată în viața reală?"
      subtitle="O alimentație echilibrată nu înseamnă să mănânci perfect, să cântărești fiecare aliment sau să renunți la pâine, paste ori desert. Înseamnă să îi oferi organismului, în mod constant, energia și nutrienții de care are nevoie, într-un mod suficient de flexibil încât să poată funcționa și în viața reală."
      readTime="4 min citire"
      updated="Actualizat: septembrie 2026"
      tldr="O alimentație echilibrată se construiește în timp, nu la o singură masă. Contează varietatea alimentelor, porțiile potrivite, prezența regulată a legumelor, proteinelor, surselor bune de carbohidrați și grăsimi, dar și libertatea de a include uneori un desert, o pizza sau mâncarea preferată fără sentimentul că ai «stricat dieta»."
      keyTakeaways={[
        "Nu trebuie ca fiecare masă să fie perfectă.",
        "Nu trebuie să elimini carbohidrații pentru a mânca sănătos.",
        "Calitatea alimentelor contează, dar contează și cantitatea.",
        "Varietatea este mai importantă decât obsesia pentru câteva „superalimente”.",
        "O alimentație pe care nu o poți susține în viața reală nu este, în practică, o soluție bună pe termen lung.",
      ]}
      faq={[
        {
          q: "Trebuie să mănânc trei mese și două gustări pe zi?",
          a: "Nu există o structură universală. Unele persoane se simt bine cu trei mese, altele au nevoie și de una sau două gustări. Programul trebuie adaptat foamei, stilului de viață și nevoilor individuale.",
        },
        {
          q: "Trebuie să elimin complet zahărul?",
          a: "Nu. Este mai util să limitezi consumul frecvent de produse foarte bogate în zaharuri libere decât să urmărești eliminarea absolută a zahărului din alimentație.",
        },
        {
          q: "Fructele se pot mânca seara?",
          a: "Da. Nu există o regulă generală conform căreia fructele consumate seara ar favoriza automat creșterea în greutate.",
        },
        {
          q: "Trebuie să cântăresc alimentele?",
          a: "Nu neapărat. Pentru multe persoane, structura farfuriei și reperele vizuale sunt suficiente. Cântărirea poate fi utilă temporar în anumite situații, dar nu este obligatorie pentru o alimentație echilibrată.",
        },
        {
          q: "Am nevoie de suplimente dacă mănânc echilibrat?",
          a: "Nu automat. Suplimentele au indicații specifice și nu înlocuiesc o alimentație variată. Necesitatea lor depinde de alimentație, vârstă, anumite perioade fiziologice, analize și starea de sănătate.",
        },
      ]}
      related={[
        { label: "Controlul greutății: de ce nu este doar despre a mânca mai puțin", href: "/nutrihub/controlul-greutatii" },
        { label: "Câtă proteină am nevoie?", href: "/nutrihub/cata-proteina-am-nevoie" },
        { label: "Fibrele alimentare: cât ai nevoie și de ce nu trebuie să exagerezi", href: "/nutrihub/fibrele-alimentare" },
        { label: "Câte calorii am nevoie, de fapt?", href: "/nutrihub/cate-calorii-am-nevoie" },
        { label: "Sunt toate caloriile la fel?" },
      ]}
      sources="Articol bazat pe recomandări și principii actuale privind alimentația sănătoasă formulate de Organizația Mondială a Sănătății și pe modele internaționale de educație nutrițională. Sursele științifice complete pot fi consultate în secțiunea dedicată referințelor."
    >
      <section>
        <ArticleH2>Ce înseamnă, de fapt, „echilibrat”?</ArticleH2>
        <ArticleP>
          Organizația Mondială a Sănătății descrie alimentația sănătoasă prin patru principii importante.
        </ArticleP>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <ArticleCallout>
            <strong className="text-foreground">Adecvare</strong> — să primești suficientă energie și suficienți nutrienți pentru nevoile organismului.
          </ArticleCallout>
          <ArticleCallout>
            <strong className="text-foreground">Echilibru</strong> — cantitatea de energie consumată și structura alimentației trebuie să fie potrivite nevoilor tale.
          </ArticleCallout>
          <ArticleCallout>
            <strong className="text-foreground">Moderație</strong> — unele alimente sunt mai potrivite în cantități mai mici și mai rar, fără să fie nevoie să le transformăm în alimente „interzise”.
          </ArticleCallout>
          <ArticleCallout>
            <strong className="text-foreground">Diversitate</strong> — niciun aliment nu oferă tot ce are nevoie organismul. Varietatea contează.
          </ArticleCallout>
        </div>
        <ArticleP>
          Cu alte cuvinte, alimentația sănătoasă nu este construită în jurul unei liste de interdicții.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Cum arată o masă echilibrată?</ArticleH2>
        <ArticleP>
          Un reper vizual simplu poate fi mai util decât calculele complicate — Farfuria Diet4Life, pentru multe mese principale:
        </ArticleP>
        <PlateDiagram />
        <ArticleP>
          <strong className="text-foreground">Este un reper, nu o formulă.</strong> Nu trebuie ca fiecare masă să arate identic și nu este nevoie să măsori farfuria cu rigla. Cantitățile se adaptează vârstei, nivelului de activitate, obiectivului, preferințelor și stării de sănătate. Pentru copii, sarcină sau anumite afecțiuni, recomandările pot necesita adaptare individuală.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Cum știu dacă alimentația mea este suficient de echilibrată?</ArticleH2>
        <ArticleP>În loc să urmărești perfecțiunea, poți verifica câteva lucruri simple:</ArticleP>
        <ArticleList
          items={[
            "Apar legume în mod regulat la mesele principale?",
            "Consumi fructe și alimente bogate în fibre?",
            "Ai surse variate de proteină?",
            "Incluzi și leguminoase sau cereale integrale?",
            "Bei apă în mod regulat?",
            "Alimentele tale diferă de la o zi la alta și de la o săptămână la alta?",
            "Poți mânca uneori ceva doar pentru plăcere fără să simți că trebuie să „compensezi” ulterior?",
          ]}
        />
        <ArticleP>
          Dacă răspunsul este în general „da”, ești probabil mai aproape de o alimentație echilibrată decât crezi.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Trebuie să renunț la carbohidrați?</ArticleH2>
        <ArticleP>
          Nu. Carbohidrații fac parte dintr-o alimentație normală și reprezintă o sursă importantă de energie. Importantă este mai ales calitatea surselor și cantitatea.
        </ArticleP>
        <ArticleP>În mod obișnuit, merită să alegem mai des:</ArticleP>
        <ArticleList items={["Ovăz și alte cereale integrale", "Pâine integrală", "Orez", "Cartofi", "Fasole", "Linte", "Năut", "Fructe", "Legume"]} />
        <ArticleP>
          Asta nu înseamnă că o porție de pâine albă, paste obișnuite sau un desert transformă automat masa într-una „nesănătoasă”. Alimentația trebuie privită în ansamblu.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Dar pizza, desertul sau mâncarea tradițională?</ArticleH2>
        <ArticleP>
          Au loc într-o alimentație echilibrată. Mâncarea nu are doar rol nutritiv — face parte și din viața socială, tradiții, familie și plăcerea de a mânca.
        </ArticleP>
        <ArticleP>
          O pizza într-o seară nu anulează toate mesele echilibrate din restul săptămânii. La fel, un desert nu trebuie urmat de post, antrenamente suplimentare sau vinovăție.
        </ArticleP>
        <ArticleP>
          Contează mai ales frecvența, cantitatea și ceea ce faci în mod obișnuit. O alimentație bună trebuie să fie suficient de flexibilă încât să poată exista și în concediu, la restaurant, la o masă în familie sau într-o zi foarte aglomerată.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Cum arată în viața reală?</ArticleH2>
        <ArticleP>O masă echilibrată nu trebuie să fie sofisticată. Poate însemna:</ArticleP>
        <ArticleList
          items={[
            "Omletă + roșii și ardei + pâine",
            "Pește + cartof copt + salată",
            "Tocăniță de pui + mămăligă + salată de varză",
            "Fasole scăzută + salată + o felie de pâine",
            "Paste cu ton și legume",
            "Ciorbă cu carne și legume + pâine",
          ]}
        />
        <ArticleP>
          Ingredientele nu trebuie să fie întotdeauna separate pe farfurie. Ciorbele, tocănițele, pastele sau mâncărurile la cuptor pot conține aceleași componente într-un singur preparat.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>„Sănătos” nu înseamnă „în orice cantitate”</ArticleH2>
        <ArticleP>
          Este o diferență importantă. Uleiul de măsline, nucile, semințele, avocado sau untul de arahide pot fi alegeri nutritive, dar sunt și alimente cu densitate energetică mare.
        </ArticleP>
        <ArticleP>
          Asta nu înseamnă să le eviți, ci doar să îți amintești că valoarea nutrițională și cantitatea sunt două lucruri diferite — un aspect cu atât mai important atunci când obiectivul este și controlul greutății.
        </ArticleP>
      </section>
    </ArticleShell>
  );
}
