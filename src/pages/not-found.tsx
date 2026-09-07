import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Compass, ArrowRight } from "lucide-react";

export default function NotFound() {
  const { language } = useLanguage();
  const ro = language === "ro";

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 py-24">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Compass className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
          {ro ? "Pagina nu a fost găsită" : "Page not found"}
        </h1>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          {ro
            ? "Ne pare rău, pagina pe care o cauți nu există sau a fost mutată."
            : "Sorry, the page you're looking for doesn't exist or has moved."}
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-primary/90 active:scale-[0.97] text-primary-foreground font-medium px-8 h-12 transition-all"
          data-testid="button-back-home"
        >
          {ro ? "Înapoi la pagina principală" : "Back to homepage"}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
