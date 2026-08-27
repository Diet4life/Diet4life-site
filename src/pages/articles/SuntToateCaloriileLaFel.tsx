import { Apple, Cookie } from "lucide-react";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { ArticleBreadcrumbs } from "@/components/article/ArticleBreadcrumbs";
import { ArticleHero } from "@/components/article/ArticleHero";
import { TableOfContentsDesktop, TableOfContentsMobile, TocItem } from "@/components/article/TableOfContents";
import { KeyIdeaBox } from "@/components/article/KeyIdeaBox";
import { ComparisonSection } from "@/components/article/ComparisonSection";
import { ChecklistCard } from "@/components/article/ChecklistCard";
import { ArticleCTA } from "@/components/article/ArticleCTA";
import { SourcesAccordion, SourceLink } from "@/components/article/SourcesAccordion";
import { RelatedArticles, RelatedArticle } from "@/components/article/RelatedArticles";

const SITE_URL = "https://diet4lifeconcept.ro";
const PAGE_PATH = "/articole/sunt-toate-caloriile-la-fel";
const CANONICAL_URL = `${SITE_URL}${PAGE_PATH}`;
const IMAGE_PATH = "/images/sunt-toate-caloriile-la-fel.webp";
const IMAGE_URL = `${SITE_URL}${IMAGE_PATH}`;

const AUTHOR_NAME = "Dr. Andreea Ionescu";
const AUTHOR_TITLE = "Dietetician-Nutriționist";
const PUBLISHED_DATE = "2026-08-27";
const PUBLISHED_LABEL = "27 august 2026";
const MODIFIED_DATE = "2026-08-27";

const TOC_ITEMS: TocItem[] = [
  { id: "caloriile-conteaza", label: "Dacă vreau să slăbesc, caloriile contează?" },
  { id: "200-kcal", label: "200 kcal pot arăta foarte diferit" },
  { id: "efect-termic", label: "Contează și de unde provin caloriile" },
  { id: "ultraprocesate", label: "De ce unele alimente ne fac să mâncăm mai mult?" },
  { id: "diete-diferite", label: "Dacă mâncăm același număr de calorii" },
  { id: "ce-urmaresc", label: "Calorii sau calitatea alimentelor?" },
  { id: "raspuns", label: "Care este răspunsul?" },
  { id: "surse", label: "Surse și lecturi suplimentare" },
];

const SOURCES: SourceLink[] = [
  { label: "Studiul controlat privind alimentația ultraprocesată și supraalimentarea spontană", source: "Cell Metabolism", href: "https://pubmed.ncbi.nlm.nih.gov/31105044/" },
  { label: "Rezumatul studiului, realizat de NIH", source: "NIH", href: "https://www.nih.gov/news-events/news-releases/nih-study-finds-heavily-processed-foods-cause-overeating-weight-gain" },
];

const RELATED_ARTICLES: RelatedArticle[] = [
  {
    title: "De ce nu slăbesc, deși mănânc puțin?",
    excerpt: "Poți avea puține mese și, totuși, să consumi mai multă energie decât îți imaginezi. Explicația nu ține doar de voință.",
    href: "/articole/de-ce-nu-slabesc-daca-mananc-putin",
    img: "/images/de-ce-nu-slabesc-daca-mananc-putin.webp",
  },
  {
    title: "Ghidul Complet de Nutriție Bariatrică",
    excerpt: "Tot ce trebuie să știi despre alimentația înainte și după intervenția chirurgicală pentru obezitate.",
    href: "/blog",
    img: "/images/blog-bariatric.png",
  },
  {
    title: "Beneficiile Dietei Mediteraneene",
    excerpt: "De ce dieta mediteraneană este considerată constant cea mai sănătoasă abordare nutrițională din lume.",
    href: "/blog",
    img: "/images/blog-med.png",
  },
];

const p = "text-[17px] md:text-[18px] leading-[1.7] text-foreground/90 mb-5";
const h2 = "text-2xl sm:text-3xl font-serif font-bold text-foreground mt-12 mb-5 scroll-mt-28";

