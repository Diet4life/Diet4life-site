import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Info,
  Flame,
  Dumbbell,
  Droplets,
  Wheat,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Activity level table ────────────────────────────────────────────────────
// Base energy range in kcal/kg body weight per day (ESPEN-aligned)
const ACTIVITY_KCAL: Record<string, [number, number]> = {
  sedentary:   [25, 30],
  light:       [30, 35],
  moderate:    [35, 40],
  very:        [40, 45],
  extra:       [45, 50],
};

const ACTIVE_LEVELS = new Set(["moderate", "very", "extra"]);

// ─── BMI (IMC) classification — WHO ranges ────────────────────────────────────
interface BmiCategory {
  label: { ro: string; en: string };
  textClass: string;
  recommendation: { ro: string; en: string };
}

const BMI_RECOMMENDATION_GAIN = {
  ro: "Se recomandă creșterea în greutate, treptat și controlat, pentru a ajunge la normoponderabilitate.",
  en: "Gradual, controlled weight gain is recommended to reach a normal weight.",
};
const BMI_RECOMMENDATION_MAINTAIN = {
  ro: "Greutatea este în limite normale — se recomandă menținerea ei.",
  en: "Weight is within the normal range — maintaining it is recommended.",
};
const BMI_RECOMMENDATION_LOSE = {
  ro: "Se recomandă scăderea în greutate, treptat și controlat, pentru a ajunge la normoponderabilitate.",
  en: "Gradual, controlled weight loss is recommended to reach a normal weight.",
};

function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) {
    return { label: { ro: "Subponderal", en: "Underweight" }, textClass: "text-blue-600", recommendation: BMI_RECOMMENDATION_GAIN };
  }
  if (bmi < 25) {
    return { label: { ro: "Greutate normală", en: "Normal weight" }, textClass: "text-primary", recommendation: BMI_RECOMMENDATION_MAINTAIN };
  }
  if (bmi < 30) {
    return { label: { ro: "Supraponderal", en: "Overweight" }, textClass: "text-amber-600", recommendation: BMI_RECOMMENDATION_LOSE };
  }
  if (bmi < 35) {
    return { label: { ro: "Obezitate gradul I", en: "Obesity class I" }, textClass: "text-orange-600", recommendation: BMI_RECOMMENDATION_LOSE };
  }
  if (bmi < 40) {
    return { label: { ro: "Obezitate gradul II", en: "Obesity class II" }, textClass: "text-red-600", recommendation: BMI_RECOMMENDATION_LOSE };
  }
  return { label: { ro: "Obezitate gradul III (severă)", en: "Obesity class III (severe)" }, textClass: "text-red-700", recommendation: BMI_RECOMMENDATION_LOSE };
}

// BMI scale rendered as a 15–40 kg/m² bar; segment widths match real WHO cutoffs.
const BMI_SCALE_MIN = 15;
const BMI_SCALE_MAX = 40;
const BMI_SEGMENTS = [
  { upTo: 18.5, color: "hsl(210 70% 60%)" }, // underweight
  { upTo: 25, color: "hsl(152 40% 45%)" },   // normal
  { upTo: 30, color: "hsl(35 70% 55%)" },    // overweight
  { upTo: 40, color: "hsl(0 65% 55%)" },     // obese
];

const BMI_BAR_SEGMENTS = (() => {
  let prev = BMI_SCALE_MIN;
  return BMI_SEGMENTS.map((seg) => {
    const to = Math.min(seg.upTo, BMI_SCALE_MAX);
    const widthPct = ((to - prev) / (BMI_SCALE_MAX - BMI_SCALE_MIN)) * 100;
    const segment = { widthPct, color: seg.color };
    prev = to;
    return segment;
  });
})();

// ─── Zod schema ──────────────────────────────────────────────────────────────
const formSchema = z.object({
  sex: z.enum(["M", "F"]),
  age: z.coerce.number().min(15, "min 15").max(120, "max 120"),
  weight: z.coerce.number().min(30, "min 30").max(300, "max 300"),
  height: z.coerce.number().min(100, "min 100").max(250, "max 250"),
  activityLevel: z.string(),
  goal: z.enum(["loss", "maintenance", "gain"]),
});

