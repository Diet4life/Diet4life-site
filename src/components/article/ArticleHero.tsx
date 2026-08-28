import { Calendar, Clock, User } from "lucide-react";

interface ArticleHeroProps {
  category: string;
  title: string;
  subtitle: string;
  authorName: string;
  authorTitle: string;
  publishedLabel: string;
  readTimeLabel: string;
}

export function ArticleHero({
  category,
  title,
  subtitle,
  authorName,
  authorTitle,
  publishedLabel,
  readTimeLabel,
}: ArticleHeroProps) {
  return (
    <div className="max-w-3xl">
      <span className="inline-flex items-center rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium px-3.5 py-1.5 mb-4">
        {category}
      </span>

      <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-foreground leading-[1.15] mb-4">
        {title}
      </h1>

      <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
        {subtitle}
      </p>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
        <span className="flex items-center gap-2 font-medium text-foreground">
          <User className="w-4 h-4 text-primary" />
          {authorName}
          <span className="hidden sm:inline text-muted-foreground font-normal">· {authorTitle}</span>
        </span>
        <span className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {publishedLabel}
        </span>
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          {readTimeLabel}
        </span>
      </div>
    </div>
  );
}
