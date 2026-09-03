import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

export default function About() {
  const { t, language } = useLanguage();

  return (
    <div className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-5/12"
          >
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
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
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-7/12"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Camelia Amuza
            </h1>
            <p className="text-xl text-primary font-medium mb-8">
              {language === 'ro' ? 'Dietetician-Nutriționist' : 'Dietitian-Nutritionist'}
            </p>
            
            <div className="prose prose-lg prose-slate text-muted-foreground font-light leading-relaxed">
              <p>
                {language === 'ro'
                  ? 'Cu o experiență de peste 10 ani în nutriția clinică, misiunea mea este să te ghidez către un stil de viață echilibrat, bazat pe dovezi științifice și adaptat nevoilor tale unice.'
                  : 'With over 10 years of experience in clinical nutrition, my mission is to guide you toward a balanced lifestyle based on scientific evidence and tailored to your unique needs.'}
              </p>
              <p>
                {language === 'ro'
                  ? 'Cred cu tărie că nutriția nu este despre restricții severe, ci despre înțelegerea modului în care alimentele interacționează cu corpul tău. Fie că îți dorești să scazi în greutate sau pur și simplu vrei să îți îmbunătățești sănătatea generală, abordarea mea este una empatică și profesională.'
                  : 'I strongly believe that nutrition is not about severe restrictions, but about understanding how food interacts with your body. Whether you are looking to lose weight or simply want to improve your overall health, my approach is empathetic and professional.'}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
