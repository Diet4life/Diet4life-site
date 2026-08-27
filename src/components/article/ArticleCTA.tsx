import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ArticleCTAProps {
  title: string;
  text: string;
  buttonLabel: string;
  href: string;
}

export function ArticleCTA({ title, text, buttonLabel, href }: ArticleCTAProps) {
  return (
    <div className="my-10 rounded-2xl bg-secondary/50 border border-border p-6 sm:p-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between sm:gap-8">
      <div className="mb-5 sm:mb-0">
        <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-2">
          {title}
        </h3>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
          {text}
        </p>
      </div>
      <Button asChild size="lg" className="rounded-full px-7 shrink-0 gap-2">
        <Link href={href} data-testid="button-article-cta-booking">
          {buttonLabel}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  );
}
