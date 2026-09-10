// ─── "De cât am nevoie?" — eligibility / safety-filter logic ────────────────
// DO NOT CHANGE WITHOUT MEDICAL REVIEW.

import { MIN_AGE } from "./constants";

/** Standard calculator applies only to adults ≥18. */
export function isEligibleAge(age: number): boolean {
  return age >= MIN_AGE;
}

/**
 * Situations that require an individual evaluation instead of the standard
 * calculator. Selecting any one of these blocks the calculation — do not
 * add, remove, or reword entries without medical review.
 */
export const SAFETY_EXCLUSIONS = [
  { key: "pregnant", ro: "Sunt însărcinată", en: "I am pregnant" },
  { key: "breastfeeding", ro: "Alăptez", en: "I am breastfeeding" },
  { key: "bariatric", ro: "Am avut chirurgie bariatrică", en: "I have had bariatric surgery" },
  { key: "kidney", ro: "Am boală renală", en: "I have kidney disease" },
  { key: "liver", ro: "Am boală hepatică severă", en: "I have severe liver disease" },
  { key: "fluid_restriction", ro: "Mi s-a recomandat medical restricție de lichide", en: "I've been medically advised to restrict fluids" },
  { key: "eating_disorder", ro: "Am o tulburare de comportament alimentar sau o restricție alimentară importantă", en: "I have an eating disorder or a significant dietary restriction" },
] as const;

export type SafetyExclusionKey = (typeof SAFETY_EXCLUSIONS)[number]["key"];

export type SafetySelections = Partial<Record<SafetyExclusionKey, boolean>>;

/** True if any safety-exclusion checkbox is selected. */
export function hasSafetyExclusion(selected: SafetySelections): boolean {
  return SAFETY_EXCLUSIONS.some((item) => selected[item.key]);
}
