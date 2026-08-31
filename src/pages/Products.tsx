import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Download, FileText, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Products() {
  const { language } = useLanguage();

  const products = [
    {
      title: { ro: "Plan de Mese - 7 Zile (PDF)", en: "7-Day Meal Plan (PDF)" },
      price: { ro: "49 RON", en: "€10" },
      icon: <CalendarIcon className="w-12 h-12 text-primary" />,
      desc: { ro: "Un plan complet de slăbire echilibrat pentru o săptămână, incluzând liste de cumpărături și rețete detaliate.", en: "A complete balanced weight loss plan for one week, including shopping lists and detailed recipes." }
    },
    {
      title: { ro: "Workbook: Monitorizare Macro", en: "Macro Tracking Workbook" },
      price: { ro: "39 RON", en: "€8" },
      icon: <FileText className="w-12 h-12 text-primary" />,
      desc: { ro: "Un caiet de lucru digital pentru a învăța cum să îți calculezi și monitorizezi eficient macronutrienții.", en: "A digital workbook to learn how to effectively calculate and track your macronutrients." }
    },
    {
      title: { ro: "Protocol Nutriție Sportivă", en: "Sports Nutrition Protocol" },
      price: { ro: "59 RON", en: "€12" },
      icon: <ActivityIcon className="w-12 h-12 text-primary" />,
      desc: { ro: "Ghid avansat pentru optimizarea performanței sportive prin nutriție adecvată înainte, în timpul și după antrenament.", en: "Advanced guide to optimizing sports performance through proper nutrition before, during, and after training." }
    }
  ];

  return (
    <div className="py-24 bg-secondary/20 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            {language === 'ro' ? 'Produse Digitale' : 'Digital Products'}
          </h1>
          <p className="text-lg text-muted-foreground">
            {language === 'ro' 
              ? 'Materiale educative, ghiduri și planuri pe care le poți descărca imediat pentru a începe călătoria ta.' 
              : 'Educational materials, guides, and plans that you can download immediately to start your journey.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border flex flex-col group hover:shadow-md transition-shadow"
            >
              <div className="aspect-[4/3] bg-secondary/50 flex items-center justify-center p-8 group-hover:bg-primary/5 transition-colors">
                <div className="p-4 bg-background rounded-full shadow-sm">
                  {product.icon}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-serif font-bold text-card-foreground mb-2">
                  {language === 'ro' ? product.title.ro : product.title.en}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 flex-1 font-light leading-relaxed">
                  {language === 'ro' ? product.desc.ro : product.desc.en}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xl font-bold text-foreground">
                    {language === 'ro' ? product.price.ro : product.price.en}
                  </span>
                  <Button data-testid={`button-buy-${index}`}>
                    <Download className="w-4 h-4 mr-2" />
                    {language === 'ro' ? 'Cumpără' : 'Buy'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalendarIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
