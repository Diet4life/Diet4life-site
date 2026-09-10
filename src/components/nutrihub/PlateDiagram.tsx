import { useLanguage } from "@/contexts/LanguageContext";

// Colors reuse the site's real tokens: primary green (--primary, 152 35% 40%)
// and accent blue (--accent, 210 40% 55%) as literal hex, since inline
// conic-gradient stops can't reference CSS custom properties through hsl().
const SEGMENTS = [
  {
    pct: 50,
    color: "#428a68",
    ro: "Legume",
    en: "Vegetables",
    noteRo: "crude sau gătite, cât mai variate",
    noteEn: "raw or cooked, as varied as possible",
  },
  {
    pct: 25,
    color: "#5e8cba",
    ro: "Proteină",
    en: "Protein",
    noteRo: "pește, carne, ouă, leguminoase, tofu",
    noteEn: "fish, meat, eggs, legumes, tofu",
  },
  {
    pct: 25,
    color: "#c49540",
    ro: "Carbohidrați",
    en: "Carbohydrates",
    noteRo: "cartof, orez, paste, pâine, cereale integrale",
    noteEn: "potatoes, rice, pasta, bread, whole grains",
  },
];

export function PlateDiagram() {
  const { language } = useLanguage();
  const ro = language === "ro";

  let acc = 0;
  const stops = SEGMENTS.map((s) => {
    const start = acc;
    acc += s.pct;
    return `${s.color} ${start}% ${acc}%`;
  }).join(", ");

  return (
    <div className="flex flex-col sm:flex-row items-center gap-8 py-2">
      <div
        className="w-44 h-44 rounded-full shrink-0 shadow-inner ring-1 ring-black/5"
        style={{ background: `conic-gradient(${stops})` }}
        role="img"
        aria-label={
          ro
            ? "Farfuria Diet4Life: jumătate legume, un sfert proteină, un sfert carbohidrați"
            : "Diet4Life plate: half vegetables, a quarter protein, a quarter carbohydrates"
        }
      />
      <div className="flex-1 space-y-3 w-full">
        {SEGMENTS.map((s) => (
          <div key={s.ro} className="flex items-start gap-3">
            <span className="w-3 h-3 rounded-full shrink-0 mt-1" style={{ backgroundColor: s.color }} />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {s.pct}% <span className="font-normal text-muted-foreground">— {ro ? s.ro : s.en}</span>
              </p>
              <p className="text-xs text-muted-foreground">{ro ? s.noteRo : s.noteEn}</p>
            </div>
          </div>
        ))}
        <div className="flex items-start gap-3 pt-2.5 mt-1 border-t border-border">
          <span className="w-3 h-3 rounded-full shrink-0 mt-1 bg-muted-foreground/40" />
          <p className="text-xs text-muted-foreground">
            {ro
              ? "+ o cantitate potrivită de grăsimi (ulei de măsline, nuci, semințe) și apă ca băutură principală."
              : "+ a suitable amount of fats (olive oil, nuts, seeds) and water as the main drink."}
          </p>
        </div>
      </div>
    </div>
  );
}
