import { Check } from "lucide-react";

interface ChecklistCardProps {
  title: string;
  items: string[];
}

export function ChecklistCard({ title, items }: ChecklistCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 my-5">
      <p className="font-semibold text-foreground mb-4">{title}</p>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-foreground/90 leading-relaxed">
            <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-primary" aria-hidden="true" />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
