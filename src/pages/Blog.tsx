import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Blog() {
  const { language } = useLanguage();

  const posts = [
    {
      img: "/images/blog-myths.png",
      title: { ro: "10 Mituri Alimentare Demontate", en: "10 Food Myths Debunked" },
      excerpt: { 
        ro: "Află adevărul științific din spatele celor mai comune credințe despre dietă, carbohidrați, grăsimi și orele de masă.", 
        en: "Discover the scientific truth behind the most common beliefs about diet, carbs, fats, and meal times." 
      },
      date: "28 Sep 2023",
      readTime: "5 min"
    },
    {
      img: "/images/blog-med.png",
      title: { ro: "Beneficiile Dietei Mediteraneene", en: "Benefits of the Mediterranean Diet" },
      excerpt: { 
        ro: "De ce dieta mediteraneană este considerată constant cea mai sănătoasă abordare nutrițională din lume și cum o poți adopta ușor.", 
        en: "Why the Mediterranean diet is consistently ranked as the healthiest nutritional approach in the world and how to easily adopt it." 
      },
      date: "15 Sep 2023",
      readTime: "6 min"
    },
    {
      img: "/images/blog-myths.png", // Reusing image
      title: { ro: "Înțelegerea Macronutrienților", en: "Understanding Macros" },
      excerpt: { 
        ro: "Un ghid simplu pentru a înțelege rolul proteinelor, carbohidraților și grăsimilor în corpul tău și cum să le echilibrezi.", 
        en: "A simple guide to understanding the role of proteins, carbs, and fats in your body and how to balance them." 
      },
      date: "02 Sep 2023",
      readTime: "7 min"
    }
  ];

  return (
    <div className="py-24 bg-background min-h-screen">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-6">
            Blog & Articole
          </h1>
          <p className="text-lg text-muted-foreground">
            {language === 'ro' 
              ? 'Articole educative bazate pe știință pentru a te ajuta să iei cele mai bune decizii pentru sănătatea ta.' 
              : 'Science-based educational articles to help you make the best decisions for your health.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
          {posts.map((post, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group cursor-pointer flex flex-col h-full"
            >
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl mb-6 shadow-sm">
                <img 
                  src={post.img} 
                  alt={language === 'ro' ? post.title.ro : post.title.en}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {post.date}</span>
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {post.readTime} read</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                {language === 'ro' ? post.title.ro : post.title.en}
              </h2>
              <p className="text-muted-foreground mb-6 flex-1 font-light leading-relaxed line-clamp-3">
                {language === 'ro' ? post.excerpt.ro : post.excerpt.en}
              </p>
              <div className="mt-auto">
                <span className="inline-flex items-center text-primary font-medium group-hover:underline">
                  {language === 'ro' ? 'Citește Articolul' : 'Read Article'} <ArrowRight className="w-4 h-4 ml-2" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
