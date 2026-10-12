import { Link } from "wouter";
import { Leaf, Activity, Shuffle, Salad, Feather, TrendingUp, Layers } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArticleH2, ArticleP, ArticleLead, ArticleList } from "@/components/nutrihub/ArticleShell";
import { ArticleShellPremium } from "@/components/nutrihub/ArticleShellPremium";

// "O singură categorie, roluri diferite" + "Creștere treptată, adaptată
// toleranței" -- visual modules for this article only (never touch
// ArticleShellPremium.tsx, never add these to the other 5 articles). Same
// visual recipe already used in the other 4 implemented articles (bg-card
// border-border tile + bg-primary/10 icon circle) -- zero new tokens, zero
// new global components. Every item's text is an exact quote from this
// article's own body (sec-0, sec-1, sec-2, sec-7) -- approved verbatim by
// the user, not paraphrased further here. No new facts, numbers, or claims.
// Deliberately excludes the 25 g/zi value, the LDL/glycemic supplement-study
// results, and any medical-condition-specific content from both modules.
const ONE_CATEGORY_DIFFERENT_ROLES = [
  {
    icon: Leaf,
    label: "Ce sunt fibrele",
    note: "Fibrele alimentare sunt componente ale alimentelor vegetale pe care organismul nostru nu le digeră complet în intestinul subțire.",
  },
  {
    icon: Activity,
    label: "Rolul principal",
    note: "Cel mai cunoscut rol al fibrelor este legat de tranzitul intestinal. Ele pot contribui la formarea și consistența normală a scaunului și pot fi utile în prevenirea sau gestionarea constipației.",
  },
  {
    icon: Shuffle,
    label: "Nu toate la fel",
    note: "Important este însă să nu punem toate fibrele în aceeași categorie. Nu toate au exact aceleași efecte.",
  },
  {
    icon: Salad,
    label: "Sursele",
    note: "O alimentație variată, care conține legume, fructe, cereale integrale, leguminoase, nuci și semințe, oferă în mod natural mai multe tipuri de fibre.",
  },
];

const GRADUAL_INCREASE_ADAPTED_TO_TOLERANCE = [
  {
    icon: Feather,
    label: "Fără complicații inutile",
    note: "Fibrele sunt importante, dar nu trebuie complicate inutil.",
  },
  {
    icon: TrendingUp,
    label: "Introducere treptată",
    note: "Dacă în prezent consumi puține fibre, introducerea lor treptată este de obicei mai ușor de tolerat decât o schimbare bruscă.",
  },
  {
    icon: Layers,
    label: "Nicio fibră «perfectă»",
    note: "Și poate cel mai important: nu există o singură fibră „perfectă”. O alimentație variată aduce tipuri diferite de fibre, fiecare cu propriile caracteristici.",
  },
];

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
    <ArticleShellPremium
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
        "U.S. Department of Agriculture, Agricultural Research Service. FoodData Central.",
      ]}
    >
      {/* Hero image -- already-approved, already-local asset (also used as
          this article's card image on the NutriHub hub), reused as-is, not
          duplicated, not re-sourced. Same pattern as the hero images in the
          other 4 implemented articles. */}
      <img
        src="/images/nutrihub/fibre-alimentare-surse.webp"
        alt="Surse de fibre alimentare: ovăz, leguminoase, pâine integrală, banane și legume cu frunze"
        width={1600}
        height={900}
        className="w-full aspect-[16/9] object-cover rounded-2xl border border-border"
        loading="eager"
        decoding="async"
      />

      <section id="sec-0">
        {/* First sentence re-rendered via ArticleLead instead of ArticleP --
            text is byte-identical to before, appears exactly once (not
            duplicated into either module below), per explicit approval. */}
        <ArticleLead>
          Probabil ai auzit de multe ori că „ar trebui să mănânci mai multe fibre”, mai ales dacă ai probleme cu
          tranzitul intestinal.
        </ArticleLead>
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

      <section id="sec-1">
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

      {/* Module "O singură categorie, roluri diferite" -- positioned after
          sec-1, before sec-2. Every caption redisplays a sentence that
          already exists in this same article (sec-0, sec-1, sec-2).
          Deliberately excludes the 25 g/zi value and every LDL/glycemic/
          constipation-study-result sentence. */}
      <div>
        <h2 className="font-serif font-bold text-foreground text-xl md:text-2xl mb-4">
          O singură categorie, roluri diferite
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {ONE_CATEGORY_DIFFERENT_ROLES.map((item) => (
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

      <section id="sec-2">
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

      <section id="sec-3">
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

      {/* New photo + short editorial module -- original photograph (not
          stock, not a placeholder), saved locally, not yet used anywhere
          else on the site. Deliberately not framed as a ranking ("cele mai
          bogate fructe") since the article gives no comparable per-fruit
          values -- framed instead as examples, with a note that fibre
          content varies by variety/ripeness/portion. One new source
          (USDA FoodData Central) added to the bibliography for this module
          only; the article's own 5 existing sources are untouched. */}
      <div>
        <img
          src="/images/nutrihub/fructe-cu-fibre.webp"
          alt="Avocado întreg și tăiat în jumătate, zmeură, mure, pară cu coajă și kiwi tăiat, așezate pe un blat"
          width={1600}
          height={900}
          className="w-full aspect-[16/9] object-cover rounded-2xl border border-border"
          loading="lazy"
          decoding="async"
        />
        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-semibold text-foreground leading-snug">
            Fructe cu un conținut mai ridicat de fibre
          </p>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Avocado, zmeura, murele, para cu coajă și kiwi sunt câteva exemple de fructe care pot contribui la
            aportul de fibre.
          </p>
          <p className="text-xs text-muted-foreground mt-2 leading-snug">
            Conținutul de fibre poate varia în funcție de soi, maturitate și porția consumată.
          </p>
        </div>
      </div>

      <section id="sec-4">
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

      <section id="sec-5">
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

      <section id="sec-6">
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

      <section id="sec-7">
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

      {/* Module "Creștere treptată, adaptată toleranței" -- closing recap,
          same position/pattern as the closing modules in the other 4
          implemented articles (after the last section, before the shell's
          own "Citește și" block). Every caption redisplays a sentence that
          already exists in sec-7 above; excludes the 25 g/zi value and the
          hydration/water-intake content entirely. */}
      <div>
        <h2 className="font-serif font-bold text-foreground text-xl md:text-2xl mb-4">
          Creștere treptată, adaptată toleranței
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {GRADUAL_INCREASE_ADAPTED_TO_TOLERANCE.map((item) => (
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
