import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'ro' | 'en';

interface Translations {
  [key: string]: {
    ro: string;
    en: string;
  };
}

const translations: Translations = {
  // Navigation
  "nav.home": { ro: "Acasă", en: "Home" },
  "nav.about": { ro: "Despre Mine", en: "About Me" },
  "nav.services": { ro: "Servicii", en: "Services" },
  "nav.nutrihub": { ro: "NutriHub", en: "NutriHub" },
  "nav.nutriKids": { ro: "Nutri pentru copii", en: "Nutri for Kids" },
  "nav.calculator": { ro: "Calculator", en: "Calculator" },
  "nav.products": { ro: "Produse", en: "Products" },
  "nav.contact": { ro: "Contact", en: "Contact" },

  // Footer
  "footer.rights": { ro: "Toate drepturile rezervate.", en: "All rights reserved." },
  "footer.tagline": { ro: "Diet4Life Concept - Consultanță nutrițională online", en: "Diet4Life Concept - Online Nutrition Consulting" }
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'd4l-lang';

// Lazy initializer -- reads localStorage synchronously during the first
// render, not in a useEffect after mount. Reading it later would render
// 'ro' first and then flip to the stored language, producing a visible
// RO->EN flash; reading it here avoids that entirely.
function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'ro' || stored === 'en') return stored;
  } catch {
    // localStorage unavailable (e.g. private browsing) -- fall back below.
  }
  return 'ro';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  const toggleLanguage = () => {
    setLanguage(prev => {
      const next = prev === 'ro' ? 'en' : 'ro';
      try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
      } catch {
        // Ignore write failures (e.g. private browsing / storage full) --
        // the toggle still works for the current session either way.
      }
      return next;
    });
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
