import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import {
  Flame,
  Dumbbell,
  Wheat,
  Droplet,
  Leaf,
  GlassWater,
  Info,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Scale,
  Compass,
} from "lucide-react";
import { PlateDiagram } from "@/components/nutrihub/PlateDiagram";
import {
  PAL,
  MAX_AGE,
  FIBER_MIN_G,
  WATER_MIN_L,
  WATER_MAX_L,
  CARB_PCT_MIN,
  CARB_PCT_MAX,
  FAT_PCT_MIN,
  FAT_PCT_MAX,
  BMI_REFERENCE_RANGE_MIN,
  BMI_REFERENCE_RANGE_MAX,
  PROTEIN_G_PER_KG_ADULT,
  type ActivityLevel,
} from "@/lib/necesar-energetic/constants";
import {
  calculateREE,
  calculateTEE,
  truncateKcal,
  calculateProtein,
  calculateCarbsGrams,
  calculateFatGrams,
  type Sex,
  type ProteinResult,
  type GramRange,
} from "@/lib/necesar-energetic/calculations";
import {
  isEligibleAge,
  hasSafetyExclusion,
  SAFETY_EXCLUSIONS,
  type SafetySelections,
} from "@/lib/necesar-energetic/eligibility";
import {
  calculateBmiRaw,
  formatBmi,
  getBmiCategory,
  getDirectionBranch,
  calculateWeightReferenceRange,
  calculateWeightLossRange,
  type BmiCategory,
  type DirectionBranch,
  type WeightRange,
} from "@/lib/necesar-energetic/bmi";

// ─── Age-block message — reused as both the field's validation message and,   ─
// ─── defensively, anywhere else that needs to explain the standard cutoff.    ─
const AGE_BLOCK_MESSAGE_RO =
  "Calculatorul standard Diet4Life este destinat adulților. Pentru copii și adolescenți, necesarul nutrițional trebuie evaluat diferit.";
const AGE_BLOCK_MESSAGE_EN =
  "The standard Diet4Life calculator is designed for adults. Nutritional needs for children and teenagers must be assessed differently.";

// ─── Zod schema — every field carries its own plain-language error message ──
const numberField = (emptyMsg: string) =>
  z
    .string()
    .trim()
    .min(1, emptyMsg)
    .refine((v) => !Number.isNaN(Number(v)), emptyMsg);

const formSchema = z.object({
  sex: z.enum(["F", "M"], { required_error: "Selectează sexul biologic." }),
  age: numberField("Introdu vârsta în ani.")
    .refine((v) => Number.isInteger(Number(v)), "Vârsta trebuie să fie un număr întreg.")
    .transform((v) => Number(v))
    .refine((v) => v <= MAX_AGE, "Introdu o vârstă validă.")
    .refine((v) => isEligibleAge(v), AGE_BLOCK_MESSAGE_RO),
  weight: numberField("Introdu greutatea în kilograme.")
    .transform((v) => Number(v))
    .refine((v) => v > 0, "Introdu greutatea în kilograme."),
  height: numberField("Introdu înălțimea în centimetri.")
    .transform((v) => Number(v))
    .refine((v) => v > 0, "Introdu înălțimea în centimetri."),
  activityLevel: z.enum(["low", "moderate", "active", "very_active"] as const, {
    required_error: "Selectează nivelul de activitate.",
  }),
});

type FormValues = z.input<typeof formSchema>;
type ParsedValues = z.output<typeof formSchema>;

// ─── Activity level copy — texts match the spec exactly, on purpose ─────────
const ACTIVITY_OPTIONS: { value: ActivityLevel; ro: string; en: string; descRo: string; descEn: string }[] = [
  {
    value: "low",
    ro: "Activitate redusă",
    en: "Low activity",
    descRo: "Lucrezi predominant așezat și ai puțină mișcare în restul zilei.",
    descEn: "You mostly sit for work and have little movement the rest of the day.",
  },
  {
    value: "moderate",
    ro: "Moderat activ",
    en: "Moderately active",
    descRo: "Ai mișcare regulată în viața de zi cu zi și/sau activitate fizică moderată.",
    descEn: "You have regular everyday movement and/or moderate physical activity.",
  },
  {
    value: "active",
    ro: "Activ",
    en: "Active",
    descRo: "Ai multă mișcare zilnică și/sau activitate fizică regulată consistentă.",
    descEn: "You have a lot of daily movement and/or consistent regular exercise.",
  },
  {
    value: "very_active",
    ro: "Foarte activ",
    en: "Very active",
    descRo: "Ai muncă fizică solicitantă și/sau volum mare de antrenament.",
    descEn: "You have physically demanding work and/or a high training volume.",
  },
];

// ─── Practical food examples (no quantities — informational only) ──────────
const PROTEIN_FOODS = ["ouă", "iaurt", "brânză proaspătă", "pește", "carne", "linte", "fasole", "năut"];
const CARB_FOODS = ["cartof", "orez", "ovăz", "mămăligă", "paste", "pâine", "leguminoase", "fructe"];
const FIBER_FOODS = ["legume", "fructe", "fasole", "linte", "ovăz", "pâine integrală", "cereale integrale"];

const PROTEIN_FOODS_EN = ["eggs", "yogurt", "cottage cheese", "fish", "meat", "lentils", "beans", "chickpeas"];
const CARB_FOODS_EN = ["potatoes", "rice", "oats", "polenta", "pasta", "bread", "legumes", "fruit"];
const FIBER_FOODS_EN = ["vegetables", "fruit", "beans", "lentils", "oats", "whole-grain bread", "whole grains"];

// ─── Real Romanian meal examples -- replaced this round with a more varied
// set per explicit instruction; bread now appears in exactly one example
// (was appearing in several). ────────────────────────────────────────────
const MEAL_EXAMPLES_RO = [
  "omletă cu legume + o felie de pâine integrală",
  "iaurt grecesc + ovăz + fructe + nuci",
  "pește la cuptor + cartof + salată",
  "tocăniță de pui cu legume + mămăligă",
  "linte cu legume + salată",
  "paste cu ton, roșii și legume",
];
const MEAL_EXAMPLES_EN = [
  "vegetable omelet + a slice of whole-grain bread",
  "Greek yogurt + oats + fruit + nuts",
  "baked fish + potato + salad",
  "chicken stew with vegetables + polenta",
  "lentils with vegetables + salad",
  "pasta with tuna, tomatoes and vegetables",
];

// ─── Educational macro-distribution example (15/55/30) -- a fixed,
// illustrative example for a healthy, normal-weight adult, NOT derived from
// or feeding back into any calculation. Deliberately uses a monochrome
// green-opacity ramp (not PlateDiagram's green/blue/gold trio) so it reads
// as visually unrelated to the 50/25/25 plate -- two different educational
// concepts (energy-share-by-macro vs. meal-building-by-plate-area) must
// never look like the same chart.
const MACRO_EXAMPLE = [
  { pct: 15, color: "hsl(141 33% 27%)", labelRo: "Proteine", labelEn: "Protein" },
  { pct: 55, color: "hsl(141 33% 27% / 0.55)", labelRo: "Carbohidrați", labelEn: "Carbohydrates" },
  { pct: 30, color: "hsl(141 33% 27% / 0.3)", labelRo: "Grăsimi", labelEn: "Fat" },
];

