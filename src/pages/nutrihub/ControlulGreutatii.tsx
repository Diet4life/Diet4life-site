import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArticleShell, ArticleH2, ArticleP, ArticleCallout, ArticleList } from "@/components/nutrihub/ArticleShell";
import { WeightFactorsGrid } from "@/components/nutrihub/WeightFactorsGrid";

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
    <ArticleShell
      category="NutriHub"
      title="Controlul greutății: de ce nu este doar despre a mânca mai puțin"
      subtitle="Greutatea este influențată de câtă energie consumăm și câtă folosim, dar acest echilibru nu funcționează izolat. Foamea, sațietatea, mișcarea, somnul, mediul, unele medicamente și adaptările organismului pot modifica felul în care mâncăm și câtă energie consumăm."
      readTime="5 min citire"
      updated="Actualizat: septembrie 2026"
      tldr="Pentru a pierde în greutate este nevoie, în timp, de un deficit energetic. Dar asta nu înseamnă că slăbitul este doar o problemă de «a mânca mai puțin». Organismul se adaptează, apetitul poate crește, activitatea zilnică se poate modifica, iar greutatea de pe cântar fluctuează și din alte motive decât grăsimea corporală. De aceea, o strategie bună nu răspunde doar la întrebarea «Cum slăbesc?», ci și la «Cum pot menține rezultatul?»"
      keyTakeaways={[
        "Energia contează, dar controlul greutății nu este doar o problemă de voință.",
        "Mâncatul sănătos și scăderea ponderală nu sunt exact același lucru — cantitatea contează și ea.",
        "Greutatea de pe cântar poate fluctua fără ca masa de grăsime să se fi modificat în aceeași măsură.",
        "„Metabolism blocat” nu este o explicație corectă; adaptările metabolice există, dar sunt variabile.",
        "Menținerea greutății pierdute trebuie planificată, nu lăsată pentru după dietă.",
      ]}
      faq={[
        {
          q: "Mi s-a blocat metabolismul?",
          a: "Nu în sensul în care termenul este folosit frecvent online. Odată cu scăderea ponderală, necesarul energetic scade, iar la unele persoane apare și o adaptare suplimentară a consumului energetic. Acest lucru nu înseamnă că organismul nu mai poate pierde în greutate.",
        },
        {
          q: "De ce nu slăbesc dacă mănânc puțin?",
          a: "Pot exista mai multe explicații: densitatea energetică a alimentelor, porțiile, băuturile, variațiile de greutate determinate de apă, modificarea activității sau, în anumite cazuri, factori medicali. Situația trebuie privită în ansamblu.",
        },
        {
          q: "Sportul este obligatoriu pentru a slăbi?",
          a: "Nu este obligatoriu pentru existența unui deficit energetic, dar activitatea fizică are beneficii importante pentru sănătate, funcție, menținerea masei musculare și managementul greutății pe termen lung.",
        },
        {
          q: "Cât de des ar trebui să mă cântăresc?",
          a: "Nu există o frecvență obligatorie. Pentru unele persoane monitorizarea regulată poate fi utilă, iar pentru altele poate deveni stresantă. Mai important decât o singură valoare este să urmărești tendința în timp.",
        },
        {
          q: "Ce fac dacă greutatea nu mai scade?",
          a: "Înainte de schimbări drastice, reevaluează porțiile, structura meselor, activitatea și perioada pe care analizezi evoluția. Dacă stagnarea persistă sau există alte simptome, poate fi utilă o evaluare individuală.",
        },
        {
          q: "Am încercat multe diete și greutatea revine. Înseamnă că nu am suficientă voință?",
          a: "Nu. Recâștigul ponderal este frecvent și poate fi influențat atât de revenirea obiceiurilor anterioare, cât și de adaptările biologice care apar după scăderea în greutate. Din acest motiv, menținerea trebuie tratată ca o etapă activă a managementului ponderal.",
        },
      ]}
      related={[
        { label: "Nutriție echilibrată: cum arată în viața reală?", href: "/nutrihub/nutritie-echilibrata" },
        { label: "Câte calorii am nevoie?" },
        { label: "Sunt toate caloriile la fel?" },
        { label: "Câtă proteină am nevoie?" },
        { label: "Fibrele alimentare: cât avem nevoie și de unde le luăm?" },
        { label: "De ce nu slăbesc deși mănânc puțin?" },
        { label: "Ce este platoul ponderal?" },
        { label: "Produsele pentru slăbit: ce se întâmplă după ce nu le mai folosești?" },
      ]}
      sources="Articol documentat pe baza cadrului actual al Organizației Mondiale a Sănătății privind obezitatea ca boală cronică și recidivantă și a recomandărilor European Association for the Study of Obesity privind managementul individualizat și pe termen lung al obezității. Literatura privind adaptarea metabolică după scăderea ponderală a fost utilizată pentru a diferenția fenomenul real de conceptul popular și incorect de „metabolism blocat”."
    >
      <section>
        <ArticleH2>Energia contează. Atunci de ce nu este atât de simplu?</ArticleH2>
        <ArticleP>
          Principiul de bază rămâne valabil: pentru ca masa corporală să scadă în timp, aportul de energie trebuie să fie mai mic decât energia consumată. Dar cele două părți ale ecuației se influențează reciproc.
        </ArticleP>
        <ArticleP>Când mănânci mai puțin și pierzi în greutate:</ArticleP>
        <ArticleList
          items={[
            "organismul are nevoie de mai puțină energie pentru a susține o masă corporală mai mică;",
            "la unele persoane poate crește senzația de foame;",
            "activitatea spontană din timpul zilei se poate reduce;",
            "consumul energetic se poate modifica.",
          ]}
        />
        <ArticleP>
          De aceea, recomandarea „mănâncă mai puțin și mișcă-te mai mult” descrie principiul, dar nu explică întreaga problemă.
        </ArticleP>
        <ArticleP>
          Iar atunci când vorbim despre obezitate, lucrurile sunt și mai complexe. Organizația Mondială a Sănătății o clasifică drept o boală cronică și recidivantă, rezultată din interacțiunea dintre factori biologici, comportamentali și de mediu.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Ce poate influența greutatea?</ArticleH2>
        <ArticleP>Greutatea nu este un test de voință. În controlul ei pot conta simultan:</ArticleP>
        <WeightFactorsGrid />
        <ArticleP>Niciunul dintre acești factori nu explică singur fiecare situație.</ArticleP>
      </section>

      <section>
        <ArticleH2>„Mănânc puțin. De ce nu slăbesc?”</ArticleH2>
        <ArticleP>
          Este una dintre cele mai frecvente întrebări. Și „mănânc puțin” poate fi perfect adevărat dacă ne referim la volumul alimentelor. Dar volumul și energia nu sunt același lucru.
        </ArticleP>
        <ArticleP>De exemplu, cantități relativ mici de ulei, sosuri, nuci și semințe, unt de arahide, brânzeturi, produse de patiserie sau băuturi calorice pot contribui semnificativ la aportul energetic zilnic.</ArticleP>
        <ArticleCallout>
          Asta nu înseamnă că aceste alimente sunt „rele”. Înseamnă doar că uneori cantitatea de energie consumată este mai greu de estimat decât pare — și nu este vorba despre a acuza pacientul că „nu calculează corect”. Estimarea aportului alimentar este dificilă pentru aproape toată lumea.
        </ArticleCallout>
      </section>

      <section>
        <ArticleH2>„Mănânc sănătos. Atunci de ce nu slăbesc?”</ArticleH2>
        <ArticleP>
          Pentru că aliment nutritiv și aliment care produce automat scădere ponderală nu sunt același lucru. Uleiul de măsline, nucile, semințele, avocado sau unturile din nuci pot face parte foarte bine dintr-o alimentație sănătoasă, dar sunt și dense energetic.
        </ArticleP>
        <ArticleP>
          La fel, două mese formate din alimente de calitate pot avea cantități foarte diferite de energie în funcție de porții și modul de preparare. Pentru controlul greutății contează împreună: calitatea alimentelor, cantitatea, structura meselor și ce poți susține în timp.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>De ce poate stagna cântarul?</ArticleH2>
        <ArticleP>Înainte să reduci drastic mâncarea, merită să privești întregul tablou. Verifică:</ArticleP>
        <ArticleList
          items={[
            "Porțiile — au crescut treptat fără să observi?",
            "Alimentele dense energetic — au apărut mai multe uleiuri, sosuri, nuci, brânzeturi sau gustări?",
            "Băuturile — cafeaua cu adaosuri, alcoolul sau alte băuturi aduc energie care poate fi ușor trecută cu vederea.",
            "Mișcarea zilnică — mergi mai puțin, stai mai mult pe scaun sau te simți mai obosit decât înainte?",
            "Somnul și rutina — s-au modificat somnul, programul meselor sau apetitul?",
            "Fluctuațiile normale ale greutății — apa, aportul de sare, glicogenul, tranzitul intestinal și ciclul menstrual pot modifica temporar cifra de pe cântar.",
            "Medicația sau sănătatea — în anumite situații merită luate în calcul și aceste cauze.",
          ]}
        />
        <ArticleP>
          O schimbare de câteva zile pe cântar nu reflectă automat o schimbare identică a grăsimii corporale.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>De ce slăbirea nu este o linie dreaptă?</ArticleH2>
        <ArticleP>
          Pentru că organismul nu pierde exact aceeași cantitate în fiecare săptămână. Poți avea perioade în care greutatea scade, apoi pare că stagnează, apoi scade din nou. În plus, odată cu pierderea în greutate, necesarul energetic se reduce deoarece organismul susține o masă corporală mai mică.
        </ArticleP>
        <ArticleP>
          Poate exista și ceea ce literatura numește adaptare metabolică sau termogeneză adaptativă: la unele persoane, consumul energetic poate scădea ceva mai mult decât ar fi explicat doar prin modificarea greutății și compoziției corporale.
        </ArticleP>
        <ArticleCallout>
          Asta nu înseamnă că „metabolismul s-a blocat”. Studiile arată că amploarea acestei adaptări diferă mult între persoane și că efectul poate fi modest, mai ales după stabilizarea greutății. Mesajul important este altul: necesarul unei persoane se poate modifica pe măsură ce scade în greutate, iar strategia poate avea nevoie de ajustări.
        </ArticleCallout>
      </section>

      <section>
        <ArticleH2>Cât de repede ar trebui să slăbesc?</ArticleH2>
        <ArticleP>
          Nu există un ritm potrivit pentru toată lumea. Ritmul depinde de greutatea inițială, compoziția corporală, tratament, nivelul de activitate, starea de sănătate și strategia aleasă.
        </ArticleP>
        <ArticleP>
          În practica medicală, chiar și o reducere moderată a greutății poate aduce beneficii pentru sănătate la persoanele pentru care scăderea ponderală este indicată.
        </ArticleP>
        <ArticleP>
          De aceea, obiectivul nu ar trebui să fie „Cât de repede pot slăbi?”, ci „Ce rezultat îmi îmbunătățește sănătatea și poate fi menținut?”
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Slăbitul nu este finalul</ArticleH2>
        <ArticleP>
          Aceasta este una dintre cele mai importante idei despre controlul greutății: menținerea face parte din proces. După ce o persoană pierde în greutate, organismul nu revine pur și simplu la o stare neutră.
        </ArticleP>
        <ArticleP>
          Pot persista factori care favorizează recâștigul ponderal: modificări ale apetitului, un necesar energetic mai mic și revenirea treptată la vechile obiceiuri sau contexte alimentare. Din acest motiv, organizațiile profesionale tratează tot mai mult obezitatea ca pe o afecțiune care necesită management pe termen lung, nu ca pe o „cură de slăbire” cu început și sfârșit.
        </ArticleP>
        <ArticleP>
          O strategie bună trebuie să includă din start întrebarea: cum voi mânca după ce am ajuns la rezultatul dorit?
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Când recomandările generale nu sunt suficiente</ArticleH2>
        <ArticleP>Merită o evaluare individuală atunci când:</ArticleP>
        <ArticleList
          items={[
            "greutatea crește sau scade rapid și fără intenție;",
            "apar simptome persistente care nu pot fi explicate prin schimbările de alimentație sau activitate;",
            "urmezi tratamente care pot influența greutatea;",
            "ai încercat repetat strategii foarte restrictive, iar greutatea revine;",
            "preocuparea pentru mâncare sau greutate produce anxietate importantă, restricții severe sau episoade de pierdere a controlului asupra alimentației.",
          ]}
        />
        <ArticleP>
          În astfel de situații, problema nu se rezolvă neapărat printr-o dietă și mai restrictivă.
        </ArticleP>
      </section>
    </ArticleShell>
  );
}
