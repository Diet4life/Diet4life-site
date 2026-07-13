import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <path
          d="M16 2C8.26801 2 2 8.26801 2 16C2 23.732 8.26801 30 16 30C23.732 30 30 23.732 30 16C30 8.26801 23.732 2 16 2ZM16 28C9.37258 28 4 22.6274 4 16C4 9.37258 9.37258 4 16 4C22.6274 4 28 9.37258 28 16C28 22.6274 22.6274 28 16 28Z"
          fill="currentColor"
        />
        <path
          d="M20.218 10.7821C18.665 9.22915 16.147 9.22915 14.594 10.7821L12.473 12.9031L14.594 15.0241L16.715 12.9031C17.51 12.1081 18.799 12.1081 19.594 12.9031C20.389 13.6981 20.389 14.9871 19.594 15.7821L14.594 20.7821L12.473 18.6611L10.352 20.7821L14.594 25.0241L21.632 17.9861C23.185 16.4331 23.185 13.9151 21.632 12.3621L20.218 10.7821Z"
          fill="currentColor"
        />
      </svg>
      <div className="flex flex-col">
        <span className="font-serif font-bold text-lg leading-none tracking-tight text-foreground">Diet4Life</span>
        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Concept</span>
      </div>
    </div>
  );
}
