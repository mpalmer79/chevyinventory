// src/inventoryHelpers.test.ts
import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  getModelColor,
  QUIRK_GREEN,
  POWDER_BLUE,
  CHART_COLORS,
} from "./inventoryHelpers";

describe("formatCurrency", () => {
  it("formats positive numbers as USD currency", () => {
    expect(formatCurrency(55000)).toBe("$55,000");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("formats large numbers with commas", () => {
    expect(formatCurrency(1234567)).toBe("$1,234,567");
  });

  it("removes decimal places", () => {
    expect(formatCurrency(55000.99)).toBe("$55,001");
  });

  it("returns dash for NaN", () => {
    expect(formatCurrency(NaN)).toBe("-");
  });

  it("returns dash for Infinity", () => {
    expect(formatCurrency(Infinity)).toBe("-");
  });

  it("returns dash for negative Infinity", () => {
    expect(formatCurrency(-Infinity)).toBe("-");
  });

  it("handles negative numbers", () => {
    expect(formatCurrency(-5000)).toBe("-$5,000");
  });
});

describe("getModelColor", () => {
  it("returns POWDER_BLUE for SILVERADO 1500", () => {
    expect(getModelColor("SILVERADO 1500", 0)).toBe(POWDER_BLUE);
  });

  it("returns POWDER_BLUE for silverado 1500 (case insensitive)", () => {
    expect(getModelColor("silverado 1500", 0)).toBe(POWDER_BLUE);
  });

  it("returns chart color at index for other models", () => {
    expect(getModelColor("TAHOE", 0)).toBe(CHART_COLORS[0]);
    expect(getModelColor("EQUINOX", 1)).toBe(CHART_COLORS[1]);
  });

  it("cycles through chart colors for high indices", () => {
    const index = CHART_COLORS.length + 2;
    expect(getModelColor("TRAVERSE", index)).toBe(CHART_COLORS[index % CHART_COLORS.length]);
  });

  it("uses QUIRK_GREEN as first chart color", () => {
    expect(CHART_COLORS[0]).toBe(QUIRK_GREEN);
    expect(getModelColor("TAHOE", 0)).toBe(QUIRK_GREEN);
  });
});

describe("constants", () => {
  it("QUIRK_GREEN is correct hex color", () => {
    expect(QUIRK_GREEN).toBe("#16a34a");
  });

  it("POWDER_BLUE is correct hex color", () => {
    expect(POWDER_BLUE).toBe("#5A6A82");
  });

  it("CHART_COLORS has expected length", () => {
    expect(CHART_COLORS.length).toBe(8);
  });

  it("CHART_COLORS contains valid hex colors", () => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    CHART_COLORS.forEach((color) => {
      expect(color).toMatch(hexRegex);
    });
  });
});
