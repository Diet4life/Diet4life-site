import { ReactNode, useEffect, useState } from "react";
import { Link } from "wouter";
import { ChevronRight, Info } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import type { RelatedItem } from "@/components/nutrihub/ArticleShell";

// Editorial preview, used ONLY by this one article (Nutriție echilibrată).
// Deliberately a separate component, not a modification of ArticleShell.tsx
// -- the other 5 NutriHub articles keep using the original shell completely
// unchanged. Same white/zinc palette direction as ArticleShell/NutriHub hub.
const PREMIUM_PAGE_STYLE = {
  "--background": "0 0% 100%", // #FFFFFF
  "--card": "0 0% 98%", // zinc-50
  "--border": "220 9% 89%", // zinc-200-ish
  "--foreground": "146 10% 14%", // #1F2622
  "--primary": "141 33% 27%", // #2F5D3F
  "--muted-foreground": "22 16% 41%", // #7A6559
} as any;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

interface ArticleShellPremiumProps {
  category: string;
  title: string;
  sources: string[];
  related: RelatedItem[];
  children: ReactNode;
}

export function ArticleShellPremium({ category, title, sources, related, children }: ArticleShellPremiumProps) {
  const { language } = useLanguage();
  const ro = language === "ro";
  const prefersReducedMotion = usePrefersReducedMotion();

  const [toc, setToc] = useState<{ id: string; label: string }[]>([]);
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState("");

  // TOC built exclusively from the H2 elements actually rendered inside the
  // article body -- reads the live DOM rather than a hand-typed copy of the
  // titles, so there is no possibility of the sidebar drifting from the
  // real headings or paraphrasing them.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll("#article-premium-body > section"));
    const items = sections
      .map((sec) => {
        const h2 = sec.querySelector("h2");
        return { id: sec.id, label: h2?.textContent?.trim() || "" };
      })
      .filter((item) => item.id && item.label);
    setToc(items);
  }, [children]);

  // Reading progress -- transform-only (scaleX), no layout properties touched.
  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // TOC scroll-spy -- tracks which section is currently being read, purely
  // for visual highlighting in the sidebar. Reads real section positions on
  // scroll/resize; never alters the TOC's labels or order.
  useEffect(() => {
    if (toc.length === 0) return;
    const sectionEls = toc
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sectionEls.length === 0) return;

    function onScrollSpy() {
      let current = sectionEls[0].id;
      for (const el of sectionEls) {
        if (el.getBoundingClientRect().top <= 140) {
          current = el.id;
        }
      }
      setActiveId(current);
    }

    onScrollSpy();
    window.addEventListener("scroll", onScrollSpy, { passive: true });
    window.addEventListener("resize", onScrollSpy);
    return () => {
      window.removeEventListener("scroll", onScrollSpy);
      window.removeEventListener("resize", onScrollSpy);
    };
  }, [toc]);

  // Visual-only short-paragraph override -- measures each rendered
  // .text-editorial paragraph's real line count and flags ones that render
  // at 2 lines or fewer (at >=768px, where justification applies at all) so
  // the scoped CSS below can force them left-aligned instead of justified.
  // Never touches, splits, or rewrites any text content.
  useEffect(() => {
    const container = document.getElementById("article-premium-body");
    if (!container) return;

    function measure() {
      const paragraphs = Array.from(container!.querySelectorAll<HTMLElement>("p.text-editorial"));
      paragraphs.forEach((p) => {
        p.classList.remove("force-left-short");
        const lineHeight = parseFloat(window.getComputedStyle(p).lineHeight);
        const lines = lineHeight > 0 ? Math.round(p.getBoundingClientRect().height / lineHeight) : 1;
        if (lines <= 2) {
          p.classList.add("force-left-short");
        }
      });
    }

    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [children]);

  return (
    <div className="min-h-screen bg-background py-16 md:py-20" style={PREMIUM_PAGE_STYLE}>
      {/* Reading progress -- fixed, 2px, transform-only animation, respects
          prefers-reduced-motion by dropping the transition (value still
          updates, it just snaps instead of easing). */}
      <div className="fixed top-20 left-0 right-0 h-[2px] bg-border/50 z-40" aria-hidden="true">
        <div
          className="h-full bg-primary"
          style={{
            transformOrigin: "left",
            transform: `scaleX(${progress})`,
            transition: prefersReducedMotion ? "none" : "transform 150ms linear",
          }}
        />
      </div>

      <div className="mx-auto px-[18px] min-[380px]:px-5 lg:px-8 max-w-[1100px]">
        <nav aria-label="breadcrumb" className="mb-6 flex items-center gap-1.5 flex-wrap text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors" data-testid="link-breadcrumb-home">
            {ro ? "Acasă" : "Home"}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <Link href="/nutrihub" className="hover:text-primary transition-colors" data-testid="link-breadcrumb-nutrihub">
            NutriHub
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span className="text-foreground font-medium truncate max-w-[55vw] sm:max-w-[320px]">{title}</span>
        </nav>

        <div className="xl:grid xl:grid-cols-[1fr_230px] xl:gap-14">
          <div className="min-w-0">
            <header className="mb-10 md:mb-14 pb-8 md:pb-10 border-b border-border/70">
              <span className="inline-block text-xs font-semibold tracking-wide uppercase text-primary mb-3">
                {category}
              </span>
              <h1 className="font-serif font-bold text-foreground text-[32px] md:text-[44px] leading-[1.15] text-balance max-w-[22ch]">
                {title}
              </h1>
            </header>

            {/* Compact/collapsible TOC below xl -- native <details>, open/close
                needs no JavaScript at all; only the list of items themselves
                is populated client-side from the real headings. */}
            {toc.length > 0 && (
              <details className="xl:hidden mb-10 rounded-xl border border-border bg-card/60 px-5 py-4">
                <summary className="cursor-pointer text-sm font-semibold text-foreground select-none rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2">
                  {ro ? "Cuprins" : "Contents"}
                </summary>
                <nav className="mt-4 flex flex-col gap-2.5 border-t border-border/70 pt-4">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={cn(
                        "text-sm transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
                        item.id === activeId ? "text-primary font-medium" : "text-muted-foreground hover:text-primary"
                      )}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </details>
            )}

            {/* Body column -- ~68ch reading width, vertical rhythm between
                sections (space + divider), justified text handled entirely
                by ArticleP's own existing .text-editorial class (untouched).
                text-align-last:left is added here, scoped to this article's
                own id only -- the shared .text-editorial utility used by the
                other 5 articles is not modified. */}
            <div id="article-premium-body" className="max-w-[68ch] [&>section]:scroll-mt-28 [&>*+*]:mt-14 [&>*+*]:pt-14 [&>*+*]:border-t [&>*+*]:border-border/60">
              {children}
            </div>

            <div className="max-w-[68ch] mt-16 pt-10 border-t border-border/70">
              {related.length > 0 && (
                <div>
                  <h2 className="font-serif font-bold text-xl text-foreground mb-5">
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
                <div className="mt-10">
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

              <p className="mt-8 pt-6 border-t border-border/70 text-xs text-muted-foreground leading-relaxed">
                {ro
                  ? "Acest material are scop educativ și nu înlocuiește recomandările personalizate oferite în urma unei evaluări medicale sau nutriționale."
                  : "This material is for educational purposes only and does not replace personalized recommendations provided through a medical or nutritional evaluation."}
              </p>
            </div>
          </div>

          {toc.length > 0 && (
            <aside className="hidden xl:block">
              <div className="sticky top-28">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70 mb-4">
                  {ro ? "Cuprins" : "Contents"}
                </p>
                <nav className="flex flex-col gap-3 border-l border-border pl-4">
                  {toc.map((item) => {
                    const isActive = item.id === activeId;
                    return (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        aria-current={isActive ? "true" : undefined}
                        className={cn(
                          "relative text-sm leading-snug rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
                          isActive ? "text-primary font-medium" : "text-muted-foreground hover:text-primary transition-colors"
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className="absolute -left-4 top-0.5 bottom-0.5 w-[2px] bg-primary rounded-full"
                          style={{
                            opacity: isActive ? 1 : 0,
                            transition: prefersReducedMotion ? "none" : "opacity 200ms ease-out",
                          }}
                        />
                        {item.label}
                      </a>
                    );
                  })}
                </nav>
              </div>
            </aside>
          )}
        </div>
      </div>

      <style>{`
        #article-premium-body .text-editorial { text-align-last: left; }
        @media (min-width: 768px) {
          #article-premium-body .text-editorial.force-left-short { text-align: left; }
        }
        #article-premium-body p { color: #3f3f46; }
      `}</style>
    </div>
  );
}
