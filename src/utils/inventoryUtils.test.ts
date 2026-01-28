// src/utils/inventoryUtils.test.ts
import { describe, it, expect } from "vitest";
import {
  isInTransit,
  formatAge,
  formatAgeShort,
  sortByAgeDescending,
  sortByModelThenAge,
} from "./inventoryUtils";
import { InventoryRow } from "../types";

// Helper to create mock inventory rows
const createMockRow = (overrides: Partial<InventoryRow> = {}): InventoryRow => ({
  "Stock Number": "TEST001",
  Year: 2026,
  Make: "CHEVROLET",
  Model: "SILVERADO 1500",
  "Exterior Color": "Black",
  Trim: "LT 4WD",
  "Model Number": "CK10543",
  Cylinders: 8,
  Age: 30,
  MSRP: 55000,
  Status: "ON DEALER LOT",
  VIN: "1GCUYDED1RZ123456",
  ...overrides,
});

describe("isInTransit", () => {
  it("returns true for vehicles with IN TRANSIT status", () => {
    const row = createMockRow({ Status: "IN TRANSIT" });
    expect(isInTransit(row)).toBe(true);
  });

  it("returns true for variations of transit status", () => {
    expect(isInTransit(createMockRow({ Status: "In Transit" }))).toBe(true);
    expect(isInTransit(createMockRow({ Status: "TRANSIT" }))).toBe(true);
    expect(isInTransit(createMockRow({ Status: "in transit" }))).toBe(true);
  });

  it("returns false for vehicles on dealer lot", () => {
    const row = createMockRow({ Status: "ON DEALER LOT" });
    expect(isInTransit(row)).toBe(false);
  });

  it("returns false for empty status", () => {
    const row = createMockRow({ Status: "" });
    expect(isInTransit(row)).toBe(false);
  });

  it("handles undefined status gracefully", () => {
    const row = createMockRow({ Status: undefined as unknown as string });
    expect(isInTransit(row)).toBe(false);
  });
});

describe("formatAge", () => {
  it("formats single day correctly", () => {
    const row = createMockRow({ Age: 1 });
    expect(formatAge(row)).toBe("1 day");
  });

  it("formats multiple days correctly", () => {
    const row = createMockRow({ Age: 30 });
    expect(formatAge(row)).toBe("30 days");
  });

  it("formats zero days correctly", () => {
    const row = createMockRow({ Age: 0 });
    expect(formatAge(row)).toBe("0 days");
  });

  it("returns IN TRANSIT for transit vehicles", () => {
    const row = createMockRow({ Status: "IN TRANSIT", Age: 5 });
    expect(formatAge(row)).toBe("IN TRANSIT");
  });
});

describe("formatAgeShort", () => {
  it("returns age as string for on-lot vehicles", () => {
    const row = createMockRow({ Age: 45 });
    expect(formatAgeShort(row)).toBe("45");
  });

  it("returns IN TRANSIT for transit vehicles", () => {
    const row = createMockRow({ Status: "IN TRANSIT" });
    expect(formatAgeShort(row)).toBe("IN TRANSIT");
  });
});

