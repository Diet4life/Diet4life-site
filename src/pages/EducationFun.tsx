import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Gamepad2,
  ArrowLeft,
  Printer,
  Sparkles,
  Palette,
  Apple,
  Carrot,
  Grape,
  Banana,
  Leaf,
  Download,
  CalendarCheck,
  Star,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const fruits = [
  { icon: Apple, name: { ro: "Măr", en: "Apple" }, color: "bg-red-100 text-red-500", fact: { ro: "Bogat în fibre și vitamina C", en: "Rich in fiber and vitamin C" } },
  { icon: Banana, name: { ro: "Banană", en: "Banana" }, color: "bg-yellow-100 text-yellow-600", fact: { ro: "Sursa buna de potasiu si energie", en: "Good source of potassium and energy" } },
  { icon: Grape, name: { ro: "Struguri", en: "Grapes" }, color: "bg-purple-100 text-purple-600", fact: { ro: "Antioxidanți puternici", en: "Powerful antioxidants" } },
  { icon: Carrot, name: { ro: "Morcov", en: "Carrot" }, color: "bg-orange-100 text-orange-500", fact: { ro: "Excelent pentru vedere", en: "Excellent for vision" } },
  { icon: Leaf, name: { ro: "Spanac", en: "Spinach" }, color: "bg-green-100 text-green-600", fact: { ro: "Bogat în fier și calciu", en: "Rich in iron and calcium" } },
  { icon: Apple, name: { ro: "Roșie", en: "Tomato" }, color: "bg-red-100 text-red-500", fact: { ro: "Licopenul protejează inima", en: "Lycopene protects the heart" } },
];

const worksheets = [
  {
    title: { ro: "Colorează fructele și legumele!", en: "Color the fruits and vegetables!" },
    desc: { ro: "Fișă de colorat cu 12 fructe și legume. Perfectă pentru copii 3–8 ani.", en: "Coloring sheet with 12 fruits and vegetables. Perfect for children 3–8 years." },
    icon: Palette,
    pages: "4",
    color: "bg-pink-50 border-pink-200",
    iconColor: "text-pink-500",
    badge: { ro: "Colorat", en: "Coloring" },
  },
  {
    title: { ro: "Piramida alimentară — completează!", en: "Food pyramid — complete it!" },
    desc: { ro: "Fișă interactivă unde copiii completează piramida alimentară cu alimente din fiecare categorie.", en: "Interactive worksheet where children complete the food pyramid with foods from each category." },
    icon: Sparkles,
    pages: "2",
    color: "bg-yellow-50 border-yellow-200",
    iconColor: "text-yellow-600",
    badge: { ro: "Interactiv", en: "Interactive" },
  },
  {
    title: { ro: "Jocul culorilor pe farfurie", en: "The colors on the plate game" },
    desc: { ro: "Copilul desenează o farfurie sănătoasă folosind culorile curcubeului. Dezvoltă creativitatea și conștiința alimentară.", en: "The child draws a healthy plate using rainbow colors. Develops creativity and food awareness." },
    icon: Palette,
    pages: "3",
    color: "bg-green-50 border-green-200",
    iconColor: "text-green-600",
    badge: { ro: "Creativ", en: "Creative" },
  },
  {
    title: { ro: "Fișă: Mâncatul intuitiv pentru copii", en: "Sheet: Intuitive eating for children" },
    desc: { ro: "Ajută copilul să recunoască semnalele de foame și sațietate prin imagini simple și activități de colorat.", en: "Helps the child recognize hunger and satiety signals through simple images and coloring activities." },
    icon: Star,
    pages: "6",
    color: "bg-blue-50 border-blue-200",
    iconColor: "text-blue-500",
    badge: { ro: "Educativ", en: "Educational" },
  },
  {
    title: { ro: "Ghidul micuțului bucătar", en: "The little chef guide" },
    desc: { ro: "Rețete simple și sigure pe care copiii de 6–12 ani le pot pregăti cu puțin ajutor. Construiește independența alimentară.", en: "Simple and safe recipes that children aged 6–12 can prepare with a little help. Builds food independence." },
    icon: Sparkles,
    pages: "10",
    color: "bg-orange-50 border-orange-200",
    iconColor: "text-orange-500",
    badge: { ro: "Rețete", en: "Recipes" },
  },
  {
    title: { ro: "Cuvinte încrucișate nutriționale", en: "Nutrition crossword puzzles" },
    desc: { ro: "Cuvinte încrucișate cu termeni nutriționali simpli, pentru copii 8–12 ani. Perfecte pentru activități școlare.", en: "Crossword puzzles with simple nutritional terms, for children aged 8–12. Perfect for school activities." },
    icon: Gamepad2,
    pages: "5",
    color: "bg-violet-50 border-violet-200",
    iconColor: "text-violet-600",
    badge: { ro: "Joc", en: "Game" },
  },
];

