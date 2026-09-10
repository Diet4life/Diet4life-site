// ─── "De cât am nevoie?" — nutritional reference constants ──────────────────
//
// This file is the single source of truth for every nutritional constant
// used by the calculator. Do not duplicate these values in components —
// import them from here (or from calculations.ts, which is built on them).
//
// Sources: Mifflin–St Jeor (REE), EFSA (PAL, adult protein, carbohydrates,
// fats, water), ESPEN (protein for healthy adults ≥65y), WHO/EFSA (fiber).
//
// DO NOT CHANGE WITHOUT MEDICAL REVIEW.

/** Standard calculator applies to adults only. Below this, results are blocked. */
export const MIN_AGE = 18;
/** Technical upper bound on the age input. */
export const MAX_AGE = 120;
/** Age at/above which the senior protein range applies instead of the adult reper. */
export const SENIOR_AGE_THRESHOLD = 65;

/** Physical Activity Level multipliers (EFSA). DO NOT CHANGE WITHOUT MEDICAL REVIEW. */
export const PAL = {
  low: 1.4,
  moderate: 1.6,
  active: 1.8,
  very_active: 2.0,
} as const;

export type ActivityLevel = keyof typeof PAL;

/** Adult (18–64y) protein reper, g/kg body weight/day (EFSA). DO NOT CHANGE WITHOUT MEDICAL REVIEW. */
export const PROTEIN_G_PER_KG_ADULT = 0.83;
/** Healthy older-adult (≥65y) protein range, g/kg body weight/day (ESPEN). DO NOT CHANGE WITHOUT MEDICAL REVIEW. */
export const PROTEIN_G_PER_KG_SENIOR_MIN = 1.0;
export const PROTEIN_G_PER_KG_SENIOR_MAX = 1.2;

/** Carbohydrate intake range, % of daily energy (EFSA). DO NOT CHANGE WITHOUT MEDICAL REVIEW. */
export const CARB_PCT_MIN = 0.45;
export const CARB_PCT_MAX = 0.60;
/** kcal per gram of carbohydrate. */
export const KCAL_PER_G_CARB = 4;

/** Fat intake range, % of daily energy (EFSA). DO NOT CHANGE WITHOUT MEDICAL REVIEW. */
export const FAT_PCT_MIN = 0.20;
export const FAT_PCT_MAX = 0.35;
/** kcal per gram of fat. */
export const KCAL_PER_G_FAT = 9;

/** Minimum daily fiber intake, grams (WHO/EFSA). DO NOT CHANGE WITHOUT MEDICAL REVIEW. */
export const FIBER_MIN_G = 25;

/** General daily water intake reper, liters (EFSA). DO NOT CHANGE WITHOUT MEDICAL REVIEW. */
export const WATER_MIN_L = 1.5;
export const WATER_MAX_L = 2.0;

// ─── BMI (WHO categories) ────────────────────────────────────────────────────
// DO NOT CHANGE WITHOUT MEDICAL REVIEW.

/** Category boundaries (WHO). A BMI below a given constant falls in that band. */
export const BMI_UNDERWEIGHT_MAX = 18.5;
export const BMI_OVERWEIGHT_MIN = 25.0;
export const BMI_OBESE_I_MIN = 30.0;
export const BMI_OBESE_II_MIN = 35.0;
export const BMI_OBESE_III_MIN = 40.0;

/**
 * Reference weight-range formula bounds: weight = factor × height_m².
 * 24.9 (not 25.0) is the spec's literal upper factor for this formula —
 * intentionally distinct from BMI_OVERWEIGHT_MIN, do not conflate the two.
 */
export const BMI_REFERENCE_RANGE_MIN = 18.5;
export const BMI_REFERENCE_RANGE_MAX = 24.9;

// ─── Weight-loss orientative deficit (only computed for BMI ≥25) ────────────
// DO NOT CHANGE WITHOUT MEDICAL REVIEW.

/** 10–20% orientative deficit, expressed as multipliers of TEE. */
export const WL_DEFICIT_LOW_FACTOR = 0.8;
export const WL_DEFICIT_HIGH_FACTOR = 0.9;

/** Safety floor: below this, no automatic caloric-deficit range is shown at all. */
export const WL_FLOOR_KCAL = 1200;
