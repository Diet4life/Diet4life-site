import { Coffee, Salad } from "lucide-react";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { ArticleBreadcrumbs } from "@/components/article/ArticleBreadcrumbs";
import { ArticleHero } from "@/components/article/ArticleHero";
import { TableOfContentsDesktop, TableOfContentsMobile, TocItem } from "@/components/article/TableOfContents";
import { KeyIdeaBox } from "@/components/article/KeyIdeaBox";
import { ComparisonSection } from "@/components/article/ComparisonSection";
import { ClinicianNoteBox } from "@/components/article/ClinicianNoteBox";
import { ChecklistCard } from "@/components/article/ChecklistCard";
import { ArticleCTA } from "@/components/article/ArticleCTA";
import { SourcesAccordion, SourceLink } from "@/components/article/SourcesAccordion";
import { RelatedArticles, RelatedArticle } from "@/components/article/RelatedArticles";

const SITE_URL = "https://diet4lifeconcept.ro";
const PAGE_PATH = "/articole/de-ce-nu-slabesc-daca-mananc-putin";
const CANONICAL_URL = `${SITE_URL}${PAGE_PATH}`;
const IMAGE_PATH = "/images/de-ce-nu-slabesc-daca-mananc-putin.webp";
const IMAGE_URL = `${SITE_URL}${IMAGE_PATH}`;

const AUTHOR_NAME = "Dr. Andreea Ionescu";
const AUTHOR_TITLE = "Dietetician-Nutriționist";
const PUBLISHED_DATE = "2026-08-27";
const PUBLISHED_LABEL = "27 august 2026";
const MODIFIED_DATE = "2026-08-27";

const TOC_ITEMS: TocItem[] = [
  { id: "putin-volum", label: "Puțin ca volum nu înseamnă puține calorii" },
  { id: "usor-mananci-mult", label: "De ce e ușor să mănânci mai mult decât crezi" },
  { id: "organism-adaptat", label: "Un organism adaptat la lipsă" },
  { id: "nu-doar-vointa", label: "Nu e doar despre voință" },
  { id: "ce-poti-face", label: "Ce poți face înainte să mănânci și mai puțin" },
  { id: "nu-esti-tu", label: "Nu ești tu împotriva cântarului" },
  { id: "surse", label: "Surse și lecturi suplimentare" },
];

