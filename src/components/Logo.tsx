import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <img
      src="/images/logo.png"
      alt="Diet4Life Concept"
      className={cn("h-16 w-auto", className)}
    />
  );
}
