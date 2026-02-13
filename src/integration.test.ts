// src/integration.test.ts
// High-value integration tests for critical data flows
import { describe, it, expect } from "vitest";
import {
  parseModelDisplayName,
  rowMatchesModelFilter,
  formatBodyDescription,
  getModelDisplayName,
  SPLIT_BY_MODEL_NUMBER,
} from "./utils/modelFormatting";
import { isInTransit, sortByAgeDescending } from "./utils/inventoryUtils";
import { InventoryRow } from "./types";

// Mock inventory data simulating Excel import
const createMockInventory = (): InventoryRow[] => [
  {
    "Stock Number": "M39001",
    Year: 2024,
    Make: "CHEVROLET",
    Model: "SILVERADO 1500",
    "Exterior Color": "SUMMIT WHITE",
    Trim: "LT",
    "Model Number": "CK10543",
    Cylinders: 8,
    Age: 15,
    MSRP: 52000,
    Status: "ON DEALER LOT",
    VIN: "1GCUYDED1RZ123456",
    Body: '4WD Crew Cab 147" w/1',
  },
  {
    "Stock Number": "M39002",
    Year: 2024,
    Make: "CHEVROLET",
    Model: "SILVERADO 1500",
    "Exterior Color": "BLACK",
    Trim: "RST",
    "Model Number": "CK10743",
    Cylinders: 8,
    Age: 45,
    MSRP: 58000,
    Status: "ON DEALER LOT",
    VIN: "1GCUYDED2RZ234567",
    Body: '4WD Crew Cab 157" w/3SB',
  },
  {
    "Stock Number": "M39003",
    Year: 2025,
    Make: "CHEVROLET",
    Model: "CORVETTE",
    "Exterior Color": "TORCH RED",
    Trim: "1LT",
    "Model Number": "1YC07",
    Cylinders: 8,
    Age: 5,
    MSRP: 77000,
    Status: "ON DEALER LOT",
    VIN: "1G1YB2D47R5100001",
    Body: "2dr Stingray Cpe w/",
  },
  {
    "Stock Number": "M39004",
    Year: 2024,
    Make: "CHEVROLET",
    Model: "TAHOE",
    "Exterior Color": "SILVER",
    Trim: "Z71",
    "Model Number": "CK10706",
    Cylinders: 8,
    Age: 90,
    MSRP: 72000,
    Status: "IN TRANSIT",
    VIN: "1GNSKTKL1RR123456",
    Body: "4WD 4dr",
  },
  {
    "Stock Number": "G39001",
    Year: 2024,
    Make: "GMC",
    Model: "SIERRA 1500",
    "Exterior Color": "ONYX BLACK",
    Trim: "DENALI",
    "Model Number": "TK10743",
    Cylinders: 8,
    Age: 30,
    MSRP: 68000,
    Status: "ON DEALER LOT",
    VIN: "3GTU9DED5RG123456",
    Body: '4WD Crew Cab 157" w/1',
  },
];

