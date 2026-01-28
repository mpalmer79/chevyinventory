// src/utils/vehicleUrl.ts
import { InventoryRow } from "../types";

/**
 * Determines the base URL based on the vehicle make
 * - Chevrolet → quirkchevynh.com
 * - Buick/GMC → quirkbuickgmc.com
 */
function getBaseUrl(make: string): string {
  const makeLower = make.toLowerCase();
  if (makeLower === "buick" || makeLower === "gmc") {
    return "https://www.quirkbuickgmc.com";
  }
  return "https://www.quirkchevynh.com";
}

/**
 * Generates the vehicle detail URL for the appropriate dealership
 * Format: www.{dealership}.com/inventory/new-{year}-{make}-{model}-{trim}-{drive}-{body}-{vin}
 */
export function generateVehicleUrl(row: InventoryRow): string {
  const year = row.Year;
  const make = (row.Make || "chevrolet").toLowerCase();
  const vin = (row.VIN || "").toLowerCase();

  if (!vin) return "";

  const baseUrl = getBaseUrl(row.Make || "chevrolet");

  // Process model: "SILVERADO 2500HD" → "silverado-2500-hd"
  let model = (row.Model || "")
    .toLowerCase()
    .replace(/\s+/g, "-")           // spaces to hyphens
    .replace(/(\d+)(hd)/g, "$1-hd") // "2500hd" → "2500-hd"
    .replace(/--+/g, "-");          // clean double hyphens

  // Extract drive type from trim (AWD, 4WD, RWD, FWD)
  const trim = row.Trim || "";
  const driveMatch = trim.match(/\b(AWD|4WD|RWD|FWD)\b/i);
  let driveType = driveMatch?.[1]?.toLowerCase() ?? "";

  // Remove drive type from trim for the URL
  let trimClean = trim
    .replace(/\b(AWD|4WD|RWD|FWD)\b/gi, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-|-$/g, ""); // trim leading/trailing hyphens

  // Determine body type based on model
  let bodyType = "suv"; // default
  const modelUpper = (row.Model || "").toUpperCase();

  if (modelUpper.includes("SILVERADO") || modelUpper.includes("COLORADO") || modelUpper.includes("SIERRA") || modelUpper.includes("CANYON")) {
    bodyType = "crew-cab";
    if (!driveType) driveType = "4wd"; // trucks default to 4wd
  } else if (modelUpper.includes("CORVETTE")) {
    // Check model number for convertible vs coupe
    const modelNum = (row["Model Number"] || "").toUpperCase();
    bodyType = modelNum.includes("67") ? "convertible" : "coupe";
    if (!driveType) driveType = "rwd";
  } else if (
    modelUpper.includes("EQUINOX") ||
    modelUpper.includes("TRAVERSE") ||
    modelUpper.includes("TRAX") ||
    modelUpper.includes("TAHOE") ||
    modelUpper.includes("SUBURBAN") ||
    modelUpper.includes("BLAZER") ||
    modelUpper.includes("TRAILBLAZER") ||
    modelUpper.includes("ACADIA") ||
    modelUpper.includes("TERRAIN") ||
    modelUpper.includes("YUKON") ||
    modelUpper.includes("ENCORE") ||
    modelUpper.includes("ENVISION") ||
    modelUpper.includes("ENCLAVE")
  ) {
    bodyType = "suv";
  } else if (modelUpper.includes("EXPRESS") || modelUpper.includes("SAVANA")) {
    bodyType = "cargo-van";
  } else if (modelUpper.includes("MALIBU") || modelUpper.includes("CAMARO")) {
    bodyType = "sedan";
  }

  // Build URL parts
  const parts = ["new", String(year), make, model];

  if (trimClean) {
    parts.push(trimClean);
  }

  if (driveType) {
    parts.push(driveType);
  }

  parts.push(bodyType, vin);

  const path = parts.join("-").replace(/--+/g, "-");

  return `${baseUrl}/inventory/${path}/`;
}
