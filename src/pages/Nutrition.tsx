import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

export default function Nutrition() {
  const { language } = useLanguage();

  return (
    <div className="py-24 bg-background min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-12 text-center">
            {language === 'ro' ? 'Nutriție Clinică & Bariatrică' : 'Clinical & Bariatric Nutrition'}
          </h1>
          
          <div className="prose prose-lg prose-slate max-w-none">
            <div className="bg-secondary/50 p-8 rounded-2xl mb-12">
              <h2 className="text-2xl font-serif font-bold text-foreground mb-4 mt-0">
                {language === 'ro' ? 'Nutriția Bariatrică: Un Angajament pe Viață' : 'Bariatric Nutrition: A Lifelong Commitment'}
              </h2>
              <p className="text-muted-foreground">
                {language === 'ro'
                  ? 'Chirurgia bariatrică este un instrument puternic, dar succesul pe termen lung depinde de schimbările în stilul de viață și nutriție. Monitorizarea constantă și aderarea la un plan nutrițional specific sunt esențiale pentru prevenirea deficiențelor și menținerea rezultatelor.'
                  : 'Bariatric surgery is a powerful tool, but long-term success depends on lifestyle and nutrition changes. Constant monitoring and adherence to a specific nutritional plan are essential to prevent deficiencies and maintain results.'}
              </p>
            </div>

            <h3 className="text-xl font-serif font-bold text-foreground mb-4">
              {language === 'ro' ? 'Etapele de Reintroducere a Alimentelor' : 'Stages of Food Reintroduction'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {[
                { stage: '1', title: { ro: 'Lichide Clare', en: 'Clear Liquids' }, desc: { ro: 'Zilele 1-2 post-operator', en: 'Days 1-2 post-op' } },
                { stage: '2', title: { ro: 'Lichide Complete', en: 'Full Liquids' }, desc: { ro: 'Zilele 3-14', en: 'Days 3-14' } },
                { stage: '3', title: { ro: 'Pireuri', en: 'Purees' }, desc: { ro: 'Săptămânile 3-4', en: 'Weeks 3-4' } },
                { stage: '4', title: { ro: 'Alimente Moi', en: 'Soft Foods' }, desc: { ro: 'Săptămânile 5-8', en: 'Weeks 5-8' } },
                { stage: '5', title: { ro: 'Dietă Solidă', en: 'Solid Diet' }, desc: { ro: 'De la 2 luni', en: 'From 2 months onwards' } }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 border border-border rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shrink-0">
                    {item.stage}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground m-0">{language === 'ro' ? item.title.ro : item.title.en}</h4>
                    <p className="text-sm text-muted-foreground m-0">{language === 'ro' ? item.desc.ro : item.desc.en}</p>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-xl font-serif font-bold text-foreground mb-4">
              {language === 'ro' ? 'Monitorizarea Micronutrienților' : 'Micronutrient Monitoring'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {language === 'ro'
                ? 'Deficiențele nutriționale sunt frecvente post-bariatric. Este necesară o suplementare permanentă și analize de sânge periodice pentru:'
                : 'Nutritional deficiencies are common post-bariatric. Lifelong supplementation and periodic blood tests are required for:'}
            </p>
            <ul className="list-disc list-inside text-muted-foreground mb-12 space-y-2">
              <li>{language === 'ro' ? 'Vitamina B12' : 'Vitamin B12'}</li>
              <li>{language === 'ro' ? 'Fier & Feritină' : 'Iron & Ferritin'}</li>
              <li>{language === 'ro' ? 'Calciu & Vitamina D3' : 'Calcium & Vitamin D3'}</li>
              <li>{language === 'ro' ? 'Proteine Totale & Albumină' : 'Total Protein & Albumin'}</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
