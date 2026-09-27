import { describe, it, expect } from "vitest";
import {
  calculateREE,
  calculateTEE,
  truncateKcal,
  calculateProtein,
  calculateCarbsGrams,
  calculateFatGrams,
} from "./calculations";
import { PAL } from "./constants";

describe("Mifflin–St Jeor REE", () => {
  it("computes REE for a man (formula: 10w + 6.25h - 5a + 5)", () => {
    // 10*80 + 6.25*180 - 5*30 + 5 = 800 + 1125 - 150 + 5 = 1780
    expect(calculateREE("M", 80, 180, 30)).toBe(1780);
  });

  it("computes REE for a woman (formula: 10w + 6.25h - 5a - 161)", () => {
    // 10*65 + 6.25*165 - 5*28 - 161 = 650 + 1031.25 - 140 - 161 = 1380.25
    expect(calculateREE("F", 65, 165, 28)).toBeCloseTo(1380.25);
  });
});

describe("the 4 PAL levels", () => {
  it("match the spec exactly", () => {
    expect(PAL.low).toBe(1.4);
    expect(PAL.moderate).toBe(1.6);
    expect(PAL.active).toBe(1.8);
    expect(PAL.very_active).toBe(2.0);
  });
});

describe("TEE and kcal display rule", () => {
  it("TEE = REE * PAL", () => {
    expect(calculateTEE(1500, 1.6)).toBe(2400);
  });

  it("truncates the spec's worked example: 2137.92 -> 2137, not 2138", () => {
    expect(truncateKcal(2137.92)).toBe(2137);
  });

  it("truncates 2137.12 -> 2137 too", () => {
    expect(truncateKcal(2137.12)).toBe(2137);
  });

  it("never rounds up to the next integer", () => {
    expect(truncateKcal(2137.99)).toBe(2137);
    expect(truncateKcal(2137.99)).not.toBe(2138);
  });

  it("never rounds to the nearest 50 or 100", () => {
    expect(truncateKcal(2137.92)).not.toBe(2150);
    expect(truncateKcal(2137.92)).not.toBe(2100);
  });
});

describe("protein — normoponderal (\"reference\" direction branch), 18–64y (single reper, 0.83 g/kg)", () => {
  it("adult <65y normoponderal returns the existing numeric value", () => {
    const r = calculateProtein(70, 40, "reference");
    // 70 * 0.83 = 58.1 -> 58
    expect(r.kind).toBe("standard");
    if (r.kind === "standard") {
      expect(r.min).toBe(58);
      expect(r.max).toBeNull();
    }
  });

  it("rounds .5-and-up fractions upward (58.7 -> 59)", () => {
    // 70.7 * 0.83 = 58.681 -> 59
    const r = calculateProtein(70.7, 30, "reference");
    expect(r.kind).toBe("standard");
    if (r.kind === "standard") expect(r.min).toBe(59);
  });

  it("does not apply the senior range at age 64 boundary (still adult reper)", () => {
    const r = calculateProtein(70, 64, "reference");
    expect(r.kind).toBe("standard");
    if (r.kind === "standard") expect(r.max).toBeNull();
  });
});

describe("protein — normoponderal (\"reference\" direction branch), ≥65y (senior range, 1.0–1.2 g/kg)", () => {
  it("adult ≥65y normoponderal returns the existing numeric range", () => {
    const r = calculateProtein(70, 70, "reference");
    expect(r.kind).toBe("standard");
    if (r.kind === "standard") {
      expect(r.min).toBe(70);
      expect(r.max).toBe(84);
    }
  });

  it("applies starting exactly at age 65", () => {
    const r = calculateProtein(70, 65, "reference");
    expect(r.kind).toBe("standard");
    if (r.kind === "standard") {
      expect(r.min).toBe(70);
      expect(r.max).toBe(84);
    }
  });
});

describe("protein — overweight/obese direction branches never get a numeric value", () => {
  it("overweight <65y returns needs_individual_evaluation, not 0.83 × current weight", () => {
    const r = calculateProtein(90, 40, "overweight");
    expect(r).toEqual({ kind: "needs_individual_evaluation" });
  });

  it("obese grade I <65y returns needs_individual_evaluation (collapses to the \"obese\" branch)", () => {
    const r = calculateProtein(100, 40, "obese");
    expect(r).toEqual({ kind: "needs_individual_evaluation" });
  });

  it("obese grade II ≥65y returns needs_individual_evaluation, not the 1.0–1.2 senior range", () => {
    const r = calculateProtein(110, 70, "obese");
    expect(r).toEqual({ kind: "needs_individual_evaluation" });
  });

  it("obese grade III ≥65y returns needs_individual_evaluation, not the 1.0–1.2 senior range", () => {
    const r = calculateProtein(130, 70, "obese");
    expect(r).toEqual({ kind: "needs_individual_evaluation" });
  });

  it("the overweight/obese branch takes priority over the senior (≥65y) branch", () => {
    // Same weight/age as a senior case above that would otherwise return {min:70, max:84} —
    // confirms direction branch is checked first, before age.
    const r = calculateProtein(70, 70, "overweight");
    expect(r).toEqual({ kind: "needs_individual_evaluation" });
  });
});

describe("protein — underweight direction branch still gets the standard numeric reper", () => {
  it("underweight <65y is unaffected by the overweight/obese exclusion", () => {
    const r = calculateProtein(45, 30, "underweight");
    expect(r.kind).toBe("standard");
    if (r.kind === "standard") {
      expect(r.min).toBe(37); // 45 * 0.83 = 37.35 -> 37
      expect(r.max).toBeNull();
    }
  });
});

describe("carbohydrates in grams (45–60% of energy, 4 kcal/g)", () => {
  it("converts a round maintenance energy value (kcalLow === kcalHigh)", () => {
    const r = calculateCarbsGrams(2000, 2000);
    expect(r.min).toBe(225); // 2000*0.45/4
    expect(r.max).toBe(300); // 2000*0.60/4
  });

  it("converts the spec's truncated example energy (2137)", () => {
    const r = calculateCarbsGrams(2137, 2137);
    expect(r.min).toBe(Math.round((2137 * 0.45) / 4));
    expect(r.max).toBe(Math.round((2137 * 0.6) / 4));
  });

  it("uses the relevant (weight-loss) kcal range, not a single maintenance value", () => {
    const r = calculateCarbsGrams(1700, 1912);
    expect(r.min).toBe(Math.round((1700 * 0.45) / 4));
    expect(r.max).toBe(Math.round((1912 * 0.6) / 4));
  });
});

describe("fat in grams (20–35% of energy, 9 kcal/g)", () => {
  it("converts a round maintenance energy value (kcalLow === kcalHigh)", () => {
    const r = calculateFatGrams(2000, 2000);
    expect(r.min).toBe(44); // 2000*0.20/9 = 44.44 -> 44
    expect(r.max).toBe(78); // 2000*0.35/9 = 77.78 -> 78
  });

  it("uses the relevant (weight-loss) kcal range, not a single maintenance value", () => {
    const r = calculateFatGrams(1700, 1912);
    expect(r.min).toBe(Math.round((1700 * 0.2) / 9));
    expect(r.max).toBe(Math.round((1912 * 0.35) / 9));
  });
});
