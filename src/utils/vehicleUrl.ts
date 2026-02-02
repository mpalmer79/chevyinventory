// src/utils/vehicleUrl.ts
import { InventoryRow } from "../types";

/**
 * Determines the dealership domain based on vehicle make
 */
function getDealershipDomain(make: string): string {
  const makeUpper = make.toUpperCase();
  if (makeUpper === "GMC" || makeUpper === "BUICK") {
    return "https://www.quirkbuickgmc.com";
  }
  return "https://www.quirkchevynh.com";
}

/**
 * Formats drive type based on dealership
 * GMC/Buick uses spelled-out drive types, Chevy uses abbreviations
 */
function formatDriveType(driveType: string, make: string): string {
  const makeUpper = make.toUpperCase();
  const isGmcBuick = makeUpper === "GMC" || makeUpper === "BUICK";
  const driveLower = driveType.toLowerCase();

  if (isGmcBuick) {
    // GMC/Buick uses full words
    switch (driveLower) {
      case "4wd": return "four-wheel-drive";
      case "awd": return "all-wheel-drive";
      case "rwd": return "rear-wheel-drive";
      case "fwd": return "front-wheel-drive";
      case "2wd": return "two-wheel-drive";
      default: return driveLower;
    }
  }
  // Chevrolet uses abbreviations
  return driveLower;
}

/**
 * Generates the vehicle detail URL for Quirk dealerships
 * Routes to appropriate domain based on make:
 * - GMC/BUICK → quirkbuickgmc.com
 * - CHEVROLET → quirkchevynh.com
 */
export function generateVehicleUrl(row: InventoryRow): string {
  const year = row.Year;
  const make = (row.Make || "chevrolet").toUpperCase();
  const makeLower = make.toLowerCase();
  const vin = (row.VIN || "").toLowerCase();
  
  if (!vin) return "";

  const modelUpper = (row.Model || "").toUpperCase();
  const body = row.Body || "";
  const bodyType = (row["Body Type"] || "").toLowerCase();
  const trim = row.Trim || "";
  const domain = getDealershipDomain(make);

  // Extract drive type from Body field first, then trim
  let driveType = "";
  const bodyDriveMatch = body.match(/\b(AWD|4WD|RWD|FWD|2WD)\b/i);
  if (bodyDriveMatch) {
    driveType = bodyDriveMatch[1]?.toLowerCase() || "";
  } else {
    const trimDriveMatch = trim.match(/\b(AWD|4WD|RWD|FWD|2WD)\b/i);
    driveType = trimDriveMatch?.[1]?.toLowerCase() ?? "";
  }

  // Build URL based on vehicle type and make
  if (modelUpper === "CORVETTE") {
    return buildCorvetteUrl(row, year, makeLower, vin, body, trim, driveType, domain);
  } else if (modelUpper.includes("EXPRESS") || modelUpper.includes("SAVANA")) {
    return buildVanUrl(row, year, makeLower, vin, body, trim, driveType, modelUpper, domain, make);
  } else if (modelUpper.includes("SILVERADO") || modelUpper.includes("COLORADO") || 
             modelUpper.includes("SIERRA")) {
    return buildTruckUrl(row, year, makeLower, vin, body, trim, driveType, modelUpper, domain, make);
  } else {
    return buildGenericUrl(row, year, makeLower, vin, body, trim, driveType, bodyType, domain, make);
  }
}

function buildCorvetteUrl(
  row: InventoryRow,
  year: number,
  make: string,
  vin: string,
  body: string,
  trim: string,
  driveType: string,
  domain: string
): string {
  const parts = ["new", String(year), make, "corvette"];

  // Extract sub-model from Body (e.g., "E-Ray" from "2dr E-Ray Cpe w/")
  const subModelMatch = body.match(/\b(E-Ray|Stingray|Z06|ZR1)\b/i);
  if (subModelMatch) {
    parts.push(subModelMatch[1]!.toLowerCase());
  }

  // Add trim (e.g., "3LZ", "2LT")
  if (trim) {
    parts.push(trim.toLowerCase().replace(/\s+/g, "-"));
  }

  // Add drive type - Corvettes: E-Ray is AWD, others are RWD
  if (!driveType) {
    driveType = subModelMatch?.[1]?.toLowerCase() === "e-ray" ? "awd" : "rwd";
  }
  parts.push(driveType);

  // Body type - check Model Number for convertible (67) vs coupe
  const modelNum = (row["Model Number"] || "").toUpperCase();
  const bodyTypeVal = modelNum.includes("67") ? "convertible" : "coupe";
  parts.push(bodyTypeVal);

  parts.push(vin);

  return `${domain}/inventory/${parts.join("-")}/`;
}

