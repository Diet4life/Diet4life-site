import { ExternalLink } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface SourceLink {
  label: string;
  href: string;
  source: string;
}

export function SourcesAccordion({ heading, sources }: { heading: string; sources: SourceLink[] }) {
  return (
    <div className="my-10 rounded-2xl border border-border bg-card/50">
      <Accordion type="single" collapsible defaultValue="">
        <AccordionItem value="sources" className="border-b-0">
          <AccordionTrigger className="px-5 sm:px-6 py-4 hover:no-underline text-sm sm:text-base font-semibold text-foreground">
            {heading}
          </AccordionTrigger>
          <AccordionContent>
            <ul className="px-5 sm:px-6 pb-5 space-y-3">
              {sources.map((s, i) => (
                <li key={i}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0 text-muted-foreground/70 group-hover:text-primary" aria-hidden="true" />
                    <span>
                      {s.label}
                      <span className="text-muted-foreground/70"> — {s.source}</span>
                      <span className="sr-only"> (link extern, se deschide într-o filă nouă)</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