describe("sortByAgeDescending", () => {
  it("sorts on-lot vehicles by age descending (oldest first)", () => {
    const rows = [
      createMockRow({ "Stock Number": "A", Age: 10 }),
      createMockRow({ "Stock Number": "B", Age: 30 }),
      createMockRow({ "Stock Number": "C", Age: 20 }),
    ];

    const sorted = sortByAgeDescending(rows);

    expect(sorted[0]["Stock Number"]).toBe("B"); // 30 days
    expect(sorted[1]["Stock Number"]).toBe("C"); // 20 days
    expect(sorted[2]["Stock Number"]).toBe("A"); // 10 days
  });

  it("places IN TRANSIT vehicles at the bottom", () => {
    const rows = [
      createMockRow({ "Stock Number": "A", Age: 5, Status: "IN TRANSIT" }),
      createMockRow({ "Stock Number": "B", Age: 30, Status: "ON DEALER LOT" }),
      createMockRow({ "Stock Number": "C", Age: 10, Status: "ON DEALER LOT" }),
    ];

    const sorted = sortByAgeDescending(rows);

    expect(sorted[0]["Stock Number"]).toBe("B"); // 30 days, on lot
    expect(sorted[1]["Stock Number"]).toBe("C"); // 10 days, on lot
    expect(sorted[2]["Stock Number"]).toBe("A"); // in transit (at bottom)
  });

  it("sorts multiple IN TRANSIT vehicles by age among themselves", () => {
    const rows = [
      createMockRow({ "Stock Number": "A", Age: 5, Status: "IN TRANSIT" }),
      createMockRow({ "Stock Number": "B", Age: 15, Status: "IN TRANSIT" }),
      createMockRow({ "Stock Number": "C", Age: 20, Status: "ON DEALER LOT" }),
    ];

    const sorted = sortByAgeDescending(rows);

    expect(sorted[0]["Stock Number"]).toBe("C"); // on lot first
    expect(sorted[1]["Stock Number"]).toBe("B"); // transit, 15 days
    expect(sorted[2]["Stock Number"]).toBe("A"); // transit, 5 days
  });

  it("does not mutate the original array", () => {
    const rows = [
      createMockRow({ "Stock Number": "A", Age: 10 }),
      createMockRow({ "Stock Number": "B", Age: 30 }),
    ];
    const originalFirst = rows[0]["Stock Number"];

    sortByAgeDescending(rows);

    expect(rows[0]["Stock Number"]).toBe(originalFirst);
  });

  it("handles empty array", () => {
    const sorted = sortByAgeDescending([]);
    expect(sorted).toEqual([]);
  });
});

describe("sortByModelThenAge", () => {
  it("sorts by model alphabetically first", () => {
    const rows = [
      createMockRow({ "Stock Number": "A", Model: "TAHOE", Age: 10 }),
      createMockRow({ "Stock Number": "B", Model: "EQUINOX", Age: 20 }),
      createMockRow({ "Stock Number": "C", Model: "SILVERADO 1500", Age: 5 }),
    ];

    const sorted = sortByModelThenAge(rows);

    expect(sorted[0].Model).toBe("EQUINOX");
    expect(sorted[1].Model).toBe("SILVERADO 1500");
    expect(sorted[2].Model).toBe("TAHOE");
  });

  it("sorts by age descending within same model", () => {
    const rows = [
      createMockRow({ "Stock Number": "A", Model: "TAHOE", Age: 10 }),
      createMockRow({ "Stock Number": "B", Model: "TAHOE", Age: 30 }),
      createMockRow({ "Stock Number": "C", Model: "TAHOE", Age: 20 }),
    ];

    const sorted = sortByModelThenAge(rows);

    expect(sorted[0]["Stock Number"]).toBe("B"); // 30 days
    expect(sorted[1]["Stock Number"]).toBe("C"); // 20 days
    expect(sorted[2]["Stock Number"]).toBe("A"); // 10 days
  });

  it("places IN TRANSIT at bottom of each model group", () => {
    const rows = [
      createMockRow({ "Stock Number": "A", Model: "TAHOE", Age: 5, Status: "IN TRANSIT" }),
      createMockRow({ "Stock Number": "B", Model: "TAHOE", Age: 30, Status: "ON DEALER LOT" }),
      createMockRow({ "Stock Number": "C", Model: "EQUINOX", Age: 10, Status: "ON DEALER LOT" }),
    ];

    const sorted = sortByModelThenAge(rows);

    expect(sorted[0].Model).toBe("EQUINOX");
    expect(sorted[1]["Stock Number"]).toBe("B"); // TAHOE on lot
    expect(sorted[2]["Stock Number"]).toBe("A"); // TAHOE in transit
  });
});