function buildVanUrl(
  row: InventoryRow,
  year: number,
  make: string,
  vin: string,
  body: string,
  trim: string,
  driveType: string,
  modelUpper: string,
  domain: string,
  makeOriginal: string
): string {
  const parts = ["new", String(year), make];

  // Determine van type based on make and model
  if (modelUpper.includes("SAVANA")) {
    // GMC Savana
    if (modelUpper.includes("CUTAWAY") || modelUpper.includes("COMMERCIAL")) {
      parts.push("savana-commercial-cutaway");
    } else if (modelUpper.includes("CARGO")) {
      parts.push("savana-cargo");
    } else if (modelUpper.includes("PASSENGER")) {
      parts.push("savana-passenger");
    } else {
      parts.push("savana-commercial-cutaway");
    }
  } else {
    // Chevrolet Express
    if (modelUpper.includes("CARGO")) {
      parts.push("express-cargo");
    } else if (modelUpper.includes("PASSENGER")) {
      parts.push("express-passenger");
    } else if (modelUpper.includes("CUTAWAY") || modelUpper.includes("COMMERCIAL")) {
      parts.push("express-commercial-cutaway");
    } else {
      parts.push("express");
    }
  }

  // Extract capacity from Body (e.g., "2500" from "RWD 2500 135\"")
  const capacityMatch = body.match(/\b(1500|2500|3500)\b/);
  if (capacityMatch) {
    parts.push(capacityMatch[1]!);
  }

  // Add trim - "BASE" often becomes "wt" (work truck)
  if (trim) {
    const trimLower = trim.toLowerCase();
    if (trimLower === "base") {
      parts.push("wt");
    } else {
      parts.push(trimLower.replace(/\s+/g, "-"));
    }
  }

  // Add drive type
  if (driveType) {
    parts.push(formatDriveType(driveType, makeOriginal));
  }

  // Extract wheelbase from Body (e.g., "135\"", "139\"", "155\"", "177\"")
  const wheelbaseMatch = body.match(/(\d{3})["\"]/);
  if (wheelbaseMatch) {
    const wb = parseInt(wheelbaseMatch[1]!);
    if (wb <= 139) {
      parts.push("regular-wheelbase");
    } else {
      parts.push("extended-wheelbase");
    }
  }

  parts.push(vin);

  return `${domain}/inventory/${parts.join("-")}/`;
}

function buildTruckUrl(
  row: InventoryRow,
  year: number,
  make: string,
  vin: string,
  body: string,
  trim: string,
  driveType: string,
  modelUpper: string,
  domain: string,
  makeOriginal: string
): string {
  const parts = ["new", String(year), make];

  // Process model: "SILVERADO 2500HD" → "silverado-2500-hd", "SIERRA 1500" → "sierra-1500"
  // Remove "CC" suffix for chassis cab models in URL
  let model = modelUpper
    .replace(/\s*CC\s*$/i, "") // Remove CC suffix
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/(\d+)(hd)/g, "$1-hd")
    .replace(/--+/g, "-");
  parts.push(model);

  // Add trim (remove drive type from it)
  if (trim) {
    let trimClean = trim
      .replace(/\b(AWD|4WD|RWD|FWD|2WD)\b/gi, "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .replace(/^-|-$/g, "");
    if (trimClean) {
      parts.push(trimClean);
    }
  }

  // Add drive type - trucks default to 4wd
  if (!driveType) driveType = "4wd";
  parts.push(formatDriveType(driveType, makeOriginal));

  // Determine cab type from Body
  const bodyLower = body.toLowerCase();
  if (bodyLower.includes("crew")) {
    parts.push("crew-cab");
  } else if (bodyLower.includes("double")) {
    parts.push("double-cab");
  } else if (bodyLower.includes("regular") || bodyLower.includes("reg")) {
    parts.push("regular-cab");
  } else {
    parts.push("crew-cab"); // default
  }

  parts.push(vin);

  return `${domain}/inventory/${parts.join("-")}/`;
}

function buildGenericUrl(
  row: InventoryRow,
  year: number,
  make: string,
  vin: string,
  body: string,
  trim: string,
  driveType: string,
  bodyType: string,
  domain: string,
  makeOriginal: string
): string {
  const parts = ["new", String(year), make];

  // Process model
  let model = (row.Model || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-");
  parts.push(model);

  // Add trim (remove drive type)
  if (trim) {
    let trimClean = trim
      .replace(/\b(AWD|4WD|RWD|FWD|2WD)\b/gi, "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/--+/g, "-")
      .replace(/^-|-$/g, "");
    if (trimClean) {
      parts.push(trimClean);
    }
  }

  // Add drive type if available
  if (driveType) {
    parts.push(formatDriveType(driveType, makeOriginal));
  }

  // Determine body style
  let bodyStyle = "suv"; // default
  const modelUpper = (row.Model || "").toUpperCase();
  
  if (bodyType === "coupe" || modelUpper.includes("CAMARO")) {
    bodyStyle = "coupe";
  } else if (bodyType === "sedan" || modelUpper.includes("MALIBU")) {
    bodyStyle = "sedan";
  } else if (bodyType === "van") {
    bodyStyle = "cargo-van";
  } else if (modelUpper.includes("TAHOE") || modelUpper.includes("SUBURBAN") ||
             modelUpper.includes("YUKON")) {
    bodyStyle = "suv";
  } else if (modelUpper.includes("TRAILBLAZER") || modelUpper.includes("TRAX")) {
    bodyStyle = "suv";
  } else if (modelUpper.includes("EQUINOX") || modelUpper.includes("BLAZER") || 
             modelUpper.includes("TRAVERSE")) {
    bodyStyle = "suv";
  } else if (modelUpper.includes("TERRAIN") || modelUpper.includes("ACADIA") ||
             modelUpper.includes("ENCLAVE") || modelUpper.includes("ENCORE") ||
             modelUpper.includes("ENVISTA")) {
    bodyStyle = "suv";
  }

  parts.push(bodyStyle);
  parts.push(vin);

  return `${domain}/inventory/${parts.join("-")}/`;
}
