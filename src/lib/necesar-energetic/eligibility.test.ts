import { describe, it, expect } from "vitest";
import { isEligibleAge, hasSafetyExclusion, SAFETY_EXCLUSIONS } from "./eligibility";

describe("age eligibility", () => {
  it("blocks anyone under 18", () => {
    expect(isEligibleAge(17)).toBe(false);
    expect(isEligibleAge(0)).toBe(false);
  });

  it("allows exactly 18 and above", () => {
    expect(isEligibleAge(18)).toBe(true);
    expect(isEligibleAge(65)).toBe(true);
    expect(isEligibleAge(120)).toBe(true);
  });
});

describe("safety exclusions", () => {
  it("has all 7 categories from the spec, unmodified", () => {
    expect(SAFETY_EXCLUSIONS.map((s) => s.key)).toEqual([
      "pregnant",
      "breastfeeding",
      "bariatric",
      "kidney",
      "liver",
      "fluid_restriction",
      "eating_disorder",
    ]);
  });

  it("blocks when no condition is selected: false", () => {
    expect(hasSafetyExclusion({})).toBe(false);
    expect(hasSafetyExclusion({ pregnant: false, kidney: false })).toBe(false);
  });

  it.each(SAFETY_EXCLUSIONS.map((s) => s.key))(
    "blocks when '%s' alone is selected",
    (key) => {
      expect(hasSafetyExclusion({ [key]: true })).toBe(true);
    }
  );
});
