import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArticleShell, ArticleH2, ArticleP, ArticleLead, ArticleList } from "@/components/nutrihub/ArticleShell";

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
      category="MACRONUTRIENȚI"
      title="De ce este importantă proteina și de câtă avem nevoie?"
      related={[
        { label: "Nutriție echilibrată: cum arată în viața reală?", href: "/nutrihub/nutritie-echilibrata" },
        { label: "Controlul greutății: de ce nu se reduce la „mănâncă mai puțin”", href: "/nutrihub/controlul-greutatii" },
        { label: "Câte calorii am nevoie, de fapt?", href: "/nutrihub/cate-calorii-am-nevoie" },
        { label: "Fibrele alimentare: de ce sunt importante", href: "/nutrihub/fibrele-alimentare" },
        { label: "Sunt toate caloriile la fel?", href: "/nutrihub/sunt-toate-caloriile-la-fel" },
      ]}
      sources={[
        "EFSA Panel on Dietetic Products, Nutrition and Allergies (NDA). Scientific Opinion on Dietary Reference Values for protein. EFSA Journal. 2012;10(2):2557. DOI: 10.2903/j.efsa.2012.2557.",
        "World Health Organization. Healthy diet. Fact sheet, updated 2025. Secțiunea Protein: aportul de 10–15% din energia zilnică este, în general, suficient pentru necesarul adulților.",
        "FAO Expert Consultation. Dietary protein quality evaluation in human nutrition. FAO Food and Nutrition Paper 92. Rome: Food and Agriculture Organization; 2013.",
        "Kohanmoo A, Faghih S, Akhlaghi M. Effect of short- and long-term protein consumption on appetite and appetite-regulating gastrointestinal hormones: a systematic review and meta-analysis of randomized controlled trials. Physiology & Behavior. 2020;226:113123. DOI: 10.1016/j.physbeh.2020.113123.",
        "Jäger R, Kerksick CM, Campbell BI, et al. International Society of Sports Nutrition Position Stand: protein and exercise. Journal of the International Society of Sports Nutrition. 2017;14:20. DOI: 10.1186/s12970-017-0177-8.",
        "Volkert D, Beck AM, Cederholm T, et al. ESPEN practical guideline: Clinical nutrition and hydration in geriatrics. Clinical Nutrition. 2022;41(4):958–989. DOI: 10.1016/j.clnu.2022.01.024.",
        "Stenberg E, dos Reis Falcão LF, O'Kane M, et al. Guidelines for Perioperative Care in Bariatric Surgery: Enhanced Recovery After Surgery (ERAS) Society Recommendations: A 2021 Update. World Journal of Surgery. 2022;46:729–751.",
      ]}
    >
      <section>
        <ArticleP>
          Tot mai des vedem pe rafturile magazinelor produse etichetate „high protein”: iaurturi, budinci, batoane
          sau alte produse îmbogățite cu proteină. Mesajul pe care îl primim este adesea simplu: mai multă proteină
          înseamnă mai bine.
        </ArticleP>
        <ArticleP>
          Dar înainte să ne întrebăm dacă avem nevoie de produse cu mai multă proteină, este mai important să
          înțelegem de ce avem nevoie de proteină, ce rol are în organism și câtă proteină avem, de fapt, nevoie.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>De ce este importantă proteina?</ArticleH2>
        <ArticleP>
          Proteinele sunt alcătuite din aminoacizi. O parte dintre aceștia pot fi produși de organism, în timp ce
          aminoacizii esențiali trebuie obținuți prin alimentație.
        </ArticleP>
        <ArticleP>
          Rolul proteinei nu se limitează la masa musculară. Proteinele participă la formarea și menținerea
          țesuturilor și intră în structura multor enzime, hormoni și alte molecule cu rol important în funcționarea
          organismului.
        </ArticleP>
        <ArticleP>Cu alte cuvinte, proteina este necesară permanent organismului, nu doar persoanelor care fac sport.</ArticleP>
      </section>

      <section>
        <ArticleH2>Proteina și sațietatea</ArticleH2>
        <ArticleP>
          Proteina este unul dintre macronutrienții care contribuie la senzația de sațietate. Studiile arată că un
          aport mai mare de proteină poate crește senzația de plenitudine și poate reduce foamea comparativ cu un
          aport mai redus de proteină, atunci când sunt comparate intervenții cu aport energetic controlat.
        </ArticleP>
        <ArticleP>
          Acest efect poate fi util atunci când încercăm să controlăm mai bine aportul alimentar. Totuși, proteina nu
          produce singură scădere în greutate. Contează alimentația în ansamblu și aportul energetic total.
        </ArticleP>
        <ArticleLead>Sunt toate proteinele la fel?</ArticleLead>
        <ArticleP>Nu toate sursele de proteină au aceeași compoziție.</ArticleP>
        <ArticleP>
          Calitatea unei proteine depinde, printre altele, de profilul de aminoacizi esențiali și de digestibilitatea
          acesteia. Unele surse furnizează aminoacizii esențiali într-un profil mai favorabil și au o digestibilitate
          mai mare, în timp ce altele pot avea cantități mai reduse din anumiți aminoacizi esențiali.
        </ArticleP>
        <ArticleP>Asta nu înseamnă că există proteine „bune” și proteine „rele”, ci că sursele alimentare diferă între ele.</ArticleP>
      </section>

      <section>
        <ArticleH2>Proteina animală și proteina vegetală</ArticleH2>
        <ArticleP>
          Sursele animale de proteină, precum peștele, ouăle, carnea și produsele lactate, au în general o
          digestibilitate ridicată și furnizează aminoacizii esențiali într-un profil favorabil.
        </ArticleP>
        <ArticleP>
          Proteina vegetală provine din alimente precum leguminoasele, soia, nucile, semințele și cerealele. Aceste
          surse diferă între ele atât prin digestibilitate, cât și prin profilul aminoacizilor esențiali.
        </ArticleP>
        <ArticleP>
          De aceea, atunci când alimentația se bazează predominant pe surse vegetale, varietatea surselor proteice
          este importantă pentru asigurarea unui aport adecvat de aminoacizi esențiali.
        </ArticleP>
        <ArticleP>Nu este însă necesar ca diferitele surse vegetale să fie combinate obligatoriu în cadrul aceleiași mese.</ArticleP>
        <ArticleLead>Din ce alimente putem obține proteine?</ArticleLead>
        <ArticleList
          items={[
            "pește",
            "ouă",
            "carne",
            "lapte, iaurt, brânzeturi și alte produse lactate",
            "fasole, linte, năut și mazăre",
            "soia și tofu",
            "nuci și semințe",
          ]}
        />
        <ArticleP>Important nu este doar aportul total de proteină, ci și varietatea surselor din alimentație.</ArticleP>
      </section>

      <section>
        <ArticleH2>Câtă proteină avem nevoie?</ArticleH2>
        <ArticleP>În această secțiune ne referim la adulți sănătoși, normoponderali.</ArticleP>
        <ArticleP>
          EFSA stabilește pentru adulți un Population Reference Intake (PRI) de 0,83 g proteină/kg corp/zi. Acesta
          este un reper populațional destinat să acopere necesarul majorității adulților sănătoși.
        </ArticleP>
        <ArticleP>
          În ghidurile internaționale, aportul proteic mai poate fi exprimat și ca procent din aportul energetic
          total. WHO arată că, pentru majoritatea adulților, aproximativ 10–15% din energia zilnică provenită din
          proteine este, în general, suficientă pentru acoperirea necesarului.
        </ArticleP>
        <ArticleP>
          Aceste valori nu reprezintă o formulă care trebuie aplicată automat oricărei persoane. Necesarul poate fi
          diferit în funcție de vârstă, nivelul de activitate fizică, statusul nutrițional, intervenții chirurgicale
          sau anumite patologii.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Când necesarul de proteină poate fi diferit</ArticleH2>
        <ArticleP>
          Reperul de 0,83 g/kg/zi nu descrie toate situațiile. Necesarul poate fi mai mare sau poate necesita
          ajustare, de exemplu la persoanele care fac sport regulat, la vârstnici, după chirurgie bariatrică sau în
          anumite boli acute ori cronice.
        </ArticleP>
        <ArticleP>
          La persoanele care fac sport regulat, necesarul poate fi mai mare decât cel al populației generale. În
          literatura de nutriție sportivă sunt utilizate frecvent valori de aproximativ 1,4–2,0 g/kg/zi pentru
          persoanele active, dar necesarul diferă în funcție de tipul și volumul antrenamentului, obiectiv și aportul
          energetic total.
        </ArticleP>
        <ArticleP>
          La persoanele vârstnice, ESPEN recomandă un aport de cel puțin 1 g/kg/zi, cu ajustare individuală în
          funcție de starea nutrițională, activitatea fizică, starea de sănătate și toleranță. Pentru persoanele
          vârstnice sănătoase sunt frecvent sugerate valori de aproximativ 1,0–1,2 g/kg/zi.
        </ArticleP>
        <ArticleP>
          După chirurgia bariatrică, aportul proteic este adaptat în funcție de tipul intervenției, etapa
          postoperatorie și toleranța individuală, iar monitorizarea nutrițională are un rol important.
        </ArticleP>
        <ArticleP>
          Există și alte situații în care aportul trebuie individualizat, precum sarcina, alăptarea, recuperarea
          după boală sau intervenții și diferite patologii. Exemplele de mai sus nu reprezintă o listă completă.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Ce se întâmplă în suprapondere și obezitate?</ArticleH2>
        <ArticleP>
          La persoanele cu suprapondere sau obezitate, necesarul de proteină nu ar trebui estimat automat prin
          simpla înmulțire a reperului de 0,83 g/kg cu greutatea corporală actuală.
        </ArticleP>
        <ArticleP>
          În practica clinică există situații în care sunt utilizate alte modalități de raportare a necesarului,
          inclusiv greutăți de referință sau ajustate, în funcție de context. Nu există însă o singură formulă
          universală potrivită tuturor persoanelor cu suprapondere sau obezitate.
        </ArticleP>
        <ArticleP>
          Din acest motiv, necesarul de proteină nu ar trebui estimat automat pentru aceste categorii doar pe baza
          greutății actuale.
        </ArticleP>
        <ArticleP>În aceste situații, aportul trebuie stabilit individual.</ArticleP>
      </section>

      <section>
        <ArticleH2>Mai multă proteină înseamnă automat mai bine?</ArticleH2>
        <ArticleP>
          Nu. Un aport mai mare decât necesarul nu înseamnă automat un beneficiu mai mare. Obiectivul nu este să
          consumăm cât mai multă proteină, ci un aport potrivit nevoilor organismului și contextului individual.
        </ArticleP>
        <ArticleP>
          Iar faptul că un produs este etichetat „high protein” nu spune, de unul singur, dacă acel produs este
          necesar sau dacă are o valoare nutrițională mai bună.
        </ArticleP>
        <ArticleP>
          Proteina este importantă pentru mult mai mult decât masa musculară. Participă la formarea și menținerea
          țesuturilor, are roluri importante în funcționarea organismului și contribuie la sațietate.
        </ArticleP>
        <ArticleP>
          Sursele de proteină diferă prin profilul de aminoacizi și digestibilitate, iar necesarul nu este identic
          pentru toate persoanele.
        </ArticleP>
        <ArticleLead>
          Important nu este să consumăm cât mai multă proteină, ci să avem un aport potrivit nevoilor noastre, din
          surse alimentare variate.
        </ArticleLead>
      </section>
    </ArticleShell>
  );
}
