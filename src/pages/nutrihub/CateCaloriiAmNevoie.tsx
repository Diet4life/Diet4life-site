import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArticleShell, ArticleH2, ArticleP, ArticleLead } from "@/components/nutrihub/ArticleShell";

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
      category="ENERGIE ȘI NECESAR CALORIC"
      title="Câte calorii am nevoie, de fapt?"
      related={[
        { label: "Nutriție echilibrată: cum arată în viața reală?", href: "/nutrihub/nutritie-echilibrata" },
        { label: "Controlul greutății: de ce nu se reduce la „mănâncă mai puțin”", href: "/nutrihub/controlul-greutatii" },
        { label: "De ce este importantă proteina și de câtă avem nevoie?", href: "/nutrihub/cata-proteina-am-nevoie" },
        { label: "Fibrele alimentare: de ce sunt importante", href: "/nutrihub/fibrele-alimentare" },
        { label: "Sunt toate caloriile la fel?", href: "/nutrihub/sunt-toate-caloriile-la-fel" },
      ]}
      sources={[
        "EFSA Panel on Dietetic Products, Nutrition and Allergies (NDA). Scientific Opinion on Dietary Reference Values for energy. EFSA Journal. 2013;11(1):3005. DOI: 10.2903/j.efsa.2013.3005.",
        "Mifflin MD, St Jeor ST, Hill LA, Scott BJ, Daugherty SA, Koh YO. A new predictive equation for resting energy expenditure in healthy individuals. American Journal of Clinical Nutrition. 1990;51(2):241-247. DOI: 10.1093/ajcn/51.2.241.",
        "Madden AM, Mulrooney HM, Shah S. Estimation of energy expenditure using prediction equations in overweight and obese adults: a systematic review. Journal of Human Nutrition and Dietetics. 2016;29(4):458-476. DOI: 10.1111/jhn.12355.",
        "National Institute for Health and Care Excellence (NICE). Overweight and obesity management (NG246): Physical activity and diet. 2025.",
        "Obesity Canada. Canadian Adult Obesity Clinical Practice Guidelines - Medical Nutrition Therapy in Obesity Management.",
        "Liddle RA, Goldstein RB, Saxton J. Gallstone formation during weight-reduction dieting. Archives of Internal Medicine. 1989;149(8):1750-1753.",
      ]}
    >
      <section>
        <ArticleP>
          Poate ai căutat măcar o dată pe internet „câte calorii trebuie să mănânc ca să slăbesc?” și ai primit un
          număr foarte precis.
        </ArticleP>
        <ArticleP>
          Problema este că organismul nu funcționează după o formulă perfectă. Necesarul energetic poate fi estimat,
          dar un calculator online nu poate măsura exact câte calorii consumă corpul tău într-o zi. Vârsta, sexul,
          greutatea, înălțimea și nivelul de activitate pot fi introduse într-o ecuație, însă rezultatul rămâne un
          punct de plecare, nu o prescripție exactă.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Pentru ce folosim energia?</ArticleH2>
        <ArticleP>Organismul consumă energie permanent, inclusiv atunci când dormim sau stăm nemișcați.</ArticleP>
        <ArticleP>
          O parte importantă din energia zilnică este folosită pentru funcțiile de bază ale organismului:
          respirație, circulație, menținerea temperaturii corpului și funcționarea organelor. Aceasta este ceea ce
          numim cheltuială energetică de repaus.
        </ArticleP>
        <ArticleP>
          La aceasta se adaugă energia utilizată pentru activitatea fizică și activitățile obișnuite ale zilei.
          Împreună formează cheltuiala energetică totală zilnică. De aceea, două persoane cu aceeași greutate nu au
          automat același necesar caloric.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Cum estimează un calculator necesarul caloric?</ArticleH2>
        <ArticleP>
          Calculatorul estimează mai întâi energia de care organismul are nevoie în repaus, folosind date precum
          vârsta, sexul, greutatea și înălțimea. Apoi ajustează această valoare în funcție de nivelul de activitate
          fizică pentru a aproxima necesarul energetic total.
        </ArticleP>
        <ArticleP>
          Rezultatul este o estimare, nu o măsurătoare exactă. Chiar și formulele bine studiate pot avea o marjă de
          eroare importantă atunci când sunt aplicate unei persoane individuale.
        </ArticleP>
        <ArticleP>
          De aceea, dacă un calculator afișează o anumită valoare, nu înseamnă că organismul consumă exact acel
          număr de calorii în fiecare zi.
        </ArticleP>
        <ArticleLead>Ce rol are activitatea fizică?</ArticleLead>
        <ArticleP>
          Necesarul energetic total depinde și de cât ne mișcăm. Ghidurile folosesc niveluri de activitate fizică
          pentru a aproxima diferența dintre un stil de viață mai sedentar și unul mai activ.
        </ArticleP>
        <ArticleP>
          Totuși, și această parte rămâne o aproximare. Două persoane care aleg aceeași categorie de activitate pot
          avea zile foarte diferite: una poate lucra la birou și să facă câteva antrenamente pe săptămână, iar alta
          poate avea un loc de muncă foarte activ și să meargă mult pe jos.
        </ArticleP>
        <ArticleP>
          De aceea, nivelul de activitate introdus într-un calculator trebuie privit ca o estimare, nu ca o
          măsurătoare exactă a consumului energetic.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Menținere, slăbire sau creștere în greutate?</ArticleH2>
        <ArticleP>
          În principiu, dacă aportul energetic este apropiat de energia pe care organismul o consumă, greutatea
          tinde să se mențină.
        </ArticleP>
        <ArticleP>
          Pentru scădere ponderală este necesar, în timp, un deficit energetic. Pentru creștere ponderală este
          necesar, în general, ca aportul energetic să fie mai mare decât consumul.
        </ArticleP>
        <ArticleP>
          Dar asta nu înseamnă că tuturor trebuie să li se scadă automat aceeași cantitate de calorii din valoarea
          estimată de calculator. Ghidurile actuale recomandă individualizarea intervenției în funcție de persoană,
          starea de sănătate, preferințe și posibilitatea de a menține strategia pe termen lung.
        </ArticleP>
        <ArticleP>De aceea, rezultatul unui calculator trebuie privit ca un aport orientativ, nu ca o prescripție exactă.</ArticleP>
      </section>

      <section>
        <ArticleH2>De ce nu înseamnă „mai puține calorii = rezultate mai bune”?</ArticleH2>
        <ArticleP>
          Este tentant să credem că, dacă un deficit energetic poate duce la scădere în greutate, atunci un aport
          caloric foarte mic va produce automat rezultate mai bune. Dar nu aceasta este logica unei intervenții
          nutriționale bine construite.
        </ArticleP>
        <ArticleP>
          Cu cât aportul alimentar devine mai restrictiv, cu atât poate fi mai dificil să fie asigurate suficiente
          proteine, vitamine, minerale, acizi grași esențiali și ceilalți nutrienți de care organismul are nevoie.
        </ArticleP>
        <ArticleP>
          În timpul unei scăderi rapide în greutate nu se pierde exclusiv țesut adipos; poate fi pierdută și masă
          slabă. De aceea, calitatea alimentației și aportul adecvat de nutrienți devin cu atât mai importante cu cât
          restricția energetică este mai mare.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Dar dietele de 800–1.200 kcal?</ArticleH2>
        <ArticleP>
          NICE clasifică aporturile de 800–1.200 kcal/zi drept low-energy diets, iar pe cele sub 800 kcal/zi drept
          very-low-energy diets.
        </ArticleP>
        <ArticleP>
          Aceste intervenții sunt rezervate unor contexte bine stabilite și ar trebui realizate în cadrul unor
          programe cu evaluare, suport și monitorizare. Ghidurile recomandă ca ele să fie complete nutrițional și să
          nu fie utilizate ca strategie obișnuită pe termen lung.
        </ArticleP>
        <ArticleP>
          Cu cât aportul energetic este mai redus, cu atât devine mai dificil să fie asigurate suficiente proteine,
          vitamine, minerale, acizi grași esențiali și ceilalți nutrienți necesari. În timpul unei scăderi rapide în
          greutate poate fi pierdută și masă slabă, nu doar țesut adipos.
        </ArticleP>
        <ArticleP>Scăderea rapidă în greutate poate fi asociată și cu un risc mai mare de formare a calculilor biliari.</ArticleP>
        <ArticleP>
          În cazul unor rezultate foarte reduse, calculatorul nu ar trebui să ofere automat o recomandare fără
          evaluarea contextului individual. Un prag folosit de un instrument digital este o măsură de siguranță, nu
          o limită fiziologică universală.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>De ce trebuie uneori recalculat necesarul?</ArticleH2>
        <ArticleP>
          Necesarul energetic nu rămâne neapărat identic în timp. Dacă greutatea corporală se modifică semnificativ,
          se poate modifica și cheltuiala energetică. Același lucru este valabil dacă nivelul de activitate se
          schimbă.
        </ArticleP>
        <ArticleP>
          De aceea, un aport calculat la începutul unui proces nu trebuie privit ca o cifră fixă pentru următoarele
          luni sau ani. Valoarea estimată se compară cu ceea ce se întâmplă în realitate: evoluția greutății,
          aportul alimentar, senzația de foame și sațietate, activitatea și posibilitatea de a menține intervenția.
        </ArticleP>
        <ArticleLead>Atunci la ce este bun un calculator de calorii?</ArticleLead>
        <ArticleP>
          Un calculator este util pentru orientare. Te poate ajuta să înțelegi ordinul de mărime al necesarului tău
          energetic și diferența dintre menținere și un aport orientativ pentru un anumit obiectiv.
        </ArticleP>
        <ArticleP>
          Dar nu poate vedea tot ceea ce se întâmplă în viața ta și nu poate măsura direct metabolismul. De aceea,
          rezultatul ar trebui privit ca un punct de plecare care poate necesita ajustare, nu ca un număr pe care
          trebuie să îl respecți cu precizie în fiecare zi.
        </ArticleP>
        <ArticleP>Necesarul caloric nu este un număr perfect ascuns într-o formulă.</ArticleP>
        <ArticleLead>Îl putem estima, îl putem folosi ca punct de pornire și apoi îl putem adapta în funcție de evoluția reală.</ArticleLead>
        <ArticleP>
          Pentru scădere în greutate este necesar un deficit energetic, dar un deficit mai mare nu este automat mai
          bun. Obiectivul este să găsim un aport care susține obiectivul urmărit, oferă nutrienții necesari și poate
          fi menținut în viața reală.
        </ArticleP>
      </section>
    </ArticleShell>
  );
}
