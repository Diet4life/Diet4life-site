import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

// Same outer column as Home's own PAGE_COLUMN (max-w-[1200px] + matching
// padding) -- duplicated here rather than imported, since importing it
// would require adding an export to Home.tsx, and this round's brief is
// explicit that Home must not be touched. Keep the two literal strings in
// sync by hand if Home's ever changes.
const PAGE_COLUMN = "max-w-[1200px] mx-auto px-[18px] min-[380px]:px-5 lg:px-8";

export default function About() {
  const { language } = useLanguage();
  const ro = language === "ro";

  return (
    <div
      className="flex flex-col"
      style={{
        // Same page-scoped palette override as Home.tsx (kept in sync by
        // hand for the same reason as PAGE_COLUMN above) -- #FBF6EE /
        // #FDF9F2 / #2F5D3F / #7A6559, never touching the shared :root
        // tokens so other pages are unaffected.
        "--background": "37 62% 96%", // #FBF6EE
        "--card": "38 73% 97%", // #FDF9F2
        "--primary": "141 33% 27%", // #2F5D3F
        "--muted-foreground": "22 16% 41%", // #7A6559
      } as any}
    >
      {/* A. Hero -- cine sunt */}
      <section className="pt-14 pb-14 md:pt-20 md:pb-20 bg-background">
        <div className={PAGE_COLUMN}>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-5/12"
            >
              <div className="relative aspect-[900/1040] max-w-[320px] mx-auto lg:max-w-none lg:mx-0 rounded-2xl overflow-hidden border border-border">
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
              transition={{ duration: 0.8, delay: 0.15 }}
              className="w-full lg:w-7/12"
            >
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] uppercase text-primary mb-4">
                <span className="inline-block w-4 h-px bg-primary" aria-hidden="true" />
                {ro ? "Despre mine" : "About me"}
              </span>

              <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-2 text-balance">
                Camelia Amuza
              </h1>
              <p className="text-lg md:text-xl font-semibold text-primary mb-5">
                {ro ? "Nutriționist-dietetician autorizat" : "Licensed Dietitian-Nutritionist"}
              </p>

              <div className="text-muted-foreground leading-relaxed text-base md:text-lg space-y-4 max-w-[560px]">
                <p>
                  {ro
                    ? "Lucrez în principal cu persoane care se confruntă cu obezitatea — o zonă a nutriției care cere mult mai mult decât o listă de alimente permise și interzise."
                    : "I work primarily with people facing obesity — an area of nutrition that requires much more than a list of allowed and forbidden foods."}
                </p>
                <p>
                  {ro
                    ? "Am experiență în managementul nutrițional al pacienților bariatrici din 2021, cu monitorizarea și adaptarea alimentației în diferitele etape postoperatorii."
                    : "I have experience in the nutritional management of bariatric patients since 2021, monitoring and adjusting their diet across the different postoperative stages."}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <div className={PAGE_COLUMN}>
        <div className="max-w-3xl mx-auto space-y-14 md:space-y-16 pb-16 md:pb-20">
          {/* B. Ce am învățat din practică / cum lucrez -- consolidated,
              the old separate "De ce Diet4Life Concept" section is folded
              in here since it restated the same "understand why, not just
              follow a plan" idea in different words. */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-foreground leading-tight md:leading-normal mb-5 text-balance">
              {ro ? "Ce am învățat din practică" : "What I've learned in practice"}
            </h2>
            <div className="text-muted-foreground leading-relaxed text-base md:text-lg space-y-4">
              <p>
                {ro
                  ? "Oamenii nu au nevoie doar să știe ce au voie să mănânce. Au nevoie să înțeleagă de ce fac anumite alegeri, cum își pot organiza mesele și, mai ales, cum pot adapta recomandările la viața lor reală — nu la una ideală, care există doar în teorie."
                  : "People don't just need to know what they're allowed to eat. They need to understand why they're making certain choices, how to organize their meals, and — most importantly — how to adapt recommendations to their real life, not an ideal one that only exists in theory."}
              </p>
              <p>
                {ro
                  ? "De aceea îmi place să explic nutriția simplu, fără reguli inutile și fără să complic lucrurile mai mult decât e nevoie. Informația trebuie să fie corectă din punct de vedere medical, dar și ușor de aplicat, altfel rămâne doar teorie pe hârtie. Scopul este să construim împreună obiceiuri care chiar rezistă în timp, nu soluții rapide care dispar odată cu motivația."
                  : "That's why I like to explain nutrition simply, without unnecessary rules and without overcomplicating things. Information has to be medically accurate, but also easy to apply — otherwise it stays theory on paper. The goal is to build habits together that actually last, not quick fixes that disappear along with motivation."}
              </p>
            </div>
          </motion.section>

          {/* C. Studii și implicare profesională -- editorial blocks, no
              icon circles, no shadcn Card -- border-border + bg-card/60,
              same family as Home's "Din răspunsuri" cards. */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="rounded-2xl border border-border bg-card/60 p-6">
                <h3 className="font-serif font-semibold text-xl text-foreground mb-4">
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
              </div>

              <div className="rounded-2xl border border-border bg-card/60 p-6">
                <h3 className="font-serif font-semibold text-xl text-foreground mb-4">
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
              </div>
            </div>

            {/* Scannable credibility line -- same bariatric-experience fact
                as the hero paragraph, verbatim, but here as a short,
                stand-alone editorial highlight rather than prose. */}
            <div className="rounded-2xl border border-border bg-card/60 p-6">
              <h3 className="font-serif font-semibold text-xl text-foreground mb-2">
                {ro ? "Experiență clinică" : "Clinical experience"}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {ro
                  ? "Experiență în managementul nutrițional al pacienților bariatrici din 2021, cu monitorizarea și adaptarea alimentației în diferitele etape postoperatorii."
                  : "Experience in the nutritional management of bariatric patients since 2021, monitoring and adjusting their diet across the different postoperative stages."}
              </p>
            </div>
          </motion.div>

          {/* D. Filozofia mea -- kept distinct: sustainability/progress-not-
              perfection, doesn't restate B's "understand why" idea. */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl md:text-4xl font-serif font-bold text-foreground leading-tight md:leading-normal mb-5 text-balance">
              {ro ? "Filozofia mea" : "My philosophy"}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              {ro
                ? "Nu urmăresc alimentația perfectă. Mă interesează mult mai mult ca persoana din fața mea să ajungă la o variantă bună pentru sănătatea ei — una pe care o poate menține pe termen lung, nu doar câteva săptămâni."
                : "I'm not chasing perfect eating. What matters far more to me is that the person in front of me reaches a version that's good for their health — one they can maintain long-term, not just for a few weeks."}
            </p>
          </motion.section>

          {/* E. CTA final -- same hand-built CTA system as Home, not the
              shadcn Button (which had different radius/height/weight). */}
          <motion.div
            className="text-center pt-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/contact"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 h-12 lg:h-[52px] px-6 rounded-[13px] bg-primary hover:bg-primary/90 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 text-primary-foreground font-semibold text-[15px] lg:text-base transition-all"
              data-testid="button-about-cta"
            >
              {ro ? "Hai să ne cunoaștem" : "Let's get to know each other"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
