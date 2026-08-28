import { useState } from "react";
import { ChevronDown, List } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  label: string;
}

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function TocLinks({ items, onNavigate }: { items: TocItem[]; onNavigate?: () => void }) {
  return (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection(item.id);
              onNavigate?.();
            }}
            className="block text-sm text-muted-foreground hover:text-primary transition-colors rounded-md px-2.5 py-1.5 hover:bg-primary/5"
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function TableOfContentsDesktop({ items, heading }: { items: TocItem[]; heading: string }) {
  return (
    <nav
      aria-label={heading}
      className="hidden lg:block sticky top-28 rounded-2xl border border-border bg-card/60 p-5"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-foreground mb-3">
        {heading}
      </p>
      <TocLinks items={items} />
    </nav>
  );
}

export function TableOfContentsMobile({ items, heading }: { items: TocItem[]; heading: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="lg:hidden mb-8">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            className="w-full flex items-center justify-between gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3.5 text-left"
            aria-expanded={open}
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <List className="w-4 h-4 text-primary" />
              {heading}
            </span>
            <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", open && "rotate-180")} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="rounded-2xl border border-t-0 border-border bg-card/60 -mt-px px-4 py-3 rounded-t-none">
            <TocLinks items={items} onNavigate={() => setOpen(false)} />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
