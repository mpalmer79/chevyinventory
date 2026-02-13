// src/utils/modelFormatting.test.ts
import { describe, it, expect } from "vitest";
import {
  SPLIT_BY_MODEL_NUMBER,
  getModelNumberDisplay,
  getModelDisplayName,
  parseModelDisplayName,
  rowMatchesModelFilter,
  formatBodyDescription,
  shouldSplitByModelNumber,
} from "./modelFormatting";
import { InventoryRow } from "../types";

describe("SPLIT_BY_MODEL_NUMBER", () => {
  it("includes all Silverado variants", () => {
    expect(SPLIT_BY_MODEL_NUMBER).toContain("SILVERADO 1500");
    expect(SPLIT_BY_MODEL_NUMBER).toContain("SILVERADO 2500HD");
    expect(SPLIT_BY_MODEL_NUMBER).toContain("SILVERADO 3500HD");
  });

  it("includes all Sierra variants", () => {
    expect(SPLIT_BY_MODEL_NUMBER).toContain("SIERRA 1500");
    expect(SPLIT_BY_MODEL_NUMBER).toContain("SIERRA 2500HD");
    expect(SPLIT_BY_MODEL_NUMBER).toContain("SIERRA 3500HD");
  });
});

describe("getModelNumberDisplay", () => {
  it("returns friendly name for known Silverado model numbers", () => {
    expect(getModelNumberDisplay("CK10543")).toBe('4WD CREW CAB 147" WB');
    expect(getModelNumberDisplay("CK10703")).toBe('4WD REG CAB 126" WB');
    expect(getModelNumberDisplay("CK10743")).toBe('4WD CREW CAB 157" WB');
  });

  it("returns friendly name for known Sierra model numbers", () => {
    expect(getModelNumberDisplay("TK10543")).toBe('4WD CREW CAB 147" WB');
    expect(getModelNumberDisplay("TK10753")).toBe('4WD DOUBLE CAB 147" WB');
    expect(getModelNumberDisplay("TK20953")).toBe('4WD DOUBLE CAB 162" WB');
  });

  it("returns original model number if not in map", () => {
    expect(getModelNumberDisplay("UNKNOWN123")).toBe("UNKNOWN123");
    expect(getModelNumberDisplay("")).toBe("");
  });
});

describe("getModelDisplayName", () => {
  it("combines model and body style for trucks", () => {
    expect(getModelDisplayName("SILVERADO 1500", "CK10543")).toBe(
      'SILVERADO 1500 4WD CREW CAB 147" WB'
    );
    expect(getModelDisplayName("SIERRA 2500HD", "TK20743")).toBe(
      'SIERRA 2500HD 4WD CREW CAB 159" WB'
    );
  });

  it("returns just model name if no model number", () => {
    expect(getModelDisplayName("CORVETTE", "")).toBe("CORVETTE");
    expect(getModelDisplayName("TAHOE", "")).toBe("TAHOE");
  });

  it("returns model with raw number if number not in map", () => {
    expect(getModelDisplayName("SILVERADO 1500", "UNKNOWN")).toBe(
      "SILVERADO 1500 UNKNOWN"
    );
  });
});

describe("parseModelDisplayName", () => {
  it("parses Silverado display names correctly", () => {
    const result = parseModelDisplayName('SILVERADO 1500 4WD CREW CAB 147" WB');
    expect(result.model).toBe("SILVERADO 1500");
    expect(result.modelNumber).toBe("CK10543");
  });

  it("parses Sierra display names correctly", () => {
    const result = parseModelDisplayName('SIERRA 1500 4WD CREW CAB 157" WB');
    expect(result.model).toBe("SIERRA 1500");
    expect(result.modelNumber).toBe("TK10743");
  });

  it("correctly routes same body style to different model numbers based on brand", () => {
    // Same body style, different brands
    const silverado = parseModelDisplayName('SILVERADO 1500 4WD CREW CAB 147" WB');
    const sierra = parseModelDisplayName('SIERRA 1500 4WD CREW CAB 147" WB');
    
    expect(silverado.modelNumber).toBe("CK10543"); // Chevy uses CK
    expect(sierra.modelNumber).toBe("TK10543");    // GMC uses TK
  });

  it("returns null modelNumber for non-truck models", () => {
    const result = parseModelDisplayName("CORVETTE");
    expect(result.model).toBe("CORVETTE");
    expect(result.modelNumber).toBeNull();
  });

  it("handles raw model number in display name", () => {
    const result = parseModelDisplayName("SILVERADO 1500 CK10543");
    expect(result.model).toBe("SILVERADO 1500");
    expect(result.modelNumber).toBe("CK10543");
  });
});

