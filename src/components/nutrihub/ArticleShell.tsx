import { ReactNode } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Info } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";

// Same palette override as Home/Despre mine/Servicii (see those files'
// own comments) -- kept in sync by hand, not imported, since importing
// would require exporting it from one of those page files. NutriHub's
// own background intentionally differs (white/zinc, not the warm cream
// used elsewhere) per its own design spec -- see NUTRIHUB_PAGE_STYLE
// in nutrihub/index.tsx for the matching hub-page values; this shell
// uses the same --foreground/--primary/--muted-foreground but a
// near-white --background/--card so an article reads as a continuation
// of the hub, not a jump back to the warmer Home/Despre palette.
const ARTICLE_PAGE_STYLE = {
  "--background": "0 0% 100%", // #FFFFFF
  "--card": "0 0% 98%", // zinc-50
  "--border": "220 9% 89%", // zinc-200-ish
  "--foreground": "146 10% 14%", // #1F2622
  "--primary": "141 33% 27%", // #2F5D3F
  "--muted-foreground": "22 16% 41%", // #7A6559
} as any;

export interface RelatedItem {
  label: string;
  href?: string;
}

interface ArticleShellProps {
  category: string;
  title: string;
  /** Full bibliography entries from the approved source document, one per reference. */
  sources: string[];
  related: RelatedItem[];
  children: ReactNode;
}

// Shared reader shell for every NutriHub article: back link, header (category +
// title only -- no subtitle/byline/date/read-time, per the approved-content
// sync), the article's own sections (passed as children), related articles,
// a collapsed bibliography, and the fixed educational disclaimer.
export function ArticleShell({ category, title, sources, related, children }: ArticleShellProps) {
  const { language } = useLanguage();
  const ro = language === "ro";

  return (
    <div className="min-h-screen bg-background py-16 md:py-20" style={ARTICLE_PAGE_STYLE}>
      <div className="container mx-auto px-4 max-w-[720px]">
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
          <span className="inline-block text-xs font-semibold tracking-wide uppercase text-primary mb-3">
            {category}
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground leading-tight text-balance">
            {title}
          </h1>
        </motion.header>

        <div className="space-y-8">{children}</div>

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
                    className="flex items-center rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground hover:border-primary/40 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 ease-out"
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

        {sources.length > 0 && (
          <div className="mt-12">
            <Accordion type="single" collapsible className="border border-border rounded-xl px-4">
              <AccordionItem value="sources" className="border-b-0">
                <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                  <span className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary" />
                    {ro ? "Referințe" : "References"}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <ol className="space-y-2 text-sm text-muted-foreground leading-relaxed list-decimal pl-5">
                    {sources.map((src, i) => (
                      <li key={i}>{src}</li>
                    ))}
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        <p className="mt-6 pt-6 border-t border-border text-xs text-muted-foreground leading-relaxed">
          {ro
            ? "Acest material are scop educativ și nu înlocuiește recomandările personalizate oferite în urma unei evaluări medicale sau nutriționale."
            : "This material is for educational purposes only and does not replace personalized recommendations provided through a medical or nutritional evaluation."}
        </p>
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
  return <p className="text-[17px] md:text-lg text-foreground leading-[1.7] mb-3 last:mb-0">{children}</p>;
}

// A short bold lead-in line used by the approved source documents as a
// lighter-weight in-flow sub-heading (styled as bold body text in the
// Word doc, not a full Heading 2) -- kept visually distinct from ArticleH2
// so the article's own two-tier heading structure is preserved as approved.
export function ArticleLead({ children }: { children: ReactNode }) {
  return (
    <p className="font-serif font-semibold text-foreground text-lg md:text-xl leading-snug mb-3">
      {children}
    </p>
  );
}

// A short pull-quote / rhetorical-question line, used where the approved
// source document sets the text apart visually (as a one-cell table in the
// Word doc) rather than as a plain paragraph.
export function ArticleQuote({ children }: { children: ReactNode }) {
  return (
    <p className="pl-4 border-l-2 border-primary/30 italic text-foreground/90 text-lg md:text-xl leading-snug mb-3">
      {children}
    </p>
  );
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
