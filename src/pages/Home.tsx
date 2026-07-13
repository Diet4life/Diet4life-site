import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      <section className="relative flex-1 flex items-center pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] z-10" />
          <img 
            src="/images/hero.png" 
            alt="Diet4Life Concept Hero" 
            className="w-full h-full object-cover object-center"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h1 className="text-5xl md:text-7xl font-serif font-bold text-foreground leading-[1.1] mb-6">
                {t("hero.title")}
              </h1>
              <p className="text-lg md:text-xl text-foreground/80 mb-10 leading-relaxed max-w-2xl font-light">
                {t("hero.subtitle")}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-base h-14 px-8 rounded-full shadow-lg" asChild>
                  <Link href="/contact" data-testid="button-book-consultation">
                    {t("hero.cta.book")}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-base h-14 px-8 rounded-full bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-background/80" asChild>
                  <Link href="/services" data-testid="button-explore-services">
                    {t("hero.cta.services")}
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
