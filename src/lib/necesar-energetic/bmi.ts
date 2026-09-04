// ─── "De cât am nevoie?" — BMI, category, direction, weight-reference range ──
// No UI, no copy — pure functions. DO NOT CHANGE THE FORMULAS OR THRESHOLDS
// WITHOUT MEDICAL REVIEW.

import {
  BMI_UNDERWEIGHT_MAX,
  BMI_OVERWEIGHT_MIN,
  BMI_OBESE_I_MIN,
  BMI_OBESE_II_MIN,
  BMI_OBESE_III_MIN,
  BMI_REFERENCE_RANGE_MIN,
  BMI_REFERENCE_RANGE_MAX,
  WL_DEFICIT_LOW_FACTOR,
  WL_DEFICIT_HIGH_FACTOR,
  WL_FLOOR_KCAL,
} from "./constants";

/** BMI = weight_kg / height_m². Unrounded. */
export function calculateBmiRaw(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

/** Display rule for BMI: one decimal, standard rounding (27.36 -> 27.4). */
export function formatBmi(bmiRaw: number): number {
  return Math.round(bmiRaw * 10) / 10;
}

export type BmiCategory = "underweight" | "reference" | "overweight" | "obese1" | "obese2" | "obese3";

/** The 6 WHO categories, classified on the raw (unrounded) BMI. */
export function getBmiCategory(bmiRaw: number): BmiCategory {
  if (bmiRaw < BMI_UNDERWEIGHT_MAX) return "underweight";
  if (bmiRaw < BMI_OVERWEIGHT_MIN) return "reference";
  if (bmiRaw < BMI_OBESE_I_MIN) return "overweight";
  if (bmiRaw < BMI_OBESE_II_MIN) return "obese1";
  if (bmiRaw < BMI_OBESE_III_MIN) return "obese2";
  return "obese3";
}

/**
 * The 4 status/direction message branches. Obese I/II/III share one branch —
 * the spec's status+direction copy doesn't distinguish between obesity grades,
 * only the BMI badge (getBmiCategory) does.
 */
export type DirectionBranch = "underweight" | "reference" | "overweight" | "obese";

export function getDirectionBranch(category: BmiCategory): DirectionBranch {
  if (category === "underweight" || category === "reference" || category === "overweight") {
    return category;
  }
  return "obese";
}

export interface WeightRange {
  min: number;
  max: number;
}

/**
 * "Interval orientativ de greutate" — a mathematical BMI 18.5–24.9 reference
 * range, not a personalized target. Never call this "greutate ideală".
 */
export function calculateWeightReferenceRange(heightCm: number): WeightRange {
  const heightM = heightCm / 100;
  const heightM2 = heightM * heightM;
  return {
    min: Math.round(BMI_REFERENCE_RANGE_MIN * heightM2 * 10) / 10,
    max: Math.round(BMI_REFERENCE_RANGE_MAX * heightM2 * 10) / 10,
  };
}

export type WeightLossResult =
  | { blocked: false; kcalLow: number; kcalHigh: number }
  | { blocked: true };

/**
 * Orientative 10–20% deficit range for BMI ≥25, computed from TEE at the
 * person's actual (not reference) weight. If the low end of the raw range
 * would fall at or below the safety floor, no range is shown at all —
 * per spec, not even the upper bound and not a fallback value.
 */
export function calculateWeightLossRange(teeRaw: number): WeightLossResult {
  const lowRaw = teeRaw * WL_DEFICIT_LOW_FACTOR;
  const highRaw = teeRaw * WL_DEFICIT_HIGH_FACTOR;

  if (lowRaw <= WL_FLOOR_KCAL) {
    return { blocked: true };
  }

  return {
    blocked: false,
    kcalLow: Math.trunc(lowRaw),
    kcalHigh: Math.trunc(highRaw),
  };
}