export default function SuntToateCaloriileLaFel() {
  useDocumentSeo({
    title: "Sunt toate caloriile la fel?",
    description:
      "O calorie e o unitate de energie, dar nu toate sursele hrănesc și satură la fel. Descoperă de ce contează atât cantitatea, cât și calitatea alimentelor.",
    canonical: CANONICAL_URL,
    meta: [
      { property: "og:type", content: "article" },
      { property: "og:url", content: CANONICAL_URL },
      { property: "og:title", content: "Sunt toate caloriile la fel?" },
      {
        property: "og:description",
        content: "O calorie e o unitate de energie, dar nu toate sursele hrănesc și satură la fel. Descoperă de ce contează atât cantitatea, cât și calitatea alimentelor.",
      },
      { property: "og:image", content: IMAGE_URL },
      { property: "og:image:width", content: "1600" },
      { property: "og:image:height", content: "900" },
      { property: "article:author", content: AUTHOR_NAME },
      { property: "article:published_time", content: PUBLISHED_DATE },
      { property: "article:modified_time", content: MODIFIED_DATE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Sunt toate caloriile la fel?" },
      {
        name: "twitter:description",
        content: "O calorie e o unitate de energie, dar nu toate sursele hrănesc și satură la fel. Descoperă de ce contează atât cantitatea, cât și calitatea alimentelor.",
      },
      { name: "twitter:image", content: IMAGE_URL },
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: "Sunt toate caloriile la fel?",
        description:
          "O calorie e o unitate de energie, dar nu toate sursele hrănesc și satură la fel. Descoperă de ce contează atât cantitatea, cât și calitatea alimentelor.",
        image: IMAGE_URL,
        author: { "@type": "Person", name: AUTHOR_NAME, jobTitle: AUTHOR_TITLE },
        publisher: {
          "@type": "Organization",
          name: "Diet4Life Concept",
          logo: { "@type": "ImageObject", url: `${SITE_URL}/favicon.svg` },
        },
        datePublished: PUBLISHED_DATE,
        dateModified: MODIFIED_DATE,
        mainEntityOfPage: { "@type": "WebPage", "@id": CANONICAL_URL },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Acasă", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Articole", item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: "Sunt toate caloriile la fel?", item: CANONICAL_URL },
        ],
      },
    ],
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 pt-6">
        <ArticleBreadcrumbs
          items={[
            { label: "Acasă", href: "/" },
            { label: "Articole", href: "/blog" },
            { label: "Sunt toate caloriile la fel?" },
          ]}
        />
      </div>

      <header className="pt-6 pb-8 sm:pt-8 sm:pb-10">
        <div className="container mx-auto px-4">
          <ArticleHero
            category="Nutriție"
            title="Sunt toate caloriile la fel?"
            subtitle="O calorie este mereu aceeași unitate de energie. Dar nu toate sursele de calorii hrănesc, satură sau se comportă la fel în organism."
            authorName={AUTHOR_NAME}
            authorTitle={AUTHOR_TITLE}
            publishedLabel={PUBLISHED_LABEL}
            readTimeLabel="6 min citire"
          />
        </div>
      </header>

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto mb-10 sm:mb-14">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-sm border border-border">
            <img
              src={IMAGE_PATH}
              alt="Comparație vizuală între alimente cu aceeași valoare calorică"
              className="w-full h-full object-cover"
              width={1600}
              height={900}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20 sm:pb-28">
        <div className="max-w-5xl mx-auto">
          <TableOfContentsMobile items={TOC_ITEMS} heading="În acest articol" />

          <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-16">
            <article className="max-w-[720px]">
              <p className={p}>
                Dacă 100 de calorii sunt 100 de calorii, atunci contează cu adevărat dacă provin dintr-un iaurt, dintr-o mână de nuci sau din câțiva biscuiți?
              </p>
              <p className={p}>Da și nu.</p>
              <p className={p}>
                Din punct de vedere strict energetic, o calorie este o calorie. Este o unitate prin care măsurăm energia. Dar atunci când vorbim despre alimentație, organismul nostru nu primește doar energie. Primește și proteine, carbohidrați, grăsimi, fibre, vitamine, minerale și multe alte componente ale alimentelor.
              </p>
              <p className={p}>Iar aici apar diferențele.</p>

              <h2 id="caloriile-conteaza" className={h2}>Dacă vreau să slăbesc, caloriile contează?</h2>
              <p className={p}>Da.</p>
              <p className={p}>
                Greutatea corporală este influențată de balanța dintre energia pe care o consumăm și energia pe care organismul o utilizează. Dacă, în timp, mâncăm mai multă energie decât consumăm, surplusul poate duce la creștere în greutate.
              </p>
              <p className={p}>
                Asta înseamnă că nu putem spune că „nu contează caloriile” doar pentru că un aliment este sănătos.
              </p>
              <p className={p}>
                Nucile, avocado, uleiul de măsline sau untul de arahide sunt alimente cu valoare nutritivă bună, dar sunt și concentrate energetic. Cantitatea contează.
              </p>
              <p className={p}>Însă numărul de calorii nu spune întreaga poveste.</p>

              <h2 id="200-kcal" className={h2}>200 kcal pot arăta foarte diferit</h2>
              <p className={p}>
                Gândește-te la 200 kcal provenite dintr-o combinație de iaurt, fruct și câteva nuci și la aproximativ aceeași energie provenită dintr-un produs dulce.
              </p>
              <p className={p}>Pe hârtie, avem un număr asemănător de calorii.</p>
              <p className={p}>
                Dar prima variantă poate aduce proteine, fibre, vitamine, minerale și un volum mai mare de alimente. Cealaltă poate conține mai puține proteine și fibre și poate fi mult mai ușor de consumat rapid, fără să ofere aceeași senzație de sațietate.
              </p>
              <p className={p}>Așa ajungem la una dintre diferențele importante dintre alimente:</p>

              <KeyIdeaBox label="Ideea principală" text="Nu toate caloriile ne satură la fel." />

              <ComparisonSection
                title="Aceeași energie, compoziții diferite"
                columns={[
                  {
                    title: "Iaurt + fruct + câteva nuci",
                    icon: Apple,
                    items: [
                      "proteine",
                      "fibre din fruct",
                      "vitamine și minerale",
                      "volum mai mare de alimente",
                      "sațietate mai îndelungată",
                    ],
                  },
                  {
                    title: "Produs dulce",
                    icon: Cookie,
                    items: [
                      "puține proteine și fibre",
                      "se consumă rapid",
                      "densitate calorică mare",
                      "sațietate redusă",
                      "ușor de consumat în exces",
                    ],
                  },
                ]}
              />

              <h2 id="efect-termic" className={h2}>Contează și de unde provin caloriile</h2>
              <p className={p}>Proteinele, carbohidrații și grăsimile nu sunt procesate identic de organism.</p>
              <p className={p}>
                Pentru a digera și metaboliza alimentele, organismul consumă el însuși energie. Fenomenul se numește efect termic al alimentelor.
              </p>
              <p className={p}>
                Proteinele au cel mai mare efect termic dintre macronutrienți. Cercetările arată că mesele cu un conținut mai mare de proteine determină, în general, un consum energetic postprandial mai mare decât mesele cu mai puține proteine.
              </p>
              <p className={p}>
                Proteinele au și un rol important în menținerea masei musculare și în controlul sațietății.
              </p>
              <p className={p}>
                Asta nu înseamnă că „proteinele nu se pun” sau că putem mânca orice cantitate fără să conteze energia totală.
              </p>
              <p className={p}>
                Înseamnă doar că organismul nu tratează toate alimentele identic doar pentru că au aceeași valoare calorică.
              </p>

              <h2 id="ultraprocesate" className={h2}>Atunci de ce unele alimente ne fac să mâncăm mai mult?</h2>
              <p className={p}>Aici lucrurile devin interesante.</p>
              <p className={p}>
                Într-un studiu controlat realizat de cercetătorii de la National Institutes of Health, participanții au primit, în perioade diferite, o alimentație predominant ultraprocesată și una bazată pe alimente minim procesate.
              </p>
              <p className={p}>Li s-a permis să mănânce cât doreau.</p>
              <p className={p}>
                În perioada cu alimente ultraprocesate, participanții au ajuns să consume spontan cu aproximativ 500 kcal mai mult pe zi și au crescut în greutate.
              </p>
              <p className={p}>Nu pentru că acele calorii ar fi încălcat legile metabolismului.</p>
              <p className={p}>
                Ci pentru că anumite caracteristici ale alimentelor — densitatea energetică, textura, viteza cu care sunt consumate, combinația de nutrienți și gradul de procesare — pot influența cât de mult ajungem să mâncăm.
              </p>
              <p className="text-lg sm:text-xl font-serif italic text-foreground/80 leading-relaxed mb-6 border-l-2 border-primary/30 pl-5">
                Cu alte cuvinte, uneori problema nu este doar „câte calorii are alimentul?”, ci și „cât de ușor este să mănânc prea multe calorii din el?”
              </p>

              <h2 id="diete-diferite" className={h2}>Dar dacă două persoane mănâncă exact același număr de calorii?</h2>
              <p className={p}>Nici atunci alimentația lor nu este neapărat echivalentă.</p>
              <p className={p}>
                O dietă de 1.800 kcal poate fi construită din legume, fructe, cereale integrale, leguminoase, surse adecvate de proteine și grăsimi nesaturate.
              </p>
              <p className={p}>
                Tot 1.800 kcal pot proveni predominant din produse sărace în fibre și micronutrienți, cu multe zaharuri libere, grăsimi saturate și sare.
              </p>
              <p className={p}>Valoarea energetică poate fi aceeași. Valoarea nutrițională nu este.</p>
              <p className={p}>
                Iar pe termen lung ne interesează mai mult decât cifra de pe cântar. Ne interesează sănătatea cardiovasculară, masa musculară, sănătatea metabolică, digestia, aportul de micronutrienți și capacitatea de a menține un anumit stil alimentar.
              </p>

              <h2 id="ce-urmaresc" className={h2}>Deci ce ar trebui să urmăresc: caloriile sau calitatea alimentelor?</h2>
              <p className={p}>Nu trebuie să alegem între ele.</p>
              <p className={p}>Pentru controlul greutății, cantitatea de energie contează.</p>
              <p className={p}>
                Pentru sănătate, sațietate și sustenabilitatea alimentației, contează foarte mult și alimentele din care obținem acea energie.
              </p>
              <p className={p}>
                În practică, înainte să te uiți doar la cifra „kcal” de pe etichetă, întreabă-te și:
              </p>

              <ChecklistCard
                title="Pe lângă „câte calorii are?”, întreabă-te și:"
                items={[
                  "Îmi aduce proteine?",
                  "Îmi aduce fibre?",
                  "Îmi oferă vitamine și minerale?",
                  "Mă satură?",
                  "Cât de ușor este să mănânc mai mult decât am nevoie?",
                ]}
              />

              <h2 id="raspuns" className={h2}>Și atunci, care este răspunsul?</h2>
              <p className={p}>O calorie este o calorie ca unitate de energie.</p>
              <p className={p}>
                Dar 100 de calorii din două alimente diferite nu înseamnă automat aceeași valoare nutrițională, aceeași sațietate sau același efect asupra alegerilor alimentare pe parcursul zilei.
              </p>
              <p className={p}>De aceea, o alimentație echilibrată nu înseamnă să numeri obsesiv fiecare calorie.</p>
              <p className={p}>Înseamnă să înțelegi că și cantitatea contează, și calitatea contează.</p>
              <p className="text-lg sm:text-xl font-serif italic text-foreground/80 leading-relaxed mb-6 border-l-2 border-primary/30 pl-5">
                Poate că întrebarea utilă nu este doar „câte calorii are?”, ci „ce primesc din aceste calorii?”
              </p>

              <ArticleCTA
                title="Vrei să înțelegi mai bine ce hrănește, de fapt, alimentația ta?"
                text="În cadrul evaluării analizăm nu doar caloriile, ci și calitatea, sațietatea și echilibrul nutrițional al meselor tale — adaptate stilului tău de viață, fără reguli rigide."
                buttonLabel="Programează o evaluare nutrițională"
                href="/contact"
              />

              <p className="text-sm text-muted-foreground italic mb-5">
                Articolul are scop informativ și nu înlocuiește consultația medicală sau evaluarea nutrițională individuală.
              </p>

              <div id="surse" className="scroll-mt-28">
                <SourcesAccordion heading="Surse și lecturi suplimentare" sources={SOURCES} />
              </div>
            </article>

            <aside>
              <TableOfContentsDesktop items={TOC_ITEMS} heading="În acest articol" />
            </aside>
          </div>

          <RelatedArticles heading="Articole recomandate" items={RELATED_ARTICLES} readMoreLabel="Citește articolul" />
        </div>
      </div>
    </div>
  );
}
