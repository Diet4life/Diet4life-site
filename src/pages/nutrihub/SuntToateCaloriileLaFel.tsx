import { Flame, Maximize2, Gauge, Layers, Leaf, SlidersHorizontal } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useDocumentHead } from "@/hooks/use-document-head";
import { ArticleH2, ArticleP, ArticleLead } from "@/components/nutrihub/ArticleShell";
import { ArticleShellPremium } from "@/components/nutrihub/ArticleShellPremium";

// "Ce nu spune cifra calorică" / "What the number of calories does not tell
// you" + "Trei repere pentru viața reală" / "Three practical principles" --
// visual modules for this article only (never touch ArticleShellPremium.tsx,
// never add these to the other 5 articles). Same visual recipe already used
// in ControlulGreutatii.tsx (bg-card border-border tile + bg-primary/10 icon
// circle) -- zero new tokens, zero new global components. Every item's text
// below is the user's own verbatim copy for this rewrite (RO + EN both
// supplied directly by her), not derived or paraphrased from the article
// body paragraphs.
const WHAT_THE_NUMBER_DOESNT_SAY = [
  {
    icon: Flame,
    labelRo: "Caloriile",
    labelEn: "Calories",
    noteRo: "Numărul de calorii arată câtă energie oferă alimentul, dar nu spune cât de hrănitor sau sățios este.",
    noteEn: "The number of calories shows how much energy a food provides, but it does not tell you how nutritious or filling it is.",
  },
  {
    icon: Maximize2,
    labelRo: "Mărimea porției",
    labelEn: "Portion size",
    noteRo: "Același număr de calorii poate însemna o porție mică sau o farfurie mai generoasă.",
    noteEn: "The same number of calories may represent a small portion or a more generous plate of food.",
  },
  {
    icon: Gauge,
    labelRo: "Sațietatea",
    labelEn: "Satiety",
    noteRo: "Proteinele, fibrele și volumul alimentelor influențează cât de sătul te simți după masă.",
    noteEn: "Protein, fibre and food volume influence how full you feel after a meal.",
  },
  {
    icon: Layers,
    labelRo: "Alimentele concentrate în calorii",
    labelEn: "Calorie-dense foods",
    noteRo:
      "Nucile, semințele, avocado și uleiul de măsline sunt alimente nutritive, dar oferă multe calorii într-o cantitate mică. Dacă obiectivul este scăderea în greutate, porția contează.",
    noteEn:
      "Nuts, seeds, avocado and olive oil are nutritious foods, but they provide many calories in a small amount. If the goal is weight loss, portion size still matters.",
  },
];

const THREE_REAL_LIFE_POINTS = [
  {
    icon: Flame,
    labelRo: "Numărul total de calorii",
    labelEn: "Total calorie intake",
    noteRo: "Pentru controlul greutății, numărul total de calorii consumate contează.",
    noteEn: "For weight management, the total number of calories consumed matters.",
  },
  {
    icon: Leaf,
    labelRo: "Alegerea alimentelor",
    labelEn: "Food choices",
    noteRo: "Alimentele alese influențează aportul de nutrienți, mărimea porției și senzația de sațietate.",
    noteEn: "Food choices influence nutrient intake, portion size and satiety.",
  },
  {
    icon: SlidersHorizontal,
    labelRo: "Adaptarea",
    labelEn: "Adaptability",
    noteRo:
      "O alimentație potrivită trebuie să fie echilibrată, sățioasă și suficient de flexibilă pentru a putea fi menținută în viața de zi cu zi.",
    noteEn: "A suitable diet should be balanced, satisfying and flexible enough to be maintained in everyday life.",
  },
];

// Related-article labels reuse the exact EN titles already established in
// nutrihub/index.tsx's own ARTICLES data, for consistency -- not invented
// here. hrefs/order are unchanged from before this rewrite.
const RELATED = [
  {
    labelRo: "Nutriție echilibrată: cum arată în viața reală?",
    labelEn: "Balanced nutrition: what it actually looks like",
    href: "/nutrihub/nutritie-echilibrata",
  },
  {
    labelRo: "Controlul greutății: de ce nu se reduce la „mănâncă mai puțin”",
    labelEn: "Weight control: why it's not just \"eat less\"",
    href: "/nutrihub/controlul-greutatii",
  },
  {
    labelRo: "De ce este importantă proteina și de câtă avem nevoie?",
    labelEn: "Why protein matters and how much you actually need",
    href: "/nutrihub/cata-proteina-am-nevoie",
  },
  {
    labelRo: "Câte calorii am nevoie, de fapt?",
    labelEn: "How many calories do I actually need?",
    href: "/nutrihub/cate-calorii-am-nevoie",
  },
  {
    labelRo: "Fibrele alimentare: de ce sunt importante",
    labelEn: "Dietary fiber: why it matters",
    href: "/nutrihub/fibrele-alimentare",
  },
];

