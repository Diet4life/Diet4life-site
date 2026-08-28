import { Stethoscope } from "lucide-react";

interface ClinicianNoteBoxProps {
  label: string;
  text: string;
  authorName: string;
  authorTitle: string;
  photoSrc?: string;
}

export function ClinicianNoteBox({ label, text, authorName, authorTitle, photoSrc }: ClinicianNoteBoxProps) {
  return (
    <div className="my-8 rounded-2xl bg-secondary/40 border border-border p-6 sm:p-7">
      <div className="flex items-center gap-2.5 mb-3">
        <Stethoscope className="w-4 h-4 text-primary" aria-hidden="true" />
        <span className="text-xs font-semibold uppercase tracking-wide text-foreground">
          {label}
        </span>
      </div>
      <p className="text-base sm:text-lg text-foreground leading-relaxed font-serif italic mb-5">
        „{text}”
      </p>
      <div className="flex items-center gap-3">
        {photoSrc ? (
          <img
            src={photoSrc}
            alt={authorName}
            className="w-11 h-11 rounded-full object-cover shrink-0 border border-border"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-serif font-semibold shrink-0">
            {authorName.charAt(0)}
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-foreground leading-tight">{authorName}</p>
          <p className="text-xs text-muted-foreground">{authorTitle}</p>
        </div>
      </div>
    </div>
  );
}