// ─── BMI category labels (the 6 WHO categories, shown on the IMC badge) ─────
const BMI_CATEGORY_LABELS: Record<BmiCategory, { ro: string; en: string }> = {
  underweight: { ro: "Subponderal", en: "Underweight" },
  reference: { ro: "Interval de referință", en: "Reference range" },
  overweight: { ro: "Suprapondere", en: "Overweight" },
  obese1: { ro: "Obezitate grad I", en: "Obesity grade I" },
  obese2: { ro: "Obezitate grad II", en: "Obesity grade II" },
  obese3: { ro: "Obezitate grad III", en: "Obesity grade III" },
};

// ─── Status + direction copy — 4 branches, obese1/2/3 share one ────────────
const DIRECTION_COPY: Record<
  DirectionBranch,
  { titleRo: string; titleEn: string; directionRo: string; directionEn: string; textRo: string; textEn: string; showCta: boolean }
> = {
  underweight: {
    titleRo: "Greutatea ta este sub intervalul de referință",
    titleEn: "Your weight is below the reference range",
    directionRo: "Creștere ponderală / evaluare individuală",
    directionEn: "Weight gain / individual assessment",
    textRo: "Înainte de a crește aportul caloric, este util să fie înțeleasă cauza greutății scăzute și stabilit un obiectiv potrivit.",
    textEn: "Before increasing caloric intake, it helps to understand the cause of the low weight and set a suitable goal.",
    showCta: true,
  },
  reference: {
    titleRo: "Greutatea ta se află în intervalul de referință",
    titleEn: "Your weight is within the reference range",
    directionRo: "Menținere",
    directionEn: "Maintenance",
    textRo: "Dacă nu există alte obiective medicale, direcția orientativă este menținerea greutății.",
    textEn: "If there are no other medical goals, the orientative direction is maintaining your weight.",
    showCta: false,
  },
  overweight: {
    titleRo: "Greutatea ta este peste intervalul de referință",
    titleEn: "Your weight is above the reference range",
    directionRo: "Scădere ponderală",
    directionEn: "Weight loss",
    textRo: "O reducere ponderală poate fi utilă pentru sănătate, dar obiectivul potrivit nu se stabilește doar pe baza IMC-ului.",
    textEn: "Weight loss can be beneficial for health, but the right target isn't set from BMI alone.",
    showCta: false,
  },
  obese: {
    titleRo: "IMC-ul tău se află în intervalul asociat obezității",
    titleEn: "Your BMI falls in the range associated with obesity",
    directionRo: "Scădere ponderală + evaluare individuală",
    directionEn: "Weight loss + individual assessment",
    textRo: "Managementul greutății trebuie să țină cont și de starea metabolică, funcțională și de contextul individual.",
    textEn: "Weight management also needs to account for metabolic and functional status and individual context.",
    showCta: true,
  },
};

// ─── "What this result means" — a short, generic interpretation layer shown
// once after the daily reference numbers, keyed off the same directionBranch
// already used by DIRECTION_COPY above. Deliberately not a repeat of that
// card's text: DIRECTION_COPY frames the health direction before the
// numbers; this frames how to read the energy figure itself, after it.
const RESULT_MEANING: Record<DirectionBranch, { ro: string; en: string }> = {
  underweight: {
    ro: "Rezultatul indică o direcție orientativă spre creștere ponderală. Pentru stabilirea aportului potrivit, o evaluare individuală este recomandată.",
    en: "The result points toward an orientative weight-gain direction. An individual assessment is recommended to determine the right intake.",
  },
  reference: {
    ro: "Aportul estimat este orientat spre menținerea greutății tale actuale.",
    en: "The estimated intake is oriented toward maintaining your current weight.",
  },
  overweight: {
    ro: "Intervalul afișat este o orientare pentru scădere ponderală și nu trebuie interpretat ca o prescripție fixă.",
    en: "The displayed range is an orientation for weight loss and should not be interpreted as a fixed prescription.",
  },
  obese: {
    ro: "Intervalul afișat este o orientare pentru scădere ponderală și nu trebuie interpretat ca o prescripție fixă.",
    en: "The displayed range is an orientation for weight loss and should not be interpreted as a fixed prescription.",
  },
};

// ─── Contextual NutriHub recommendation — one article per directionBranch,
// replacing the old fixed 2-card + 4-chip grid. The protein article is
// offered separately (see PROTEIN_ARTICLE below) only when a real protein
// number is actually shown, never alongside the "needs evaluation" panel.
const NUTRIHUB_RECOMMENDATION: Record<DirectionBranch, { titleRo: string; titleEn: string; href: string }> = {
  reference: {
    titleRo: "Sunt toate caloriile la fel?",
    titleEn: "Are all calories equal?",
    href: "/nutrihub/sunt-toate-caloriile-la-fel",
  },
  overweight: {
    titleRo: "Controlul greutății: de ce nu se reduce la „mănâncă mai puțin”",
    titleEn: "Weight control: why it's not just about eating less",
    href: "/nutrihub/controlul-greutatii",
  },
  obese: {
    titleRo: "Controlul greutății: de ce nu se reduce la „mănâncă mai puțin”",
    titleEn: "Weight control: why it's not just about eating less",
    href: "/nutrihub/controlul-greutatii",
  },
  underweight: {
    titleRo: "Câte calorii am nevoie, de fapt?",
    titleEn: "How many calories do I actually need?",
    href: "/nutrihub/cate-calorii-am-nevoie",
  },
};
const PROTEIN_ARTICLE = {
  titleRo: "De ce este importantă proteina și de câtă avem nevoie?",
  titleEn: "Why protein matters and how much you actually need",
  href: "/nutrihub/cata-proteina-am-nevoie",
};

// ─── Results shape ────────────────────────────────────────────────────────────
type EnergyResult =
  | { kind: "maintenance"; kcal: number }
  | { kind: "loss"; kcalLow: number; kcalHigh: number }
  | { kind: "loss_blocked" }
  | { kind: "underweight_no_calc" };

