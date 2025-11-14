import React, { useState, useMemo, ChangeEvent } from "react";
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

const QUIRK_GREEN = "#00693E";
const QUIRK_GREEN_LIGHT = "#00A86B";
const CHART_COLORS = [
  QUIRK_GREEN,
  "#2563EB",
  "#F97316",
  "#EC4899",
  "#8B5CF6",
  "#0EA5E9",
  "#22C55E",
];

/* ----------------- Data hook ----------------- */

function useInventoryData() {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    try {
      const data = await file.arrayBuffer();
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
    } catch (err) {
      console.error(err);
      setError(
        "There was a problem reading that Excel file. Please check the format."
      );
    }
  };

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

  // KPIs and ageBarData are still computed (for possible future use),
  // but we no longer render them on screen.
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
        borderBottom: "1px solid #1f2937",
        background:
          "linear-gradient(90deg, #020617, #020617 40%, #022c22 100%)",
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
              background: "#ffffff",
              borderRadius: "999px",
              padding: "4px 14px",
            }}
          >
            <span
              style={{
                color: QUIRK_GREEN,
                fontWeight: 800,
                letterSpacing: "0.18em",
                fontSize: "11px",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              QUIRK CHEVROLET   MANCHESTER NH
            </span>
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
              border: "1px solid #374151",
              fontSize: "11px",
              color: "#e5e7eb",
              cursor: "pointer",
            }}
          >
            <input
              type="file"
              accept=".xlsx,.xls"
              style={{ display: "none" }}
              onChange={onFileChange}
            />
            {hasRows ? "Import another file" : "Import Excel inventory"}
          </label>
          {fileName && (
            <span
              style={{
                maxWidth: "180px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontSize: "10px",
                color: "#9ca3af",
              }}
            >
              {fileName}
            </span>
          )}
        </div>
      </div>
    </header>
  );
};

/* ----------------- Charts ----------------- */

type ChartsSectionProps = {
  modelPieData: ModelPieDatum[];
};

const ChartsSection: React.FC<ChartsSectionProps> = ({ modelPieData }) => {
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        gap: "16px",
      }}
    >
      <div className="panel">
        {/* We keep the section title small; you can remove this line too if you want it even cleaner */}
        <div className="section-title">Inventory Mix · Top Models</div>
        <div style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={modelPieData}
                innerRadius={55}
                outerRadius={80}
                dataKey="value"
                nameKey="name"
                paddingAngle={2}
              >
                {modelPieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  borderRadius: 8,
                  border: "1px solid #1f2937",
                  fontSize: 12,
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

/* ----------------- Table ----------------- */

type InventoryTableProps = {
  rows: InventoryRow[];
};

const InventoryTable: React.FC<InventoryTableProps> = ({ rows }) => {
  if (!rows.length) return null;

  const body: JSX.Element[] = [];
  let lastModel = "";
  let lastSilveradoModelNumber = "";

  rows.forEach((row, index) => {
    const isNewModel = row.Model !== lastModel;
    const isSilverado = row.Model.toUpperCase() === "SILVERADO 1500";
    const isNewSilveradoSubgroup =
      isSilverado && row["Model Number"] !== lastSilveradoModelNumber;

    if (isNewModel) {
      body.push(
        <tr key={`model-${row.Model}-${index}`} style={{ background: "#020617" }}>
          <td
            colSpan={14}
            style={{
              padding: "6px 8px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#e5e7eb",
            }}
          >
            {row.Model}
          </td>
        </tr>
      );
      lastModel = row.Model;
      lastSilveradoModelNumber = "";
    }

    if (isNewSilveradoSubgroup) {
      body.push(
        <tr
          key={`sub-${row.Model}-${row["Model Number"]}-${index}`}
          style={{ background: "#022c22" }}
        >
          <td
            colSpan={14}
            style={{
              padding: "4px 10px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#6ee7b7",
            }}
          >
            Model Number: {row["Model Number"]}
          </td>
        </tr>
      );
      lastSilveradoModelNumber = row["Model Number"];
    }

    body.push(
      <tr key={`${row["Stock Number"]}-${index}`}>
        <td>{row["Stock Number"]}</td>
        <td>{row["Short VIN"]}</td>
        <td>{row.Year}</td>
        <td>{row.Make}</td>
        <td>{row.Model}</td>
        <td>{row.Trim}</td>
        <td>{row.VIN}</td>
        <td>{row["Model Number"]}</td>
        <td style={{ textAlign: "center" }}>{row.Cylinders}</td>
        <td>{row.Lot}</td>
        <td>{row["Vehicle Status"]}</td>
        <td style={{ textAlign: "right" }}>{row.Age}</td>
        <td style={{ textAlign: "center" }}>{row.Cylinders2}</td>
        <td style={{ textAlign: "right" }}>
          {row.MSRP?.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
          })}
        </td>
      </tr>
    );
  });

  return (
    <section className="table-shell">
      <table>
        <thead>
          <tr>
            <th>Stock #</th>
            <th>Short VIN</th>
            <th>Year</th>
            <th>Make</th>
            <th>Model</th>
            <th>Trim</th>
            <th>VIN</th>
            <th>Model #</th>
            <th>Cyl</th>
            <th>Lot</th>
            <th>Status</th>
            <th>Age</th>
            <th>Cyl2</th>
            <th>MSRP</th>
          </tr>
        </thead>
        <tbody>{body}</tbody>
      </table>
    </section>
  );
};

