import { ReactNode } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, CheckCircle2, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";

export interface FaqItem {
  q: string;
  a: string;
}

export interface RelatedItem {
  label: string;
  href?: string;
}

interface ArticleShellProps {
  category: string;
  title: string;
  subtitle: string;
  readTime: string;
  updated: string;
  tldr: string;
  keyTakeaways: string[];
  faq: FaqItem[];
  related: RelatedItem[];
  sources: string;
  children: ReactNode;
}

// Shared reader shell for every NutriHub pillar article: hero, "Pe scurt", the
// article's own sections (passed as children), key takeaways, FAQ, related
// articles and a collapsed sources block — so each article only supplies content.
export function ArticleShell({
  category,
  title,
  subtitle,
  readTime,
  updated,
  tldr,
  keyTakeaways,
  faq,
  related,
  sources,
  children,
}: ArticleShellProps) {
  const { language } = useLanguage();
  const ro = language === "ro";

  return (
    <div className="min-h-screen bg-background py-16 md:py-20">
      <div className="container mx-auto px-4 max-w-2xl">
        <Link
          href="/nutrihub"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
          data-testid="link-back-nutrihub"
        >
          <ArrowLeft className="w-4 h-4" />
          {ro ? "Înapoi la NutriHub" : "Back to NutriHub"}
        </Link>

        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="inline-block text-xs font-semibold tracking-wide uppercase text-primary bg-primary/10 px-3 py-1 rounded-full mb-4">
            {category}
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground leading-tight mb-4 text-balance">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-5">
            {subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>{ro ? "Documentat de echipa Diet4Life" : "Documented by the Diet4Life team"}</span>
            <span className="text-border">·</span>
            <span>{updated}</span>
            <span className="text-border">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {readTime}
            </span>
          </div>
        </motion.header>

        <Card className="bg-primary/5 border-primary/20 mb-10">
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
              {ro ? "Pe scurt" : "In short"}
            </p>
            <p className="text-foreground leading-relaxed">{tldr}</p>
          </CardContent>
        </Card>

        <div className="space-y-10">{children}</div>

        {keyTakeaways.length > 0 && (
          <Card className="mt-12 border-primary/20">
            <CardContent className="p-7">
              <h2 className="font-serif font-bold text-lg text-foreground mb-4">
                {ro ? "Ce să reții" : "Key takeaways"}
              </h2>
              <ul className="space-y-2.5">
                {keyTakeaways.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {faq.length > 0 && (
          <div className="mt-12">
            <h2 className="font-serif font-bold text-xl text-foreground mb-4">
              {ro ? "Întrebări frecvente" : "Frequently asked questions"}
            </h2>
            <Accordion type="single" collapsible className="border border-border rounded-xl px-4">
              {faq.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className={i === faq.length - 1 ? "border-b-0" : ""}>
                  <AccordionTrigger className="text-sm font-medium text-foreground text-left hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="font-serif font-bold text-xl text-foreground mb-4">
              {ro ? "Citește și" : "Read also"}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {related.map((item, i) =>
                item.href ? (
                  <Link
                    key={i}
                    href={item.href}
                    className="flex items-center rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:border-primary/40 hover:shadow-sm transition-all"
                    data-testid={`link-related-${i}`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    key={i}
                    className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground"
                  >
                    {item.label}
                    <span className="text-xs shrink-0">{ro ? "în curând" : "coming soon"}</span>
                  </span>
                )
              )}
            </div>
          </div>
        )}

        <div className="mt-12">
          <Accordion type="single" collapsible className="border border-border rounded-xl px-4">
            <AccordionItem value="sources" className="border-b-0">
              <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  {ro ? "Vezi sursele medicale" : "See the medical sources"}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                {sources}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}

export function ArticleH2({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xl md:text-2xl font-serif font-bold text-foreground mb-3 text-balance">
      {children}
    </h2>
  );
}

export function ArticleP({ children }: { children: ReactNode }) {
  return <p className="text-foreground leading-relaxed mb-3 last:mb-0">{children}</p>;
}

export function ArticleCallout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-secondary/40 border border-border rounded-xl px-5 py-4 text-sm text-muted-foreground leading-relaxed">
      {children}
    </div>
  );
}

export function ArticleList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 pl-1 mb-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5 text-foreground">
          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