const SOURCES: SourceLink[] = [
  { label: "Studiul despre alimentele ultraprocesate și supraalimentarea spontană", source: "Cell Metabolism", href: "https://pubmed.ncbi.nlm.nih.gov/31105044/" },
  { label: "Rezumatul studiului, realizat de NIH", source: "NIH", href: "https://www.nih.gov/news-events/news-releases/nih-study-finds-heavily-processed-foods-cause-overeating-weight-gain" },
  { label: "Analiza ipotezei „genelor economicoase”", source: "PubMed", href: "https://pubmed.ncbi.nlm.nih.gov/18852699/" },
  { label: "Revizuire despre evoluție și obezitate", source: "PMC", href: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4031802/" },
  { label: "Revizuire sistematică despre adaptarea metabolică", source: "PubMed", href: "https://pubmed.ncbi.nlm.nih.gov/33762040/" },
  { label: "Materialul OMS despre obezitate", source: "OMS", href: "https://www.who.int/en/news-room/fact-sheets/detail/obesity-and-overweight" },
];

const RELATED_ARTICLES: RelatedArticle[] = [
  {
    title: "Sunt toate caloriile la fel?",
    excerpt: "O calorie este mereu aceeași unitate de energie. Dar nu toate sursele de calorii hrănesc, satură sau se comportă la fel în organism.",
    href: "/articole/sunt-toate-caloriile-la-fel",
    img: "/images/sunt-toate-caloriile-la-fel.webp",
  },
  {
    title: "Ghidul Complet de Nutriție Bariatrică",
    excerpt: "Tot ce trebuie să știi despre alimentația înainte și după intervenția chirurgicală pentru obezitate.",
    href: "/blog",
    img: "/images/blog-bariatric.png",
  },
  {
    title: "10 Mituri Alimentare Demontate",
    excerpt: "Află adevărul științific din spatele celor mai comune credințe despre dietă, carbohidrați și grăsimi.",
    href: "/blog",
    img: "/images/blog-myths.png",
  },
];

const p = "text-[17px] md:text-[18px] leading-[1.7] text-foreground/90 mb-5";
const h2 = "text-2xl sm:text-3xl font-serif font-bold text-foreground mt-12 mb-5 scroll-mt-28";

export default function DeCeNuSlabescDacaMananc() {
  useDocumentSeo({
    title: "De ce nu slăbesc dacă mănânc puțin?",
    description:
      "Ai puține mese, dar greutatea nu scade? Află cum densitatea calorică, foamea și mediul alimentar îți pot influența progresul.",
    canonical: CANONICAL_URL,
    meta: [
      { property: "og:type", content: "article" },
      { property: "og:url", content: CANONICAL_URL },
      { property: "og:title", content: "De ce nu slăbesc dacă mănânc puțin?" },
      {
        property: "og:description",
        content: "Ai puține mese, dar greutatea nu scade? Află cum densitatea calorică, foamea și mediul alimentar îți pot influența progresul.",
      },
      { property: "og:image", content: IMAGE_URL },
      { property: "og:image:width", content: "1600" },
      { property: "og:image:height", content: "900" },
      { property: "article:author", content: AUTHOR_NAME },
      { property: "article:published_time", content: PUBLISHED_DATE },
      { property: "article:modified_time", content: MODIFIED_DATE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "De ce nu slăbesc dacă mănânc puțin?" },
      {
        name: "twitter:description",
        content: "Ai puține mese, dar greutatea nu scade? Află cum densitatea calorică, foamea și mediul alimentar îți pot influența progresul.",
      },
      { name: "twitter:image", content: IMAGE_URL },
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: "De ce nu slăbesc dacă mănânc puțin?",
        description:
          "Ai puține mese, dar greutatea nu scade? Află cum densitatea calorică, foamea și mediul alimentar îți pot influența progresul.",
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
          { "@type": "ListItem", position: 3, name: "De ce nu slăbesc, deși mănânc puțin?", item: CANONICAL_URL },
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
            { label: "De ce nu slăbesc, deși mănânc puțin?" },
          ]}
        />
      </div>

      <header className="pt-6 pb-8 sm:pt-8 sm:pb-10">
        <div className="container mx-auto px-4">
          <ArticleHero
            category="Nutriție și slăbire"
            title="De ce nu slăbesc, deși mănânc puțin?"
            subtitle="Poți avea puține mese și, totuși, să consumi mai multă energie decât îți imaginezi. Explicația nu ține doar de voință."
            authorName={AUTHOR_NAME}
            authorTitle={AUTHOR_TITLE}
            publishedLabel={PUBLISHED_LABEL}
            readTimeLabel="7 min citire"
          />
        </div>
      </header>

      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto mb-10 sm:mb-14">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-sm border border-border">
            <img
              src={IMAGE_PATH}
              alt="Comparație între alimente cu densități calorice diferite"
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
              <p className="text-lg sm:text-xl font-serif italic text-foreground/80 leading-relaxed mb-6 border-l-2 border-primary/30 pl-5">
                „Nu înțeleg de ce nu slăbesc. Nu mănânc mult. Uneori am doar una sau două mese pe zi.”
              </p>

              <p className={p}>
                Este una dintre frazele pe care le aud cel mai des în cabinet. Poate ai spus-o și tu, mai ales când cântarul nu reflectă efortul depus.
              </p>
              <p className={p}>
                Primul meu gând, ca nutriționist, nu este „mănânci prea mult” și nici „nu ai suficientă voință”. Prefer să descoperim împreună ce înseamnă, în cazul tău, „mănânc puțin” — poți avea puține mese, cu porții care nu par mari, dar care concentrează multă energie, iar foamea, somnul, stresul, programul și istoricul dietelor tale influențează și ele alegerile alimentare.
              </p>

              <h2 id="putin-volum" className={h2}>Puțin ca volum nu înseamnă puține calorii</h2>
              <p className={p}>
                Organismul nu numără mesele — primește energie din tot ce mănânci și bei într-o zi, indiferent dacă vine dintr-o singură masă sau din cinci.
              </p>
              <p className={p}>
                De aceea e util să separăm trei lucruri: câte <strong>mese</strong> ai pe zi, cât de mare este <strong>volumul</strong> mâncării și câtă <strong>energie</strong> conține de fapt. Poți avea puține mese, cu volum mic, și totuși un aport caloric suficient de mare cât să nu slăbești.
              </p>

              <KeyIdeaBox
                label="Ideea principală"
                text="Organismul nu numără mesele. Puțin ca volum nu înseamnă automat puține calorii."
              />

              <p className={p}>
                O cafea cu lapte și sirop, un croasant și un suc nu par „multă mâncare” — se consumă repede, nu prea satură, dar pot furniza multă energie. O farfurie voluminoasă cu legume, proteine și cereale integrale poate avea, în schimb, mai puține calorii și te ține sătul mult mai mult timp.
              </p>
              <p className={p}>
                Același lucru e valabil pentru alimentele „sănătoase” dense caloric: uleiul de măsline, avocado, nucile, untul de arahide sau sosurile și dressingurile. Sunt valoroase nutrițional, dar o cantitate mică aduce multe calorii — o salată cu mult ulei, brânză și avocado poate conține mai multă energie decât pare, nu pentru că ar fi o alegere greșită, ci pentru că am adunat mai multe ingrediente concentrate caloric în aceeași farfurie.
              </p>
              <p className={p}>
                Nu îți voi spune să renunți automat la ele, ci te voi ajuta să găsești cantitatea potrivită pentru obiectivul tău.
              </p>

              <ComparisonSection
                title="Puțin ca volum nu înseamnă întotdeauna puține calorii"
                columns={[
                  {
                    title: "Masă mică și densă caloric",
                    icon: Coffee,
                    items: [
                      "croasant",
                      "cafea cu lapte și sirop",
                      "suc",
                      "se consumă rapid",
                      "poate oferi sațietate redusă",
                    ],
                  },
                  {
                    title: "Masă mai voluminoasă și echilibrată",
                    icon: Salad,
                    items: [
                      "sursă de proteine",
                      "legume",
                      "cartofi, leguminoase sau cereale integrale",
                      "necesită mai multă mestecare",
                      "poate oferi sațietate mai îndelungată",
                    ],
                  },
                ]}
              />

              <h2 id="usor-mananci-mult" className={h2}>De ce e ușor să mănânci mai mult decât crezi</h2>
              <p className={p}>
                Multe alimente ultraprocesate sunt dense caloric, sărace în fibre și se mănâncă repede — combină grăsimi, carbohidrați rafinați, sare și arome într-un mod foarte atrăgător. Cum semnalele de sațietate nu apar instant, e ușor să mănânci mult înainte ca organismul să-ți transmită clar că ai mâncat destul.
              </p>
              <p className={p}>
                Un studiu clinic realizat la National Institutes of Health a comparat o alimentație bazată pe produse ultraprocesate cu una minim procesată, participanții putând mânca oricât doreau. În perioada cu alimente ultraprocesate au consumat spontan cu aproximativ 500 de calorii mai mult pe zi și au luat în greutate; în perioada cu alimente minim procesate au consumat mai puțină energie și au scăzut în greutate. Studiul a fost mic și de scurtă durată — nu demonstrează că orice produs procesat provoacă automat îngrășare, indiferent de cantitate —, dar arată că forma alimentelor poate influența cât mâncăm fără să ne propunem asta.
              </p>
              <p className={p}>
                Ceva similar se întâmplă cu foamea acumulată peste zi. Dacă nu mănânci ore în șir, e firesc să ajungi seara foarte flămând, iar dacă la foame se adaugă oboseala și graba, crește șansa să mănânci mai mult decât ți-ai propus — pâine, brânzeturi, mezeluri, ceva prăjit, sosuri, desert, plus tot ce ai gustat cât ai gătit. În memorie rămâne „am avut o singură masă”, și e adevărat; energetic însă, acea masă poate acoperi sau depăși necesarul zilei. Nu înseamnă că toată lumea trebuie să aibă cinci mese pe zi — pentru mulți funcționează bine două sau trei —, ci că ritmul ales n-ar trebui să producă o foame atât de mare încât să devină greu să-ți reglezi porțiile. Multă energie se poate strecura și pe lângă mesele „oficiale”: uleiul folosit la gătit, sosurile, zahărul din cafea, sucurile, alcoolul, gustările luate în picioare și mesele mai bogate din weekend — fără să fie nevoie să devii obsedat de fiecare calorie.
              </p>

              <h2 id="organism-adaptat" className={h2}>Un organism adaptat la lipsă, într-o lume a abundenței</h2>
              <p className={p}>
                Organismul uman nu s-a format în lumea de azi. De-a lungul evoluției, hrana nu era mereu disponibilă — trebuia căutată, vânată sau cultivată, iar perioadele de abundență puteau fi urmate de perioade de lipsă. Capacitatea de a depozita surplusul de energie ca grăsime putea fi, în acel context, un avantaj — o rezervă la care organismul apela când mâncarea lipsea.
              </p>
              <p className={p}>
                Această idee e cunoscută drept ipoteza „genelor economicoase” — o ipoteză încă dezbătută, nu un fapt demonstrat. Dar surprinde ceva util: biologia noastră s-a schimbat mult mai lent decât mediul în care trăim. Astăzi mâncarea e disponibilă la orice oră, o comandăm fără să ieșim din casă și suntem expuși permanent la reclame și mirosuri care ne stimulează apetitul — avem, într-un fel, un organism adaptat pentru lipsă, într-o lume în care problema principală a devenit abundența.
              </p>
              <p className={p}>
                Acest fundal contează și când slăbești efectiv: corpul răspunde la deficitul alimentar — foamea poate crește, un corp mai ușor are nevoie de mai puțină energie, ne mișcăm adesea mai puțin fără să observăm, iar uneori apare și o adaptare metabolică, ceva mai amplă decât explică doar greutatea pierdută. Nu înseamnă că metabolismul e „blocat”, nici că mănânci atât de puțin încât nu mai slăbești deloc — dacă există un deficit real și susținut, organismul folosește din rezerve. Înseamnă doar că slăbirea e un proces dinamic, de reevaluat pe parcurs, iar o restricție prea mare crește foamea și riscul de a compensa ulterior.
              </p>

              <h2 id="nu-doar-vointa" className={h2}>Nu e doar despre voință</h2>
              <p className={p}>
                Greutatea nu e o simplă măsură a disciplinei — e influențată de biologie, genetică, mediul alimentar, somn, stres, activitate fizică, medicamente, sănătate mintală și experiențele anterioare cu dietele. Organizația Mondială a Sănătății descrie obezitatea drept o afecțiune cronică și recidivantă, rezultată din interacțiuni complexe între genetică, neurobiologie, comportament și mediu — nu dintr-o singură cauză.
              </p>

              <ClinicianNoteBox
                label="Ce observ în cabinet"
                text="Nu caut un vinovat. Analizez cum sunt construite mesele, cât de sățioase sunt și ce se întâmplă între ele."
                authorName={AUTHOR_NAME}
                authorTitle={AUTHOR_TITLE}
              />

              <p className={p}>
                De aceea, când cineva îmi spune că nu slăbește deși mănâncă puțin, caut o explicație: cum arată mesele, cât de flămândă ajunge persoana seara, cum diferă weekendul, cât doarme, cât se mișcă și ce diete a urmat până acum. Două persoane care spun „mănânc puțin” pot avea situații complet diferite, iar recomandările generale nu sunt mereu suficiente.
              </p>

              <h2 id="ce-poti-face" className={h2}>Ce poți face înainte să mănânci și mai puțin</h2>
              <p className={p}>
                Primul impuls, când cântarul nu se mișcă, e adesea „de mâine mănânc și mai puțin” — dar o restricție suplimentară nu e mereu soluția. Înainte să elimini alimente sau mese, câteva zile de observație pot ajuta mai mult. Notează:
              </p>

              <ChecklistCard
                title="Notează, timp de câteva zile"
                items={[
                  "tot ce mănânci și bei, inclusiv uleiurile și sosurile",
                  "momentele când apare o foame intensă",
                  "cât de repede mănânci și dacă te simți sătul după masă",
                  "dacă mănânci din foame, oboseală, stres sau plictiseală",
                ]}
              />

              <p className={p}>
                O masă echilibrată include, de obicei, o sursă de proteine, legume, carbohidrați bogați în fibre și o cantitate moderată de grăsimi. Mai pot ajuta câteva schimbări simple:
              </p>

              <ChecklistCard
                title="Câteva schimbări simple"
                items={[
                  "pune mâncarea în farfurie, nu mânca direct din ambalaj, și mănâncă mai încet",
                  "alege mai des alimente minim procesate",
                  "bea apă în locul băuturilor calorice de zi cu zi",
                  "evită să ajungi la cină extrem de flămând",
                  "urmărește tendința greutății pe câteva săptămâni, nu o singură cântărire",
                ]}
              />

              <p className={p}>
                Nu trebuie să numeri calorii toată viața — de multe ori, o perioadă scurtă de observație e suficientă ca să identifici ce îți încetinește progresul.
              </p>

              <h2 id="nu-esti-tu" className={h2}>Nu ești tu împotriva cântarului</h2>
              <p className={p}>
                Dacă ai doar una sau două mese pe zi și tot nu slăbești, nu înseamnă că organismul tău e defect. Nu ai nevoie să mănânci cât mai puțin posibil, ci de o alimentație care să-ți ofere sațietate, nutrienți și energia potrivită pentru corpul și obiectivul tău.
              </p>

              <ArticleCTA
                title="Simți că mănânci puțin, dar nu reușești să slăbești?"
                text="În cadrul evaluării analizăm mesele, programul, senzația de foame și obiceiurile tale, fără judecată și fără diete extreme."
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
