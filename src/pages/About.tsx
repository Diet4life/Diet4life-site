import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { GraduationCap, Award, Heart, Lightbulb, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function About() {
  const { language } = useLanguage();
  const ro = language === "ro";

  return (
    <div className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-5/12"
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/images/portrait.png"
                alt="Camelia Amuza"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-7/12"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Camelia Amuza
            </h1>
            <p className="text-xl text-primary font-medium mb-8">
              {ro ? "Nutriționist-dietetician autorizat" : "Licensed Dietitian-Nutritionist"}
            </p>

            <div className="prose prose-lg prose-slate text-muted-foreground font-light leading-relaxed">
              <p>
                {ro
                  ? "În ultimii ani am lucrat în special cu persoane care se confruntă cu obezitatea — o zonă a nutriției care cere mult mai mult decât o listă de alimente permise și interzise."
                  : "In recent years I've worked especially with people facing obesity — an area of nutrition that requires much more than a list of allowed and forbidden foods."}
              </p>
            </div>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto space-y-16">
          {/* Ce am învățat din practică */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-5">
              {ro ? "Ce am învățat din practică" : "What I've learned in practice"}
            </h2>
            <div className="text-muted-foreground font-light leading-relaxed text-lg space-y-4">
              <p>
                {ro
                  ? "Oamenii nu au nevoie doar să știe ce au voie să mănânce. Au nevoie să înțeleagă de ce fac anumite alegeri, cum își pot organiza mesele și, mai ales, cum pot adapta recomandările la viața lor reală — nu la una ideală, care există doar în teorie."
                  : "People don't just need to know what they're allowed to eat. They need to understand why they're making certain choices, how to organize their meals, and — most importantly — how to adapt recommendations to their real life, not an ideal one that only exists in theory."}
              </p>
              <p>
                {ro
                  ? "De aceea îmi place să explic nutriția simplu, fără reguli inutile și fără să complic lucrurile mai mult decât e nevoie. Informația trebuie să fie corectă din punct de vedere medical, dar și ușor de aplicat, altfel rămâne doar teorie pe hârtie."
                  : "That's why I like to explain nutrition simply, without unnecessary rules and without overcomplicating things. Information has to be medically accurate, but also easy to apply — otherwise it stays theory on paper."}
              </p>
            </div>
          </motion.section>

          {/* Studii și formare / Implicare profesională */}
          <motion.div
            className="grid md:grid-cols-2 gap-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-border">
              <CardContent className="p-7">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif font-bold text-xl text-foreground mb-4">
                  {ro ? "Studii și formare" : "Education & training"}
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                  <li>
                    {ro ? (
                      <>
                        <span className="text-foreground font-medium">Master, Nutriție Clinică</span> —
                        Universitatea de Medicină și Farmacie „Victor Babeș" Timișoara (2019–2021)
                      </>
                    ) : (
                      <>
                        <span className="text-foreground font-medium">Master's, Clinical Nutrition</span> —
                        "Victor Babeș" University of Medicine and Pharmacy, Timișoara (2019–2021)
                      </>
                    )}
                  </li>
                  <li>
                    {ro ? (
                      <>
                        <span className="text-foreground font-medium">Licență, Nutriție și Dietetică</span> —
                        Universitatea de Medicină și Farmacie „Victor Babeș" Timișoara (2016–2019)
                      </>
                    ) : (
                      <>
                        <span className="text-foreground font-medium">Bachelor's, Nutrition and Dietetics</span> —
                        "Victor Babeș" University of Medicine and Pharmacy, Timișoara (2016–2019)
                      </>
                    )}
                  </li>
                  <li>
                    {ro
                      ? "Formare continuă în psiho-nutriție, nutriție clinică oncologică și nutriția pacientului critic"
                      : "Ongoing training in psycho-nutrition, clinical oncology nutrition, and critical care nutrition"}
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardContent className="p-7">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-5">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-serif font-bold text-xl text-foreground mb-4">
                  {ro ? "Implicare profesională" : "Professional involvement"}
                </h3>
                <ul className="space-y-2.5 text-sm text-muted-foreground leading-relaxed mb-4">
                  <li>
                    {ro
                      ? "Membru ESPEN (European Society for Clinical Nutrition and Metabolism)"
                      : "Member, ESPEN (European Society for Clinical Nutrition and Metabolism)"}
                  </li>
                  <li>
                    {ro
                      ? "Membru în Consiliul Teritorial Timiș al Colegiului Dieteticienilor din România"
                      : "Member of the Timiș Territorial Council of the Romanian College of Dietitians"}
                  </li>
                  <li>
                    {ro
                      ? "Membru în Comisia de creditare a cursurilor EMCD"
                      : "Member of the EMCD Course Accreditation Committee"}
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {ro
                    ? "Fac parte din ESPEN pentru că recomandările pe care le găsești pe acest site pornesc chiar de la ghidurile acestei societăți — nu sunt doar opinii personale, ci informații verificate la nivel european."
                    : "I'm part of ESPEN because the recommendations you find on this site start from that society's own guidelines — not just personal opinions, but information verified at a European level."}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* De ce Diet4Life Concept */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
                  {ro ? "De ce Diet4Life Concept" : "Why Diet4Life Concept"}
                </h2>
                <p className="text-muted-foreground font-light leading-relaxed text-lg">
                  {ro
                    ? "Diet4Life Concept a pornit exact din această nevoie: să existe un loc în care informațiile despre nutriție să fie explicate clar, corect și practic, astfel încât oamenii să înțeleagă cu adevărat ce fac și de ce o fac — nu doar să urmeze un plan fără să-l priceapă."
                    : "Diet4Life Concept started from exactly this need: a place where nutrition information is explained clearly, correctly, and practically, so people truly understand what they're doing and why — not just follow a plan without grasping it."}
                </p>
              </div>
            </div>
          </motion.section>

          {/* Filozofia mea */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4">
                  {ro ? "Filozofia mea" : "My philosophy"}
                </h2>
                <p className="text-muted-foreground font-light leading-relaxed text-lg">
                  {ro
                    ? "Nu urmăresc alimentația perfectă. Mă interesează mult mai mult ca persoana din fața mea să ajungă la o variantă bună pentru sănătatea ei — una pe care o poate menține pe termen lung, nu doar câteva săptămâni."
                    : "I'm not chasing perfect eating. What matters far more to me is that the person in front of me reaches a version that's good for their health — one they can maintain long-term, not just for a few weeks."}
                </p>
              </div>
            </div>
          </motion.section>

          {/* CTA */}
          <motion.div
            className="text-center pt-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Button asChild size="lg" className="rounded-xl gap-2">
              <Link href="/contact">
                <Heart className="w-4 h-4" />
                {ro ? "Hai să ne cunoaștem" : "Let's get to know each other"}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
