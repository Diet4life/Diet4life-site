import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Clock, Flame } from "lucide-react";

export default function Recipes() {
  const { language } = useLanguage();

  const recipes = [
    {
      img: "/images/recipe-smoothie.png",
      title: { ro: "Smoothie Verde Proteic", en: "Green Protein Smoothie" },
      cals: 250,
      time: "5 min",
      desc: { ro: "O explozie de vitamine și proteine, perfect pentru un mic dejun rapid.", en: "A burst of vitamins and protein, perfect for a quick breakfast." }
    },
    {
      img: "/images/recipe-soup.png",
      title: { ro: "Supă Cremă Bariatrică", en: "Bariatric Cream Soup" },
      cals: 180,
      time: "25 min",
      desc: { ro: "Fină, hrănitoare și ușor de tolerat în faza de dietă moale post-operatorie.", en: "Smooth, nutritious and easily tolerated in the post-op soft diet phase." }
    },
    {
      img: "/images/recipe-salad.png",
      title: { ro: "Salată Low-Calorie", en: "Low-Calorie Salad" },
      cals: 210,
      time: "10 min",
      desc: { ro: "Volum mare, calorii puține. O cină ușoară plină de fibre.", en: "High volume, low calorie. A light dinner full of fiber." }
    },
    {
      img: "/images/recipe-bowl.png",
      title: { ro: "Bowl Bogat în Proteine", en: "High-Protein Bowl" },
      cals: 450,
      time: "20 min",
      desc: { ro: "Echilibrul perfect între macro-nutrienți pentru recuperare musculară.", en: "The perfect balance of macronutrients for muscle recovery." }
    },
    {
      img: "/images/recipe-anti.png",
      title: { ro: "Farfurie Anti-Inflamatorie", en: "Anti-Inflammatory Plate" },
      cals: 380,
      time: "30 min",
      desc: { ro: "Somon sălbatic și legume bogate în antioxidanți.", en: "Wild salmon and antioxidant-rich vegetables." }
    },
    {
      img: "/images/recipe-soup.png", // reusing image due to missing unique generation target
      title: { ro: "Piure Post-Operator", en: "Post-Op Puree" },
      cals: 150,
      time: "15 min",
      desc: { ro: "Pui și morcov blendat perfect pentru faza 3 a dietei bariatrice.", en: "Blended chicken and carrots perfect for phase 3 of bariatric diet." }
    }
  ];

  return (
    <div className="py-24 bg-background min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            {language === 'ro' ? 'Rețete Sănătoase' : 'Healthy Recipes'}
          </h1>
          <p className="text-lg text-muted-foreground">
            {language === 'ro' 
              ? 'Inspirație culinară pentru un stil de viață echilibrat, creată special pentru nevoile tale nutriționale.' 
              : 'Culinary inspiration for a balanced lifestyle, specially created for your nutritional needs.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recipes.map((recipe, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border group"
            >
              <div className="aspect-square overflow-hidden">
                <img 
                  src={recipe.img} 
                  alt={language === 'ro' ? recipe.title.ro : recipe.title.en}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-3 text-sm font-medium text-primary">
                  <span className="flex items-center gap-1"><Flame className="w-4 h-4" /> {recipe.cals} kcal</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {recipe.time}</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-card-foreground mb-2">
                  {language === 'ro' ? recipe.title.ro : recipe.title.en}
                </h3>
                <p className="text-muted-foreground font-light text-sm leading-relaxed">
                  {language === 'ro' ? recipe.desc.ro : recipe.desc.en}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