type ResultState =
  | { status: "idle" }
  | { status: "blocked-safety" }
  | {
      status: "ok";
      bmi: number;
      bmiCategory: BmiCategory;
      directionBranch: DirectionBranch;
      weightRange: WeightRange;
      energy: EnergyResult;
      protein: ProteinResult;
      carbs: GramRange | null;
      fat: GramRange | null;
    };

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Calculator() {
  const { language } = useLanguage();
  const ro = language === "ro";

  const [safety, setSafety] = useState<SafetySelections>({});
  const [result, setResult] = useState<ResultState>({ status: "idle" });
  const [showActivityHelp, setShowActivityHelp] = useState(false);
  const [showCarbGrams, setShowCarbGrams] = useState(false);
  const [showFatGrams, setShowFatGrams] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sex: undefined,
      age: "",
      weight: "",
      height: "",
      activityLevel: undefined,
    },
  });

  const onSubmit = (values: FormValues) => {
    const parsed = values as unknown as ParsedValues;

    if (hasSafetyExclusion(safety)) {
      setResult({ status: "blocked-safety" });
      requestAnimationFrame(() => scrollToId("rezultate"));
      return;
    }

    const sex: Sex = parsed.sex;
    const bmiRaw = calculateBmiRaw(parsed.weight, parsed.height);
    const bmi = formatBmi(bmiRaw);
    const bmiCategory = getBmiCategory(bmiRaw);
    const directionBranch = getDirectionBranch(bmiCategory);
    const weightRange = calculateWeightReferenceRange(parsed.height);

    const ree = calculateREE(sex, parsed.weight, parsed.height, parsed.age);
    const teeRaw = calculateTEE(ree, PAL[parsed.activityLevel]);

    let energy: EnergyResult;
    let carbs: GramRange | null = null;
    let fat: GramRange | null = null;

    if (directionBranch === "underweight") {
      energy = { kind: "underweight_no_calc" };
    } else if (directionBranch === "reference") {
      const kcal = truncateKcal(teeRaw);
      energy = { kind: "maintenance", kcal };
      carbs = calculateCarbsGrams(kcal, kcal);
      fat = calculateFatGrams(kcal, kcal);
    } else {
      // overweight or obese -> orientative weight-loss deficit
      const wl = calculateWeightLossRange(teeRaw);
      if (wl.blocked) {
        energy = { kind: "loss_blocked" };
      } else {
        energy = { kind: "loss", kcalLow: wl.kcalLow, kcalHigh: wl.kcalHigh };
        carbs = calculateCarbsGrams(wl.kcalLow, wl.kcalHigh);
        fat = calculateFatGrams(wl.kcalLow, wl.kcalHigh);
      }
    }

    const protein = calculateProtein(parsed.weight, parsed.age, directionBranch);

    setShowCarbGrams(false);
    setShowFatGrams(false);
    setResult({ status: "ok", bmi, bmiCategory, directionBranch, weightRange, energy, protein, carbs, fat });
    requestAnimationFrame(() => scrollToId("rezultate"));
  };

  return (
    <div
      className="min-h-screen bg-background py-16 md:py-20"
      style={{
        // Same page-scoped palette override as Home/About/Services (kept in
        // sync by hand -- see those files' own comments for why this isn't
        // imported). Brings /calculator into the same warm-cream visual
        // family instead of the raw global :root tokens it used before.
        "--background": "37 62% 96%", // #FBF6EE
        "--card": "38 73% 97%", // #FDF9F2
        "--primary": "141 33% 27%", // #2F5D3F
        "--muted-foreground": "22 16% 41%", // #7A6559
      } as any}
    >
      {/* Narrower than Home's PAGE_COLUMN on purpose -- this is a form page,
          not an editorial one, so it keeps its own max-w-3xl width. Only the
          mobile padding convention (18px/20px, not Tailwind's default
          px-4/16px) is adopted from the sitewide system. */}
      <div className="max-w-3xl mx-auto px-[18px] min-[380px]:px-5">

        {/* ── 1. Intro ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-5">
            <Flame className="w-4 h-4" />
            {ro ? "Calculator educațional" : "Educational calculator"}
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            {ro ? "Necesarul tău nutrițional, estimat" : "Your nutritional needs, estimated"}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto mb-3">
            {ro
              ? "Estimează necesarul zilnic de energie și câteva repere utile pentru alimentația de zi cu zi."
              : "Estimate your daily energy needs and a few useful reference points for everyday eating."}
          </p>
          {/* Made visually secondary (smaller, lower-contrast) relative to
              the main subtitle above -- was the same muted-foreground color
              at only one step down in size (text-sm vs text-lg); now text-xs
              at reduced opacity so it reads as a footnote-level caveat, not
              a second subtitle. */}
          <p className="text-xs text-muted-foreground/70 max-w-xl mx-auto mb-8">
            {ro
              ? "Rezultatele sunt orientative și nu înlocuiesc o evaluare nutrițională sau medicală individuală."
              : "The results are orientative and do not replace an individual nutrition or medical assessment."}
          </p>
          <Button size="lg" className="rounded-full px-8" onClick={() => scrollToId("formular")} data-testid="button-start-calculator">
            {ro ? "Calculează necesarul meu" : "Calculate my needs"}
          </Button>
        </motion.div>

        {/* ── 2–4. Form: personal data, activity, safety filter ─────────────── */}
        <div id="formular" className="scroll-mt-24">
          {/* Plain flat surface instead of shadcn's Card (border + shadow) --
              a thin border is kept so the form reads as a distinct input
              area, but the heavy shadow is dropped per the "less SaaS-card"
              visual direction. */}
          <div className="rounded-2xl border border-border bg-card/60 p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                  {/* Date personale */}
                  <div>
                    <h2 className="text-lg font-serif font-bold text-foreground mb-4">
                      {ro ? "Date personale" : "Personal information"}
                    </h2>
                    <div className="space-y-5">
                      <FormField
                        control={form.control}
                        name="sex"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{ro ? "Sex biologic" : "Biological sex"}</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="grid grid-cols-2 gap-3"
                              >
                                {[
                                  { value: "F", ro: "Femeie", en: "Female" },
                                  { value: "M", ro: "Bărbat", en: "Male" },
                                ].map((opt) => (
                                  <label
                                    key={opt.value}
                                    htmlFor={`sex-${opt.value}`}
                                    className={`flex items-center gap-3 rounded-xl border p-3.5 min-h-[44px] cursor-pointer transition-colors ${
                                      field.value === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                                    }`}
                                  >
                                    <RadioGroupItem value={opt.value} id={`sex-${opt.value}`} />
                                    <span className="text-sm font-medium text-foreground">{ro ? opt.ro : opt.en}</span>
                                  </label>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="age"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{ro ? "Vârstă (ani)" : "Age (years)"}</FormLabel>
                              <FormControl>
                                <Input type="number" inputMode="numeric" step="1" placeholder="35" {...field} data-testid="input-age" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="weight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{ro ? "Greutate (kg)" : "Weight (kg)"}</FormLabel>
                              <FormControl>
                                <Input type="number" inputMode="decimal" step="0.1" placeholder="70" {...field} data-testid="input-weight" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{ro ? "Înălțime (cm)" : "Height (cm)"}</FormLabel>
                            <FormControl>
                              <Input type="number" inputMode="decimal" step="0.1" placeholder="170" className="max-w-[calc(50%-0.5rem)]" {...field} data-testid="input-height" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Nivel de activitate */}
                  <div>
                    <h2 className="text-lg font-serif font-bold text-foreground mb-4">
                      {ro ? "Nivelul de activitate" : "Activity level"}
                    </h2>
                    <FormField
                      control={form.control}
                      name="activityLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="gap-3">
                              {ACTIVITY_OPTIONS.map((opt) => (
                                <label
                                  key={opt.value}
                                  htmlFor={`activity-${opt.value}`}
                                  className={`flex items-start gap-3 rounded-xl border p-4 min-h-[44px] cursor-pointer transition-colors ${
                                    field.value === opt.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                                  }`}
                                >
                                  <RadioGroupItem value={opt.value} id={`activity-${opt.value}`} className="mt-0.5" />
                                  <span>
                                    <span className="block text-sm font-semibold text-foreground">{ro ? opt.ro : opt.en}</span>
                                    <span className="block text-xs text-muted-foreground mt-0.5">{ro ? opt.descRo : opt.descEn}</span>
                                  </span>
                                </label>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Pill-button treatment (was a plain text link) so this
                        easy-to-miss helper is easier to notice without
                        becoming a second CTA -- same bg-primary/10 pattern
                        used for highlight pills elsewhere on the site. */}
                    <button
                      type="button"
                      onClick={() => setShowActivityHelp((v) => !v)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-2 text-sm font-semibold text-primary mt-3 hover:bg-primary/15 transition-colors"
                      data-testid="button-activity-help"
                    >
                      <HelpCircle className="w-4 h-4 shrink-0" />
                      {ro ? "Nu știu ce să aleg → Ajută-mă" : "I'm not sure which to pick → Help me"}
                    </button>

                    {showActivityHelp && (
                      <div className="mt-3 rounded-xl bg-secondary/40 border border-border p-4 text-sm text-muted-foreground leading-relaxed">
                        <p className="font-medium text-foreground mb-2">
                          {ro ? "Cum aleg nivelul de activitate?" : "How do I choose my activity level?"}
                        </p>
                        <p className="mb-2">
                          {ro
                            ? "Gândește-te la o zi obișnuită din ultimele 2–3 luni, nu la o zi excepțional de activă sau inactivă."
                            : "Think of a typical day over the last 2–3 months, not an unusually active or inactive one."}
                        </p>
                        <ul className="space-y-1.5 list-disc pl-4">
                          <li>
                            {ro
                              ? "Lucrezi așezat (birou, condus) și nu faci mișcare structurată → Activitate redusă."
                              : "You sit for work (desk, driving) and don't exercise regularly → Low activity."}
                          </li>
                          <li>
                            {ro
                              ? "Ai un loc de muncă cu mișcare moderată sau faci mișcare de 2–3 ori/săptămână → Moderat activ."
                              : "Your job involves moderate movement, or you exercise 2–3 times/week → Moderately active."}
                          </li>
                          <li>
                            {ro
                              ? "Ai un loc de muncă activ sau te miști intens de 4–5 ori/săptămână → Activ."
                              : "Your job is active, or you exercise intensely 4–5 times/week → Active."}
                          </li>
                          <li>
                            {ro
                              ? "Muncă fizică solicitantă zilnic sau antrenamente intense aproape zilnic → Foarte activ."
                              : "Physically demanding daily work, or near-daily intense training → Very active."}
                          </li>
                        </ul>
                        <p className="mt-2">
                          {ro
                            ? "Dacă ești la limită între două categorii, alege-o pe cea mai prudentă."
                            : "If you're between two categories, pick the more conservative one."}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Filtru de siguranță -- wrapped in its own subdued
                      surface (was bare labels directly in the form flow) so
                      it visually reads as a distinct screening step, not as
                      just more ordinary lifestyle options alongside age/
                      weight/activity. Logic/options/blocking behavior
                      unchanged -- visual grouping only. */}
                  <div className="rounded-2xl bg-secondary/30 p-4 md:p-5">
                    <h2 className="text-lg font-serif font-bold text-foreground mb-1.5">
                      {ro ? "Se aplică ceva dintre următoarele?" : "Does any of the following apply to you?"}
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      {ro
                        ? "Bifează dacă e cazul — recomandările standard nu sunt potrivite pentru aceste situații."
                        : "Check if it applies — the standard recommendations aren't suited to these situations."}
                    </p>
                    <div className="space-y-2.5">
                      {SAFETY_EXCLUSIONS.map((item) => (
                        <label
                          key={item.key}
                          htmlFor={`safety-${item.key}`}
                          className="flex items-start gap-3 rounded-xl border border-border bg-background p-3.5 min-h-[44px] cursor-pointer hover:border-primary/30 transition-colors"
                        >
                          <Checkbox
                            id={`safety-${item.key}`}
                            checked={!!safety[item.key]}
                            onCheckedChange={(checked) =>
                              setSafety((prev) => ({ ...prev, [item.key]: checked === true }))
                            }
                            className="mt-0.5"
                            data-testid={`checkbox-safety-${item.key}`}
                          />
                          <span className="text-sm text-foreground">{ro ? item.ro : item.en}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" size="lg" className="w-full rounded-xl" data-testid="button-calculate">
                    {ro ? "Calculează" : "Calculate"}
                  </Button>
              </form>
            </Form>
          </div>
        </div>

        {/* ── 5–6. Rezultate ─────────────────────────────────────────────── */}
        <div id="rezultate" className="scroll-mt-24">
          {result.status === "blocked-safety" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 p-6 flex items-start gap-4"
              data-testid="panel-blocked-safety"
            >
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-1.5">
                  {ro ? "Necesarul tău poate necesita un calcul diferit." : "Your needs may require a different calculation."}
                </h3>
                <p className="text-sm text-amber-900/80 leading-relaxed">
                  {ro
                    ? "Recomandările generale ale acestui calculator nu sunt potrivite pentru situația selectată. O evaluare individuală este mai sigură."
                    : "This calculator's general recommendations aren't suited to the situation you selected. An individual assessment is safer."}
                </p>
              </div>
            </motion.div>
          )}

          {result.status === "ok" && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mt-10">
              {/* ── 8. IMC ─────────────────────────────────────────────────── */}
              <div className="rounded-2xl bg-card/60 p-6 mb-4">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <Scale className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium">{ro ? "IMC-ul tău" : "Your BMI"}</p>
                </div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  <p className="text-3xl font-bold font-serif text-foreground" data-testid="text-bmi-value">
                    {result.bmi.toLocaleString(ro ? "ro-RO" : "en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </p>
                  <span className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary" data-testid="text-bmi-category">
                    {ro ? BMI_CATEGORY_LABELS[result.bmiCategory].ro : BMI_CATEGORY_LABELS[result.bmiCategory].en}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  {ro
                    ? "IMC-ul este un instrument de orientare, nu un diagnostic complet. Nu descrie direct compoziția corporală, distribuția grăsimii sau starea metabolică."
                    : "BMI is an orientation tool, not a complete diagnosis. It doesn't directly describe body composition, fat distribution, or metabolic status."}
                </p>
              </div>

              {/* ── 9. Status actual + direcție orientativă ──────────────────── */}
              <div className="rounded-2xl bg-card/60 p-6 mb-4">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <Compass className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium">
                    {ro
                      ? DIRECTION_COPY[result.directionBranch].directionRo
                      : DIRECTION_COPY[result.directionBranch].directionEn}
                  </p>
                </div>
                <h3 className="text-lg font-serif font-bold text-foreground mb-2" data-testid="text-direction-title">
                  {ro ? DIRECTION_COPY[result.directionBranch].titleRo : DIRECTION_COPY[result.directionBranch].titleEn}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {ro ? DIRECTION_COPY[result.directionBranch].textRo : DIRECTION_COPY[result.directionBranch].textEn}
                </p>
                {DIRECTION_COPY[result.directionBranch].showCta && (
                  <Button asChild variant="outline" size="sm" className="rounded-full mt-4">
                    <Link href="/contact">{ro ? "Hai să discutăm" : "Let's talk"}</Link>
                  </Button>
                )}
              </div>

              {/* ── 10. Interval orientativ de greutate ──────────────────────── */}
              {/* This card's own caveat text (below) is kept verbatim and
                  NOT folded into the new consolidated interpretation block
                  -- it specifically distinguishes this range from a
                  personalized/"ideal" target weight, which is a distinct,
                  deliberate safeguard (see the standing "never expose an
                  ideal-weight formula" rule), not generic repetition. */}
              <div className="rounded-2xl bg-card/60 p-6 mb-4">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <Scale className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium">
                    {ro
                      ? `Interval orientativ de greutate corespunzător unui IMC ${BMI_REFERENCE_RANGE_MIN.toString().replace(".", ",")}–${BMI_REFERENCE_RANGE_MAX.toString().replace(".", ",")}`
                      : `Orientative weight range corresponding to a BMI of ${BMI_REFERENCE_RANGE_MIN}–${BMI_REFERENCE_RANGE_MAX}`}
                  </p>
                </div>
                <p className="text-2xl font-bold font-serif text-foreground" data-testid="text-weight-range">
                  {result.weightRange.min.toLocaleString(ro ? "ro-RO" : "en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  –
                  {result.weightRange.max.toLocaleString(ro ? "ro-RO" : "en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}{" "}
                  kg
                </p>
                {/* Expanded per explicit instruction: spells out exactly
                    where the two numbers come from (BMI 18.5-24.9 x the
                    entered height) before repeating the "not an automatic
                    target" safeguard -- the old version asserted the
                    safeguard without explaining the arithmetic, which read
                    as arbitrary. Still never says "greutate ideală". */}
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {ro
                    ? `Acest interval este calculat matematic pentru un IMC între ${BMI_REFERENCE_RANGE_MIN.toString().replace(".", ",")} și ${BMI_REFERENCE_RANGE_MAX.toString().replace(".", ",")}, folosind înălțimea introdusă. Nu reprezintă automat greutatea pe care ar trebui să o atingi. Un obiectiv potrivit se stabilește în funcție de contextul individual, compoziția corporală și starea de sănătate.`
                    : `This range is calculated mathematically for a BMI between ${BMI_REFERENCE_RANGE_MIN} and ${BMI_REFERENCE_RANGE_MAX}, using the height you entered. It does not automatically represent the weight you should reach. An appropriate goal is set based on individual context, body composition, and health status.`}
                </p>
              </div>

              {/* ── Consolidated interpretation block ─────────────────────────
                  Replaces the generic "this is an estimate / needs vary"
                  caveats that used to be repeated under the maintenance and
                  weight-loss energy cards below (trimmed in place). Shown
                  once, here, before the numbers -- not a card, just a plain
                  flat surface so it doesn't compete visually with the
                  actual results. */}
              <div className="rounded-2xl bg-secondary/30 p-5 md:p-6 mb-8 flex items-start gap-3">
                <Info className="w-4 h-4 text-primary shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {ro ? "Cum să interpretezi rezultatul" : "How to read your result"}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {ro
                      ? "Cifrele de mai jos sunt estimări, nu măsurători exacte. Necesarul real poate diferi de la o persoană la alta, chiar și la aceeași greutate și înălțime — contează nivelul real de activitate, compoziția corporală, acuratețea datelor introduse și contextul individual de sănătate."
                      : "The figures below are estimates, not exact measurements. Actual needs can differ from person to person, even at the same weight and height — real activity level, body composition, the accuracy of the data you entered, and individual health context all play a role."}
                  </p>
                </div>
              </div>

              <h2 className="text-2xl font-serif font-bold text-foreground text-center mb-6 mt-10">
                {ro ? "Reperele tale zilnice" : "Your daily reference points"}
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Energie — 4 variants depending on direction */}
                {result.energy.kind === "maintenance" && (
                  <div className="rounded-2xl bg-primary text-primary-foreground p-6 sm:col-span-2">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                      <Flame className="w-4 h-4" />
                      <p className="text-sm font-medium">{ro ? "Aport orientativ pentru menținere" : "Orientative maintenance intake"}</p>
                    </div>
                    <p className="text-3xl font-bold font-serif" data-testid="text-energy-value">
                      {result.energy.kcal.toLocaleString(ro ? "ro-RO" : "en-US")} kcal/zi
                    </p>
                    <p className="text-sm opacity-90 mt-2">
                      {ro ? "Estimare pentru menținerea greutății actuale." : "Estimate for maintaining your current weight."}
                    </p>
                  </div>
                )}

                {result.energy.kind === "loss" && (
                  <div className="rounded-2xl bg-primary text-primary-foreground p-6 sm:col-span-2">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                      <Flame className="w-4 h-4" />
                      <p className="text-sm font-medium">{ro ? "Aport orientativ pentru scădere ponderală" : "Orientative weight-loss intake"}</p>
                    </div>
                    <p className="text-3xl font-bold font-serif" data-testid="text-energy-value">
                      {result.energy.kcalLow.toLocaleString(ro ? "ro-RO" : "en-US")}–
                      {result.energy.kcalHigh.toLocaleString(ro ? "ro-RO" : "en-US")} kcal/zi
                    </p>
                    <p className="text-sm opacity-90 mt-2">
                      {ro
                        ? "Interval calculat pornind de la necesarul energetic estimat și un deficit moderat."
                        : "Range calculated from your estimated energy needs and a moderate deficit."}
                    </p>
                    {/* Was a generic "this is guidance, not a prescription,
                        depends on X/Y/Z" caveat (now consolidated above) --
                        replaced with a short, contextual lead-in straight
                        into the CTA, so the button reads as a natural next
                        step rather than a repeated disclaimer. */}
                    <p className="text-xs opacity-75 mt-3">
                      {ro
                        ? "Dacă vrei un plan adaptat situației tale, nu doar o estimare generală:"
                        : "If you'd like a plan adapted to your situation, not just a general estimate:"}
                    </p>
                    <Button asChild variant="secondary" size="sm" className="rounded-full mt-2">
                      <Link href="/contact">{ro ? "Hai să discutăm" : "Let's talk"}</Link>
                    </Button>
                  </div>
                )}

                {result.energy.kind === "loss_blocked" && (
                  <div
                    className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:col-span-2 flex items-start gap-4"
                    data-testid="panel-loss-blocked"
                  >
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-1.5">
                        {ro
                          ? "Pentru datele introduse, o recomandare automată de reducere calorică nu este potrivită."
                          : "For the data entered, an automatic caloric-reduction recommendation isn't appropriate."}
                      </h3>
                      {/* New: explains *why* the calculator stops here,
                          phrased so the threshold doesn't read as a
                          universal physiological floor -- it's a safety
                          margin for an unsupervised automatic calculation,
                          not a claim that this exact number is where risk
                          begins for every body. */}
                      <p className="text-sm text-amber-900/80 leading-relaxed mb-2">
                        {ro
                          ? "Sub un anumit nivel, calculul automat al unui deficit caloric nu mai este sigur fără supraveghere — nu pentru că acest prag ar fi o limită fixă, valabilă la fel pentru toată lumea, ci pentru că la aporturi foarte reduse crește riscul de a nu acoperi nevoile nutriționale de bază."
                          : "Below a certain level, automatically calculating a caloric deficit is no longer safe without supervision — not because this threshold is a fixed limit that applies the same way to everyone, but because very low intakes raise the risk of not covering basic nutritional needs."}
                      </p>
                      <p className="text-sm text-amber-900/80 leading-relaxed mb-3">
                        {ro
                          ? "Un aport atât de redus necesită evaluare individuală și monitorizare adecvată."
                          : "An intake this low needs individual assessment and proper monitoring."}
                      </p>
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link href="/contact">{ro ? "Hai să discutăm" : "Let's talk"}</Link>
                      </Button>
                    </div>
                  </div>
                )}

                {result.energy.kind === "underweight_no_calc" && (
                  <div
                    className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:col-span-2 flex items-start gap-4"
                    data-testid="panel-underweight-no-calc"
                  >
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-900/80 leading-relaxed mb-3">
                        {ro
                          ? "Aportul pentru creștere ponderală trebuie stabilit după evaluarea cauzei și a situației individuale."
                          : "Intake for weight gain should be set only after assessing the cause and the individual situation."}
                      </p>
                      <Button asChild variant="outline" size="sm" className="rounded-full">
                        <Link href="/contact">{ro ? "Hai să discutăm" : "Let's talk"}</Link>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Proteină */}
                <div
                  className={
                    result.protein.kind === "needs_individual_evaluation"
                      ? "rounded-2xl border border-amber-200 bg-amber-50 p-5"
                      : "rounded-2xl bg-card/60 p-5"
                  }
                >
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <Dumbbell className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium">{ro ? "Proteină" : "Protein"}</p>
                  </div>
                  {result.protein.kind === "needs_individual_evaluation" ? (
                    <p className="text-sm text-amber-900/80 leading-relaxed" data-testid="text-protein-needs-evaluation">
                      {ro
                        ? "La persoanele cu suprapondere sau obezitate, necesarul de proteină nu este estimat automat doar pe baza greutății corporale actuale. Pentru stabilirea unui aport individual este necesară o evaluare nutrițională."
                        : "For people who are overweight or living with obesity, protein needs aren't automatically estimated from current body weight alone. Establishing an individual intake requires a nutritional evaluation."}
                    </p>
                  ) : result.protein.max === null ? (
                    <>
                      {/* Healthy adult (18-64y) branch -- redesigned to lead
                          with the body-weight reference (what the EFSA
                          figure actually is) before the grams/day number,
                          per explicit request: g/kg -> g/day reads as more
                          concrete to a patient than a %-of-energy framing
                          alone. "≈ 0,8 g/kg/zi" is the rounded, easy-to-
                          remember headline figure; the exact EFSA PRI
                          (0.83, from the same PROTEIN_G_PER_KG_ADULT
                          constant the calculation itself already uses) is
                          cited as a secondary note, not invented separately.
                          The 10-15%-of-energy line from the previous round
                          is removed here (per the same request) -- this is
                          the one branch it applied confusing-not-concrete
                          framing to; the senior branch below is untouched. */}
                      <p className="text-sm font-medium text-muted-foreground">
                        {ro ? "Reper general" : "General reference"}
                      </p>
                      <p className="text-lg font-bold font-serif text-foreground" data-testid="text-protein-per-kg">
                        {ro ? "≈ 0,8 g proteine/kg corp/zi" : "≈ 0.8 g protein/kg body weight/day"}
                      </p>
                      <p className="text-xl font-bold font-serif text-foreground mt-1" data-testid="text-protein-value">
                        ≈ {result.protein.min} g/zi
                      </p>
                      <p className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                        {ro
                          ? `EFSA PRI: ${PROTEIN_G_PER_KG_ADULT.toString().replace(".", ",")} g/kg/zi pentru adulți.`
                          : `EFSA PRI: ${PROTEIN_G_PER_KG_ADULT} g/kg/day for adults.`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {ro
                          ? "Nevoile pot fi diferite în funcție de activitate, obiective, vârstă și stare de sănătate."
                          : "Needs can differ based on activity, goals, age, and health status."}
                      </p>
                    </>
                  ) : (
                    <>
                      {/* Senior (≥65y, ESPEN 1.0-1.2 g/kg) branch --
                          deliberately left exactly as the previous round
                          shipped it, including its own 10-15%-of-energy
                          line, per explicit instruction to keep the
                          older-adult context separate from this change. */}
                      <p className="text-xl font-bold font-serif text-foreground" data-testid="text-protein-value">
                        ≈ {result.protein.min}–{result.protein.max} g/zi
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {ro
                          ? "Pentru adulții vârstnici sănătoși, aportul proteic recomandat este în general mai mare decât reperul pentru adultul tânăr."
                          : "For healthy older adults, the recommended protein intake is generally higher than the young-adult reference."}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {ro
                          ? "Nevoile pot fi diferite în funcție de activitate, obiective, vârstă și stare de sănătate."
                          : "Needs can differ based on activity, goals, age, and health status."}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5 pt-1.5 border-t border-border/50">
                        {ro
                          ? "Ca reper general, proteinele pot reprezenta aproximativ 10–15% din aportul energetic zilnic la adulții sănătoși."
                          : "As a general reference, protein can represent roughly 10-15% of daily energy intake for healthy adults."}
                      </p>
                    </>
                  )}
                </div>

                {/* Carbohidrați */}
                <div className="rounded-2xl bg-card/60 p-5">
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <Wheat className="w-4 h-4 text-amber-600" />
                    <p className="text-sm font-medium">{ro ? "Carbohidrați" : "Carbohydrates"}</p>
                  </div>
                  <p className="text-xl font-bold font-serif text-foreground">
                    {(CARB_PCT_MIN * 100).toFixed(0)}–{(CARB_PCT_MAX * 100).toFixed(0)}%{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      {ro ? "din energia zilnică" : "of daily energy"}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {ro ? "Interval orientativ. Contează și sursa alimentelor." : "Orientative range. The food source matters too."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {ro
                      ? "Alege frecvent cereale integrale, leguminoase, legume și fructe."
                      : "Choose whole grains, legumes, vegetables and fruit often."}
                  </p>
                  {result.carbs && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowCarbGrams((v) => !v)}
                        className="text-xs font-medium text-primary hover:underline mt-2"
                        data-testid="button-toggle-carb-grams"
                      >
                        {showCarbGrams
                          ? (ro ? "Ascunde gramele" : "Hide grams")
                          : (ro ? "Vezi și în grame" : "See it in grams too")}
                      </button>
                      {showCarbGrams && (
                        <p className="text-sm font-semibold text-foreground mt-1.5" data-testid="text-carb-grams">
                          {result.carbs.min}–{result.carbs.max} g/zi
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Grăsimi */}
                <div className="rounded-2xl bg-card/60 p-5">
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <Droplet className="w-4 h-4 text-accent" />
                    <p className="text-sm font-medium">{ro ? "Grăsimi" : "Fat"}</p>
                  </div>
                  <p className="text-xl font-bold font-serif text-foreground">
                    {(FAT_PCT_MIN * 100).toFixed(0)}–{(FAT_PCT_MAX * 100).toFixed(0)}%{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      {ro ? "din energia zilnică" : "of daily energy"}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {ro
                      ? "Cantitatea contează, dar și tipul de grăsime. Alege predominant surse de grăsimi nesaturate."
                      : "The amount matters, but so does the type of fat. Choose mostly unsaturated sources."}
                  </p>
                  {result.fat && (
                    <>
                      <button
                        type="button"
                        onClick={() => setShowFatGrams((v) => !v)}
                        className="text-xs font-medium text-primary hover:underline mt-2"
                        data-testid="button-toggle-fat-grams"
                      >
                        {showFatGrams
                          ? (ro ? "Ascunde gramele" : "Hide grams")
                          : (ro ? "Vezi și în grame" : "See it in grams too")}
                      </button>
                      {showFatGrams && (
                        <p className="text-sm font-semibold text-foreground mt-1.5" data-testid="text-fat-grams">
                          {result.fat.min}–{result.fat.max} g/zi
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Fibre */}
                <div className="rounded-2xl bg-card/60 p-5">
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <Leaf className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium">{ro ? "Fibre" : "Fiber"}</p>
                  </div>
                  <p className="text-xl font-bold font-serif text-foreground">
                    {ro ? `Cel puțin ${FIBER_MIN_G} g/zi` : `At least ${FIBER_MIN_G} g/day`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {ro
                      ? "Include regulat legume, fructe, leguminoase și cereale integrale."
                      : "Regularly include vegetables, fruit, legumes and whole grains."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {ro
                      ? "Dacă în prezent consumi puține fibre, crește aportul progresiv."
                      : "If you currently eat little fiber, increase your intake gradually."}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5 italic">
                    {ro
                      ? "Nucile și semințele sunt surse nutritive de fibre, dar nu este nevoie de cantități foarte mari."
                      : "Nuts and seeds are nutritious fiber sources, but you don't need large amounts of them."}
                  </p>
                </div>
              </div>

              {/* Apă — full width */}
              <div className="rounded-2xl bg-card/60 p-5 mt-4">
                <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                  <GlassWater className="w-4 h-4 text-accent" />
                  <p className="text-sm font-medium">{ro ? "Apă" : "Water"}</p>
                </div>
                <p className="text-xl font-bold font-serif text-foreground">
                  {ro
                    ? `Aproximativ ${WATER_MIN_L.toString().replace(".", ",")}–${WATER_MAX_L.toString().replace(".", ",")} L apă/zi`
                    : `Approximately ${WATER_MIN_L}–${WATER_MAX_L} L water/day`}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {ro ? "Reper general pentru adultul sănătos." : "General reference point for a healthy adult."}
                </p>
                <p className="text-xs text-muted-foreground mt-1.5">
                  {ro
                    ? "Poți avea nevoie de mai multă apă în perioadele călduroase, când faci efort fizic sau în alte situații specifice."
                    : "You may need more water in hot weather, during physical effort, or in other specific situations."}
                </p>
                <div className="mt-4 rounded-xl bg-secondary/40 p-3.5">
                  <p className="text-xs font-semibold text-foreground mb-1">
                    {ro ? "Uiți să bei apă?" : "Do you forget to drink water?"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ro
                      ? "O aplicație de monitorizare sau câteva remindere simple pe parcursul zilei pot ajuta la formarea obiceiului."
                      : "A tracking app or a few simple reminders throughout the day can help build the habit."}
                  </p>
                </div>
              </div>

              {/* ── "Ce înseamnă acest rezultat" ── short, generic, branch-
                  specific interpretation of the energy figure itself (not a
                  card -- plain text, per the "don't add another large
                  result card" instruction). */}
              <div className="mt-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
                  {ro ? "Ce înseamnă acest rezultat" : "What this result means"}
                </p>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {ro ? RESULT_MEANING[result.directionBranch].ro : RESULT_MEANING[result.directionBranch].en}
                </p>
              </div>

              {/* ── 16. Mesaj important -- was a bordered bg-primary/5 "app
                  card" with a stacked icon/h3/p/outlined-Button; now a slim
                  editorial transition band (a top rule, not a box) between
                  the numbers above and the practical food section below.
                  Icon shrinks to sit inline with the eyebrow instead of
                  large and centered; CTA becomes a text link with an arrow
                  (same pattern as the article/related-article links
                  elsewhere on the site) instead of an outlined Button. */}
              <div className="mt-8 pt-6 border-t border-border/60 text-center">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  {ro ? "Cifrele sunt doar începutul" : "The numbers are just the start"}
                </p>
                <p className="text-base text-foreground max-w-md mx-auto mb-3">
                  {ro
                    ? "25 g de fibre sau 60 g de proteină nu spun mare lucru dacă nu știi cum arată în farfurie."
                    : "25 g of fiber or 60 g of protein don't mean much if you don't know what that looks like on a plate."}
                </p>
                <button
                  type="button"
                  onClick={() => scrollToId("exemple-practice")}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
                  data-testid="button-show-examples"
                >
                  {ro ? "Arată-mi cum arată în alimente" : "Show me what that looks like in food"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── 17–20. Only shown once a real result exists ────────────────── */}
        {result.status === "ok" && (
          <>
            {/* Exemple practice -- heading/subheading rewritten this round
                to frame the section as "recognize these in food", not
                "here are numbers again". Category order is now Proteine /
                Carbohidrați / Fibre (was Proteină / Fibre / Carbohidrați)
                to match the order the categories are introduced elsewhere
                on the page (energy card -> protein -> carbs -> fat -> fibre).
                Card/chip treatment from the prior round (top rule, plain
                comma-separated text) is unchanged. */}
            <div id="exemple-practice" className="scroll-mt-24 mt-12">
              <h2 className="text-2xl font-serif font-bold text-foreground text-center mb-2">
                {ro ? "Cum se traduc aceste repere în alimentația de zi cu zi?" : "How do these reference points translate into everyday eating?"}
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-8 max-w-lg mx-auto">
                {ro
                  ? "Nu trebuie să transformi fiecare masă într-un calcul. Reperele sunt utile atunci când le poți recunoaște în alimente și mese obișnuite."
                  : "You don't need to turn every meal into a calculation. Reference points are useful once you can recognize them in everyday foods and meals."}
              </p>
              <div className="grid sm:grid-cols-3 gap-8 sm:gap-6 max-w-3xl mx-auto">
                {[
                  { title: ro ? "Proteine" : "Protein", icon: Dumbbell, items: ro ? PROTEIN_FOODS : PROTEIN_FOODS_EN },
                  { title: ro ? "Carbohidrați" : "Carbohydrates", icon: Wheat, items: ro ? CARB_FOODS : CARB_FOODS_EN },
                  { title: ro ? "Fibre" : "Fiber", icon: Leaf, items: ro ? FIBER_FOODS : FIBER_FOODS_EN },
                ].map((group) => (
                  <div key={group.title} className="border-t-2 border-primary/25 pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <group.icon className="w-4 h-4 text-primary" strokeWidth={1.75} />
                      <p className="text-xs font-semibold uppercase tracking-wide text-foreground">{group.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {group.items.join(" · ")}
                    </p>
                  </div>
                ))}
              </div>

              {/* New: 15/55/30 educational macro-distribution example (item
                  6). A horizontal three-part bar, deliberately NOT a pie
                  chart, so it can't be visually confused with PlateDiagram's
                  circle below -- these are two different concepts (energy
                  share vs. plate area). Monochrome green-opacity ramp, not
                  PlateDiagram's 3-color scheme, for the same reason. Fixed,
                  static numbers -- never read from or written into any
                  calculation result. */}
              <div className="max-w-xl mx-auto mt-10 pt-8 border-t border-border/60 text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1.5">
                  {ro ? "Exemplu orientativ" : "Illustrative example"}
                </p>
                <p className="font-serif font-bold text-lg text-foreground mb-4">
                  {ro ? "Exemplu orientativ de distribuție a energiei" : "Illustrative example of energy distribution"}
                </p>
                <div className="flex h-3 rounded-full overflow-hidden mb-3" role="img" aria-label={
                  ro
                    ? "15% proteine, 55% carbohidrați, 30% grăsimi"
                    : "15% protein, 55% carbohydrates, 30% fat"
                }>
                  {MACRO_EXAMPLE.map((seg) => (
                    <div key={seg.labelRo} style={{ width: `${seg.pct}%`, backgroundColor: seg.color }} />
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 mb-4">
                  {MACRO_EXAMPLE.map((seg) => (
                    <span key={seg.labelRo} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                      <span className="font-semibold text-foreground">{seg.pct}%</span> {ro ? seg.labelRo : seg.labelEn}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                  {ro
                    ? "Este doar un exemplu educațional pentru un adult sănătos, normoponderal. Distribuția potrivită poate varia în funcție de obiectiv, activitate, preferințe și context medical."
                    : "This is only an educational example for a healthy, normal-weight adult. The right distribution can vary based on goal, activity, preferences, and medical context."}
                </p>
              </div>
            </div>

            {/* Farfuria Diet4Life -- was the diagram boxed inside a
                bg-card/60 + p-6/8 container (the "PowerPoint graphic in a
                card" look). PlateDiagram itself is untouched (shared with
                the NutriHub articles) -- only its wrapper here changes: no
                background, no padding box, so the circle and its legend
                sit directly on the page and read as part of the page
                rather than a pasted-in diagram. */}
            <div id="farfurie" className="scroll-mt-24 mt-12">
              <h2 className="text-2xl font-serif font-bold text-foreground text-center mb-2">
                {ro ? "Construiește o masă, nu o ecuație" : "Build a meal, not an equation"}
              </h2>
              <div className="max-w-2xl mx-auto mt-6">
                <PlateDiagram />
                <div className="mt-5 pt-5 border-t border-border/60 text-center">
                  <p className="font-serif font-bold text-foreground mb-1.5">{ro ? "Reper, nu regulă." : "A reference, not a rule."}</p>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {ro
                      ? "Proporțiile se adaptează mesei, nivelului de activitate, obiectivului și nevoilor individuale."
                      : "The proportions adapt to the meal, activity level, goal, and individual needs."}
                  </p>
                </div>
              </div>
            </div>

            {/* Exemple de mese reale -- was 6 empty rounded-xl bg-card/60
                pills with text inside (looked unfinished / like selectable
                options). Now a plain two-column editorial list: a small
                accent dot instead of a pill shape, a thin separator
                between rows instead of a box around each one. Same exact
                6 meal examples, same 2-col desktop / 1-col mobile grid. */}
            <div id="exemple-mese" className="scroll-mt-24 mt-12">
              <h2 className="text-2xl font-serif font-bold text-foreground text-center mb-6">
                {ro ? "Exemple de mese reale" : "Real meal examples"}
              </h2>
              {/* divide-y gives mobile's single column a clean separator
                  between rows; disabled at sm+ (2 columns) since a divide-y
                  border would land between items that aren't visually
                  adjacent -- the column/row gap alone reads as separation
                  there. */}
              <div className="grid sm:grid-cols-2 gap-x-10 sm:gap-y-3 max-w-2xl mx-auto divide-y divide-border/50 sm:divide-y-0">
                {(ro ? MEAL_EXAMPLES_RO : MEAL_EXAMPLES_EN).map((meal) => (
                  <div key={meal} className="flex items-start gap-2.5 py-2.5 sm:py-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" aria-hidden="true" />
                    <p className="text-sm text-foreground">{meal}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Ce faci cu rezultatul -- was a full bg-card/60 box around a
                small amount of content (oversized footprint for one title
                + one link). Now the same left-accent-border treatment
                already used for editorial callouts elsewhere on the site
                (the Nutri page's "Ci cu..." block, ArticleQuote) instead of
                a card -- compact, no background, reads as a recommendation
                note rather than another dashboard tile. Same contextual
                article logic, same optional protein secondary link. */}
            <div id="ce-faci-cu-rezultatul" className="scroll-mt-24 mt-12">
              <h2 className="text-2xl font-serif font-bold text-foreground text-center mb-6">
                {ro ? "Ce faci cu rezultatul?" : "What do you do with the result?"}
              </h2>
              <div className="max-w-xl mx-auto border-l-2 border-primary pl-5 py-0.5">
                <p className="text-xs font-semibold tracking-wide uppercase text-primary mb-1.5">
                  {ro ? "Recomandat pentru tine" : "Recommended for you"}
                </p>
                <Link
                  href={NUTRIHUB_RECOMMENDATION[result.directionBranch].href}
                  className="group block"
                  data-testid="link-nutrihub-contextual"
                >
                  <p className="font-serif font-bold text-lg text-foreground group-hover:text-primary transition-colors mb-1.5">
                    {ro
                      ? NUTRIHUB_RECOMMENDATION[result.directionBranch].titleRo
                      : NUTRIHUB_RECOMMENDATION[result.directionBranch].titleEn}
                  </p>
                  <span className="text-sm text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    {ro ? "Citește articolul" : "Read the article"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
                {result.protein.kind !== "needs_individual_evaluation" && (
                  <Link
                    href={PROTEIN_ARTICLE.href}
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mt-3"
                    data-testid="link-nutrihub-protein"
                  >
                    {ro ? PROTEIN_ARTICLE.titleRo : PROTEIN_ARTICLE.titleEn}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── 27. Surse și metodologie — always visible ──────────────────── */}
        <div className="mt-16">
          <Accordion type="single" collapsible className="border border-border rounded-xl px-4">
            <AccordionItem value="sources" className="border-b-0">
              <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline">
                <span className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  {ro ? "Surse și metodologie" : "Sources and methodology"}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed space-y-1.5">
                <p>{ro ? "Mifflin–St Jeor — estimarea necesarului energetic de repaus (REE)." : "Mifflin–St Jeor — resting energy expenditure (REE) estimation."}</p>
                <p>{ro ? "EFSA — nivelurile de activitate fizică (PAL)." : "EFSA — physical activity levels (PAL)."}</p>
                <p>{ro ? "EFSA — reperul de proteină pentru adultul sănătos." : "EFSA — protein reference for the healthy adult."}</p>
                <p>{ro ? "ESPEN — reperul de proteină pentru adultul vârstnic sănătos." : "ESPEN — protein reference for the healthy older adult."}</p>
                <p>{ro ? "EFSA — intervalul de carbohidrați." : "EFSA — carbohydrate range."}</p>
                <p>{ro ? "EFSA — intervalul de grăsimi." : "EFSA — fat range."}</p>
                <p>{ro ? "OMS / EFSA — reperul de fibre." : "WHO / EFSA — fiber reference."}</p>
                <p>{ro ? "EFSA — reperul practic de hidratare." : "EFSA — practical hydration reference."}</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* ── 28. Disclaimer ──────────────────────────────────────────────── */}
        <div className="flex items-start gap-2.5 px-4 py-4 rounded-xl bg-muted/50 border border-border mt-6">
          <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {ro
              ? "Acest calculator are scop educațional și oferă estimări bazate pe formule și valori de referință pentru adulți sănătoși. Nu înlocuiește evaluarea realizată de medic sau dietetician și nu este destinat diagnosticului sau tratamentului."
              : "This calculator is for educational purposes and provides estimates based on formulas and reference values for healthy adults. It does not replace an assessment by a doctor or dietitian and is not intended for diagnosis or treatment."}
          </p>
        </div>
      </div>
    </div>
  );
}
