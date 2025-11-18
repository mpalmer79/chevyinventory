// src/types.ts

export type InventoryRow = {
  "Stock Number": string;
  Year: number;
  Make: string;
  Model: string;
  "Exterior Color": string;
  Trim: string;
  "Model Number": string;
  Cylinders: number;
  "Short VIN": string;
  Age: number;
  MSRP: number;
};

export type ModelPieDatum = {
  name: string;
  value: number;
};

export type AgingBuckets = {
  bucket0_30: number;
  bucket31_60: number;
  bucket61_90: number;
  bucket90_plus: number;
};

export type DrillType =
  | null
  | "total"
  | "new"
  | "0_30"
  | "31_60"
  | "61_90"
  | "90_plus";

export type Filters = {
  model: string;
  year: string;
  priceMin: string;
  priceMax: string;
  stockNumber: string;
};
