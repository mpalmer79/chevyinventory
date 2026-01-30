// src/utils/vehicleUrl.ts
import { InventoryRow } from "../types";

/**
 * Generates the quirkchevynh.com vehicle detail URL
 * Format varies by vehicle type but generally:
 * www.quirkchevynh.com/inventory/new-{year}-chevrolet-{model}-{submodel}-{trim}-{drive}-{body}-{vin}
 */
export function generateVehicleUrl(row: InventoryRow): string {
  const year = row.Year;
  const make = (row.Make || "chevrolet").toLowerCase();
  const vin = (row.VIN || "").toLowerCase();
  
  if (!vin) return "";

  const modelUpper = (row.Model || "").toUpperCase();
  const body = row.Body || "";
  const bodyType = (row["Body Type"] || "").toLowerCase();
  const trim = row.Trim || "";
  const modelNumber = row["Model Number"] || "";

  // Extract drive type from Body field first, then trim
  let driveType = "";
  const bodyDriveMatch = body.match(/\b(AWD|4WD|RWD|FWD|2WD)\b/i);
  if (bodyDriveMatch) {
    driveType = bodyDriveMatch[1]?.toLowerCase() || "";
  } else {
    const trimDriveMatch = trim.match(/\b(AWD|4WD|RWD|FWD|2WD)\b/i);
    driveType = trimDriveMatch?.[1]?.toLowerCase() ?? "";
  }

  // Build URL based on vehicle type
  if (modelUpper === "CORVETTE") {
    return buildCorvetteUrl(row, year, make, vin, body, trim, driveType);
  } else if (modelUpper.includes("EXPRESS")) {
    return buildExpressUrl(row, year, make, vin, body, trim, driveType, modelUpper);
  } else if (modelUpper.includes("SILVERADO") || modelUpper.includes("COLORADO")) {
    return buildTruckUrl(row, year, make, vin, body, trim, driveType, modelUpper);
  } else {
    return buildGenericUrl(row, year, make, vin, body, trim, driveType, bodyType);
  }
}

function buildCorvetteUrl(
  row: InventoryRow,
  year: number,
  make: string,
  vin: string,
  body: string,
  trim: string,
  driveType: string
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

  return `https://www.quirkchevynh.com/inventory/${parts.join("-")}/`;
}

function buildExpressUrl(
  row: InventoryRow,
  year: number,
  make: string,
  vin: string,
  body: string,
  trim: string,
  driveType: string,
  modelUpper: string
): string {
  const parts = ["new", String(year), make];

  // Determine express type: cargo, passenger, commercial cutaway
  if (modelUpper.includes("CARGO")) {
    parts.push("express-cargo");
  } else if (modelUpper.includes("PASSENGER")) {
    parts.push("express-passenger");
  } else if (modelUpper.includes("CUTAWAY") || modelUpper.includes("COMMERCIAL")) {
    parts.push("express-commercial-cutaway");
  } else {
    parts.push("express");
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
    parts.push(driveType);
  }

  // Extract wheelbase from Body (e.g., "135\"" or "155\"")
  const wheelbaseMatch = body.match(/(\d{3})["\"]/);
  if (wheelbaseMatch) {
    const wb = parseInt(wheelbaseMatch[1]!);
    if (wb <= 135) {
      parts.push("regular-wheelbase");
    } else if (wb <= 155) {
      parts.push("extended-wheelbase");
    } else {
      parts.push("extended-wheelbase");
    }
  }

  parts.push(vin);

  return `https://www.quirkchevynh.com/inventory/${parts.join("-")}/`;
}

function buildTruckUrl(
  row: InventoryRow,
  year: number,
  make: string,
  vin: string,
  body: string,
  trim: string,
  driveType: string,
  modelUpper: string
): string {
  const parts = ["new", String(year), make];

  // Process model: "SILVERADO 2500HD" → "silverado-2500-hd"
  let model = modelUpper
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
  parts.push(driveType);

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

  return `https://www.quirkchevynh.com/inventory/${parts.join("-")}/`;
}

function buildGenericUrl(
  row: InventoryRow,
  year: number,
  make: string,
  vin: string,
  body: string,
  trim: string,
  driveType: string,
  bodyType: string
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
    parts.push(driveType);
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
  } else if (modelUpper.includes("TAHOE") || modelUpper.includes("SUBURBAN")) {
    bodyStyle = "suv";
  } else if (modelUpper.includes("TRAILBLAZER") || modelUpper.includes("TRAX")) {
    bodyStyle = "suv";
  } else if (modelUpper.includes("EQUINOX") || modelUpper.includes("BLAZER") || modelUpper.includes("TRAVERSE")) {
    bodyStyle = "suv";
  }

  parts.push(bodyStyle);
  parts.push(vin);

  return `https://www.quirkchevynh.com/inventory/${parts.join("-")}/`;
}
