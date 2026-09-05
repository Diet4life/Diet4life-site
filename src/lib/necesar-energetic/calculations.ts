// ─── "De cât am nevoie?" — pure calculation functions ────────────────────────
// No UI, no copy — every formula here is defined once and consumed by the
// calculator page. DO NOT CHANGE THE FORMULAS WITHOUT MEDICAL REVIEW.

import {
  PROTEIN_G_PER_KG_ADULT,
  PROTEIN_G_PER_KG_SENIOR_MIN,
  PROTEIN_G_PER_KG_SENIOR_MAX,
  SENIOR_AGE_THRESHOLD,
  CARB_PCT_MIN,
  CARB_PCT_MAX,
  KCAL_PER_G_CARB,
  FAT_PCT_MIN,
  FAT_PCT_MAX,
  KCAL_PER_G_FAT,
} from "./constants";

export type Sex = "M" | "F";

/**
 * Resting energy expenditure via Mifflin–St Jeor.
 * DO NOT CHANGE WITHOUT MEDICAL REVIEW.
 */
export function calculateREE(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === "M" ? base + 5 : base - 161;
}

/** Total energy expenditure = REE × PAL (unrounded). */
export function calculateTEE(ree: number, pal: number): number {
  return ree * pal;
}

/**
 * Display rule for the energy result: truncate, never round, never show decimals.
 * 2137.92 -> 2137, not 2138 or 2150.
 */
export function truncateKcal(teeRaw: number): number {
  return Math.trunc(teeRaw);
}

export interface ProteinResult {
  /** 18–64y: the single reper value. ≥65y: the low end of the range. */
  min: number;
  /** 18–64y: null (single value, not a range). ≥65y: the high end of the range. */
  max: number | null;
}

/**
 * Protein reper. 18–64y uses a single adult value; ≥65y uses the healthy
 * older-adult range. Do not apply the senior range to anyone with a
 * condition requiring individual evaluation — this function assumes the
 * safety filter has already cleared the person.
 */
export function calculateProtein(weightKg: number, age: number): ProteinResult {
  if (age >= SENIOR_AGE_THRESHOLD) {
    return {
      min: Math.round(weightKg * PROTEIN_G_PER_KG_SENIOR_MIN),
      max: Math.round(weightKg * PROTEIN_G_PER_KG_SENIOR_MAX),
    };
  }
  return { min: Math.round(weightKg * PROTEIN_G_PER_KG_ADULT), max: null };
}

export interface GramRange {
  min: number;
  max: number;
}

/**
 * Carbohydrate range in grams, from the kcal figures actually shown to the
 * user for their direction — maintenance kcal (kcalLow === kcalHigh) or the
 * weight-loss deficit range (kcalLow < kcalHigh). Never pass maintenance kcal
 * when the person is shown a weight-loss range instead.
 */
export function calculateCarbsGrams(kcalLow: number, kcalHigh: number): GramRange {
  return {
    min: Math.round((kcalLow * CARB_PCT_MIN) / KCAL_PER_G_CARB),
    max: Math.round((kcalHigh * CARB_PCT_MAX) / KCAL_PER_G_CARB),
  };
}

/** Fat range in grams — same kcalLow/kcalHigh convention as calculateCarbsGrams. */
export function calculateFatGrams(kcalLow: number, kcalHigh: number): GramRange {
  return {
    min: Math.round((kcalLow * FAT_PCT_MIN) / KCAL_PER_G_FAT),
    max: Math.round((kcalHigh * FAT_PCT_MAX) / KCAL_PER_G_FAT),
  };
}
