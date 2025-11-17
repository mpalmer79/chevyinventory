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

type DrillType = null | "total" | "new" | "0_30" | "31_60" | "61_90" | "90_plus";

/* ---------- Constants / helpers ---------- */

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

function exportToCsv(filename: string, rows: InventoryRow[]): void {
  if (!rows.length) return;

  const headers = [
    "Stock Number",
    "Year",
    "Make",
    "Model",
    "Exterior Color",
    "Trim",
    "Model Number",
    "Cylinders",
    "Short VIN",
    "Age",
    "MSRP",
  ];

  const escape = (value: unknown) => {
    const str = value == null ? "" : String(value);
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const lines: string[] = [];
  lines.push(headers.map(escape).join(","));

  rows.forEach((r) => {
    lines.push(
      [
        r["Stock Number"],
        r.Year,
        r.Make,
        r.Model,
        r["Exterior Color"],
        r.Trim,
        r["Model Number"],
        r.Cylinders,
        r["Short VIN"],
        r.Age,
        r.MSRP,
      ].map(escape).join(",")
    );
  });

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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

const HeaderBar: FC<{
  searchTerm: string;
  onSearchChange: (v: string) => void;
}> = ({ searchTerm, onSearchChange }) => (
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

/* ------------------ Filters ------------------ */

type Filters = {
  model: string;
  yearMin: string;
  yearMax: string;
  priceMin: string;
  priceMax: string;
  atRiskOnly: boolean;
};

const FiltersBar: FC<{
  models: string[];
  filters: Filters;
  onChange: (next: Filters) => void;
}> = ({ models, filters, onChange }) => {
  const handleChange = (field: keyof Filters, value: string | boolean) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <section className="panel filters-panel">
      <div className="filters-row">
        <div className="filter-group">
          <div className="filter-label">Model</div>
          <select
            className="filter-input"
            value={filters.model}
            onChange={(e) => handleChange("model", e.target.value)}
          >
            <option value="">All Models</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <div className="filter-label">Year Range</div>
          <div className="filter-inline">
            <input
              className="filter-input"
              type="number"
              placeholder="Min"
              value={filters.yearMin}
              onChange={(e) => handleChange("yearMin", e.target.value)}
            />
            <span className="filter-separator">–</span>
            <input
              className="filter-input"
              type="number"
              placeholder="Max"
              value={filters.yearMax}
              onChange={(e) => handleChange("yearMax", e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group">
          <div className="filter-label">MSRP Range</div>
          <div className="filter-inline">
            <input
              className="filter-input"
              type="number"
              placeholder="Min"
              value={filters.priceMin}
              onChange={(e) => handleChange("priceMin", e.target.value)}
            />
            <span className="filter-separator">–</span>
            <input
              className="filter-input"
              type="number"
              placeholder="Max"
              value={filters.priceMax}
              onChange={(e) => handleChange("priceMax", e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group">
          <div className="filter-label">At Risk Only</div>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.atRiskOnly}
              onChange={(e) => handleChange("atRiskOnly", e.target.checked)}
            />
            <span>90+ days</span>
          </label>
        </div>
      </div>
    </section>
  );
};

/* ------------------ KPI Cards ------------------ */

const KpiBar: FC<{
  totalUnits: number;
  newArrivalCount: number;
  onSelectTotalUnits: () => void;
  onSelectNewArrivals: () => void;
}> = ({ totalUnits, newArrivalCount, onSelectTotalUnits, onSelectNewArrivals }) => (
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

const ChartsSection: FC<{
  modelPieData: ModelPieDatum[];
  agingBuckets: AgingBuckets;
  agingHandlers: {
    on0_30: () => void;
    on31_60: () => void;
    on61_90: () => void;
    on90_plus: () => void;
  };
}> = ({ modelPieData, agingBuckets, agingHandlers }) => (
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
                <Cell key={index} fill={getModelColor(entry.name, index)} />
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

/* ------------------ Inventory Health Panel ------------------ */

const InventoryHealthPanel: FC<{
  rows: InventoryRow[];
  agingBuckets: AgingBuckets;
}> = ({ rows, agingBuckets }) => {
  if (!rows.length) return null;

  const total = rows.length;
  const freshPct = total ? (agingBuckets.bucket0_30 / total) * 100 : 0;
  const atRiskPct = total ? (agingBuckets.bucket90_plus / total) * 100 : 0;

  const oldest = [...rows].sort((a, b) => b.Age - a.Age).slice(0, 3);

  const modelAges: Record<string, { totalAge: number; count: number }> = {};
  rows.forEach((r) => {
    if (!modelAges[r.Model]) modelAges[r.Model] = { totalAge: 0, count: 0 };
    modelAges[r.Model].totalAge += r.Age;
    modelAges[r.Model].count += 1;
  });
  const modelAgeArray = Object.entries(modelAges)
    .map(([model, v]) => ({
      model,
      avgAge: v.totalAge / v.count,
      count: v.count,
    }))
    .sort((a, b) => b.avgAge - a.avgAge)
    .slice(0, 5);

  return (
    <section className="panel">
      <div className="section-title">Inventory Health · At a Glance</div>
      <div className="health-grid">
        <div className="health-card">
          <div className="health-label">Fresh Inventory (0–30 days)</div>
          <div className="health-value">
            {freshPct.toFixed(0)}%
            <span className="health-sub"> of {total} units</span>
          </div>
        </div>
        <div className="health-card">
          <div className="health-label">At-Risk Inventory (90+ days)</div>
          <div className="health-value">
            {atRiskPct.toFixed(0)}%
            <span className="health-sub"> of {total} units</span>
          </div>
        </div>
      </div>

      <div className="health-layout">
        <div className="health-column">
          <div className="health-subtitle">Oldest Units on Lot</div>
          <ul className="health-list">
            {oldest.map((r) => (
              <li key={r["Stock Number"]}>
                <span>#{r["Stock Number"]}</span>
                <span>
                  {r.Year} {r.Model} {r.Trim}
                </span>
                <span>{r.Age} days</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="health-column">
          <div className="health-subtitle">Models with Highest Avg Age</div>
          <ul className="health-list">
            {modelAgeArray.map((m) => (
              <li key={m.model}>
                <span>{m.model}</span>
                <span>{m.count} units</span>
                <span>{m.avgAge.toFixed(0)} days avg</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

/* ------------------ New Arrivals Panel ------------------ */

const NewArrivalsPanel: FC<{ rows: InventoryRow[] }> = ({ rows }) => {
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

/* ------------------ Drill-down Table ------------------ */

const DrilldownTable: FC<{
  groups: Record<string, InventoryRow[]>;
  onBack: () => void;
  onRowClick: (row: InventoryRow) => void;
}> = ({ groups, onBack, onRowClick }) => {
  const flatRows = useMemo(
    () =>
      Object.keys(groups)
        .sort()
        .flatMap((model) => groups[model]),
    [groups]
  );

  return (
    <section className="panel">
      <div className="drill-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <div className="drill-title">Drill-Down Results</div>
        <button
          className="export-button"
          onClick={() => exportToCsv("drilldown_inventory.csv", flatRows)}
        >
          Export CSV
        </button>
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
                  <th>Make</th>
                  <th>Model</th>
                  <th>Trim</th>
                  <th>Exterior Color</th>
                  <th>Short VIN</th>
                  <th>Age</th>
                  <th>MSRP</th>
                </tr>
              </thead>
              <tbody>
                {groups[model].map((row) => (
                  <tr
                    key={row["Stock Number"]}
                    onClick={() => onRowClick(row)}
                    className="click-row"
                  >
                    <td>{row["Stock Number"]}</td>
                    <td>{row.Year}</td>
                    <td>{row.Make}</td>
                    <td>{row.Model}</td>
                    <td>{row.Trim}</td>
                    <td>{row["Exterior Color"]}</td>
                    <td>{row["Short VIN"]}</td>
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
};

/* ------------------ Inventory Table (default) ------------------ */

const InventoryTable: FC<{
  rows: InventoryRow[];
  onRowClick: (row: InventoryRow) => void;
}> = ({ rows, onRowClick }) => {
  if (!rows.length) return null;

  const visibleRows = rows.slice(0, 500);

  return (
    <section className="panel">
      <div className="inventory-header">
        <div className="section-title">
          Inventory Detail · Grouped by Model / Model Number
        </div>
        <button
          className="export-button"
          onClick={() => exportToCsv("inventory_view.csv", visibleRows)}
        >
          Export CSV
        </button>
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
              <tr
                key={row["Stock Number"]}
                onClick={() => onRowClick(row)}
                className="click-row"
              >
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

/* ------------------ Vehicle detail drawer ------------------ */

const VehicleDetailDrawer: FC<{
  vehicle: InventoryRow | null;
  onClose: () => void;
}> = ({ vehicle, onClose }) => {
  if (!vehicle) return null;

  const summary = `${vehicle.Year} ${vehicle.Make} ${vehicle.Model} ${vehicle.Trim}, ${vehicle["Exterior Color"]}, stock #${vehicle["Stock Number"]}, MSRP ${formatCurrency(
    vehicle.MSRP
  )}, ${vehicle.Age} days in stock.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
    } catch (err) {
      console.error("Clipboard error:", err);
    }
  };

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <h2>
            {vehicle.Year} {vehicle.Make} {vehicle.Model} {vehicle.Trim}
          </h2>
          <button className="detail-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="detail-body">
          <div className="detail-row">
            <span className="detail-label">Stock #</span>
            <span>{vehicle["Stock Number"]}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Short VIN</span>
            <span>{vehicle["Short VIN"]}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Exterior Color</span>
            <span>{vehicle["Exterior Color"]}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Model #</span>
            <span>{vehicle["Model Number"]}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Cylinders</span>
            <span>{vehicle.Cylinders}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Age in Stock</span>
            <span>{vehicle.Age} days</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">MSRP</span>
            <span>{formatCurrency(vehicle.MSRP)}</span>
          </div>
        </div>

        <div className="detail-footer">
          <button className="copy-button" onClick={handleCopy}>
            Copy Summary
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------ Main App ------------------ */

const App: FC = () => {
  const { rows, error, sortedRows, modelPieData } = useInventoryData();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>({
    model: "",
    yearMin: "",
    yearMax: "",
    priceMin: "",
    priceMax: "",
    atRiskOnly: false,
  });

  const [drillType, setDrillType] = useState<DrillType>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<InventoryRow | null>(
    null
  );

  const modelsList = useMemo(
    () => Array.from(new Set(rows.map((r) => r.Model))).sort(),
    [rows]
  );

  const agingBuckets = useMemo<AgingBuckets>(() => {
    const b: AgingBuckets = {
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

  // Apply filters + search to sortedRows
  const filteredRows = useMemo(() => {
    let data = [...sortedRows];

    if (filters.model) {
      data = data.filter((r) => r.Model === filters.model);
    }

    if (filters.yearMin) {
      const minYear = Number(filters.yearMin);
      if (!Number.isNaN(minYear)) {
        data = data.filter((r) => r.Year >= minYear);
      }
    }

    if (filters.yearMax) {
      const maxYear = Number(filters.yearMax);
      if (!Number.isNaN(maxYear)) {
        data = data.filter((r) => r.Year <= maxYear);
      }
    }

    if (filters.priceMin) {
      const minPrice = Number(filters.priceMin);
      if (!Number.isNaN(minPrice)) {
        data = data.filter((r) => r.MSRP >= minPrice);
      }
    }

    if (filters.priceMax) {
      const maxPrice = Number(filters.priceMax);
      if (!Number.isNaN(maxPrice)) {
        data = data.filter((r) => r.MSRP <= maxPrice);
      }
    }

    if (filters.atRiskOnly) {
      data = data.filter((r) => r.Age > 90);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      data = data.filter((r) => {
        const stock = (r["Stock Number"] || "").toLowerCase();
        const shortVin = (r["Short VIN"] || "").toLowerCase();
        const model = (r.Model || "").toLowerCase();
        const modelNumber = (r["Model Number"] || "").toLowerCase();
        return (
          stock.includes(term) ||
          shortVin.includes(term) ||
          model.includes(term) ||
          modelNumber.includes(term)
        );
      });
    }

    return data;
  }, [sortedRows, filters, searchTerm]);

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
    if (drillType === "31_60")
      result = rows.filter((r) => r.Age > 30 && r.Age <= 60);
    if (drillType === "61_90")
      result = rows.filter((r) => r.Age > 60 && r.Age <= 90);
    if (drillType === "90_plus") result = rows.filter((r) => r.Age > 90);

    result.sort((a, b) => a.Model.localeCompare(b.Model));
    return buildGroups(result);
  }, [drillType, rows, sortedRows, newArrivalRows]);

  const handleRowClick = (row: InventoryRow) => {
    setSelectedVehicle(row);
  };

  const handleCloseDetail = () => {
    setSelectedVehicle(null);
  };

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
            <FiltersBar
              models={modelsList}
              filters={filters}
              onChange={setFilters}
            />

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

            <InventoryHealthPanel rows={rows} agingBuckets={agingBuckets} />

            {!drillType && <NewArrivalsPanel rows={newArrivalRows} />}

            {drillType ? (
              drillData && (
                <DrilldownTable
                  groups={drillData}
                  onBack={() => setDrillType(null)}
                  onRowClick={handleRowClick}
                />
              )
            ) : (
              <InventoryTable rows={filteredRows} onRowClick={handleRowClick} />
            )}

            <VehicleDetailDrawer
              vehicle={selectedVehicle}
              onClose={handleCloseDetail}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default App;
