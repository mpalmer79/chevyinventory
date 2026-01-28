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
      if (!sheetName) {
        setError("No sheets found in workbook");
        return;
      }
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        setError("Worksheet not found");
        return;
      }
      
      // Read as array of arrays since there's no header row
      const rawData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: "" 
      });

      // Map columns by index:
      // 0: Stock Number, 1: Year, 2: Make, 3: Model, 4: Exterior Color,
      // 5: Trim, 6: Model Number, 7: Cylinders, 8: Age, 9: MSRP, 10: Status, 11: VIN
      const parsed: InventoryRow[] = rawData
        .filter((row): row is unknown[] => Array.isArray(row) && row.length >= 10 && row[0] != null)
        .map((row) => ({
          "Stock Number": String(row[0] ?? ""),
          Year: Number(row[1]) || 0,
          Make: String(row[2] ?? ""),
          Model: String(row[3] ?? ""),
          "Exterior Color": String(row[4] ?? ""),
          Trim: String(row[5] ?? ""),
          "Model Number": String(row[6] ?? ""),
          Cylinders: Number(row[7]) || 0,
          Age: Number(row[8]) || 0,
          MSRP: Number(row[9]) || 0,
          Status: String(row[10] ?? ""),
          VIN: String(row[11] ?? ""),
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
      countByModel[r.Model] = (countByModel[r.Model] ?? 0) + 1;
    });

    return Object.entries(countByModel)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [rows]);

  return { rows, error, sortedRows, modelPieData };
}
