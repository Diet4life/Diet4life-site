import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArticleShell, ArticleH2, ArticleP } from "@/components/nutrihub/ArticleShell";

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
      category="NUTRIȚIE ECHILIBRATĂ"
      title="Nutriție echilibrată: cum arată în viața reală?"
      related={[
        { label: "Controlul greutății: de ce nu se reduce la „mănâncă mai puțin”", href: "/nutrihub/controlul-greutatii" },
        { label: "De ce este importantă proteina și de câtă avem nevoie?", href: "/nutrihub/cata-proteina-am-nevoie" },
        { label: "Câte calorii am nevoie, de fapt?", href: "/nutrihub/cate-calorii-am-nevoie" },
        { label: "Fibrele alimentare: de ce sunt importante", href: "/nutrihub/fibrele-alimentare" },
        { label: "Sunt toate caloriile la fel?", href: "/nutrihub/sunt-toate-caloriile-la-fel" },
      ]}
      sources={[
        "World Health Organization & Food and Agriculture Organization of the United Nations. What are healthy diets? Joint statement by FAO and WHO. 2024.",
        "World Health Organization. Healthy diet. Fact sheet, actualizat periodic.",
        "World Health Organization. Carbohydrate intake for adults and children. WHO guideline. 2023.",
        "European Food Safety Authority. Dietary Reference Values for nutrients.",
        "Academy of Nutrition and Dietetics. Vegetarian Dietary Patterns for Adults: Position Paper.",
        "Obesity Canada. Canadian Adult Obesity Clinical Practice Guidelines - Medical Nutrition Therapy.",
        "Mavadiya HB, Roh D, Ly A, Lu Y. Whole Fruits Versus 100% Fruit Juice: Revisiting the Evidence and Its Implications for Healthy Dietary Recommendations. Nutrition Bulletin. 2025.",
      ]}
    >
      <section>
        <ArticleP>„Trebuie să mănânci echilibrat” este unul dintre cele mai frecvente sfaturi pe care le auzim.</ArticleP>
        <ArticleP>Dar ce înseamnă, de fapt?</ArticleP>
        <ArticleP>
          Înseamnă să renunți la pâine? Să mănânci numai salate? Să nu mai atingi niciodată ceva dulce? Să cântărești tot
          ce pui în farfurie?
        </ArticleP>
        <ArticleP>Nu.</ArticleP>
        <ArticleP>
          O alimentație echilibrată înseamnă ca, în majoritatea timpului, să îi oferi organismului energia și nutrienții
          de care are nevoie, din alimente variate și în cantități potrivite pentru tine.
        </ArticleP>
        <ArticleP>Iar „potrivite pentru tine” contează.</ArticleP>
        <ArticleP>
          Necesitățile nu sunt identice pentru toată lumea. Ele diferă în funcție de vârstă, sex, activitate fizică,
          obiective, sarcină, anumite afecțiuni și alte particularități individuale.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Nu un singur aliment face alimentația sănătoasă</ArticleH2>
        <ArticleP>
          Poate ai avut zile în care ai mâncat o salată și ai simțit că „ai mâncat sănătos”. Sau, dimpotrivă, ai mâncat
          ceva diferit de plan și ai avut impresia că ai stricat totul.
        </ArticleP>
        <ArticleP>În realitate, alimentația nu se judecă după o singură masă.</ArticleP>
        <ArticleP>
          Contează mai mult ceea ce repeți în majoritatea zilelor: dacă ai varietate, dacă ai suficiente legume și
          fructe, dacă incluzi surse potrivite de proteină, dacă ai fibre suficiente și dacă produsele foarte bogate în
          zahăr, sare sau grăsimi nu ajung să ocupe cea mai mare parte din alimentație.
        </ArticleP>
        <ArticleP>Asta este mult mai util decât să împărțim toate alimentele în „bune” și „rele”.</ArticleP>
      </section>

      <section>
        <ArticleH2>Legumele: nu doar ceva pus lângă mâncare</ArticleH2>
        <ArticleP>Pentru mulți oameni, legumele sunt încă văzute ca o garnitură mică lângă felul principal.</ArticleP>
        <ArticleP>Într-o alimentație echilibrată, ar trebui să le privim altfel.</ArticleP>
        <ArticleP>
          Legumele aduc fibre, vitamine, minerale și o varietate de compuși bioactivi, iar diversitatea contează.
        </ArticleP>
        <ArticleP>
          Nu este nevoie să mănânci permanent aceeași salată. Poți alterna roșii, ardei, dovlecel, vinete, broccoli,
          conopidă, morcov, fasole verde, varză, ciuperci, legume cu frunze și multe altele.
        </ArticleP>
        <ArticleP>Pot fi crude, coapte, fierte, sotate, în supe sau integrate în diferite preparate.</ArticleP>
        <ArticleP>
          Pentru persoanele peste 10 ani, recomandările internaționale folosesc ca reper cel puțin 400 g de fructe și
          legume pe zi.
        </ArticleP>
        <ArticleP>
          Nu trebuie însă să transformi cifra într-o obsesie. Ideea practică este să existe constant și suficient de
          variat în alimentația ta.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Fructele întregi sau fresh-ul?</ArticleH2>
        <ArticleP>
          Poate ți se pare că un fresh este una dintre cele mai sănătoase alegeri, tocmai pentru că este făcut direct
          din fructe.
        </ArticleP>
        <ArticleP>Totuși, un pahar de fresh nu este același lucru cu fructul întreg.</ArticleP>
        <ArticleP>
          Când mănânci fructul întreg, consumi și pulpa și fibrele, iar faptul că trebuie să îl mesteci încetinește
          consumul și contribuie la sațietate.
        </ArticleP>
        <ArticleP>
          Când fructul este stors, o parte dintre fibre se pierde și devine mult mai ușor să consumi rapid cantitatea
          provenită din mai multe fructe într-un singur pahar.
        </ArticleP>
        <ArticleP>
          De aceea, pentru consumul de zi cu zi, fructele sunt recomandate în primul rând întregi, nu sub formă de
          fresh.
        </ArticleP>
        <ArticleP>
          Un alt motiv important este că zaharurile din sucurile de fructe sunt incluse în categoria zaharurilor
          libere, chiar dacă în suc nu a fost adăugat zahăr.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Carbohidrații sunt mult mai mult decât pâine, orez și cartofi</ArticleH2>
        <ArticleP>Când auzi „carbohidrați”, este posibil să te gândești imediat la pâine, paste, orez sau cartofi.</ArticleP>
        <ArticleP>Dar carbohidrații se găsesc într-o gamă mult mai largă de alimente.</ArticleP>
        <ArticleP>
          Îi găsim și în legume, fructe, năut, linte, fasole uscată, mazăre boabe, porumb, ovăz, orz, hrișcă și alte
          cereale.
        </ArticleP>
        <ArticleP>
          Și aici apare partea importantă: nu toate alimentele care conțin carbohidrați vin cu același profil
          nutrițional.
        </ArticleP>
        <ArticleP>
          Năutul, lintea, fasolea uscată și mazărea boabe aduc, pe lângă carbohidrați, și fibre, proteină vegetală,
          vitamine și minerale.
        </ArticleP>
        <ArticleP>
          Legumele aduc carbohidrați în cantități diferite, dar contribuie și cu fibre, vitamine, minerale și alți
          compuși vegetali.
        </ArticleP>
        <ArticleP>
          Cerealele integrale păstrează mai multe componente ale bobului și, în general, aduc mai multe fibre decât
          variantele foarte rafinate.
        </ArticleP>
        <ArticleP>
          Recomandările actuale încurajează ca sursele principale de carbohidrați să provină în principal din cereale
          integrale, legume, fructe și leguminoase.
        </ArticleP>
        <ArticleP>
          Așa că întrebarea utilă nu este doar „Câți carbohidrați mănânc?”, ci și „Din ce alimente vin carbohidrații
          mei?”
        </ArticleP>
        <ArticleP>
          O alimentație echilibrată nu înseamnă să repeți zilnic pâine, orez și cartofi. Înseamnă să variezi sursele
          și să lași loc pentru legume, leguminoase, fructe și cereale integrale.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Proteina: nu toate sursele sunt identice</ArticleH2>
        <ArticleP>Proteina poate proveni atât din alimente de origine animală, cât și vegetală.</ArticleP>
        <ArticleP>Dar sursele nu sunt identice.</ArticleP>
        <ArticleP>
          Proteinele de origine animală au, în general, o digestibilitate mai ridicată și un profil favorabil de
          aminoacizi esențiali.
        </ArticleP>
        <ArticleP>
          Sursele vegetale diferă între ele prin cantitatea de proteină, digestibilitate și profilul aminoacizilor
          esențiali.
        </ArticleP>
        <ArticleP>Asta nu înseamnă că proteinele vegetale nu pot face parte dintr-o alimentație echilibrată. Pot.</ArticleP>
        <ArticleP>
          Dar dacă alimentația ta este predominant vegetală, este important să existe varietate între surse și un
          aport total suficient, pentru ca necesarul de aminoacizi esențiali să fie acoperit.
        </ArticleP>
        <ArticleP>
          Nu este însă necesar să combini obligatoriu anumite proteine vegetale la aceeași masă. Contează alimentația
          în ansamblu.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Grăsimile nu trebuie eliminate</ArticleH2>
        <ArticleP>Poate ai trecut și tu prin perioade în care ai încercat să alegi totul „fără grăsimi”.</ArticleP>
        <ArticleP>Dar grăsimile sunt nutrienți necesari.</ArticleP>
        <ArticleP>Contează însă ce tip de grăsimi consumi și în ce cantitate.</ArticleP>
        <ArticleP>
          Într-o alimentație echilibrată pot exista surse de grăsimi nesaturate, precum uleiurile vegetale, nucile,
          semințele sau peștele.
        </ArticleP>
        <ArticleP>
          Recomandările internaționale încurajează preferarea grăsimilor nesaturate și limitarea aportului de grăsimi
          saturate și trans.
        </ArticleP>
        <ArticleP>
          Și aici contează cantitatea. Faptul că un aliment are o compoziție bună nu înseamnă că trebuie consumat
          fără limită.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Dar zahărul și dulciurile?</ArticleH2>
        <ArticleP>O alimentație echilibrată presupune și limitarea zaharurilor libere.</ArticleP>
        <ArticleP>
          Recomandările internaționale folosesc ca reper un aport sub 10% din energia zilnică, iar reducerea sub 5%
          poate aduce beneficii suplimentare.
        </ArticleP>
        <ArticleP>
          Aici intră zahărul adăugat în produse și băuturi, dar și zaharurile din miere, siropuri și sucurile de
          fructe.
        </ArticleP>
        <ArticleP>Pentru tine, ca pacient, nu este nevoie să transformi asta într-un calcul zilnic de procente.</ArticleP>
        <ArticleP>
          Mai simplu este să te uiți la cât de des apar în alimentația ta băuturile îndulcite, biscuiții, produsele de
          patiserie, deserturile și alte produse cu mult zahăr adăugat.
        </ArticleP>
        <ArticleP>
          Dacă obiectivul tău este scăderea în greutate, aceste produse vor fi, de regulă, reduse sau limitate,
          pentru că pot crește ușor aportul energetic fără să aducă aceeași cantitate de fibre, proteină, vitamine și
          minerale ca alimentele pe care vrem să construim alimentația.
        </ArticleP>
        <ArticleP>
          Pentru gustul dulce, putem folosi mai des fructele întregi sau variante de preparate în care cantitatea de
          zahăr adăugat este redusă.
        </ArticleP>
        <ArticleP>
          Ideea este ca dulciurile să nu ajungă să ocupe locul alimentelor de care organismul are nevoie zi de zi.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Procesat și neprocesat: ce înseamnă în viața reală?</ArticleH2>
        <ArticleP>Cuvântul „procesat” a ajuns să fie folosit foarte des ca sinonim pentru „nesănătos”.</ArticleP>
        <ArticleP>Dar lucrurile nu sunt atât de simple.</ArticleP>
        <ArticleP>
          Un aliment neprocesat este foarte apropiat de forma în care îl găsim în natură. De exemplu: un măr întreg, un
          morcov, un ou, o bucată de pește sau carne proaspătă.
        </ArticleP>
        <ArticleP>
          Un aliment minim procesat a trecut printr-un proces simplu care îl face mai ușor de păstrat, transportat sau
          consumat, fără să îi schimbe fundamental compoziția.
        </ArticleP>
        <ArticleP>
          De exemplu: legume congelate, fructe congelate fără zahăr adăugat, lapte pasteurizat, iaurt simplu, fulgi de
          ovăz, nuci ambalate fără adaosuri sau leguminoase fierte ori conservate simplu.
        </ArticleP>
        <ArticleP>Aceste alimente pot face parte fără probleme dintr-o alimentație echilibrată.</ArticleP>
        <ArticleP>
          Procesarea devine mai relevantă atunci când produsului îi sunt adăugate cantități importante de zahăr, sare,
          grăsimi sau alte ingrediente, iar produsul final ajunge foarte diferit de alimentul de bază.
        </ArticleP>
        <ArticleP>
          De exemplu, una este un iaurt simplu și alta este un desert lactat cu mult zahăr adăugat. Una este ovăzul
          simplu și alta sunt cerealele foarte îndulcite. Una este carnea proaspătă și alta este un produs din carne cu
          cantități mari de sare și grăsimi adăugate.
        </ArticleP>
        <ArticleP>
          De aceea, când alegi un produs, nu te opri doar la întrebarea „Este procesat?”. Uită-te și la ingrediente,
          cantitatea de zahăr adăugat, sarea, tipul de grăsime, fibrele și rolul produsului în alimentația ta.
        </ArticleP>
        <ArticleP>Asta nu înseamnă că trebuie să gătești absolut totul de la zero.</ArticleP>
        <ArticleP>
          Înseamnă să știi să faci diferența între un aliment procesat pentru siguranță sau conservare și un produs în
          care procesarea a venit la pachet cu mult zahăr, sare, grăsimi și energie.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Dacă vrei să slăbești, principiile rămân, dar cantitățile se schimbă</ArticleH2>
        <ArticleP>Poți mânca alimente foarte nutritive și totuși să consumi mai multă energie decât ai nevoie.</ArticleP>
        <ArticleP>
          De aceea, atunci când obiectivul este scăderea în greutate, nu discutăm doar despre calitatea alimentelor,
          ci și despre cantitate și aport energetic.
        </ArticleP>
        <ArticleP>
          În același timp, nu există o singură distribuție de carbohidrați, proteine și grăsimi potrivită tuturor.
        </ArticleP>
        <ArticleP>
          Intervenția nutrițională trebuie adaptată persoanei, preferințelor, obiectivelor și posibilității de a
          menține schimbările pe termen lung.
        </ArticleP>
        <ArticleP>
          Asta înseamnă că nu trebuie să cauți dieta pe care o urmează altcineva. Trebuie să găsești structura
          potrivită pentru tine.
        </ArticleP>
      </section>

      <section>
        <ArticleH2>Ce înseamnă, până la urmă, să mănânci echilibrat?</ArticleH2>
        <ArticleP>Nu înseamnă să mănânci perfect.</ArticleP>
        <ArticleP>Nu înseamnă să elimini carbohidrații.</ArticleP>
        <ArticleP>Nu înseamnă să trăiești doar cu salate.</ArticleP>
        <ArticleP>Și nici să transformi fiecare masă într-un calcul.</ArticleP>
        <ArticleP>
          Înseamnă ca, în majoritatea timpului, alimentația ta să conțină legume variate, fructe întregi, leguminoase,
          cereale integrale, surse potrivite de proteină și grăsimi în cantități adaptate nevoilor tale, iar produsele
          foarte bogate în zahăr, sare sau energie să nu ajungă să domine alimentația.
        </ArticleP>
        <ArticleP>Este important și să existe varietate.</ArticleP>
        <ArticleP>
          Poate astăzi alegi năut, mâine linte sau fasole. Poate într-o zi ai pește, în alta ouă sau carne. Schimbi
          legumele, fructele și cerealele.
        </ArticleP>
        <ArticleP>Nu trebuie să mănânci „perfect”.</ArticleP>
        <ArticleP>
          Trebuie să construiești un mod de a mânca care îți asigură nutrienții de care ai nevoie și pe care îl poți
          păstra în viața reală.
        </ArticleP>
      </section>
    </ArticleShell>
  );
}
