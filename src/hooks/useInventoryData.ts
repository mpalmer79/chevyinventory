import { useState, useMemo, useEffect, ChangeEvent } from "react";
import * as XLSX from "xlsx";
import {
  InventoryRow,
  InventoryKpis,
  ModelPieDatum,
  AgeBarDatum,
} from "../types/inventory";

const DEFAULT_INVENTORY_PATH = "/inventory.xlsx";

/**
 * Convert a worksheet into our strongly-typed InventoryRow[]
 */
function parseWorksheetToRows(worksheet: XLSX.WorkSheet): InventoryRow[] {
  const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  return json.map((row: any) => ({
    "Stock Number": row["Stock Number"],
    "Short VIN": row["Short VIN"],
    Year: Number(row["Year"]),
    Make: row["Make"],
    Model: row["Model"],
    Trim: row["Trim"],
    VIN: row["VIN"],
    "Model Number": row["Model Number"],
    Cylinders: Number(row["Cylinders"]),
    Lot: row["Lot"],
    "Vehicle Status": row["Vehicle Status"],
    Age: Number(row["Age"]),
    Cylinders2: Number(row["Cylinders2"]),
    MSRP: Number(row["MSRP"]),
  }));
}

export function useInventoryData() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Shared loader: given an ArrayBuffer of an Excel file,
   * read the first sheet and populate rows.
   */
  const loadFromArrayBuffer = async (data: ArrayBuffer, name: string) => {
    try {
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const parsed = parseWorksheetToRows(worksheet);
      setRows(parsed);
      setFileName(name);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(
        "There was a problem reading that Excel file. Please check the format."
      );
    }
  };

  /**
   * Manual upload handler (still useful for testing / development)
   */
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = await file.arrayBuffer();
    await loadFromArrayBuffer(data, file.name);
  };

  /**
   * NEW: Load the shared inventory file from /public on first mount.
   * Everyone hitting the site will see this data.
   */
  useEffect(() => {
    const loadDefaultInventory = async () => {
      try {
        const res = await fetch(DEFAULT_INVENTORY_PATH);
        if (!res.ok) {
          // If the file doesn't exist yet, just start empty without error.
          console.warn(
            `Default inventory file not found at ${DEFAULT_INVENTORY_PATH}`
          );
          return;
        }

        const data = await res.arrayBuffer();
        await loadFromArrayBuffer(data, "inventory.xlsx");
      } catch (err) {
        console.error("Failed to load default inventory:", err);
        // Don’t show a hard error to sales; just fall back to empty.
      }
    };

    loadDefaultInventory();
  }, []);

  /**
   * Sorting and KPIs are unchanged
   */
  const sortedRows = useMemo<InventoryRow[]>(() => {
    if (!rows.length) return [];

    return [...rows].sort((a, b) => {
      if (a.Model !== b.Model) {
        return a.Model.localeCompare(b.Model);
      }

      const isASilverado = a.Model.toUpperCase() === "SILVERADO 1500";
      const isBSilverado = b.Model.toUpperCase() === "SILVERADO 1500";

      if (isASilverado && isBSilverado) {
        if (a["Model Number"] !== b["Model Number"]) {
          return a["Model Number"].localeCompare(b["Model Number"]);
        }
      }

      return b.Age - a.Age;
    });
  }, [rows]);

  const kpis = useMemo<InventoryKpis>(() => {
    if (!rows.length) {
      return { total: 0, avgAge: 0, totalMsrp: 0, avgMsrp: 0 };
    }

    const total = rows.length;
    const totalAge = rows.reduce(
      (sum, r) => sum + (Number.isFinite(r.Age) ? r.Age : 0),
      0
    );
    const totalMsrp = rows.reduce(
      (sum, r) => sum + (Number.isFinite(r.MSRP) ? r.MSRP : 0),
      0
    );

    return {
      total,
      avgAge: totalAge / total,
      totalMsrp,
      avgMsrp: totalMsrp / total,
    };
  }, [rows]);

  const modelPieData = useMemo<ModelPieDatum[]>(() => {
    const countByModel: Record<string, number> = {};

    rows.forEach((r) => {
      countByModel[r.Model] = (countByModel[r.Model] || 0) + 1;
    });

    return Object.entries(countByModel)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [rows]);

  const ageBarData = useMemo<AgeBarDatum[]>(() => {
    const buckets: Record<string, number> = {
      "0–60": 0,
      "61–120": 0,
      "121–180": 0,
      "181–240": 0,
      "241+": 0,
    };

    rows.forEach((r) => {
      const age = r.Age || 0;
      if (age <= 60) buckets["0–60"]++;
      else if (age <= 120) buckets["61–120"]++;
      else if (age <= 180) buckets["121–180"]++;
      else if (age <= 240) buckets["181–240"]++;
      else buckets["241+"]++;
    });

    return Object.entries(buckets).map(([range, count]) => ({
      range,
      count,
    }));
  }, [rows]);

  return {
    rows,
    fileName,
    error,
    handleFileChange,
    sortedRows,
    kpis,
    modelPieData,
    ageBarData,
  };
}