const funFacts = [
  { ro: "Roșia este de fapt un fruct, nu o legumă!", en: "The tomato is actually a fruit, not a vegetable!" },
  { ro: "Morcovii au fost inițial violet, nu portocalii.", en: "Carrots were originally purple, not orange." },
  { ro: "Strugurii se transformă în stafide când se usucă la soare.", en: "Grapes turn into raisins when dried in the sun." },
  { ro: "Broccoli conține mai multă vitamina C decât o portocală.", en: "Broccoli contains more vitamin C than an orange." },
  { ro: "Creierul uman consumă 20% din caloriile noastre zilnice.", en: "The human brain uses 20% of our daily calories." },
  { ro: "Stomacul tău are cam aceeași mărime ca pumnul tău!", en: "Your stomach is about the same size as your fist!" },
];

export default function EducationFun() {
  const { language, t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Header — most playful section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-violet-50 via-background to-yellow-50/30">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <Link href="/education" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8" data-testid="link-back-education-fun">
              <ArrowLeft className="w-4 h-4" />
              {t("edu.backhub")}
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-violet-600" />
              </div>
              <span className="text-sm font-medium text-violet-600 bg-violet-100 px-3 py-1 rounded-full">
                {language === "ro" ? "Interactiv & Distractiv" : "Interactive & Fun"}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-5">
              {t("fun.title")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
              {t("fun.subtitle")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Visual food explorer */}
      <section className="py-16 border-b">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.h2
            className="text-2xl font-serif font-bold text-foreground mb-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {language === "ro" ? "Exploratorul alimentelor — ce știi despre ele?" : "The food explorer — what do you know about them?"}
          </motion.h2>
          <p className="text-muted-foreground mb-10 text-sm">
            {language === "ro"
              ? "Descoperă super-puterile fructelor și legumelor!"
              : "Discover the superpowers of fruits and vegetables!"}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {fruits.map((fruit, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ scale: 1.05, y: -4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`rounded-2xl border-2 ${fruit.color} border-transparent p-5 text-center flex flex-col items-center gap-3 cursor-pointer`} data-testid={`card-food-${i}`}>
                  <div className={`w-14 h-14 rounded-full ${fruit.color} flex items-center justify-center`}>
                    <fruit.icon className="w-7 h-7" />
                  </div>
                  <span className="font-bold text-sm text-foreground">
                    {language === "ro" ? fruit.name.ro : fruit.name.en}
                  </span>
                  <span className="text-xs text-muted-foreground leading-tight text-center">
                    {language === "ro" ? fruit.fact.ro : fruit.fact.en}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fun facts */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-8">
            {language === "ro" ? "Știai că...? Fapte interesante despre mâncare" : "Did you know...? Interesting food facts"}
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {funFacts.map((fact, i) => (
              <motion.div key={i} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
                <div className="flex items-start gap-4 p-5 bg-card rounded-xl border border-border hover:border-violet-300 transition-colors" data-testid={`card-funfact-${i}`}>
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-violet-600" />
                  </div>
                  <p className="text-foreground text-sm leading-relaxed font-medium">
                    {language === "ro" ? fact.ro : fact.en}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Worksheets */}
      <section className="py-16 border-t">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center gap-3 mb-3">
            <Printer className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-serif font-bold text-foreground">
              {language === "ro" ? "Fișe de lucru printabile" : "Printable worksheets"}
            </h2>
          </div>
          <p className="text-muted-foreground text-sm mb-10">
            {language === "ro"
              ? "Materiale educaționale gratuite, pregătite de nutriționiști, pentru acasă și la grădiniță/școală."
              : "Free educational materials, prepared by nutritionists, for home and kindergarten/school."}
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {worksheets.map((sheet, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                whileHover={{ y: -4 }}
              >
                <div className={`rounded-2xl border-2 ${sheet.color} p-6 h-full flex flex-col gap-4 cursor-pointer hover:shadow-md transition-all duration-300`} data-testid={`card-worksheet-${i}`}>
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center">
                      <sheet.icon className={`w-5 h-5 ${sheet.iconColor}`} />
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full bg-white/60 ${sheet.iconColor}`}>
                      {language === "ro" ? sheet.badge.ro : sheet.badge.en}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground text-sm leading-snug mb-2">
                      {language === "ro" ? sheet.title.ro : sheet.title.en}
                    </h3>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {language === "ro" ? sheet.desc.ro : sheet.desc.en}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border/40 mt-auto">
                    <span className="text-xs text-muted-foreground">{sheet.pages} {language === "ro" ? "pagini" : "pages"}</span>
                    <span className={`text-xs font-medium flex items-center gap-1 ${sheet.iconColor}`}>
                      <Download className="w-3.5 h-3.5" />
                      {language === "ro" ? "Descarcă" : "Download"}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-violet-50 to-orange-50 border-t">
        <div className="container mx-auto px-4 max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
              {language === "ro"
                ? "Vrei mai multe resurse pentru copilul tău?"
                : "Want more resources for your child?"}
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              {language === "ro"
                ? "Consultația nutrițională pediatrică include un pachet de materiale educaționale personalizate și fișe adaptate vârstei."
                : "The pediatric nutritional consultation includes a package of personalized educational materials and age-adapted worksheets."}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button asChild className="rounded-full px-8" data-testid="button-fun-consult">
                <Link href="/contact">
                  <CalendarCheck className="w-4 h-4 mr-2" />
                  {t("edu.cta.consult")}
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-8" data-testid="button-fun-products">
                <Link href="/products">
                  <Download className="w-4 h-4 mr-2" />
                  {t("edu.cta.download")}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
