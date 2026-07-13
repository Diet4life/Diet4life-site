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
  "nav.nutrition": { ro: "Nutriție", en: "Nutrition" },
  "nav.calculator": { ro: "Calculator", en: "Calculator" },
  "nav.recipes": { ro: "Rețete", en: "Recipes" },
  "nav.blog": { ro: "Blog", en: "Blog" },
  "nav.products": { ro: "Produse", en: "Products" },
  "nav.education": { ro: "Educație & Prevenție", en: "Education & Prevention" },
  "nav.contact": { ro: "Contact", en: "Contact" },

  // Education Hub
  "edu.hero.title": { ro: "Educație & Prevenție", en: "Education & Prevention" },
  "edu.hero.subtitle": {
    ro: "Cunoașterea este primul pas spre o viață sănătoasă. Explorați resursele noastre educaționale bazate pe dovezi științifice, concepute pentru adulți și copii deopotrivă.",
    en: "Knowledge is the first step toward a healthy life. Explore our evidence-based educational resources, designed for adults and children alike."
  },
  "edu.intro.title": { ro: "De ce contează educația nutrițională?", en: "Why does nutrition education matter?" },
  "edu.intro.text": {
    ro: "Prevenția este mai eficientă și mai accesibilă decât tratamentul. Prin înțelegerea principiilor nutriției, fiecare persoană poate lua decizii mai bune pentru sănătatea sa pe termen lung. Diet4Life Concept se poziționează ca un centru de autoritate medicală și educațională în nutriție — pentru adulți, părinți și copii.",
    en: "Prevention is more effective and accessible than treatment. By understanding nutrition principles, every person can make better decisions for their long-term health. Diet4Life Concept positions itself as a center of medical and educational authority in nutrition — for adults, parents, and children."
  },
  "edu.card.nutredu.title": { ro: "Educație Nutrițională", en: "Nutrition Education" },
  "edu.card.nutredu.desc": { ro: "Principii de bază, macronutrienți, ghiduri pentru adulți", en: "Basic principles, macronutrients, adult guides" },
  "edu.card.prevention.title": { ro: "Prevenție & Stil de Viață", en: "Prevention & Lifestyle" },
  "edu.card.prevention.desc": { ro: "Sănătate metabolică, obezitate, obiceiuri durabile", en: "Metabolic health, obesity prevention, lasting habits" },
  "edu.card.kids.title": { ro: "Nutriție pentru Copii", en: "Kids Nutrition" },
  "edu.card.kids.desc": { ro: "Ghiduri pentru părinți, idei de mese, sfaturi practice", en: "Parent guides, meal ideas, practical tips" },
  "edu.card.fun.title": { ro: "Învățare prin Joc", en: "Learning & Fun" },
  "edu.card.fun.desc": { ro: "Materiale educaționale vizuale pentru copii", en: "Visual educational materials for children" },
  "edu.cta.consult": { ro: "Programează o Consultație", en: "Book a Consultation" },
  "edu.cta.download": { ro: "Descarcă Ghidul", en: "Download Guide" },
  "edu.cta.contact": { ro: "Plan Personalizat", en: "Personalized Plan" },
  "edu.badge.free": { ro: "Gratuit", en: "Free" },
  "edu.badge.guide": { ro: "Ghid", en: "Guide" },
  "edu.badge.new": { ro: "Nou", en: "New" },
  "edu.readmore": { ro: "Citește mai mult", en: "Read more" },
  "edu.backhub": { ro: "Înapoi la Educație & Prevenție", en: "Back to Education & Prevention" },
  "edu.stats.articles": { ro: "Articole educaționale", en: "Educational articles" },
  "edu.stats.guides": { ro: "Ghiduri descărcabile", en: "Downloadable guides" },
  "edu.stats.patients": { ro: "Pacienți educați", en: "Educated patients" },

  // Nutrition Education sub-page
  "nutredu.title": { ro: "Educație Nutrițională", en: "Nutrition Education" },
  "nutredu.subtitle": { ro: "Înțelege nutriția pentru a-ți transforma sănătatea", en: "Understand nutrition to transform your health" },
  "nutredi.intro": {
    ro: "Educația nutrițională este fundamentul oricărei schimbări durabile. Înțelegând cum funcționează alimentele în corpul nostru, putem face alegeri mai bune în fiecare zi.",
    en: "Nutrition education is the foundation of any lasting change. By understanding how food works in our bodies, we can make better choices every day."
  },

  // Prevention sub-page
  "prev.title": { ro: "Prevenție & Stil de Viață", en: "Prevention & Lifestyle" },
  "prev.subtitle": { ro: "Investește în sănătatea ta de azi pentru un viitor mai bun", en: "Invest in your health today for a better tomorrow" },

  // Kids sub-page
  "kids.title": { ro: "Nutriție pentru Copii", en: "Kids Nutrition" },
  "kids.subtitle": { ro: "Construiți împreună obiceiuri alimentare sănătoase", en: "Build healthy eating habits together" },

  // Fun sub-page
  "fun.title": { ro: "Învățare prin Joc", en: "Learning & Fun" },
  "fun.subtitle": { ro: "Nutriția devine aventură — pentru copii curioși", en: "Nutrition becomes an adventure — for curious kids" },

  // Home Hero
  "hero.title": { 
    ro: "Sănătatea ta începe cu alegeri informate", 
    en: "Your health begins with informed choices" 
  },
  "hero.subtitle": { 
    ro: "Nutriție clinică și bariatrică personalizată pentru o transformare durabilă. Descoperă echilibrul alături de specialiști.", 
    en: "Personalized clinical and bariatric nutrition for sustainable transformation. Discover balance with specialists." 
  },
  "hero.cta.book": { ro: "Programează o Consultație", en: "Book a Consultation" },
  "hero.cta.services": { ro: "Descoperă Serviciile", en: "Explore Services" },
  
  // Footer
  "footer.rights": { ro: "Toate drepturile rezervate.", en: "All rights reserved." },
  "footer.clinic": { ro: "Diet4Life Concept - Clinică de Nutriție", en: "Diet4Life Concept - Nutrition Clinic" }
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