describe("Integration: XLSX Parse → Filter → Display Flow", () => {
  describe("Excel Data Parsing Simulation", () => {
    it("correctly maps Excel columns to InventoryRow type", () => {
      const mapped: InventoryRow = {
        "Stock Number": "TEST001",
        Year: 2024,
        Make: "CHEVROLET",
        Model: "SILVERADO 1500",
        "Exterior Color": "WHITE",
        Trim: "LT",
        "Model Number": "CK10543",
        Cylinders: 8,
        Age: 10,
        MSRP: 50000,
        Status: "ON DEALER LOT",
        VIN: "1234567890ABCDEFG",
        Body: '4WD Crew Cab 147"',
      };

      expect(mapped["Stock Number"]).toBe("TEST001");
      expect(mapped.Year).toBe(2024);
      expect(mapped.Status).toBe("ON DEALER LOT");
      expect(typeof mapped.MSRP).toBe("number");
    });

    it("handles missing optional Body field gracefully", () => {
      const mapped: InventoryRow = {
        "Stock Number": "TEST002",
        Year: 2024,
        Make: "CHEVROLET",
        Model: "EQUINOX",
        "Exterior Color": "BLUE",
        Trim: "LT",
        "Model Number": "1XS26",
        Cylinders: 4,
        Age: 20,
        MSRP: 35000,
        Status: "ON DEALER LOT",
        VIN: "ABCDEFG1234567890",
        // Body intentionally omitted
      };

      expect(mapped.Body).toBeUndefined();
      expect(formatBodyDescription(mapped.Body)).toBe("");
    });
  });

  describe("Filter Chain", () => {
    const inventory = createMockInventory();

    it("filters by model with body style display name", () => {
      const filterValue = 'SILVERADO 1500 4WD CREW CAB 147" WB';
      const filtered = inventory.filter((row) =>
        rowMatchesModelFilter(row, filterValue)
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0]["Stock Number"]).toBe("M39001");
    });

    it("correctly distinguishes Silverado from Sierra with same body style", () => {
      const silveradoFilter = 'SILVERADO 1500 4WD CREW CAB 157" WB';
      const sierraFilter = 'SIERRA 1500 4WD CREW CAB 157" WB';

      const silveradoResults = inventory.filter((row) =>
        rowMatchesModelFilter(row, silveradoFilter)
      );
      const sierraResults = inventory.filter((row) =>
        rowMatchesModelFilter(row, sierraFilter)
      );

      expect(silveradoResults).toHaveLength(1);
      expect(silveradoResults[0].Make).toBe("CHEVROLET");

      expect(sierraResults).toHaveLength(1);
      expect(sierraResults[0].Make).toBe("GMC");
    });

    it("filters non-truck models by base name only", () => {
      const filtered = inventory.filter((row) =>
        rowMatchesModelFilter(row, "CORVETTE")
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0]["Stock Number"]).toBe("M39003");
    });

    it("separates in-transit from in-stock vehicles", () => {
      const inStock = inventory.filter((row) => !isInTransit(row));
      const inTransit = inventory.filter((row) => isInTransit(row));

      expect(inStock).toHaveLength(4);
      expect(inTransit).toHaveLength(1);
      expect(inTransit[0]["Stock Number"]).toBe("M39004");
    });
  });

  describe("Model Display Name Generation", () => {
    it("generates unique display names for all truck variants", () => {
      const inventory = createMockInventory();
      const truckModels = inventory.filter((row) =>
        SPLIT_BY_MODEL_NUMBER.includes(row.Model)
      );

      const displayNames = truckModels.map((row) =>
        getModelDisplayName(row.Model, row["Model Number"])
      );

      // All should be unique
      const uniqueNames = new Set(displayNames);
      expect(uniqueNames.size).toBe(displayNames.length);
    });

    it("parses display names back to correct model numbers", () => {
      const testCases = [
        {
          displayName: 'SILVERADO 1500 4WD CREW CAB 147" WB',
          expectedModel: "SILVERADO 1500",
          expectedModelNumber: "CK10543",
        },
        {
          displayName: 'SIERRA 1500 4WD CREW CAB 157" WB',
          expectedModel: "SIERRA 1500",
          expectedModelNumber: "TK10743",
        },
      ];

      testCases.forEach(({ displayName, expectedModel, expectedModelNumber }) => {
        const parsed = parseModelDisplayName(displayName);
        expect(parsed.model).toBe(expectedModel);
        expect(parsed.modelNumber).toBe(expectedModelNumber);
      });
    });
  });

  describe("Sorting and Grouping", () => {
    it("sorts vehicles by age descending for oldest units", () => {
      const inventory = createMockInventory();
      const inStock = inventory.filter((row) => !isInTransit(row));
      const sorted = sortByAgeDescending(inStock);

      // Tahoe (90 days) is IN TRANSIT, so excluded
      // Oldest in-stock is M39002 (Silverado) at 45 days
      expect(sorted[0].Age).toBe(45);
      expect(sorted[0]["Stock Number"]).toBe("M39002");
    });

    it("correctly identifies new arrivals (≤7 days)", () => {
      const inventory = createMockInventory();
      const newArrivals = inventory.filter(
        (row) => !isInTransit(row) && row.Age <= 7
      );

      expect(newArrivals).toHaveLength(1);
      expect(newArrivals[0]["Stock Number"]).toBe("M39003"); // Corvette, 5 days
    });

    it("correctly identifies aging inventory (90+ days)", () => {
      const inventory = createMockInventory();
      const aging = inventory.filter(
        (row) => !isInTransit(row) && row.Age >= 90
      );

      // Tahoe is 90 days but IN TRANSIT, so excluded
      expect(aging).toHaveLength(0);
    });
  });

  describe("Body Description Formatting", () => {
    it("formats all vehicle body types correctly", () => {
      const testCases = [
        { input: '4WD Crew Cab 147" w/1', expected: '4WD CREW CAB 147" WB' },
        { input: '4WD Crew Cab 157" w/3SB', expected: '4WD CREW CAB 157" WB' },
        { input: "2dr Stingray Cpe w/", expected: "2DR STINGRAY CPE" },
        { input: "4WD 4dr", expected: "4WD 4DR" },
        { input: '4WD Crew Cab 157" w/1', expected: '4WD CREW CAB 157" WB' },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(formatBodyDescription(input)).toBe(expected);
      });
    });
  });

  describe("End-to-End Filter Scenario", () => {
    it("simulates user selecting Silverado 1500 Crew Cab from dropdown", () => {
      const inventory = createMockInventory();

      // Step 1: Generate model list (what appears in dropdown)
      const modelSet = new Set<string>();
      inventory.forEach((row) => {
        if (SPLIT_BY_MODEL_NUMBER.includes(row.Model)) {
          modelSet.add(getModelDisplayName(row.Model, row["Model Number"]));
        } else {
          modelSet.add(row.Model);
        }
      });

      const modelList = Array.from(modelSet).sort();

      // Verify dropdown options include our expected models
      expect(modelList).toContain('SILVERADO 1500 4WD CREW CAB 147" WB');
      expect(modelList).toContain('SILVERADO 1500 4WD CREW CAB 157" WB');
      expect(modelList).toContain('SIERRA 1500 4WD CREW CAB 157" WB');
      expect(modelList).toContain("CORVETTE");
      expect(modelList).toContain("TAHOE");

      // Step 2: User selects a specific model
      const selectedModel = 'SILVERADO 1500 4WD CREW CAB 147" WB';

      // Step 3: Filter inventory
      const filtered = inventory.filter((row) =>
        rowMatchesModelFilter(row, selectedModel)
      );

      // Step 4: Verify results
      expect(filtered).toHaveLength(1);
      expect(filtered[0]["Stock Number"]).toBe("M39001");
      expect(filtered[0].Model).toBe("SILVERADO 1500");
      expect(filtered[0]["Model Number"]).toBe("CK10543");
    });
  });
});

describe("Integration: Aging Bucket Calculations", () => {
  it("calculates correct aging distribution", () => {
    const inventory = createMockInventory();
    const inStock = inventory.filter((row) => !isInTransit(row));

    const buckets = {
      fresh: inStock.filter((r) => r.Age <= 30).length,    // 0-30 days
      normal: inStock.filter((r) => r.Age > 30 && r.Age <= 60).length,  // 31-60
      watch: inStock.filter((r) => r.Age > 60 && r.Age <= 90).length,   // 61-90
      risk: inStock.filter((r) => r.Age > 90).length,      // 90+
    };

    expect(buckets.fresh).toBe(3);  // M39001 (15), M39003 (5), G39001 (30)
    expect(buckets.normal).toBe(1); // M39002 (45)
    expect(buckets.watch).toBe(0);
    expect(buckets.risk).toBe(0);   // Tahoe is IN TRANSIT, not counted
  });
});
