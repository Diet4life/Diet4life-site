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
