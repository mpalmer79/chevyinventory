import React, { useState, useMemo, useEffect, ChangeEvent } from "react";
import * as XLSX from "xlsx";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

type InventoryRow = {
  "Stock Number": string;
  "Short VIN": string;
  Year: number;
  Make: string;
  Model: string;
  Trim: string;
  VIN: string;
  "Model Number": string;
  Cylinders: number;
  Lot: string;
  "Vehicle Status": string;
  Age: number;
  Cylinders2: number;
  MSRP: number;
};

type ModelPieDatum = {
  name: string;
  value: number;
};

type AgeBarDatum = {
  range: string;
  count: number;
};

type InventoryKpis = {
  total: number;
  avgAge: number;
  totalMsrp: number;
  avgMsrp: number;
};

const QUIRK_GREEN = "#0D8A3A";

const PIE_COLORS = [
  QUIRK_GREEN,
  "#2563EB",
  "#F97316",
  "#EC4899",
  "#8B5CF6",
  "#0EA5E9",
  "#22C55E",
];

/* ----------------- Data hook ----------------- */

const DEFAULT_INVENTORY_PATH = "/inventory.xlsx";

function useInventoryData() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Shared loader for both default file and manual uploads
  const loadFromArrayBuffer = async (data: ArrayBuffer, name: string) => {
    try {
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      const parsed: InventoryRow[] = json.map((row: any) => ({
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

  // Manual upload via the existing input
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = await file.arrayBuffer();
    await loadFromArrayBuffer(data, file.name);
  };

  // Auto-load default inventory from /inventory.xlsx on first load
  useEffect(() => {
    const loadDefaultInventory = async () => {
      try {
        const res = await fetch(DEFAULT_INVENTORY_PATH);
        if (!res.ok) {
          console.warn(
            `Default inventory file not found at ${DEFAULT_INVENTORY_PATH}`
          );
          return;
        }

        const data = await res.arrayBuffer();
        await loadFromArrayBuffer(data, "inventory.xlsx");
      } catch (err) {
        console.error("Failed to load default inventory:", err);
      }
    };

    loadDefaultInventory();
  }, []);

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

    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
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

/* ----------------- Header ----------------- */

type HeaderBarProps = {
  fileName: string | null;
  hasRows: boolean;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
};

const HeaderBar: React.FC<HeaderBarProps> = ({
  fileName,
  hasRows,
  onFileChange,
}) => {
  return (
    <header
      style={{
        background:
          "radial-gradient(circle at top left, #052e16 0, #020617 32%, #020617 100%)",
        color: "white",
        padding: "10px 0",
        marginBottom: "12px",
        borderBottom: "1px solid rgba(148, 163, 184, 0.4)",
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.6)",
      }}
    >
      <div
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              padding: "6px 18px",
              borderRadius: "999px",
              background: "white",
              color: QUIRK_GREEN,
              fontWeight: 700,
              letterSpacing: "0.15em",
              fontSize: "13px",
              boxShadow: "0 8px 20px rgba(15, 23, 42, 0.4)",
            }}
          >
            QUIRK CHEVROLET   MANCHESTER NH
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <label
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              padding: "6px 14px",
              borderRadius: "999px",
              background: "#020617",
              border: "1px solid rgba(148, 163, 184, 0.5)",
              cursor: "pointer",
              fontSize: "12px",
              boxShadow: "0 4px 16px rgba(15, 23, 42, 0.6)",
            }}
          >
            <span
              style={{
                marginRight: "8px",
                fontWeight: 600,
                color: "#E5E7EB",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Import inventory
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "#9CA3AF",
                borderLeft: "1px solid rgba(75, 85, 99, 0.8)",
                paddingLeft: "8px",
                maxWidth: "180px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {fileName || "Choose Excel export"}
            </span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={onFileChange}
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                cursor: "pointer",
              }}
            />
          </label>
        </div>
      </div>
    </header>
  );
};

/* ----------------- KPI cards ----------------- */

// (… keep the rest of your KPI cards, ChartsSection, InventoryTable,
// and App component exactly as they already are in your file …)

export default App;