describe("rowMatchesModelFilter", () => {
  const createRow = (model: string, modelNumber: string): InventoryRow => ({
    "Stock Number": "TEST123",
    Year: 2024,
    Make: "CHEVROLET",
    Model: model,
    "Exterior Color": "WHITE",
    Trim: "LT",
    "Model Number": modelNumber,
    Cylinders: 8,
    Age: 10,
    MSRP: 50000,
    Status: "ON DEALER LOT",
    VIN: "1234567890",
  });

  it("matches when filter is empty", () => {
    const row = createRow("SILVERADO 1500", "CK10543");
    expect(rowMatchesModelFilter(row, "")).toBe(true);
  });

  it("matches exact model for non-truck vehicles", () => {
    const row = createRow("CORVETTE", "1YC07");
    expect(rowMatchesModelFilter(row, "CORVETTE")).toBe(true);
    expect(rowMatchesModelFilter(row, "TAHOE")).toBe(false);
  });

  it("matches truck with body style display name", () => {
    const row = createRow("SILVERADO 1500", "CK10543");
    expect(rowMatchesModelFilter(row, 'SILVERADO 1500 4WD CREW CAB 147" WB')).toBe(true);
    expect(rowMatchesModelFilter(row, 'SILVERADO 1500 4WD CREW CAB 157" WB')).toBe(false);
  });

  it("correctly filters Sierra vs Silverado with same body style", () => {
    const silverado = createRow("SILVERADO 1500", "CK10543");
    const sierra = createRow("SIERRA 1500", "TK10543");
    
    // Sierra filter should NOT match Silverado
    expect(rowMatchesModelFilter(silverado, 'SIERRA 1500 4WD CREW CAB 147" WB')).toBe(false);
    expect(rowMatchesModelFilter(sierra, 'SIERRA 1500 4WD CREW CAB 147" WB')).toBe(true);
  });
});

describe("formatBodyDescription", () => {
  describe("truck body styles", () => {
    it("formats crew cab trucks", () => {
      expect(formatBodyDescription('4WD Crew Cab 147" w/1')).toBe('4WD CREW CAB 147" WB');
      expect(formatBodyDescription('4WD Crew Cab 157" w/3SB')).toBe('4WD CREW CAB 157" WB');
    });

    it("formats regular cab trucks", () => {
      expect(formatBodyDescription('4WD Reg Cab 126"')).toBe('4WD REG CAB 126" WB');
      expect(formatBodyDescription("4WD Regular Cab 140\"")).toBe('4WD REG CAB 140" WB');
    });

    it("formats double cab trucks", () => {
      expect(formatBodyDescription('4WD Double Cab 147" w/3SB')).toBe('4WD DOUBLE CAB 147" WB');
    });

    it("handles 2WD trucks", () => {
      expect(formatBodyDescription('2WD Crew Cab 147"')).toBe('2WD CREW CAB 147" WB');
    });
  });

  describe("non-truck body styles", () => {
    it("formats Corvette body styles", () => {
      expect(formatBodyDescription("2dr Stingray Cpe w/")).toBe("2DR STINGRAY CPE");
      expect(formatBodyDescription("2dr E-Ray Cpe w/")).toBe("2DR E-RAY CPE");
    });

    it("formats sedan/SUV body styles", () => {
      expect(formatBodyDescription("FWD 4dr")).toBe("FWD 4DR");
      expect(formatBodyDescription("AWD 4dr LT w/2LT")).toBe("AWD 4DR LT");
    });

    it("formats van body styles", () => {
      expect(formatBodyDescription('Van 177"')).toBe('VAN 177" WB');
    });
  });

  describe("edge cases", () => {
    it("returns empty string for undefined/null", () => {
      expect(formatBodyDescription(undefined)).toBe("");
      expect(formatBodyDescription("")).toBe("");
    });

    it("handles HD truck suffixes", () => {
      expect(formatBodyDescription('4WD Crew Cab 159", 60" CA')).toBe('4WD CREW CAB 159" WB');
    });
  });
});

describe("shouldSplitByModelNumber", () => {
  it("returns true for Silverado models", () => {
    expect(shouldSplitByModelNumber("SILVERADO 1500")).toBe(true);
    expect(shouldSplitByModelNumber("SILVERADO 2500HD")).toBe(true);
    expect(shouldSplitByModelNumber("SILVERADO 3500HD")).toBe(true);
  });

  it("returns true for Sierra models", () => {
    expect(shouldSplitByModelNumber("SIERRA 1500")).toBe(true);
    expect(shouldSplitByModelNumber("SIERRA 2500HD")).toBe(true);
    expect(shouldSplitByModelNumber("SIERRA 3500HD")).toBe(true);
  });

  it("returns false for other models", () => {
    expect(shouldSplitByModelNumber("CORVETTE")).toBe(false);
    expect(shouldSplitByModelNumber("TAHOE")).toBe(false);
    expect(shouldSplitByModelNumber("EQUINOX")).toBe(false);
    expect(shouldSplitByModelNumber("YUKON")).toBe(false);
  });
});
