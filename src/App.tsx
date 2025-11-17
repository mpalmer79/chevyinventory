import React, { useState, useMemo, useEffect, FC } from "react";
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

/* ---------- Types ---------- */

type InventoryRow = {
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

type ModelPieDatum = {
  name: string;
  value: number;
};

type AgingBuckets = {
  bucket0_30: number;
  bucket31_60: number;
  bucket61_90: number;
  bucket90_plus: number;
};

/* ---------- Constants / helpers ---------- */

const QUIRK_GREEN = "#16a34a";
const POWDER_BLUE = "#5A6A82"; // Silverado 1500 highlight color
const DEFAULT_INVENTORY_PATH = "/inventory.xlsx";

const CHART_COLORS = [
  QUIRK_GREEN,
  "#22c55e",
  "#4ade80",
  "#a3e635",
  "#f97316",
  "#facc15",
  "#eab308",
  "#22d3ee",
];

// Use powder blue specifically for Silverado 1500; fallback to normal palette for others
const getModelColor = (name: string, index: number): string => {
  if (name.toUpperCase() === "SILVERADO 1500") {
    return POWDER_BLUE;
  }
  return CHART_COLORS[index % CHART_COLORS.length];
};

function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

/* ---------- Data hook (loads default inventory) ---------- */

function useInventoryData() {
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
      setError(
        "There was a problem reading the inventory file. Please check the format."
      );
    }
  };

  // Auto-load /public/inventory.xlsx on first render
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
        await loadFromArrayBuffer(data);
      } catch (err) {
        console.error("Failed to load default inventory:", err);
      }
    };

    loadDefaultInventory();
  }, []);

  const sortedRows = useMemo<InventoryRow[]>(() => {
    if (!rows.length) return [];

    return [...rows].sort((a, b) => {
      // Group by model alphabetically
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

      // Then sort within each group by Age desc
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
    error,
    sortedRows,
    modelPieData,
  };
}

/* ---------- Layout components ---------- */

type HeaderProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
};

const HeaderBar: FC<HeaderProps> = ({ searchTerm, onSearchChange }) => (
  <header className="app-header">
    <div className="brand-block">
      <div className="brand-main">QUIRK CHEVROLET</div>
      <div className="brand-sub">MANCHESTER NH</div>
    </div>

    <div className="header-controls">
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

/* ----- KPI strip ----- */

type SummaryMetricsProps = {
  totalUnits: number;
  avgAge: number | null;
  totalMsrp: number | null;
  newArrivalCount: number;
};

const SummaryMetrics: FC<SummaryMetricsProps> = ({
  totalUnits,
  avgAge,
  totalMsrp,
  newArrivalCount,
}) => {
  if (!totalUnits) return null;

  return (
    <section className="metrics-row">
      <div className="metric-card">
        <div className="metric-label">Total Units</div>
        <div className="metric-value">{totalUnits}</div>
      </div>
      <div className="metric-card">
        <div className="metric-label">Average Days in Stock</div>
        <div className="metric-value">
          {avgAge !== null ? avgAge.toFixed(0) : "-"}
        </div>
      </div>
      <div className="metric-card">
        <div className="metric-label">Total MSRP on Lot</div>
        <div className="metric-value">
          {totalMsrp !== null ? formatCurrency(totalMsrp) : "-"}
        </div>
      </div>
      <div className="metric-card">
        <div className="metric-label">New Arrivals (≤ 7 days)</div>
        <div className="metric-value metric-pill">
          {newArrivalCount > 0 ? newArrivalCount : "0"}
        </div>
      </div>
    </section>
  );
};

/* ----- Charts + aging buckets ----- */

type ChartsSectionProps = {
  modelPieData: ModelPieDatum[];
  agingBuckets: AgingBuckets;
};

const ChartsSection: FC<ChartsSectionProps> = ({
  modelPieData,
  agingBuckets,
}) => {
  if (!modelPieData.length) return null;

  const { bucket0_30, bucket31_60, bucket61_90, bucket90_plus } = agingBuckets;

  return (
    <section className="panel-grid">
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
                    fill={getModelColor(entry.name, index)}
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

      <div className="panel">
        <div className="section-title">Aging Overview · Days in Stock</div>
        <div className="aging-grid">
          <div className="aging-card">
            <div className="aging-label">0–30 days</div>
            <div className="aging-count">{bucket0_30}</div>
            <span className="aging-tag fresh">Fresh</span>
          </div>
          <div className="aging-card">
            <div className="aging-label">31–60 days</div>
            <div className="aging-count">{bucket31_60}</div>
            <span className="aging-tag normal">Normal</span>
          </div>
          <div className="aging-card">
            <div className="aging-label">61–90 days</div>
            <div className="aging-count">{bucket61_90}</div>
            <span className="aging-tag watch">Watch</span>
          </div>
          <div className="aging-card aging-risk">
            <div className="aging-label">90+ days</div>
            <div className="aging-count">{bucket90_plus}</div>
            <span className="aging-tag risk">At Risk</span>
          </div>
        </div>
        <p className="aging-footnote">
          Focus on <span className="text-highlight">90+ day</span> units first
          when planning daily follow-up and pricing.
        </p>
      </div>
    </section>
  );
};

/* ----- New arrivals panel ----- */

type NewArrivalsProps = {
  rows: InventoryRow[];
};

const NewArrivalsPanel: FC<NewArrivalsProps> = ({ rows }) => {
  if (!rows.length) return null;

  return (
    <section className="panel">
      <div className="section-title">New Arrivals · Last 7 Days</div>
      <div className="new-arrivals">
        {rows.map((row) => (
          <div className="arrival-card" key={row["Stock Number"]}>
            <div className="arrival-main">
              <span className="arrival-stock">#{row["Stock Number"]}</span>
              <span className="arrival-title">
                {row.Year} {row.Make} {row.Model} {row.Trim}
              </span>
            </div>
            <div className="arrival-meta">
              <span className="arrival-pill">
                {row["Exterior Color"] || "Color TBD"}
              </span>
              <span className="arrival-pill">
                {row.Age} day{row.Age === 1 ? "" : "s"} in stock
              </span>
              <span className="arrival-price">
                {formatCurrency(row.MSRP)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ----- Inventory table ----- */

type InventoryTableProps = {
  rows: InventoryRow[];
};

const InventoryTable: FC<InventoryTableProps> = ({ rows }) => {
  if (!rows.length) return null;

  const visibleRows = rows.slice(0, 500);

  return (
    <section className="panel">
      <div className="section-title">
        Inventory Detail · Grouped by Model / Model Number
      </div>
      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>Stock #</th>
              <th>Year</th>
              <th>Make</th>
              <th>Model</th>
              <th>Exterior Color</th>
              <th>Trim</th>
              <th>Model #</th>
              <th>Cyl</th>
              <th>Short VIN</th>
              <th>Age</th>
              <th>MSRP</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr key={row["Stock Number"]}>
                <td>{row["Stock Number"]}</td>
                <td>{row.Year}</td>
                <td>{row.Make}</td>
                <td>{row.Model}</td>
                <td>{row["Exterior Color"]}</td>
                <td>{row.Trim}</td>
                <td>{row["Model Number"]}</td>
                <td>{row.Cylinders}</td>
                <td>{row["Short VIN"]}</td>
                <td>{row.Age}</td>
                <td>{formatCurrency(row.MSRP)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

/* ---------- App ---------- */

const App: FC = () => {
  const { rows, error, sortedRows, modelPieData } = useInventoryData();
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

  // ---------- Derived metrics for KPIs, aging, and new arrivals ----------

  const summaryAndSegments = useMemo(() => {
    if (!rows.length) {
      return {
        totalUnits: 0,
        avgAge: null as number | null,
        totalMsrp: null as number | null,
        agingBuckets: {
          bucket0_30: 0,
          bucket31_60: 0,
          bucket61_90: 0,
          bucket90_plus: 0,
        } as AgingBuckets,
        newArrivals: [] as InventoryRow[],
      };
    }

    let totalAge = 0;
    let totalMsrp = 0;

    const aging: AgingBuckets = {
      bucket0_30: 0,
      bucket31_60: 0,
      bucket61_90: 0,
      bucket90_plus: 0,
    };

    const newArrivals: InventoryRow[] = [];

    rows.forEach((row) => {
      const age = row.Age || 0;
      totalAge += age;
      totalMsrp += Number.isFinite(row.MSRP) ? row.MSRP : 0;

      if (age <= 30) aging.bucket0_30 += 1;
      else if (age <= 60) aging.bucket31_60 += 1;
      else if (age <= 90) aging.bucket61_90 += 1;
      else aging.bucket90_plus += 1;

      if (age <= 7) {
        newArrivals.push(row);
      }
    });

    // Show newest arrivals first
    newArrivals.sort((a, b) => a.Age - b.Age);

    return {
      totalUnits: rows.length,
      avgAge: rows.length ? totalAge / rows.length : null,
      totalMsrp: rows.length ? totalMsrp : null,
      agingBuckets: aging,
      newArrivals,
    };
  }, [rows]);

  const {
    totalUnits,
    avgAge,
    totalMsrp,
    agingBuckets,
    newArrivals,
  } = summaryAndSegments;

  return (
    <div className="app-root">
      <HeaderBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main className="app-main">
        {error && (
          <section className="panel error-panel">
            <div className="section-title">File error</div>
            <p>{error}</p>
          </section>
        )}

        {rows.length > 0 && (
          <>
            <SummaryMetrics
              totalUnits={totalUnits}
              avgAge={avgAge}
              totalMsrp={totalMsrp}
              newArrivalCount={newArrivals.length}
            />
            <ChartsSection
              modelPieData={displayModelPieData}
              agingBuckets={agingBuckets}
            />
            <NewArrivalsPanel rows={newArrivals} />
            <InventoryTable rows={filteredRows} />
          </>
        )}
      </main>
    </div>
  );
};

export default App;