type FormValues = z.infer<typeof formSchema>;

// ─── Types ───────────────────────────────────────────────────────────────────
interface CalcResults {
  caloriesMin: number;
  caloriesMax: number;
  proteinMin: number;
  proteinMax: number;
  fatPctMin: number;
  fatPctMax: number;
  fatGMin: number;
  fatGMax: number;
  carbsPctMin: number;
  carbsPctMax: number;
  carbsGMin: number;
  carbsGMax: number;
  chartData: { name: string; value: number; color: string }[];
  bmi: number;
  bmiCategory: BmiCategory;
}

// ─── Core calculation logic ───────────────────────────────────────────────────
function calculate(values: FormValues): CalcResults {
  const { weight, height, activityLevel, goal } = values;
  const [kMin, kMax] = ACTIVITY_KCAL[activityLevel] ?? [25, 30];

  // 0. BMI (IMC) = weight(kg) / height(m)²
  const heightM = height / 100;
  const bmi = Math.round((weight / (heightM * heightM)) * 10) / 10;
  const bmiCategory = getBmiCategory(bmi);

  // 1. Maintenance calorie range
  let calMin = Math.round(weight * kMin);
  let calMax = Math.round(weight * kMax);

  // 2. Goal adjustment
  if (goal === "loss") {
    calMin = Math.max(1200, calMin - 500);
    calMax = calMax - 300;
  } else if (goal === "gain") {
    calMin = calMin + 300;
    calMax = calMax + 500;
  }

  // 3. Protein (g/day) — varies by goal and activity
  let proteinMin: number;
  let proteinMax: number;
  const isActive = ACTIVE_LEVELS.has(activityLevel);

  if (goal === "loss") {
    proteinMin = Math.round(weight * 1.2);
    proteinMax = Math.round(weight * 1.6);
  } else if (goal === "gain") {
    if (isActive) {
      proteinMin = Math.round(weight * 1.6);
      proteinMax = Math.round(weight * 2.0);
    } else {
      proteinMin = Math.round(weight * 1.0);
      proteinMax = Math.round(weight * 1.5);
    }
  } else {
    // maintenance
    proteinMin = Math.round(weight * 1.0);
    proteinMax = Math.round(weight * 1.5);
  }

  // 4. Fat % range by goal
  let fatPctMin: number;
  let fatPctMax: number;
  if (goal === "loss") {
    fatPctMin = 25;
    fatPctMax = 30;
  } else if (goal === "gain") {
    fatPctMin = 30;
    fatPctMax = 35;
  } else {
    fatPctMin = 25;
    fatPctMax = 35;
  }

  // 5. Carbs % range (remainder after protein & fat at midpoint)
  let carbsPctMin: number;
  let carbsPctMax: number;
  if (goal === "loss") {
    carbsPctMin = 40;
    carbsPctMax = 50;
  } else if (goal === "gain") {
    carbsPctMin = 45;
    carbsPctMax = 55;
  } else {
    carbsPctMin = 45;
    carbsPctMax = 55;
  }

  // 6. Convert % to grams using midpoint calories
  const calMid = Math.round((calMin + calMax) / 2);
  const fatGMin  = Math.round((calMid * (fatPctMin / 100)) / 9);
  const fatGMax  = Math.round((calMid * (fatPctMax / 100)) / 9);
  const carbsGMin = Math.round((calMid * (carbsPctMin / 100)) / 4);
  const carbsGMax = Math.round((calMid * (carbsPctMax / 100)) / 4);

  // 7. Chart uses midpoints for display
  const proteinMid = Math.round((proteinMin + proteinMax) / 2);
  const fatGMid    = Math.round((fatGMin + fatGMax) / 2);
  const carbsGMid  = Math.round((carbsGMin + carbsGMax) / 2);

  const chartData = [
    { name: "Proteine", value: proteinMid, color: "hsl(152 35% 40%)" },
    { name: "Carbohidrați", value: carbsGMid, color: "hsl(210 40% 55%)" },
    { name: "Lipide", value: fatGMid, color: "hsl(35 60% 65%)" },
  ];

  return {
    caloriesMin: calMin,
    caloriesMax: calMax,
    proteinMin,
    proteinMax,
    fatPctMin,
    fatPctMax,
    fatGMin,
    fatGMax,
    carbsPctMin,
    carbsPctMax,
    carbsGMin,
    carbsGMax,
    chartData,
    bmi,
    bmiCategory,
  };
}

