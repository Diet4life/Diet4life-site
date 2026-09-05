import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { CheckCircle2, ArrowRight, MessageCircle, Stethoscope } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const packages = [
  {
    id: "start",
    weeksRo: "4 săptămâni",
    weeksEn: "4 weeks",
    nameRo: "Pachet Start",
    nameEn: "Start Package",
    price: 450,
    originalPrice: 500,
    recommended: false,
    featuresRo: ["Consultație inițială", "1 consultație de control", "Plan alimentar personalizat, 7 zile"],
    featuresEn: ["Initial consultation", "1 follow-up consultation", "Personalized 7-day meal plan"],
  },
  {
    id: "echilibru",
    weeksRo: "8 săptămâni",
    weeksEn: "8 weeks",
    nameRo: "Pachet Echilibru",
    nameEn: "Balance Package",
    price: 750,
    originalPrice: 850,
    recommended: true,
    featuresRo: [
      "Consultație inițială",
      "2 consultații de control",
      "Suport WhatsApp — 60 zile",
      "Plan alimentar personalizat, 7 zile",
    ],
    featuresEn: [
      "Initial consultation",
      "2 follow-up consultations",
      "WhatsApp support — 60 days",
      "Personalized 7-day meal plan",
    ],
  },
  {
    id: "transformare",
    weeksRo: "12 săptămâni",
    weeksEn: "12 weeks",
    nameRo: "Pachet Transformare",
    nameEn: "Transformation Package",
    price: 950,
    originalPrice: 1100,
    recommended: false,
    featuresRo: [
      "Consultație inițială",
      "3 consultații de control",
      "Suport WhatsApp — 90 zile",
      "Plan alimentar personalizat, 14 zile",
    ],
    featuresEn: [
      "Initial consultation",
      "3 follow-up consultations",
      "WhatsApp support — 90 days",
      "Personalized 14-day meal plan",
    ],
  },
];

const whatsappSteps = [
  {
    ro: "Completezi jurnalul alimentar de 7 zile",
    en: "You fill in the 7-day food journal",
  },
  {
    ro: "Analizez jurnalul tău",
    en: "I analyze your journal",
  },
  {
    ro: "Îmi trimiți un mesaj pe WhatsApp (vocal sau text) despre tine",
    en: "You send me a WhatsApp message (voice or text) about yourself",
  },
  {
    ro: "Îți răspund pe parcursul zilei cu recomandări personalizate",
    en: "I reply during the day with personalized recommendations",
  },
];

export default function Services() {
  const { language } = useLanguage();
  const ro = language === "ro";

  return (
    <div className="py-24 bg-secondary/30 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-5">
            {ro ? "Servicii" : "Services"}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {ro
              ? "Abordări personalizate, bazate pe dovezi științifice, pentru a te ajuta să îți atingi obiectivele de sănătate în mod durabil."
              : "Personalized, evidence-based approaches to help you sustainably reach your health goals."}
          </p>
        </motion.div>

        {/* Two core services */}
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="h-full border-border">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <Stethoscope className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-serif font-bold text-2xl text-foreground mb-1">
                  {ro ? "Consultație de nutriție" : "Nutrition consultation"}
                </h2>
                <p className="text-3xl font-bold text-primary mb-4">300 lei</p>
                <p className="text-muted-foreground leading-relaxed text-sm mb-6 flex-1">
                  {ro
                    ? "Consultație completă — evaluare, discuție despre obiective, istoric medical, obiceiuri alimentare și recomandări personalizate, adaptate situației tale reale."
                    : "A complete consultation — assessment, a discussion about your goals, medical history, eating habits, and personalized recommendations adapted to your real situation."}
                </p>
                <Button asChild size="lg" className="rounded-xl gap-2 w-full">
                  <Link href="/contact">
                    {ro ? "Programează-te" : "Book now"}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full border-border">
              <CardContent className="p-8 flex flex-col h-full">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <MessageCircle className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-serif font-bold text-2xl text-foreground mb-1">
                  {ro ? "Ghidaj WhatsApp pe 7 zile" : "7-day WhatsApp guidance"}
                </h2>
                <p className="text-3xl font-bold text-primary mb-4">150 lei</p>
                <p className="text-muted-foreground leading-relaxed text-sm mb-6">
                  {ro
                    ? "Completezi jurnalul alimentar de 7 zile, eu îl analizez, iar apoi îmi scrii pe WhatsApp câteva cuvinte despre tine — cum te simți, ce provocări ai, ce îți dorești să schimbi. Pe parcursul zilei îți răspund cu idei și recomandări conturate exact pe baza jurnalului tău."
                    : "You fill in the 7-day food journal, I analyze it, then you write me a few words on WhatsApp about yourself — how you feel, what challenges you have, what you'd like to change. During the day I reply with ideas and recommendations shaped exactly around your journal."}
                </p>

                <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground mb-3">
                  {ro ? "Cum funcționează" : "How it works"}
                </h3>
                <ol className="space-y-2 mb-6">
                  {whatsappSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {ro ? step.ro : step.en}
                    </li>
                  ))}
                </ol>

                <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                  {ro
                    ? "Nu înlocuiește o consultație completă — e un prim ghidaj, pornind de la jurnalul tău."
                    : "It doesn't replace a full consultation — it's an initial guidance, starting from your journal."}
                </p>

                <Button asChild size="lg" variant="outline" className="rounded-xl gap-2 w-full mt-auto">
                  <Link href="/contact">
                    {ro ? "Începe cu jurnalul" : "Start with the journal"}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Pachete */}
        <motion.h2
          className="text-3xl font-serif font-bold text-foreground text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {ro ? "Pachete" : "Packages"}
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {packages.map((pkg, i) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              {pkg.recommended && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  {ro ? "Recomandat" : "Recommended"}
                </Badge>
              )}
              <Card className={`h-full ${pkg.recommended ? "border-primary shadow-md" : "border-border"}`}>
                <CardContent className="p-7 flex flex-col h-full">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                    {ro ? pkg.weeksRo : pkg.weeksEn}
                  </p>
                  <h3 className="font-serif font-bold text-xl text-foreground mb-3">
                    {ro ? pkg.nameRo : pkg.nameEn}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-5">
                    <span className="text-2xl font-bold text-primary">{pkg.price} lei</span>
                    <span className="text-sm text-muted-foreground line-through">{pkg.originalPrice} lei</span>
                  </div>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {(ro ? pkg.featuresRo : pkg.featuresEn).map((item, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-sm text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button
                    asChild
                    size="lg"
                    variant={pkg.recommended ? "default" : "outline"}
                    className="rounded-xl gap-2 w-full mt-auto"
                  >
                    <Link href="/contact">
                      {ro ? "Alege pachetul potrivit" : "Choose this package"}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center rounded-2xl bg-primary/8 border border-primary/20 py-10 px-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-serif font-bold text-foreground mb-3">
            {ro ? "Nu știi de unde să începi?" : "Not sure where to start?"}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm leading-relaxed">
            {ro
              ? "Contactează-ne și îți vom recomanda cel mai potrivit serviciu pentru situația ta."
              : "Contact us and we'll recommend the most suitable service for your situation."}
          </p>
          <Button asChild size="lg" className="rounded-xl gap-2">
            <Link href="/contact">
              {ro ? "Contactează-ne" : "Contact us"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
