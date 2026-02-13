// src/utils/modelFormatting.ts
import { InventoryRow } from "../types";

// Models that should be split by Model Number for grouping
export const SPLIT_BY_MODEL_NUMBER = [
  "SILVERADO 1500",
  "SILVERADO 2500HD",
  "SILVERADO 3500HD",
  "SIERRA 1500",
  "SIERRA 2500HD",
  "SIERRA 3500HD",
];

// Model Number to Body Style mapping for user-friendly display
// Format: "MODEL_NUMBER" -> "DRIVE CAB_STYLE WHEELBASE WB"
const MODEL_NUMBER_DISPLAY_MAP: Record<string, string> = {
  // Silverado 1500
  "CK10543": "4WD CREW CAB 147\" WB",
  "CK10703": "4WD REG CAB 126\" WB",
  "CK10743": "4WD CREW CAB 157\" WB",
  "CK10903": "4WD REG CAB 140\" WB",
  // Silverado 2500HD
  "CK20743": "4WD CREW CAB 159\" WB",
  "CK20943": "4WD CREW CAB 172\" WB",
  "CK20753": "4WD DOUBLE CAB 162\" WB",
  // Silverado 3500HD
  "CK30743": "4WD CREW CAB 159\" WB",
  "CK30943": "4WD CREW CAB 172\" WB",
  // Sierra 1500
  "TK10543": "4WD CREW CAB 147\" WB",
  "TK10703": "4WD REG CAB 126\" WB",
  "TK10743": "4WD CREW CAB 157\" WB",
  // Sierra 2500HD
  "TK20743": "4WD CREW CAB 159\" WB",
  "TK20943": "4WD CREW CAB 172\" WB",
  // Sierra 3500HD
  "TK30743": "4WD CREW CAB 159\" WB",
  "TK30943": "4WD CREW CAB 172\" WB",
};

/**
 * Gets the display-friendly body style for a model number
 * Returns the mapped description or the original model number if no mapping exists
 */
export function getModelNumberDisplay(modelNumber: string): string {
  return MODEL_NUMBER_DISPLAY_MAP[modelNumber] || modelNumber;
}

/**
 * Generates a display name for split models (trucks)
 * Example: "SILVERADO 1500", "CK10543" -> "SILVERADO 1500 4WD CREW CAB 147\" WB"
 */
export function getModelDisplayName(model: string, modelNumber: string): string {
  if (!modelNumber) return model;
  const bodyStyle = getModelNumberDisplay(modelNumber);
  return `${model} ${bodyStyle}`;
}

/**
 * Creates a unique key for grouping that includes the model number
 * Used internally for filtering/matching
 */
export function getModelKey(model: string, modelNumber: string): string {
  if (SPLIT_BY_MODEL_NUMBER.includes(model) && modelNumber) {
    return `${model}|${modelNumber}`;
  }
  return model;
}

/**
 * Parses a display name back to model and model number
 * Used when filtering by a selected display name
 */
export function parseModelDisplayName(displayName: string): { model: string; modelNumber: string | null } {
  for (const baseModel of SPLIT_BY_MODEL_NUMBER) {
    if (displayName.startsWith(`${baseModel} `)) {
      const remainder = displayName.replace(`${baseModel} `, "");
      // Check if remainder matches a known body style pattern or model number
      for (const [modelNum, bodyStyle] of Object.entries(MODEL_NUMBER_DISPLAY_MAP)) {
        if (remainder === bodyStyle || remainder === modelNum) {
          return { model: baseModel, modelNumber: modelNum };
        }
      }
      // If no exact match, the remainder might be a raw model number
      return { model: baseModel, modelNumber: remainder };
    }
  }
  return { model: displayName, modelNumber: null };
}

/**
 * Checks if a row matches a filter model (handles both display names and raw values)
 */
export function rowMatchesModelFilter(row: InventoryRow, filterModel: string): boolean {
  if (!filterModel) return true;
  
  const parsed = parseModelDisplayName(filterModel);
  
  if (parsed.modelNumber) {
    // Filter is for a specific model + model number combination
    return row.Model === parsed.model && row["Model Number"] === parsed.modelNumber;
  }
  
  // Filter is just for the base model
  return row.Model === filterModel;
}

/**
 * Formats the body description from the Body field
 * For trucks: Converts "4WD Crew Cab 147" w/3SB" to "4WD CREW CAB 147" WB"
 * For cars/SUVs: Cleans up and returns readable format like "2DR STINGRAY CPE" or "FWD 4DR"
 */
export function formatBodyDescription(body: string | undefined): string {
  if (!body) return "";
  
  // Clean up common suffixes
  let cleaned = body
    .replace(/\s*w\/\d*[A-Z]*\s*$/gi, "")  // Remove "w/3SB", "w/1", "w/" etc at end
    .replace(/\s*,\s*\d+"\s*CA\s*/gi, "")   // Remove ", 60" CA" suffix for HD trucks
    .replace(/["']+$/g, "")                  // Remove trailing quotes
    .trim();
  
  // Check if this is a truck-style body (has cab type and wheelbase)
  const truckMatch = cleaned.match(/^(4WD|2WD|AWD|RWD|FWD)?\s*(Crew Cab|Double Cab|Reg Cab|Regular Cab)\s*(\d{2,3})[""']?/i);
  
  if (truckMatch) {
    const driveType = truckMatch[1] || "";
    let cabStyle = truckMatch[2] || "";
    const wheelbase = truckMatch[3] || "";
    
    if (cabStyle.toLowerCase() === "regular cab") {
      cabStyle = "REG CAB";
    }
    
    const parts: string[] = [];
    if (driveType) parts.push(driveType.toUpperCase());
    if (cabStyle) parts.push(cabStyle.toUpperCase());
    if (wheelbase) parts.push(`${wheelbase}" WB`);
    
    return parts.join(" ");
  }
  
  // Check for van-style body (e.g., "Van 177"", "RWD 2500 135"")
  const vanMatch = cleaned.match(/^(RWD|FWD|AWD)?\s*(Van)?\s*(\d{4})?\s*(\d{2,3})[""']?/i);
  if (vanMatch && vanMatch[4]) {
    const parts: string[] = [];
    if (vanMatch[1]) parts.push(vanMatch[1].toUpperCase());
    if (vanMatch[2]) parts.push(vanMatch[2].toUpperCase());
    if (vanMatch[3]) parts.push(vanMatch[3]);
    if (vanMatch[4]) parts.push(`${vanMatch[4]}" WB`);
    return parts.join(" ");
  }
  
  // For everything else (Corvettes, sedans, SUVs, etc.), just clean and uppercase
  // Examples: "2dr Stingray Cpe" -> "2DR STINGRAY CPE", "FWD 4dr" -> "FWD 4DR"
  return cleaned.toUpperCase();
}

/**
 * Checks if a model should be split by model number for display
 */
export function shouldSplitByModelNumber(model: string): boolean {
  return SPLIT_BY_MODEL_NUMBER.includes(model);
}