/* ----------------- App (with search, no KPIs, no age bar) ----------------- */

const App: React.FC = () => {
  const { rows, fileName, error, handleFileChange, sortedRows } =
    useInventoryData();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredRows = useMemo<InventoryRow[]>(() => {
    if (!searchTerm.trim()) return sortedRows;

    const term = searchTerm.trim().toLowerCase();

    return sortedRows.filter((row) => {
      const stock = (row["Stock Number"] || "").toString().toLowerCase();
      const shortVin = (row["Short VIN"] || "").toString().toLowerCase();
      const vinLast6 = (row.VIN || "").slice(-6).toLowerCase();
      const model = (row.Model || "").toLowerCase();
      const modelNumber = (row["Model Number"] || "").toLowerCase();

      return (
        stock.includes(term) ||
        shortVin.includes(term) ||
        vinLast6.includes(term) ||
        model.includes(term) ||
        modelNumber.includes(term)
      );
    });
  }, [sortedRows, searchTerm]);

  const displayModelPieData = useMemo<ModelPieDatum[]>(() => {
    const countByModel: Record<string, number> = {};

    filteredRows.forEach((r) => {
      countByModel[r.Model] = (countByModel[r.Model] || 0) + 1;
    });

    return Object.entries(countByModel)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [filteredRows]);

  return (
    <div>
      <HeaderBar
        fileName={fileName}
        hasRows={rows.length > 0}
        onFileChange={handleFileChange}
      />

      <main>
        {rows.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "10px",
              marginBottom: "12px",
            }}
          >
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search stock #, VIN, model..."
              style={{
                minWidth: "240px",
                padding: "6px 12px",
                borderRadius: "999px",
                border: "1px solid #d1d5db",
                fontSize: "12px",
              }}
            />
          </div>
        )}

        {!rows.length && !error && (
          <div className="panel">
            <div className="section-title">Upload inventory</div>
            <p style={{ fontSize: "13px", color: "#111827" }}>
              Import the latest Excel export from your Quirk Chevrolet inventory
              report. We’ll group by model, sub-group Silverado 1500 by model
              number, and visualize the mix for you.
            </p>
          </div>
        )}

        {error && (
          <div
            className="panel"
            style={{ borderColor: "#b91c1c", color: "#b91c1c" }}
          >
            {error}
          </div>
        )}

        {rows.length > 0 && (
          <>
            {/* KPIs removed from display per your request */}
            <ChartsSection modelPieData={displayModelPieData} />
            <InventoryTable rows={filteredRows} />
          </>
        )}
      </main>

      <footer className="app-footer">
        Quirk Chevrolet Manchester · Inventory Dashboard Prototype
      </footer>
    </div>
  );
};

export default App;
