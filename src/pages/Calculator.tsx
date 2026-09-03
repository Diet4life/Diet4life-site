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
import { Card, CardContent } from "@/components/ui/card";
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
const FIBER_FOODS = ["legume", "fructe", "fasole", "linte", "ovăz", "pâine integrală", "cereale integrale"];
const CARB_FOODS = ["cartof", "pâine", "orez", "paste", "ovăz", "mămăligă", "leguminoase", "fructe"];

const PROTEIN_FOODS_EN = ["eggs", "yogurt", "cottage cheese", "fish", "meat", "lentils", "beans", "chickpeas"];
const FIBER_FOODS_EN = ["vegetables", "fruit", "beans", "lentils", "oats", "whole-grain bread", "whole grains"];
const CARB_FOODS_EN = ["potatoes", "bread", "rice", "pasta", "oats", "polenta", "legumes", "fruit"];

// ─── Real Romanian meal examples ─────────────────────────────────────────────
const MEAL_EXAMPLES_RO = [
  "omletă + roșii/ardei + pâine",
  "pește + cartof + salată",
  "tocăniță de pui + mămăligă + salată",
  "fasole scăzută + salată + pâine",
  "paste cu ton și legume",
  "ciorbă cu carne și legume + pâine",
];
const MEAL_EXAMPLES_EN = [
  "omelet + tomatoes/peppers + bread",
  "fish + potato + salad",
  "chicken stew + polenta + salad",
  "stewed beans + salad + bread",
  "pasta with tuna and vegetables",
  "meat and vegetable soup + bread",
];