// ─── Custom tooltip for pie ───────────────────────────────────────────────────
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-background border border-border rounded-lg px-3 py-2 text-sm shadow-md">
        <span className="font-semibold text-foreground">{payload[0].name}</span>
        <span className="ml-2 text-muted-foreground">{payload[0].value}g</span>
      </div>
    );
  }
  return null;
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function Calculator() {
  const { language } = useLanguage();
  const [results, setResults] = useState<CalcResults | null>(null);
  // null = not asked yet, true = has condition, false = no condition
  const [medicalCondition, setMedicalCondition] = useState<boolean | null>(null);

  const ro = language === "ro";

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sex: "F",
      age: 30,
      weight: 70,
      height: 165,
      activityLevel: "light",
      goal: "maintenance",
    },
  });

  const onSubmit = (values: FormValues) => {
    setMedicalCondition(null); // reset medical question on recalculate
    setResults(calculate(values));
  };

  const goalOptions = [
    { value: "loss", ro: "Slabire (pierdere in greutate)", en: "Weight loss" },
    { value: "maintenance", ro: "Mentinere greutate", en: "Weight maintenance" },
    { value: "gain", ro: "Crestere in greutate / masa musculara", en: "Weight / muscle gain" },
  ];

  const activityOptions = [
    { value: "sedentary", ro: "Sedentar (fara exercitii)", en: "Sedentary (no exercise)" },
    { value: "light", ro: "Usor activ (1–3 zile/sapt)", en: "Lightly active (1–3 days/wk)" },
    { value: "moderate", ro: "Moderat activ (3–5 zile/sapt)", en: "Moderately active (3–5 days/wk)" },
    { value: "very", ro: "Foarte activ (6–7 zile/sapt)", en: "Very active (6–7 days/wk)" },
    { value: "extra", ro: "Extra activ (sportiv de performanta)", en: "Extra active (athlete)" },
  ];

  return (
    <div className="min-h-screen bg-background py-24">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Header */}
        <motion.div
          className="text-center max-w-2xl mx-auto mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-5">
            <Flame className="w-4 h-4" />
            {ro ? "Calculator energetic bazat pe dovezi" : "Evidence-based energy calculator"}
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4">
            {ro ? "Calculator Nutrițional" : "Nutrition Calculator"}
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            {ro
              ? "Estimare personalizată a necesarului caloric și a macronutrienților, conform ghidurilor ESPEN, OMS și EFSA."
              : "Personalized estimate of caloric needs and macronutrients, based on ESPEN, WHO, and EFSA guidelines."}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 items-start">

          {/* ── Form ── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, delay: 0.1 }}>
            <Card className="border-border shadow-md">
              <CardContent className="p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    {/* Sex + Age */}
                    <div className="grid grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="sex"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{ro ? "Sex" : "Sex"}</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-sex"><SelectValue /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="F">{ro ? "Femeie" : "Female"}</SelectItem>
                                <SelectItem value="M">{ro ? "Bărbat" : "Male"}</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{ro ? "Vârstă (ani)" : "Age (years)"}</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} data-testid="input-age" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Weight + Height */}
                    <div className="grid grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{ro ? "Greutate (kg)" : "Weight (kg)"}</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} data-testid="input-weight" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{ro ? "Înălțime (cm)" : "Height (cm)"}</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} data-testid="input-height" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Activity */}
                    <FormField
                      control={form.control}
                      name="activityLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{ro ? "Nivel de activitate" : "Activity level"}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-activity"><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {activityOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {ro ? opt.ro : opt.en}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Goal */}
                    <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{ro ? "Obiectiv" : "Goal"}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-goal"><SelectValue /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {goalOptions.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {ro ? opt.ro : opt.en}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full rounded-xl" size="lg" data-testid="button-calculate">
                      {ro ? "Calculează" : "Calculate"}
                    </Button>
                  </form>
                </Form>

                {/* Source note */}
                <p className="text-xs text-muted-foreground mt-5 text-center flex items-center justify-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  {ro
                    ? "Metodologie: ESPEN Guidelines 2021 · OMS · EFSA"
                    : "Methodology: ESPEN Guidelines 2021 · WHO · EFSA"}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Results panel ── */}
          <div className="min-h-[460px]">
            <AnimatePresence mode="wait">
              {!results ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[460px] flex items-center justify-center border-2 border-dashed border-border rounded-2xl bg-secondary/20 p-10 text-center"
                >
                  <div>
                    <Flame className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
                    <p className="text-muted-foreground text-sm">
                      {ro
                        ? "Completează formularul și apasă Calculează pentru a vedea rezultatele."
                        : "Fill in the form and press Calculate to see your results."}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="flex flex-col gap-5"
                >
                  {/* Calories range card */}
                  <div className="rounded-2xl bg-primary text-primary-foreground p-6 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium opacity-85 mb-1">
                        {ro ? "Calorii zilnice estimate" : "Estimated daily calories"}
                      </p>
                      <p className="text-3xl font-bold font-serif">
                        {results.caloriesMin.toLocaleString()} – {results.caloriesMax.toLocaleString()}
                        <span className="text-lg font-normal ml-2">kcal</span>
                      </p>
                    </div>
                    <Flame className="w-10 h-10 opacity-60 shrink-0" />
                  </div>

                  {/* BMI (IMC) card */}
                  <div className="rounded-2xl bg-card border border-border p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm font-medium text-muted-foreground">
                          {ro ? "Indice de Masă Corporală (IMC)" : "Body Mass Index (BMI)"}
                        </p>
                      </div>
                      <span className="text-2xl font-bold font-serif text-foreground" data-testid="text-bmi-value">
                        {results.bmi.toFixed(1)}
                      </span>
                    </div>

                    <div className="relative mb-2">
                      <div className="flex h-2.5 rounded-full overflow-hidden">
                        {BMI_BAR_SEGMENTS.map((seg, i) => (
                          <div key={i} style={{ width: `${seg.widthPct}%`, backgroundColor: seg.color }} />
                        ))}
                      </div>
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-background border-2 border-foreground shadow"
                        style={{
                          left: `${((Math.min(Math.max(results.bmi, BMI_SCALE_MIN), BMI_SCALE_MAX) - BMI_SCALE_MIN) / (BMI_SCALE_MAX - BMI_SCALE_MIN)) * 100}%`,
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground mb-3">
                      <span>{BMI_SCALE_MIN}</span>
                      <span>18.5</span>
                      <span>25</span>
                      <span>30</span>
                      <span>{BMI_SCALE_MAX}+</span>
                    </div>

                    <p className={cn("text-sm font-semibold text-center", results.bmiCategory.textClass)} data-testid="text-bmi-category">
                      {ro ? results.bmiCategory.label.ro : results.bmiCategory.label.en}
                    </p>
                    <p className="text-xs text-muted-foreground text-center mt-1.5" data-testid="text-bmi-recommendation">
                      {ro ? results.bmiCategory.recommendation.ro : results.bmiCategory.recommendation.en}
                    </p>
                  </div>

                  {/* Macros grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Protein */}
                    <div className="rounded-xl bg-card border border-border p-4 text-center">
                      <Dumbbell className="w-5 h-5 text-primary mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground mb-1">
                        {ro ? "Proteine (g/zi)" : "Protein (g/day)"}
                      </p>
                      <p className="font-bold text-foreground text-sm">
                        {results.proteinMin}–{results.proteinMax}g
                      </p>
                    </div>
                    {/* Fat */}
                    <div className="rounded-xl bg-card border border-border p-4 text-center">
                      <Droplets className="w-5 h-5 text-accent mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground mb-1">
                        {ro ? "Lipide" : "Fat"}
                      </p>
                      <p className="font-bold text-foreground text-sm">
                        {results.fatPctMin}–{results.fatPctMax}%
                      </p>
                      <p className="text-xs text-muted-foreground">{results.fatGMin}–{results.fatGMax}g</p>
                    </div>
                    {/* Carbs */}
                    <div className="rounded-xl bg-card border border-border p-4 text-center">
                      <Wheat className="w-5 h-5 text-amber-500 mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground mb-1">
                        {ro ? "Carbohidrați" : "Carbohydrates"}
                      </p>
                      <p className="font-bold text-foreground text-sm">
                        {results.carbsPctMin}–{results.carbsPctMax}%
                      </p>
                      <p className="text-xs text-muted-foreground">{results.carbsGMin}–{results.carbsGMax}g</p>
                    </div>
                  </div>

                  {/* Pie chart */}
                  {medicalCondition !== true && (
                    <div className="rounded-2xl bg-card border border-border p-4">
                      <p className="text-sm font-medium text-muted-foreground text-center mb-2">
                        {ro ? "Distribuție macronutrienți (valori de mijloc)" : "Macronutrient distribution (midpoint values)"}
                      </p>
                      <div className="h-44">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={results.chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={48}
                              outerRadius={68}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {results.chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                        {/* Legend */}
                        <div className="flex justify-center gap-5 -mt-2">
                          {results.chartData.map((d) => (
                            <div key={d.name} className="flex items-center gap-1.5">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                              <span className="text-xs text-muted-foreground">{d.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Medical condition question ── */}
                  <AnimatePresence>
                    {medicalCondition === null && (
                      <motion.div
                        key="question"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-2xl border-2 border-accent/30 bg-accent/5 p-5"
                      >
                        <p className="text-sm font-medium text-foreground mb-4 flex items-start gap-2">
                          <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          {ro
                            ? "Ai o afecțiune medicală sau o situație specială?"
                            : "Do you have a medical condition or a special situation?"}
                        </p>
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 rounded-xl border-green-300 text-green-700 hover:bg-green-50"
                            onClick={() => setMedicalCondition(false)}
                            data-testid="button-no-condition"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            {ro ? "Nu" : "No"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 rounded-xl border-orange-300 text-orange-700 hover:bg-orange-50"
                            onClick={() => setMedicalCondition(true)}
                            data-testid="button-yes-condition"
                          >
                            <XCircle className="w-4 h-4 mr-1.5" />
                            {ro ? "Da" : "Yes"}
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {medicalCondition === true && (
                      <motion.div
                        key="medical-alert"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border-2 border-orange-300 bg-orange-50 p-6"
                      >
                        <div className="flex items-start gap-3 mb-4">
                          <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
                          <p className="text-sm text-foreground leading-relaxed font-medium">
                            {ro
                              ? "Pentru siguranța ta, recomandările trebuie adaptate individual. Te rugăm să ne contactezi pentru un plan personalizat."
                              : "For your safety, recommendations must be personalized. Please contact us for a customized plan."}
                          </p>
                        </div>
                        <Button asChild className="w-full rounded-xl" data-testid="button-medical-contact">
                          <Link href="/contact">
                            <CalendarCheck className="w-4 h-4 mr-2" />
                            {ro ? "Solicită plan personalizat" : "Request personalized plan"}
                          </Link>
                        </Button>
                      </motion.div>
                    )}

                    {medicalCondition === false && (
                      <motion.div
                        key="cta-no-condition"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl bg-primary/8 border border-primary/25 p-5 flex items-center justify-between gap-4"
                      >
                        <p className="text-sm text-foreground leading-relaxed">
                          {ro
                            ? "Dorești un plan adaptat exact nevoilor tale?"
                            : "Want a plan tailored exactly to your needs?"}
                        </p>
                        <Button asChild className="rounded-xl shrink-0" data-testid="button-cta-plan">
                          <Link href="/contact">
                            {ro ? "Solicită plan personalizat" : "Request personalized plan"}
                          </Link>
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Disclaimer */}
                  <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-muted/50 border border-border">
                    <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {ro
                        ? "Rezultatele sunt orientative și nu înlocuiesc un consult nutrițional personalizat."
                        : "The results are estimative and do not replace a personalized nutrition consultation."}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
