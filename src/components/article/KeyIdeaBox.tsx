import { Lightbulb } from "lucide-react";

export function KeyIdeaBox({ label, text }: { label: string; text: string }) {
  return (
    <div className="my-8 rounded-2xl bg-primary/5 border border-primary/15 pl-5 pr-6 py-5 sm:pl-7 sm:pr-8 sm:py-6 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40 rounded-l-2xl" aria-hidden="true" />
      <div className="flex items-center gap-2.5 mb-2.5">
        <Lightbulb className="w-4 h-4 text-primary" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">
          {label}
        </span>
      </div>
      <p className="text-lg sm:text-xl font-serif text-foreground leading-snug">
        {text}
      </p>
    </div>
  );
}
