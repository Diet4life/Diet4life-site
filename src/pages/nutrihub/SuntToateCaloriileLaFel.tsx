import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArticleShell, ArticleH2, ArticleP } from "@/components/nutrihub/ArticleShell";

export default function SuntToateCaloriileLaFel() {
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
      category="ENERGIE ȘI ALEGERI ALIMENTARE"
      title="Sunt toate caloriile la fel?"
      related={[
        { label: "Nutriție echilibrată: cum arată în viața reală?", href: "/nutrihub/nutritie-echilibrata" },
        { label: "Controlul greutății: de ce nu se reduce la „mănâncă mai puțin”", href: "/nutrihub/controlul-greutatii" },
        { label: "De ce este importantă proteina și de câtă avem nevoie?", href: "/nutrihub/cata-proteina-am-nevoie" },
        { label: "Câte calorii am nevoie, de fapt?", href: "/nutrihub/cate-calorii-am-nevoie" },
        { label: "Fibrele alimentare: de ce sunt importante", href: "/nutrihub/fibrele-alimentare" },
      ]}
      sources={[
        "World Health Organization & Food and Agriculture Organization of the United Nations. What are healthy diets? Joint statement by FAO and WHO. 2024.",
        "World Health Organization. Carbohydrate intake for adults and children: WHO guideline. 2023.",
        "Obesity Canada. Canadian Adult Obesity Clinical Practice Guidelines – Medical Nutrition Therapy in Obesity Management. Updated 2022.",
        "Hall KD, Ayuketah A, Brychta R, et al. Ultra-Processed Diets Cause Excess Calorie Intake and Weight Gain: An Inpatient Randomized Controlled Trial of Ad Libitum Food Intake. Cell Metab. 2019;30(1):67-77.e3. DOI: 10.1016/j.cmet.2019.05.008.",
        "Kohanmoo A, Faghih S, Akhlaghi M. Effect of short- and long-term protein consumption on appetite and appetite-regulating gastrointestinal hormones: a systematic review and meta-analysis of randomized controlled trials. Physiol Behav. 2020;226:113123. DOI: 10.1016/j.physbeh.2020.113123.",
      ]}
    >
      <section>
        <ArticleP>Două alimente pot avea aceeași valoare energetică și totuși să arate complet diferit în farfurie.</ArticleP>
        <ArticleP>Unul poate însemna doar câteva înghițituri. Celălalt poate ocupa aproape toată farfuria.</ArticleP>
        <ArticleP>Ca unitate de energie, o calorie rămâne o calorie. Dar alimentul din care provine acea energie contează.</ArticleP>
        <ArticleP>Valoarea calorică nu îți spune singură cât de mare este porția, cât de sățios va fi alimentul sau ce nutrienți îți oferă.</ArticleP>
      </section>

      <section>
        <ArticleH2>O calorie măsoară energia. Nu întreaga valoare a alimentului.</ArticleH2>
        <ArticleP>
          Pentru controlul greutății, aportul energetic este important. Dacă obiectivul este slăbirea, este nevoie
          de un aport compatibil cu acest obiectiv.
        </ArticleP>
        <ArticleP>Dar o alimentație nu se construiește doar dintr-un total de calorii.</ArticleP>
        <ArticleP>
          WHO și FAO descriu o alimentație sănătoasă prin patru principii: adecvare, echilibru, moderație și
          diversitate. Cu alte cuvinte, contează atât energia, cât și calitatea alimentelor din care o obținem.
        </ArticleP>
        <ArticleP>
          De aceea, două zile cu același total caloric pot fi foarte diferite din punct de vedere nutrițional și
          foarte diferite ca experiență pentru pacient.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Diferența se vede adesea direct în farfurie</ArticleH2>
        <ArticleP>
          Unele alimente concentrează multă energie într-o cantitate mică. Altele conțin mai multă apă, fibre sau au
          un volum mai mare și permit construirea unei mese mai consistente pentru o cantitate comparabilă de
          energie.
        </ArticleP>
        <ArticleP>Acest concept se numește densitate energetică.</ArticleP>
        <ArticleP>
          Nu este nevoie să o calculezi. Este suficient să observi că aceeași energie poate ocupa foarte puțin
          spațiu sau poate însemna o farfurie mult mai generoasă.
        </ArticleP>
        <ArticleP>
          Pentru o persoană care încearcă să slăbească, asta poate face diferența dintre o alimentație greu de
          tolerat și una care poate fi menținută mai ușor.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>O masă bună ar trebui să îți ofere sațietate</ArticleH2>
        <ArticleP>Nu contează doar cât ai mâncat, ci și cât de sătul te simți după masă.</ArticleP>
        <ArticleP>Compoziția mesei contează: proteina, fibrele, volumul și structura alimentelor pot influența senzația de sațietate.</ArticleP>
        <ArticleP>
          De aceea, o masă bine construită nu urmărește doar să se încadreze într-un anumit număr de calorii, ci și
          să te ajute să ajungi mai confortabil până la următoarea masă.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Unele alimente sunt foarte ușor de consumat în exces</ArticleH2>
        <ArticleP>
          Un studiu realizat la NIH a comparat, în condiții controlate, o alimentație bogată în produse
          ultraprocesate cu una bazată pe alimente neprocesate sau minim procesate.
        </ArticleP>
        <ArticleP>
          Diferența devine mai ușor de înțeles dacă ne uităm la mesele oferite. În varianta ultraprocesată, un mic
          dejun putea include bagel cu cremă de brânză și bacon de curcan, iar un prânz putea conține sandviș cu
          carne procesată și brânză, chipsuri și o băutură. În alte zile, meniul includea produse precum pâine albă,
          cereale procesate, deserturi ambalate și băuturi îndulcite.
        </ArticleP>
        <ArticleP>
          În varianta neprocesată sau minim procesată, mesele includeau, de exemplu, terci de ovăz cu banană, nuci și
          lapte, iar la prânz carne de vită, orz, broccoli, salată și felii de măr.
        </ArticleP>
        <ArticleP>
          Participanții puteau mânca atât cât doreau. În perioada cu dieta ultraprocesată au consumat, în medie, cu
          aproximativ 500 kcal pe zi mai mult, au mâncat mai repede și au crescut în greutate; în perioada cu dieta
          neprocesată, aportul energetic a fost mai mic, iar greutatea a scăzut. Studiul nu demonstrează că fiecare
          produs ultraprocesat, luat separat, provoacă automat creștere în greutate. Arată însă că, în acel context
          controlat, tipul alimentelor oferite a influențat cât au ales participanții să mănânce.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Și alimentele nutritive au calorii</ArticleH2>
        <ArticleP>Există și extrema opusă: ideea că, dacă un aliment este considerat sănătos, cantitatea nu mai contează.</ArticleP>
        <ArticleP>
          Nucile, semințele, avocado sau uleiul de măsline pot face parte foarte bine dintr-o alimentație
          echilibrată, dar au și o densitate energetică ridicată.
        </ArticleP>
        <ArticleP>Dacă obiectivul este scăderea în greutate, porția rămâne importantă.</ArticleP>
        <ArticleP>Nu trebuie să alegem între „contează doar caloriile” și „caloriile nu contează”. Ambele variante simplifică prea mult lucrurile.</ArticleP>
      </section>

      <section>
        <ArticleH2>Ce contează, de fapt</ArticleH2>
        <ArticleP>Pentru greutate, energia totală contează.</ArticleP>
        <ArticleP>Pentru calitatea alimentației și pentru cât de ușor o poți menține, contează și sursa acelei energii.</ArticleP>
        <ArticleP>O alimentație bine construită urmărește să ofere suficienți nutrienți, să permită mese satisfăcătoare și să poată fi adaptată vieții reale.</ArticleP>
        <ArticleP>
          Obesity Canada recomandă tocmai o abordare individualizată, sigură, nutritiv adecvată și compatibilă cu
          preferințele și obiectivele persoanei.
        </ArticleP>
        <ArticleP>Caloriile îți spun câtă energie conține alimentul. Nu îți spun întreaga lui poveste.</ArticleP>
      </section>
    </ArticleShell>
  );
}
