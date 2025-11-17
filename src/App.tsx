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

/* ---------- Constants ---------- */

const QUIRK_GREEN = "#16a34a";
const POWDER_BLUE = "#5A6A82";
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

/* ---------- Data hook ---------- */

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
      } catch {}
    };
    loadDefaultInventory();
  }, []);

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      if (a.Model !== b.Model) return a.Model.localeCompare(b.Model);
      return b.Age - a.Age;
    });
  }, [rows]);

  const modelPieData = useMemo(() => {
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

/* ------------------ Header ------------------ */

const HeaderBar = ({
  searchTerm,
  onSearchChange,
}: {
  searchTerm: string;
  onSearchChange: (v: string) => void;
}) => (
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

/* ------------------ KPI Cards ------------------ */

const KpiBar = ({
  totalUnits,
  newArrivalCount,
  onSelectTotalUnits,
  onSelectNewArrivals,
}: {
  totalUnits: number;
  newArrivalCount: number;
  onSelectTotalUnits: () => void;
  onSelectNewArrivals: () => void;
}) => (
  <div className="kpi-row">
    <div className="kpi-card" onClick={onSelectTotalUnits}>
      <div className="kpi-label">Total Units</div>
      <div className="kpi-value clickable">{totalUnits}</div>
    </div>

    <div className="kpi-card" onClick={onSelectNewArrivals}>
      <div className="kpi-label">New Arrivals (≤ 7 days)</div>
      <div className="kpi-value clickable">{newArrivalCount}</div>
    </div>
  </div>
);

/* ------------------ Charts + Aging ------------------ */

const ChartsSection = ({
  modelPieData,
  agingBuckets,
  agingHandlers,
}: {
  modelPieData: ModelPieDatum[];
  agingBuckets: AgingBuckets;
  agingHandlers: {
    on0_30: () => void;
    on31_60: () => void;
    on61_90: () => void;
    on90_plus: () => void;
  };
}) => (
  <section className="panel-grid">
    <div className="panel">
      <div className="section-title centered">Inventory Mix · Top Models</div>

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
                  key={index}
                  fill={getModelColor(entry.name, index)}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#020617",
                border: "1px solid rgba(148,163,184,0.5)",
                borderRadius: 8,
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
      <div className="section-title centered">
        Aging Overview · Days in Stock
      </div>

      <div className="aging-grid">
        <div className="aging-card" onClick={agingHandlers.on0_30}>
          <div className="aging-label">0–30 Days</div>
          <div className="aging-count clickable">
            {agingBuckets.bucket0_30}
          </div>
          <span className="aging-tag fresh">Fresh</span>
        </div>

        <div className="aging-card" onClick={agingHandlers.on31_60}>
          <div className="aging-label">31–60 Days</div>
          <div className="aging-count clickable">
            {agingBuckets.bucket31_60}
          </div>
          <span className="aging-tag normal">Normal</span>
        </div>

        <div className="aging-card" onClick={agingHandlers.on61_90}>
          <div className="aging-label">61–90 Days</div>
          <div className="aging-count clickable">
            {agingBuckets.bucket61_90}
          </div>
          <span className="aging-tag watch">Watch</span>
        </div>

        <div className="aging-card aging-risk" onClick={agingHandlers.on90_plus}>
          <div className="aging-label">90+ Days</div>
          <div className="aging-count clickable">
            {agingBuckets.bucket90_plus}
          </div>
          <span className="aging-tag risk">At Risk</span>
        </div>
      </div>

      <p className="aging-footnote">
        Focus on <span className="text-highlight">90+ day</span> units first.
      </p>
    </div>
  </section>
);

/* ------------------ New Arrivals Panel ------------------ */

const NewArrivalsPanel = ({ rows }: { rows: InventoryRow[] }) => (
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

/* ------------------ Drill-down Table ------------------ */

const DrilldownTable = ({
  groups,
  onBack,
}: {
  groups: Record<string, InventoryRow[]>;
  onBack: () => void;
}) => (
  <section className="panel">
    <div className="drill-header">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>
      <div className="drill-title">Drill-Down Results</div>
    </div>

    {Object.keys(groups).map((model) => (
      <div key={model} className="drill-group">
        <div className="drill-group-title">{model}</div>
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Stock #</th>
                <th>Year</th>
                <th>Model</th>
                <th>Trim</th>
                <th>Exterior Color</th>
                <th>Miles</th>
                <th>Age</th>
                <th>MSRP</th>
              </tr>
            </thead>

            <tbody>
              {groups[model].map((row) => (
                <tr key={row["Stock Number"]}>
                  <td>{row["Stock Number"]}</td>
                  <td>{row.Year}</td>
                  <td>{row.Model}</td>
                  <td>{row.Trim}</td>
                  <td>{row["Exterior Color"]}</td>
                  <td>{row.Cylinders}</td>
                  <td>{row.Age}</td>
                  <td>{formatCurrency(row.MSRP)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ))}
  </section>
);

/* ------------------ Main App ------------------ */

const App: FC = () => {
  const { rows, error, sortedRows, modelPieData } = useInventoryData();
  const [searchTerm, setSearchTerm] = useState("");

  const [drillType, setDrillType] = useState<
    null | "total" | "new" | "0_30" | "31_60" | "61_90" | "90_plus"
  >(null);

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return sortedRows;
    const term = searchTerm.toLowerCase();
    return sortedRows.filter((r) =>
      [
        r["Stock Number"].toLowerCase(),
        r["Short VIN"].toLowerCase(),
        r.Model.toLowerCase(),
        r["Model Number"].toLowerCase(),
      ].some((f) => f.includes(term))
    );
  }, [searchTerm, sortedRows]);

  const agingBuckets = useMemo(() => {
    const b = {
      bucket0_30: 0,
      bucket31_60: 0,
      bucket61_90: 0,
      bucket90_plus: 0,
    };
    rows.forEach((r) => {
      if (r.Age <= 30) b.bucket0_30++;
      else if (r.Age <= 60) b.bucket31_60++;
      else if (r.Age <= 90) b.bucket61_90++;
      else b.bucket90_plus++;
    });
    return b;
  }, [rows]);

  const newArrivalRows = useMemo(() => {
    return rows
      .filter((r) => r.Age <= 7)
      .sort((a, b) => a.Model.localeCompare(b.Model));
  }, [rows]);

  const buildGroups = (items: InventoryRow[]) => {
    const groups: Record<string, InventoryRow[]> = {};
    items.forEach((r) => {
      if (!groups[r.Model]) groups[r.Model] = [];
      groups[r.Model].push(r);
    });
    Object.keys(groups).forEach((model) => {
      groups[model].sort((a, b) => b.Age - a.Age);
    });
    return groups;
  };

  const drillData = useMemo(() => {
    if (!drillType) return null;

    let result: InventoryRow[] = [];

    if (drillType === "total") result = [...sortedRows];
    if (drillType === "new") result = [...newArrivalRows];
    if (drillType === "0_30") result = rows.filter((r) => r.Age <= 30);
    if (drillType === "31_60") result = rows.filter((r) => r.Age > 30 && r.Age <= 60);
    if (drillType === "61_90") result = rows.filter((r) => r.Age > 60 && r.Age <= 90);
    if (drillType === "90_plus") result = rows.filter((r) => r.Age > 90);

    result.sort((a, b) => a.Model.localeCompare(b.Model));

    return buildGroups(result);
  }, [drillType, rows, sortedRows, newArrivalRows]);

  return (
    <div className="app-root">
      <HeaderBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <main className="app-main">
        {error && (
          <section className="panel error-panel">
            <div className="section-title">File Error</div>
            <p>{error}</p>
          </section>
        )}

        {rows.length > 0 && (
          <>
            <KpiBar
              totalUnits={rows.length}
              newArrivalCount={newArrivalRows.length}
              onSelectTotalUnits={() => setDrillType("total")}
              onSelectNewArrivals={() => setDrillType("new")}
            />

            <ChartsSection
              modelPieData={modelPieData}
              agingBuckets={agingBuckets}
              agingHandlers={{
                on0_30: () => setDrillType("0_30"),
                on31_60: () => setDrillType("31_60"),
                on61_90: () => setDrillType("61_90"),
                on90_plus: () => setDrillType("90_plus"),
              }}
            />

            {!drillType && <NewArrivalsPanel rows={newArrivalRows} />}

            {drillType ? (
              <DrilldownTable
                groups={drillData!}
                onBack={() => setDrillType(null)}
              />
            ) : (
              <InventoryTable rows={filteredRows} />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
