import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArticleShell, ArticleH2, ArticleP, ArticleLead, ArticleList } from "@/components/nutrihub/ArticleShell";

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
      category="FIBRE ALIMENTARE"
      title="Fibrele alimentare: de ce sunt importante"
      related={[
        { label: "Nutriție echilibrată: cum arată în viața reală?", href: "/nutrihub/nutritie-echilibrata" },
        { label: "Controlul greutății: de ce nu se reduce la „mănâncă mai puțin”", href: "/nutrihub/controlul-greutatii" },
        { label: "De ce este importantă proteina și de câtă avem nevoie?", href: "/nutrihub/cata-proteina-am-nevoie" },
        { label: "Câte calorii am nevoie, de fapt?", href: "/nutrihub/cate-calorii-am-nevoie" },
        { label: "Sunt toate caloriile la fel?", href: "/nutrihub/sunt-toate-caloriile-la-fel" },
      ]}
      sources={[
        "World Health Organization. Carbohydrate intake for adults and children: WHO guideline. Geneva: WHO; 2023.",
        "EFSA Panel on Dietetic Products, Nutrition and Allergies. Scientific Opinion on Dietary Reference Values for carbohydrates and dietary fibre. EFSA Journal. 2010.",
        "van der Schoot A, Drysdale C, Whelan K, Dimidi E. The Effect of Fiber Supplementation on Chronic Constipation in Adults: An Updated Systematic Review and Meta-Analysis of Randomized Controlled Trials. Am J Clin Nutr. 2022;116(4):953–969.",
        "Ghavami A, et al. Soluble Fiber Supplementation and Serum Lipid Profile: A Systematic Review and Dose-Response Meta-Analysis of Randomized Controlled Trials. Adv Nutr. 2023;14(3):465–474.",
        "Xie Y, et al. Effects of soluble fiber supplementation on glycemic control in adults with type 2 diabetes mellitus: a systematic review and meta-analysis of randomized controlled trials. Clin Nutr. 2021;40(4):1800–1810.",
      ]}
    >
      <section>
        <ArticleP>
          Probabil ai auzit de multe ori că „ar trebui să mănânci mai multe fibre”, mai ales dacă ai probleme cu
          tranzitul intestinal.
        </ArticleP>
        <ArticleP>
          Dar ce sunt, de fapt, fibrele? Unde le găsim? Sunt toate la fel? Și de ce uneori, atunci când începem să
          mâncăm mai multe alimente bogate în fibre, pot apărea gaze sau balonare?
        </ArticleP>
        <ArticleP>
          Fibrele alimentare sunt componente ale alimentelor vegetale pe care organismul nostru nu le digeră complet
          în intestinul subțire. Le găsim în principal în legume, fructe, leguminoase, cereale integrale, nuci și
          semințe.
        </ArticleP>
        <ArticleP>
          Ele nu au toate același rol. Unele absorb apă, unele formează un fel de gel în intestin, iar altele sunt
          fermentate de bacteriile intestinale. Tocmai de aceea două alimente bogate în fibre pot fi tolerate diferit.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Ce fac fibrele în organism?</ArticleH2>
        <ArticleP>
          Cel mai cunoscut rol al fibrelor este legat de tranzitul intestinal. Ele pot contribui la formarea și
          consistența normală a scaunului și pot fi utile în prevenirea sau gestionarea constipației.
        </ArticleP>
        <ArticleP>
          Dar rolul fibrelor nu se oprește aici. Anumite tipuri de fibre pot contribui la scăderea colesterolului
          LDL, iar unele fibre solubile pot influența favorabil răspunsul glicemic. Fibrele din alimentație fac
          parte și dintr-un model alimentar asociat cu o sănătate metabolică și cardiovasculară mai bună.
        </ArticleP>
        <ArticleP>Important este însă să nu punem toate fibrele în aceeași categorie. Nu toate au exact aceleași efecte.</ArticleP>
      </section>

      <section>
        <ArticleH2>Sunt toate fibrele la fel?</ArticleH2>
        <ArticleP>Nu.</ArticleP>
        <ArticleP>
          Unele fibre sunt solubile și pot forma, în contact cu apa, o structură asemănătoare unui gel. Exemple
          cunoscute sunt beta-glucanii din ovăz și orz și fibrele din psyllium.
        </ArticleP>
        <ArticleP>
          Aceste fibre vâscoase au fost studiate în mod special pentru efectele asupra colesterolului. O
          meta-analiză amplă, care a inclus 181 de studii randomizate, a arătat că suplimentarea cu fibre solubile a
          fost asociată cu reducerea colesterolului LDL și a colesterolului total.
        </ArticleP>
        <ArticleP>Alte fibre contribuie mai ales la volumul scaunului și la tranzitul intestinal.</ArticleP>
        <ArticleP>
          Iar unele fibre sunt fermentate mai mult de bacteriile din colon. În timpul fermentației se produc și
          gaze. Asta este un proces normal și nu înseamnă că alimentul respectiv îți face rău.
        </ArticleP>
        <ArticleP>
          Totuși, la unele persoane, mai ales atunci când aportul de fibre crește foarte repede, pot apărea
          balonare, gaze sau disconfort abdominal.
        </ArticleP>
        <ArticleLead>Atunci care sunt fibrele „bune”?</ArticleLead>
        <ArticleP>Poate părea tentant să împărțim fibrele în „bune” și „rele”, dar lucrurile nu funcționează așa.</ArticleP>
        <ArticleP>Mai corect este să spunem că diferitele tipuri de fibre au roluri diferite.</ArticleP>
        <ArticleP>
          De aceea, pentru majoritatea persoanelor sănătoase, nu este nevoie să urmărească zilnic câte grame de
          fibre solubile, insolubile sau vâscoase au consumat.
        </ArticleP>
        <ArticleP>
          O alimentație variată, care conține legume, fructe, cereale integrale, leguminoase, nuci și semințe, oferă
          în mod natural mai multe tipuri de fibre.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Câtă fibră avem nevoie?</ArticleH2>
        <ArticleP>
          WHO recomandă adulților cel puțin 25 g de fibre alimentare pe zi, provenite în mod natural din alimente.
          Tot WHO recomandă ca sursele principale de carbohidrați să fie cerealele integrale, legumele, fructele și
          leguminoasele.
        </ArticleP>
        <ArticleP>EFSA utilizează, de asemenea, 25 g/zi ca aport adecvat pentru funcționarea normală a intestinului la adulți.</ArticleP>
        <ArticleP>
          Asta nu înseamnă însă că trebuie să începi de mâine să cântărești fiecare gram de fibre. Mai important este
          să te uiți la alimentația ta în ansamblu.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Cum poate arăta practic o zi cu surse de fibre?</ArticleH2>
        <ArticleP>Nu este nevoie de produse speciale „high fibre” pentru a introduce fibre în alimentație.</ArticleP>
        <ArticleList
          items={[
            "Mic dejun: iaurt cu ovăz și câteva bucăți de zmeură",
            "Prânz: carne de pui, alături de legume și o garnitură într-o cantitate mai mică de orez integral",
            "Gustare: un fruct întreg, în prima parte a zilei",
            "Seara: pește, ouă sau o altă sursă de proteină, alături de legume; în funcție de necesarul individual se poate adăuga și o cantitate de carbohidrați complecși",
          ]}
        />
        <ArticleP>Pe parcursul săptămânii pot fi introduse și leguminoase precum fasolea, lintea, năutul sau mazărea.</ArticleP>
        <ArticleP>
          Ideea nu este ca fiecare masă să fie încărcată cu fibre. Fibrele se adună treptat, din mai multe alimente
          consumate pe parcursul zilei.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>De ce mă pot balona dacă încep să mănânc mai multe fibre?</ArticleH2>
        <ArticleP>Aceasta este una dintre cele mai frecvente situații.</ArticleP>
        <ArticleP>
          Cineva decide că vrea să mănânce mai sănătos și, aproape peste noapte, adaugă ovăz dimineața, semințe, mai
          multe fructe, salate foarte mari, pâine integrală și leguminoase.
        </ArticleP>
        <ArticleP>
          Toate acestea pot face parte dintr-o alimentație sănătoasă. Dar dacă înainte aportul de fibre era redus,
          schimbarea poate fi foarte mare.
        </ArticleP>
        <ArticleP>
          Unele fibre sunt fermentate de bacteriile intestinale, iar acest proces produce gaze. De aceea, creșterea
          rapidă a aportului poate duce temporar la balonare sau flatulență.
        </ArticleP>
        <ArticleP>
          O meta-analiză din 2022 asupra persoanelor cu constipație cronică a arătat că suplimentarea cu fibre a
          îmbunătățit frecvența și consistența scaunului, dar flatulența a fost mai frecventă în grupurile care au
          primit fibre.
        </ArticleP>
        <ArticleP>
          Dacă începi să te balonezi după ce ai crescut brusc fibrele, concluzia nu trebuie să fie imediat „fibrele
          nu-mi fac bine”. Uneori poate fi suficient să crești aportul mai progresiv.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Fibrele și constipația</ArticleH2>
        <ArticleP>
          Fibrele pot fi utile în constipație, dar nici aici nu funcționează regula simplă „mai multe fibre =
          tranzit mai bun”.
        </ArticleP>
        <ArticleP>
          Tipul de fibre contează, iar răspunsul diferă între persoane. În meta-analiza menționată anterior,
          psylliumul s-a numărat printre fibrele pentru care au fost observate rezultate favorabile, dar studiile au
          avut o heterogenitate importantă.
        </ArticleP>
        <ArticleP>
          De aceea, la o persoană cu constipație persistentă nu este întotdeauna cea mai bună idee să adăugăm dintr-o
          dată cantități foarte mari de fibre fără să ne uităm și la restul contextului.
        </ArticleP>
        <ArticleLead>Fibrele și glicemia</ArticleLead>
        <ArticleP>Și aici este important să fim preciși.</ArticleP>
        <ArticleP>
          Nu putem spune simplu că „fibrele scad glicemia”. Există însă dovezi că anumite fibre solubile pot
          îmbunătăți controlul glicemic în anumite populații.
        </ArticleP>
        <ArticleP>
          De exemplu, o meta-analiză a studiilor randomizate la adulți cu diabet zaharat de tip 2 a găsit
          îmbunătățiri ale mai multor parametri glicemici după suplimentarea cu fibre solubile. Autorii au subliniat
          însă și heterogenitatea importantă dintre studii.
        </ArticleP>
        <ArticleP>
          Pentru pacient, mesajul practic este simplu: nu toate fibrele au aceleași efecte și nu trebuie să
          transformăm un singur nutrient într-un tratament universal.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Mai multe fibre înseamnă mai bine?</ArticleH2>
        <ArticleP>Nu neapărat.</ArticleP>
        <ArticleP>
          Dacă alimentația ta conține foarte puține fibre, creșterea aportului poate fi benefică. Dar nu există
          niciun avantaj în a transforma fibrele într-o competiție și a încerca să consumi cantități cât mai mari.
        </ArticleP>
        <ArticleP>
          Un aport crescut foarte repede poate provoca gaze, balonare și disconfort. Iar în anumite boli digestive
          sau situații medicale, cantitatea și tipul fibrelor pot necesita o abordare individualizată.
        </ArticleP>
        <ArticleP>25 g/zi este un reper pentru adult, nu o țintă pe care trebuie să o depășești cu orice preț.</ArticleP>
        <ArticleLead>Și apa?</ArticleLead>
        <ArticleP>Atunci când crești aportul de fibre, este important ca aportul de lichide să fie adecvat.</ArticleP>
        <ArticleP>
          Nu există însă o formulă universală de tipul „la fiecare gram de fibre trebuie să bei o anumită cantitate
          de apă”. Necesarul de lichide diferă în funcție de persoană, alimentație, activitate fizică, temperatură și
          alte condiții.
        </ArticleP>
        <ArticleP>
          Mai ales dacă există tendință la constipație, fibrele nu ar trebui privite separat de hidratare și de
          restul stilului de viață.
        </ArticleP>
        <ArticleP>Fibrele sunt importante, dar nu trebuie complicate inutil.</ArticleP>
        <ArticleP>Le găsim în alimente vegetale obișnuite: legume, fructe, cereale integrale, leguminoase, nuci și semințe.</ArticleP>
        <ArticleP>
          Pentru adulți, cel puțin 25 g/zi reprezintă un reper susținut de WHO, dar nu este nevoie să ajungi acolo
          peste noapte.
        </ArticleP>
        <ArticleP>
          Dacă în prezent consumi puține fibre, introducerea lor treptată este de obicei mai ușor de tolerat decât o
          schimbare bruscă.
        </ArticleP>
        <ArticleP>
          Și poate cel mai important: nu există o singură fibră „perfectă”. O alimentație variată aduce tipuri
          diferite de fibre, fiecare cu propriile caracteristici.
        </ArticleP>
      </section>
    </ArticleShell>
  );
}