// ─── Results shape ────────────────────────────────────────────────────────────
type ResultState =
  | { status: "idle" }
  | { status: "blocked-safety" }
  | {
      status: "ok";
      energyKcal: number;
      protein: ProteinResult;
      carbs: GramRange;
      fat: GramRange;
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
    const ree = calculateREE(sex, parsed.weight, parsed.height, parsed.age);
    const teeRaw = calculateTEE(ree, PAL[parsed.activityLevel]);
    const energyKcal = truncateKcal(teeRaw);
    const protein = calculateProtein(parsed.weight, parsed.age);
    const carbs = calculateCarbsGrams(energyKcal);
    const fat = calculateFatGrams(energyKcal);

    setShowCarbGrams(false);
    setShowFatGrams(false);
    setResult({ status: "ok", energyKcal, protein, carbs, fat });
    requestAnimationFrame(() => scrollToId("rezultate"));
  };

  return (
    <div className="min-h-screen bg-background py-16 md:py-20">
      <div className="container mx-auto px-4 max-w-3xl">

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
            {ro ? "De cât am nevoie?" : "How much do I need?"}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto mb-3">
            {ro
              ? "Estimează necesarul zilnic de energie și câteva repere nutriționale pentru un adult sănătos."
              : "Estimate your daily energy needs and a few basic nutrition reference points for a healthy adult."}
          </p>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-8">
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
          <Card className="shadow-md">
            <CardContent className="p-6 md:p-8">
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

                    <button
                      type="button"
                      onClick={() => setShowActivityHelp((v) => !v)}
                      className="flex items-center gap-1.5 text-sm text-primary font-medium mt-3 hover:underline"
                      data-testid="button-activity-help"
                    >
                      <HelpCircle className="w-4 h-4" />
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

                  {/* Filtru de siguranță */}
                  <div>
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
                          className="flex items-start gap-3 rounded-xl border border-border p-3.5 min-h-[44px] cursor-pointer hover:border-primary/30 transition-colors"
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
            </CardContent>
          </Card>
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
              <h2 className="text-2xl font-serif font-bold text-foreground text-center mb-6">
                {ro ? "Reperele tale zilnice" : "Your daily reference points"}
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Energie */}
                <div className="rounded-2xl bg-primary text-primary-foreground p-6 sm:col-span-2">
                  <div className="flex items-center gap-2 mb-2 opacity-90">
                    <Flame className="w-4 h-4" />
                    <p className="text-sm font-medium">{ro ? "Energie" : "Energy"}</p>
                  </div>
                  <p className="text-3xl font-bold font-serif" data-testid="text-energy-value">
                    {result.energyKcal.toLocaleString(ro ? "ro-RO" : "en-US")} kcal/zi
                  </p>
                  <p className="text-sm opacity-90 mt-2">
                    {ro ? "Estimare pentru menținerea greutății actuale." : "Estimate for maintaining your current weight."}
                  </p>
                  <p className="text-xs opacity-75 mt-1">
                    {ro
                      ? "Rezultatul provine dintr-o ecuație predictivă și necesarul real poate varia."
                      : "This comes from a predictive equation, and your actual need may vary."}
                  </p>
                </div>

                {/* Proteină */}
                <div className="rounded-2xl bg-card border border-border p-5">
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <Dumbbell className="w-4 h-4 text-primary" />
                    <p className="text-sm font-medium">{ro ? "Proteină" : "Protein"}</p>
                  </div>
                  <p className="text-xl font-bold font-serif text-foreground" data-testid="text-protein-value">
                    {result.protein.max === null
                      ? `≈ ${result.protein.min} g/zi`
                      : `≈ ${result.protein.min}–${result.protein.max} g/zi`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {result.protein.max === null
                      ? (ro ? "Reper de bază pentru adultul sănătos." : "Basic reference point for a healthy adult.")
                      : (ro
                          ? "Pentru adulții vârstnici sănătoși, aportul proteic recomandat este în general mai mare decât reperul pentru adultul tânăr."
                          : "For healthy older adults, the recommended protein intake is generally higher than the young-adult reference.")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {ro
                      ? "Nevoile pot fi diferite în funcție de activitate, obiective, vârstă și stare de sănătate."
                      : "Needs can differ based on activity, goals, age, and health status."}
                  </p>
                </div>

                {/* Carbohidrați */}
                <div className="rounded-2xl bg-card border border-border p-5">
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
                </div>

                {/* Grăsimi */}
                <div className="rounded-2xl bg-card border border-border p-5">
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
                </div>

                {/* Fibre */}
                <div className="rounded-2xl bg-card border border-border p-5">
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
              <div className="rounded-2xl bg-card border border-border p-5 mt-4">
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

              {/* ── 16. Mesaj important ── */}
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 mt-6 text-center">
                <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
                <h3 className="font-serif font-bold text-foreground mb-2">
                  {ro ? "Cifrele sunt doar începutul." : "The numbers are just the start."}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                  {ro
                    ? "25 g de fibre sau 60 g de proteină nu spun mare lucru dacă nu știi cum arată în farfurie."
                    : "25 g of fiber or 60 g of protein don't mean much if you don't know what that looks like on a plate."}
                </p>
                <Button variant="outline" className="rounded-full" onClick={() => scrollToId("exemple-practice")} data-testid="button-show-examples">
                  {ro ? "Arată-mi cum arată în alimente" : "Show me what that looks like in food"}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── 17–20. Only shown once a real result exists ────────────────── */}
        {result.status === "ok" && (
          <>
            {/* Exemple practice */}
            <div id="exemple-practice" className="scroll-mt-24 mt-16">
              <h2 className="text-2xl font-serif font-bold text-foreground text-center mb-2">
                {ro ? "Ce înseamnă aceste cifre în viața reală?" : "What do these numbers mean in real life?"}
              </h2>
              <p className="text-sm text-muted-foreground text-center mb-8 max-w-lg mx-auto">
                {ro
                  ? "Doar exemple de alimente uzuale — nu un plan sau un meniu."
                  : "Just examples of everyday foods — not a plan or a menu."}
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { title: ro ? "Proteină" : "Protein", icon: Dumbbell, items: ro ? PROTEIN_FOODS : PROTEIN_FOODS_EN },
                  { title: ro ? "Fibre" : "Fiber", icon: Leaf, items: ro ? FIBER_FOODS : FIBER_FOODS_EN },
                  { title: ro ? "Carbohidrați" : "Carbohydrates", icon: Wheat, items: ro ? CARB_FOODS : CARB_FOODS_EN },
                ].map((group) => (
                  <div key={group.title} className="rounded-2xl bg-card border border-border p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <group.icon className="w-4 h-4 text-primary" />
                      <p className="text-sm font-semibold text-foreground">{group.title}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {group.items.map((food) => (
                        <span key={food} className="text-xs px-2.5 py-1 rounded-full bg-secondary/50 text-foreground">
                          {food}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Farfuria Diet4Life */}
            <div id="farfurie" className="scroll-mt-24 mt-16">
              <h2 className="text-2xl font-serif font-bold text-foreground text-center mb-2">
                {ro ? "Construiește o masă, nu o ecuație" : "Build a meal, not an equation"}
              </h2>
              <Card className="mt-6">
                <CardContent className="p-6 md:p-8">
                  <PlateDiagram />
                  <div className="mt-5 pt-5 border-t border-border text-center">
                    <p className="font-serif font-bold text-foreground mb-1.5">{ro ? "Reper, nu regulă." : "A reference, not a rule."}</p>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      {ro
                        ? "Proporțiile se adaptează mesei, nivelului de activitate, obiectivului și nevoilor individuale."
                        : "The proportions adapt to the meal, activity level, goal, and individual needs."}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Exemple de mese reale */}
            <div id="exemple-mese" className="scroll-mt-24 mt-16">
              <h2 className="text-2xl font-serif font-bold text-foreground text-center mb-6">
                {ro ? "Exemple de mese reale" : "Real meal examples"}
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {(ro ? MEAL_EXAMPLES_RO : MEAL_EXAMPLES_EN).map((meal) => (
                  <div key={meal} className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground">
                    {meal}
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4 max-w-lg mx-auto">
                {ro
                  ? "Ingredientele nu trebuie să fie întotdeauna separate pe farfurie — ciorbele, tocănițele, pastele și preparatele la cuptor pot conține aceleași componente într-un singur preparat."
                  : "Ingredients don't have to be physically separated on the plate — soups, stews, pastas and baked dishes can contain the same components in a single preparation."}
              </p>
            </div>

            {/* Ce faci cu rezultatul */}
            <div id="ce-faci-cu-rezultatul" className="scroll-mt-24 mt-16">
              <h2 className="text-2xl font-serif font-bold text-foreground text-center mb-6">
                {ro ? "Ce faci cu rezultatul?" : "What do you do with the result?"}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <Link
                  href="/nutrihub/nutritie-echilibrata"
                  className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all"
                  data-testid="link-nutrihub-echilibrata"
                >
                  <p className="font-semibold text-foreground mb-1">
                    {ro ? "Vreau să mănânc mai echilibrat" : "I want to eat in a more balanced way"}
                  </p>
                  <p className="text-sm text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                    {ro ? "Nutriție echilibrată: cum arată în viața reală?" : "Balanced nutrition: what it looks like in real life"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </p>
                </Link>
                <Link
                  href="/nutrihub/controlul-greutatii"
                  className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-md transition-all"
                  data-testid="link-nutrihub-greutate"
                >
                  <p className="font-semibold text-foreground mb-1">
                    {ro ? "Vreau să înțeleg mai bine greutatea mea" : "I want to better understand my weight"}
                  </p>
                  <p className="text-sm text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                    {ro ? "Controlul greutății: de ce nu este doar despre a mânca mai puțin" : "Weight control: why it's not just about eating less"}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </p>
                </Link>
              </div>
              <div className="rounded-2xl border border-dashed border-border p-6">
                <p className="font-semibold text-foreground mb-3">
                  {ro ? "Vreau să aflu mai multe despre nutrienți" : "I want to learn more about nutrients"}
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { ro: "Câtă proteină am nevoie?", en: "How much protein do I need?", href: "/nutrihub/cata-proteina-am-nevoie" },
                    { ro: "Fibrele alimentare", en: "Dietary fiber", href: "/nutrihub/fibrele-alimentare" },
                    { ro: "Câte calorii am nevoie, de fapt?", en: "How many calories do I actually need?", href: "/nutrihub/cate-calorii-am-nevoie" },
                    { ro: "Sunt toate caloriile la fel?", en: "Are all calories the same?", href: undefined },
                  ].map((item) =>
                    item.href ? (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        {ro ? item.ro : item.en}
                      </Link>
                    ) : (
                      <span key={item.ro} className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground">
                        {ro ? item.ro : item.en} · {ro ? "în curând" : "coming soon"}
                      </span>
                    )
                  )}
                </div>
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
