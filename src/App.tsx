import React, { useState, useMemo, useEffect, ChangeEvent } from "react";
import * as XLSX from "xlsx";
import "./style.css";
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

const CHART_COLORS = [
  "#16a34a",
  "#22c55e",
  "#4ade80",
  "#a3e635",
  "#f97316",
  "#facc15",
  "#eab308",
  "#22d3ee",
];

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Local hook to manage inventory state.
 * (This is fully self-contained and doesn’t depend on src/hooks/.)
 */
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
      // Group by Model (A–Z)
      if (a.Model !== b.Model) {
        return a.Model.localeCompare(b.Model);
      }

      // Sub-group Silverado 1500 by Model Number
      const isASilverado = a.Model.toUpperCase() === "SILVERADO 1500";
      const isBSilverado = b.Model.toUpperCase() === "SILVERADO 1500";

      if (isASilverado && isBSilverado) {
        if (a["Model Number"] !== b["Model Number"]) {
          return a["Model Number"].localeCompare(b["Model Number"]);
        }
      }

      // Within each group, sort by Age descending
      return b.Age - a.Age;
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

  return {
    rows,
    fileName,
    error,
    handleFileChange,
    sortedRows,
    modelPieData,
  };
}

type HeaderProps = {
  fileName: string | null;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  hasRows: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
};

const HeaderBar: React.FC<HeaderProps> = ({
  fileName,
  onFileChange,
  hasRows,
  searchTerm,
  onSearchChange,
}) => {
  return (
    <header className="app-header">
      <div className="brand-pill">
        QUIRK CHEVROLET MANCHESTER NH
      </div>

      <div className="header-right">
        <label className="upload-button">
          <span>{hasRows ? "Import another file" : "Import Excel inventory"}</span>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={onFileChange}
            style={{ display: "none" }}
          />
        </label>

        <div className="file-name">
          {fileName ? <span>{fileName}</span> : <span>No file loaded yet</span>}
        </div>

        <input
          className="search-input"
          type="text"
          placeholder="Search stock #, VIN, model..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </header>
  );
};

type ChartsSectionProps = {
  modelPieData: ModelPieDatum[];
};

const ChartsSection: React.FC<ChartsSectionProps> = ({ modelPieData }) => {
  if (!modelPieData.length) return null;

  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr)",
        gap: "16px",
      }}
    >
      <div className="panel">
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
                  background: "#020617",
                  border: "1px solid rgba(148,163,184,0.5)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend
                layout="horizontal"
                align="center"
                verticalAlign="bottom"
                wrapperStyle={{
                  fontSize: 11,
                  paddingTop: 16,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
};

type InventoryTableProps = {
  rows: InventoryRow[];
};

const InventoryTable: React.FC<InventoryTableProps> = ({ rows }) => {
  if (!rows.length) return null;

  const body = rows.slice(0, 500).map((row) => (
    <tr key={row["Stock Number"]}>
      <td>{row["Stock Number"]}</td>
      <td>{row["Short VIN"]}</td>
      <td>{row.Year}</td>
      <td>{row.Make}</td>
      <td>{row.Model}</td>
      <td>{row.Trim}</td>
      <td>{row.VIN}</td>
      <td>{row["Model Number"]}</td>
      <td>{row.Cylinders}</td>
      <td>{row.Lot}</td>
      <td>{row["Vehicle Status"]}</td>
      <td>{row.Age}</td>
      <td>{row.Cylinders2}</td>
      <td>{formatCurrency(row.MSRP)}</td>
    </tr>
  ));

  return (
    <section className="panel">
      <div className="section-title">Inventory Detail · Grouped by Model</div>
      <div className="table-shell">
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
      </div>
    </section>
  );
};

/* ----------------- App ----------------- */

const App: React.FC = () => {
  const { rows, fileName, error, handleFileChange, sortedRows, modelPieData } =
    useInventoryData();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredRows = useMemo<InventoryRow[]>(() => {
    if (!searchTerm.trim()) return sortedRows;

    const term = searchTerm.trim().toLowerCase();

    return sortedRows.filter((row) => {
      const stock = (row["Stock Number"] || "").toString().toLowerCase();
      const shortVin = (row["Short VIN"] || "").toString().toLowerCase();
      const model = (row.Model || "").toString().toLowerCase();
      const modelNumber = (row["Model Number"] || "")
        .toString()
        .toLowerCase();

      return (
        stock.includes(term) ||
        shortVin.includes(term) ||
        model.includes(term) ||
        modelNumber.includes(term)
      );
    });
  }, [sortedRows, searchTerm]);

  const displayModelPieData = modelPieData.length
    ? modelPieData
    : [{ name: "No data", value: 1 }];

  return (
    <div className="app-root">
      <HeaderBar
        fileName={fileName}
        onFileChange={handleFileChange}
        hasRows={rows.length > 0}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <main className="app-main">
        <section className="panel">
          <div className="section-title">Upload inventory</div>
          <p
            style={{
              fontSize: "13px",
              color: "#111827",
            }}
          >
            Import the latest Excel export from your Quirk Chevrolet inventory
            report. We’ll group by model, sub-group Silverado 1500 by model
            number, and visualize the mix for you.
          </p>
          <p className="app-footer">
            Quirk Chevrolet Manchester · Inventory Dashboard Prototype
          </p>
        </section>

        {error && (
          <section className="panel" style={{ borderColor: "#b91c1c" }}>
            <div className="section-title" style={{ color: "#b91c1c" }}>
              {error}
            </div>
          </section>
        )}

        {rows.length > 0 && (
          <>
            <ChartsSection modelPieData={displayModelPieData} />
            <InventoryTable rows={filteredRows} />
          </>
        )}
      </main>
    </div>
  );
};

export default App;