const SOURCES = [
  "World Health Organization & Food and Agriculture Organization of the United Nations. What are healthy diets? Joint statement by FAO and WHO. 2024.",
  "World Health Organization. Carbohydrate intake for adults and children: WHO guideline. 2023.",
  "Obesity Canada. Canadian Adult Obesity Clinical Practice Guidelines – Medical Nutrition Therapy in Obesity Management. Updated 2022.",
  "Hall KD, Ayuketah A, Brychta R, et al. Ultra-Processed Diets Cause Excess Calorie Intake and Weight Gain: An Inpatient Randomized Controlled Trial of Ad Libitum Food Intake. Cell Metab. 2019;30(1):67-77.e3. DOI: 10.1016/j.cmet.2019.05.008.",
  "Kohanmoo A, Faghih S, Akhlaghi M. Effect of short- and long-term protein consumption on appetite and appetite-regulating gastrointestinal hormones: a systematic review and meta-analysis of randomized controlled trials. Physiol Behav. 2020;226:113123. DOI: 10.1016/j.physbeh.2020.113123.",
];

export default function SuntToateCaloriileLaFel() {
  const { language } = useLanguage();
  const ro = language === "ro";

  useDocumentHead(
    ro ? "Sunt toate caloriile la fel? | NutriHub" : "Are All Calories Equal? | NutriHub",
    ro
      ? "De ce aceeași cantitate de energie poate arăta diferit în farfurie și cum sursa alimentelor influențează sațietatea și calitatea alimentației."
      : "Why the same amount of energy can look different on the plate, and how food sources influence fullness and overall diet quality.",
    { canonical: "https://diet4lifeconcept.ro/nutrihub/sunt-toate-caloriile-la-fel" }
  );

  return (
    <ArticleShellPremium
      category={ro ? "ENERGIE ȘI ALEGERI ALIMENTARE" : "ENERGY & FOOD CHOICES"}
      title={ro ? "Sunt toate caloriile la fel?" : "Are all calories equal?"}
      related={RELATED.map((item) => ({ label: ro ? item.labelRo : item.labelEn, href: item.href }))}
      sources={SOURCES}
    >
      {/* Hero image -- already-approved, already-local asset, reused as-is
          (not duplicated, not re-sourced). Same pattern as the hero image
          in ControlulGreutatii.tsx. */}
      <img
        src="/images/nutrihub/nutrihub-calorii-featured.webp"
        alt="Selecție variată de alimente: cereale, leguminoase, lactate, ouă, pește, legume, fructe și nuci"
        width={1600}
        height={900}
        className="w-full aspect-[16/9] object-cover rounded-2xl border border-border"
        loading="eager"
        decoding="async"
      />

      <section id="sec-0">
        <ArticleLead>
          {ro
            ? "Două alimente cu același număr de calorii pot arăta foarte diferit în farfurie. O porție poate însemna doar câteva înghițituri, iar alta poate ocupa aproape toată farfuria."
            : "Two foods with the same number of calories can look very different on the plate. One portion may amount to only a few bites, while another may fill almost the entire plate."}
        </ArticleLead>
        <ArticleP>
          {ro
            ? "Caloriile ne arată câtă energie oferă un aliment. Totuși, ele nu ne spun cât de hrănitor este alimentul, cât de sățios va fi sau cât de ușor ne va fi să ne oprim din mâncat."
            : "Calories tell us how much energy a food provides. However, they do not tell us how nutritious or filling that food is, or how easy it may be to stop eating it."}
        </ArticleP>
        <ArticleP>
          {ro
            ? "De aceea, atunci când alegem ce mâncăm, este important să privim atât numărul de calorii, cât și calitatea alimentelor."
            : "For this reason, food choices should consider both the number of calories and the nutritional quality of the food."}
        </ArticleP>
      </section>

      {/* Module "Ce nu spune cifra calorică" / "What the number of calories
          does not tell you" -- positioned right after the intro (sec-0),
          before sec-1, same early-preview pattern already used in
          ControlulGreutatii.tsx. */}
      <div>
        <h2 className="font-serif font-bold text-foreground text-xl md:text-2xl mb-4">
          {ro ? "Ce nu îți spune numărul de calorii" : "What the number of calories does not tell you"}
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {WHAT_THE_NUMBER_DOESNT_SAY.map((item) => (
            <div key={item.labelRo} className="rounded-xl border border-border bg-card p-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2.5">
                <item.icon className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-foreground leading-snug">{ro ? item.labelRo : item.labelEn}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">{ro ? item.noteRo : item.noteEn}</p>
            </div>
          ))}
        </div>
      </div>

      <section id="sec-1">
        <ArticleH2>{ro ? "Caloriile contează, dar nu spun totul" : "Calories matter, but they do not tell the whole story"}</ArticleH2>
        <ArticleP>
          {ro
            ? "Pentru controlul greutății, numărul total de calorii consumate este important. Dacă obiectivul este scăderea în greutate, aportul caloric trebuie adaptat acestui obiectiv."
            : "For weight management, the total number of calories consumed is important. If the goal is weight loss, calorie intake needs to be adapted to that goal."}
        </ArticleP>
        <ArticleP>
          {ro
            ? "Totuși, o alimentație echilibrată nu se construiește doar prin numărarea caloriilor. Contează și dacă mesele oferă proteine, fibre, vitamine și minerale și dacă te ajută să te simți sătul."
            : "However, a balanced diet is not built by counting calories alone. It also matters whether meals provide protein, fibre, vitamins and minerals and whether they help you feel full."}
        </ArticleP>
        <ArticleP>
          {ro
            ? "Două zile cu același număr total de calorii pot fi foarte diferite. Una poate include mese hrănitoare și sățioase, iar cealaltă alimente care se consumă ușor, dar după care foamea poate reapărea mai repede."
            : "Two days with the same total number of calories can be very different. One may include nutritious and filling meals, while the other may include foods that are easy to eat but may leave you feeling hungry again sooner."}
        </ArticleP>
      </section>

      <section id="sec-2">
        <ArticleH2>{ro ? "Același număr de calorii, porții diferite" : "The same number of calories, different portion sizes"}</ArticleH2>
        <ArticleP>
          {ro
            ? "Unele alimente oferă multe calorii într-o cantitate mică. Altele conțin mai multă apă și fibre și permit formarea unei porții mai generoase pentru un număr asemănător de calorii."
            : "Some foods provide many calories in a small amount. Others contain more water and fibre and allow for a more generous portion with a similar number of calories."}
        </ArticleP>
        <ArticleP>
          {ro
            ? "Această diferență poartă numele de densitate calorică. Pe scurt, densitatea calorică ne arată câte calorii sunt concentrate într-o anumită cantitate de aliment."
            : "This difference is known as calorie density. In simple terms, calorie density describes how many calories are concentrated in a certain amount of food."}
        </ArticleP>
        <ArticleP>
          {ro
            ? "Nu este nevoie să calculezi densitatea calorică a fiecărui aliment. Este suficient să reții că două porții cu același număr de calorii pot avea dimensiuni foarte diferite."
            : "You do not need to calculate the calorie density of every food. It is enough to remember that two portions with the same number of calories can be very different in size."}
        </ArticleP>
        <ArticleP>
          {ro
            ? "Pentru o persoană care dorește să slăbească, mesele cu un volum potrivit și suficiente proteine și fibre pot fi mai ușor de menținut pe termen lung."
            : "For someone who wants to lose weight, meals with an appropriate volume and sufficient protein and fibre may be easier to maintain over time."}
        </ArticleP>
      </section>

      <section id="sec-3">
        <ArticleH2>{ro ? "Sațietatea contează" : "Satiety matters"}</ArticleH2>
        <ArticleP>
          {ro
            ? "Nu contează doar cât ai mâncat, ci și cât de sătul te simți după masă și cât timp se menține această senzație."
            : "It is not only how much you eat that matters, but also how full you feel after a meal and how long that feeling lasts."}
        </ArticleP>
        <ArticleP>
          {ro
            ? "Proteinele, fibrele, volumul alimentelor și structura mesei pot influența sațietatea."
            : "Protein, fibre, food volume and the overall composition of a meal can influence satiety."}
        </ArticleP>
        <ArticleP>
          {ro
            ? "O masă bine alcătuită nu urmărește doar să se încadreze într-un anumit număr de calorii. Ea trebuie să ofere nutrienți și să te ajute să ajungi confortabil până la următoarea masă."
            : "A well-balanced meal should not focus only on staying within a certain number of calories. It should also provide nutrients and help you feel comfortable until your next meal."}
        </ArticleP>
      </section>

      <section id="sec-4">
        <ArticleH2>{ro ? "De ce unele alimente se consumă ușor în exces" : "Why some foods are easy to overconsume"}</ArticleH2>
        <ArticleP>
          {ro
            ? "Unele alimente oferă multe calorii într-o porție mică și pot fi consumate repede, fără să ofere aceeași senzație de sațietate ca o masă completă."
            : "Some foods provide many calories in a small portion and can be eaten quickly without providing the same feeling of fullness as a complete meal."}
        </ArticleP>
        <ArticleP>
          {ro
            ? "Acest lucru nu înseamnă că trebuie eliminate complet. Frecvența, cantitatea și contextul în care sunt consumate sunt importante."
            : "This does not mean they need to be completely avoided. How often they are eaten, the amount consumed and the context in which they are included all matter."}
        </ArticleP>
        <ArticleP>
          {ro
            ? "Dacă obiectivul este scăderea în greutate, este util ca cea mai mare parte a meselor să fie formată din alimente care oferă proteine, fibre și un volum potrivit."
            : "If the goal is weight loss, it can be helpful for most meals to include foods that provide protein, fibre and an appropriate volume."}
        </ArticleP>
      </section>

      <section id="sec-5">
        <ArticleH2>{ro ? "Și alimentele nutritive conțin calorii" : "Nutritious foods also contain calories"}</ArticleH2>
        <ArticleP>
          {ro
            ? "Faptul că un aliment este nutritiv nu înseamnă că poate fi consumat în orice cantitate."
            : "The fact that a food is nutritious does not mean it can be consumed in unlimited amounts."}
        </ArticleP>
        <ArticleP>
          {ro
            ? "Nucile, semințele, avocado și uleiul de măsline pot face parte dintr-o alimentație echilibrată, dar au multe calorii într-o cantitate relativ mică."
            : "Nuts, seeds, avocado and olive oil can be part of a balanced diet, but they provide many calories in a relatively small amount."}
        </ArticleP>
        <ArticleP>
          {ro
            ? "Dacă obiectivul este scăderea în greutate, porția acestor alimente rămâne importantă."
            : "If the goal is weight loss, the portion size of these foods remains important."}
        </ArticleP>
        <ArticleP>
          {ro
            ? "Nu trebuie să alegem între ideea că „doar caloriile contează” și ideea că „numărul de calorii nu contează deloc”. Ambele afirmații simplifică prea mult realitatea."
            : "We do not need to choose between the idea that “only calories matter” and the idea that “calories do not matter at all”. Both statements oversimplify the issue."}
        </ArticleP>
      </section>

      <section id="sec-6">
        <ArticleH2>{ro ? "Ce contează, de fapt?" : "What actually matters?"}</ArticleH2>
        <ArticleP>
          {ro
            ? "Pentru controlul greutății, contează numărul total de calorii consumate."
            : "For weight management, the total number of calories consumed matters."}
        </ArticleP>
        <ArticleP>
          {ro
            ? "Pentru sănătate, sațietate și menținerea schimbărilor pe termen lung, contează și alimentele din care provin aceste calorii."
            : "For health, satiety and maintaining changes over time, the foods those calories come from also matter."}
        </ArticleP>
        <ArticleP>
          {ro
            ? "O alimentație bine alcătuită trebuie să ofere suficienți nutrienți, să includă mese sățioase și să poată fi adaptată preferințelor, obiectivelor și vieții reale."
            : "A well-balanced diet should provide sufficient nutrients, include satisfying meals and be adaptable to individual preferences, goals and everyday life."}
        </ArticleP>
        <ArticleP>
          {ro
            ? "Caloriile oferă o informație importantă, dar nu descriu singure întreaga valoare a unui aliment."
            : "Calories provide important information, but they do not describe the full nutritional value of a food."}
        </ArticleP>
      </section>

      {/* Module "Trei repere pentru viața reală" / "Three practical
          principles" -- closing recap, same position/pattern as
          ControlulGreutatii.tsx's second module (after the last section,
          before the shell's own "Citește și" block). */}
      <div>
        <h2 className="font-serif font-bold text-foreground text-xl md:text-2xl mb-4">
          {ro ? "Trei repere pentru viața reală" : "Three practical principles"}
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {THREE_REAL_LIFE_POINTS.map((item) => (
            <div key={item.labelRo} className="rounded-xl border border-border bg-card p-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2.5">
                <item.icon className="w-5 h-5 text-primary" aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-foreground leading-snug">{ro ? item.labelRo : item.labelEn}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-snug">{ro ? item.noteRo : item.noteEn}</p>
            </div>
          ))}
        </div>
      </div>
    </ArticleShellPremium>
  );
}
