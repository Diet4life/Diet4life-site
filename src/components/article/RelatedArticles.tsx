import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

export interface RelatedArticle {
  title: string;
  excerpt: string;
  href: string;
  img: string;
}

export function RelatedArticles({ heading, items, readMoreLabel }: { heading: string; items: RelatedArticle[]; readMoreLabel: string }) {
  if (items.length === 0) return null;

  return (
    <div className="my-12">
      <h2 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-6">
        {heading}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {items.map((item, i) => (
          <Link key={i} href={item.href} className="group block">
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl mb-3">
              <img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            <p className="font-serif font-bold text-foreground text-base leading-snug mb-1.5 group-hover:text-primary transition-colors">
              {item.title}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-2">
              {item.excerpt}
            </p>
            <span className="inline-flex items-center text-primary text-sm font-medium">
              {readMoreLabel}
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
