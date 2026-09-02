import { Link, useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { Menu, X, Globe } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/about", label: t("nav.about") },
    { href: "/services", label: t("nav.services") },
    { href: "/nutrihub", label: t("nav.nutrihub") },
    { href: "/calculator", label: t("nav.calculator") },
    { href: "/blog", label: t("nav.blog") },
    { href: "/products", label: t("nav.products") },
    { href: "/education", label: t("nav.education") },
    { href: "/consultatii", label: language === "ro" ? "Consultații" : "Appointments" },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location === link.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="flex items-center gap-4 ml-4 pl-4 border-l">
              <button 
                onClick={toggleLanguage}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-lang-toggle"
              >
                <Globe className="w-4 h-4" />
                <span className={language === 'ro' ? 'font-bold text-foreground' : ''}>RO</span>
                <span className="opacity-50">|</span>
                <span className={language === 'en' ? 'font-bold text-foreground' : ''}>EN</span>
              </button>
              <Button asChild className="rounded-full px-6">
                <Link href="/contact">{t("nav.contact")}</Link>
              </Button>
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={toggleLanguage} className="flex items-center gap-1 text-sm font-medium text-foreground">
              <Globe className="w-4 h-4" />
              <span>{language.toUpperCase()}</span>
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-foreground"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-20 left-0 w-full bg-background border-b shadow-lg py-4 px-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "text-lg font-medium p-2 rounded-md",
                  location === link.href ? "bg-muted text-primary" : "text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild className="w-full mt-2" onClick={() => setMobileMenuOpen(false)}>
              <Link href="/contact">{t("nav.contact")}</Link>
            </Button>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t bg-muted/30 py-12">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo className="grayscale opacity-60" />
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} {t("footer.clinic")}. {t("footer.rights")}
          </p>
        </div>
      </footer>
    </div>
  );
}
