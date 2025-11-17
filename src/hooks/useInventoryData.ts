// src/hooks/useInventoryData.ts
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { InventoryRow, ModelPieDatum } from "../types";
import { DEFAULT_INVENTORY_PATH } from "../inventoryHelpers";

export function useInventoryData() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadFromArrayBuffer = async (data: ArrayBuffer) => {
    try {
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      const parsed: InventoryRow[] = json.map((row: any) => ({
        "Stock Number": row["Stock Number"],
        Year: Number(row["Year"]),
        Make: row["Make"],
        Model: row["Model"],
        "Exterior Color": row["Exterior Color"],
        Trim: row["Trim"],
        "Model Number": row["Model Number"],
        Cylinders: Number(row["Cylinders"]),
        "Short VIN": row["Short VIN"],
        Age: Number(row["Age"]),
        MSRP: Number(row["MSRP"]),
      }));

      setRows(parsed);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Error parsing inventory file.");
    }
  };

  useEffect(() => {
    const loadDefaultInventory = async () => {
      try {
        const res = await fetch(DEFAULT_INVENTORY_PATH);
        if (!res.ok) return;
        const data = await res.arrayBuffer();
        await loadFromArrayBuffer(data);
      } catch (err) {
        console.error("Failed to load default inventory:", err);
      }
    };

    loadDefaultInventory();
  }, []);

  const sortedRows = useMemo<InventoryRow[]>(() => {
    return [...rows].sort((a, b) => {
      if (a.Model !== b.Model) return a.Model.localeCompare(b.Model);
      return b.Age - a.Age; // oldest first within model
    });
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

  return { rows, error, sortedRows, modelPieData };
}
