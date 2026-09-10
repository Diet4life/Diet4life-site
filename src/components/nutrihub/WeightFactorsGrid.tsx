import { Utensils, Footprints, Moon, Brain, Pill, Dna } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const FACTORS = [
  { icon: Utensils, ro: "Alimentație", en: "Diet", noteRo: "cantitate, densitate energetică, structura meselor", noteEn: "amount, energy density, meal structure" },
  { icon: Footprints, ro: "Mișcare", en: "Activity", noteRo: "sport, deplasări, activitate zilnică", noteEn: "exercise, commuting, daily activity" },
  { icon: Moon, ro: "Somn", en: "Sleep", noteRo: "influențează apetitul și energia", noteEn: "affects appetite and energy" },
  { icon: Brain, ro: "Comportament alimentar", en: "Eating behavior", noteRo: "obiceiuri, context, mâncat impulsiv", noteEn: "habits, context, impulsive eating" },
  { icon: Pill, ro: "Medicație și sănătate", en: "Medication & health", noteRo: "unele tratamente și afecțiuni", noteEn: "some treatments and conditions" },
  { icon: Dna, ro: "Biologie și istoric ponderal", en: "Biology & weight history", noteRo: "genetică, compoziție corporală", noteEn: "genetics, body composition" },
];

// 2x3 icon grid — chosen over a radial "factors around a center" diagram
// specifically because radial layouts compress poorly on mobile.
export function WeightFactorsGrid() {
  const { language } = useLanguage();
  const ro = language === "ro";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {FACTORS.map((f) => (
        <div key={f.ro} className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2.5">
            <f.icon className="w-5 h-5 text-primary" />
          </div>
          <p className="text-sm font-semibold text-foreground leading-snug">{ro ? f.ro : f.en}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-snug">{ro ? f.noteRo : f.noteEn}</p>
        </div>
      ))}
    </div>
  );
}
