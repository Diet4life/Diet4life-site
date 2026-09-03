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

describe("protein — 18–64y (single reper, 0.83 g/kg)", () => {
  it("rounds to the nearest gram, not truncated", () => {
    const r = calculateProtein(70, 40);
    // 70 * 0.83 = 58.1 -> 58
    expect(r.min).toBe(58);
    expect(r.max).toBeNull();
  });

  it("rounds .5-and-up fractions upward (58.7 -> 59)", () => {
    // 70.7 * 0.83 = 58.681 -> 59
    const r = calculateProtein(70.7, 30);
    expect(r.min).toBe(59);
  });

  it("does not apply at age 64 boundary (still adult reper)", () => {
    const r = calculateProtein(70, 64);
    expect(r.max).toBeNull();
  });
});

describe("protein — ≥65y (senior range, 1.0–1.2 g/kg)", () => {
  it("returns a min/max range", () => {
    const r = calculateProtein(70, 70);
    expect(r.min).toBe(70);
    expect(r.max).toBe(84);
  });

  it("applies starting exactly at age 65", () => {
    const r = calculateProtein(70, 65);
    expect(r.min).toBe(70);
    expect(r.max).toBe(84);
  });
});

describe("carbohydrates in grams (45–60% of energy, 4 kcal/g)", () => {
  it("converts a round energy value", () => {
    const r = calculateCarbsGrams(2000);
    expect(r.min).toBe(225); // 2000*0.45/4
    expect(r.max).toBe(300); // 2000*0.60/4
  });

  it("converts the spec's truncated example energy (2137)", () => {
    const r = calculateCarbsGrams(2137);
    expect(r.min).toBe(Math.round((2137 * 0.45) / 4));
    expect(r.max).toBe(Math.round((2137 * 0.6) / 4));
  });
});

describe("fat in grams (20–35% of energy, 9 kcal/g)", () => {
  it("converts a round energy value", () => {
    const r = calculateFatGrams(2000);
    expect(r.min).toBe(44); // 2000*0.20/9 = 44.44 -> 44
    expect(r.max).toBe(78); // 2000*0.35/9 = 77.78 -> 78
  });
});
