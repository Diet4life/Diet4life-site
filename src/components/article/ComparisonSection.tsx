import { LucideIcon } from "lucide-react";

interface ComparisonColumn {
  title: string;
  icon: LucideIcon;
  items: string[];
}

interface ComparisonSectionProps {
  title: string;
  columns: [ComparisonColumn, ComparisonColumn];
}

export function ComparisonSection({ title, columns }: ComparisonSectionProps) {
  return (
    <div className="my-8">
      <h3 className="text-xl sm:text-2xl font-serif font-bold text-foreground mb-5">
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {columns.map((col, i) => {
          const Icon = col.icon;
          return (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-5 sm:p-6"
            >
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
                </div>
                <p className="font-semibold text-foreground leading-snug">{col.title}</p>
              </div>
              <ul className="space-y-2.5">
                {col.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-2 shrink-0" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
