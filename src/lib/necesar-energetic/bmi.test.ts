import { describe, it, expect } from "vitest";
import {
  calculateBmiRaw,
  formatBmi,
  getBmiCategory,
  getDirectionBranch,
  calculateWeightReferenceRange,
  calculateWeightLossRange,
} from "./bmi";

describe("BMI calculation", () => {
  it("computes weight / height_m^2", () => {
    // 70 / 1.75^2 = 22.857...
    expect(calculateBmiRaw(70, 175)).toBeCloseTo(22.857, 2);
  });

  it("formats with one decimal, standard rounding (spec's worked example)", () => {
    expect(formatBmi(27.36)).toBe(27.4);
  });

  it("does not truncate like the kcal display rule does", () => {
    expect(formatBmi(22.34)).toBe(22.3);
    expect(formatBmi(22.35)).toBe(22.4);
  });
});

describe("BMI categories (WHO thresholds)", () => {
  it("classifies each of the 6 categories correctly", () => {
    expect(getBmiCategory(17)).toBe("underweight");
    expect(getBmiCategory(18.4)).toBe("underweight");
    expect(getBmiCategory(18.5)).toBe("reference");
    expect(getBmiCategory(22)).toBe("reference");
    expect(getBmiCategory(24.9)).toBe("reference");
    expect(getBmiCategory(25.0)).toBe("overweight");
    expect(getBmiCategory(29.9)).toBe("overweight");
    expect(getBmiCategory(30.0)).toBe("obese1");
    expect(getBmiCategory(34.9)).toBe("obese1");
    expect(getBmiCategory(35.0)).toBe("obese2");
    expect(getBmiCategory(39.9)).toBe("obese2");
    expect(getBmiCategory(40.0)).toBe("obese3");
    expect(getBmiCategory(45)).toBe("obese3");
  });
});

describe("direction branch (status+direction copy — obese1/2/3 share one branch)", () => {
  it("maps underweight/reference/overweight 1:1", () => {
    expect(getDirectionBranch("underweight")).toBe("underweight");
    expect(getDirectionBranch("reference")).toBe("reference");
    expect(getDirectionBranch("overweight")).toBe("overweight");
  });

  it("collapses all 3 obesity grades into 'obese'", () => {
    expect(getDirectionBranch("obese1")).toBe("obese");
    expect(getDirectionBranch("obese2")).toBe("obese");
    expect(getDirectionBranch("obese3")).toBe("obese");
  });
});

describe("weight reference range (18.5–24.9 x height_m^2, never called 'ideal weight')", () => {
  it("computes both bounds to one decimal for 170cm", () => {
    const r = calculateWeightReferenceRange(170);
    // 18.5 * 1.7^2 = 53.465 -> 53.5 ; 24.9 * 1.7^2 = 71.961 -> 72.0
    expect(r.min).toBe(53.5);
    expect(r.max).toBe(72.0);
  });
});

describe("weight-loss orientative deficit range (10–20% of TEE, BMI >= 25 only)", () => {
  it("computes the low (20% deficit) and high (10% deficit) ends, truncated", () => {
    // TEE = 2391 -> low = 2391*0.8 = 1912.8 -> 1912 ; high = 2391*0.9 = 2151.9 -> 2151
    const r = calculateWeightLossRange(2391);
    expect(r.blocked).toBe(false);
    if (!r.blocked) {
      expect(r.kcalLow).toBe(1912);
      expect(r.kcalHigh).toBe(2151);
    }
  });

  it("blocks the entire range when the raw low end is <= 1200 (the 1200 boundary itself blocks)", () => {
    // TEE = 1500 -> low_raw = 1200 exactly -> blocked
    const r = calculateWeightLossRange(1500);
    expect(r.blocked).toBe(true);
  });

  it("blocks well below the floor too", () => {
    const r = calculateWeightLossRange(1300); // low_raw = 1040
    expect(r.blocked).toBe(true);
  });

  it("does not block just above the floor", () => {
    // low_raw must be > 1200: TEE = 1501 -> low_raw = 1200.8
    const r = calculateWeightLossRange(1501);
    expect(r.blocked).toBe(false);
  });

  it("uses the raw (untruncated) low value for the floor check, not the truncated display value", () => {
    // TEE chosen so low_raw is just over 1200 but truncates to 1200 display-wise if mishandled
    // low_raw = 1200.4 (not <= 1200) -> must NOT block
    const tee = 1200.4 / 0.8;
    const r = calculateWeightLossRange(tee);
    expect(r.blocked).toBe(false);
  });
});
