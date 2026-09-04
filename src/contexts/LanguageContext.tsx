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

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ro');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ro' ? 'en' : 'ro');
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
