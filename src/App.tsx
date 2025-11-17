// src/App.tsx
import React, { FC, useMemo, useState } from "react";
import "./style.css";

import { useInventoryData } from "./hooks/useInventoryData";
import { AgingBuckets, DrillType, Filters, InventoryRow } from "./types";

import { HeaderBar } from "./components/HeaderBar";
import { FiltersBar } from "./components/FiltersBar";
import { KpiBar } from "./components/KpiBar";
import { ChartsSection } from "./components/ChartsSection";
import { InventoryHealthPanel } from "./components/InventoryHealthPanel";
import { NewArrivalsPanel } from "./components/NewArrivalsPanel";
import { InventoryTable } from "./components/InventoryTable";
import { DrilldownTable } from "./components/DrilldownTable";
import { VehicleDetailDrawer } from "./components/VehicleDetailDrawer";

/* -------- Natural-language search helpers -------- */

type ParsedNaturalQuery = {
  color?: string;
  model?: string;
  modelNumber?: string;
};

const COLOR_KEYWORDS = [
  "black",
  "white",
  "blue",
  "red",
  "silver",
  "grey",
  "gray",
  "green",
  "orange",
  "yellow",
  "tan",
  "beige",
  "brown",
  "gold"
];

function parseNaturalQuery(
  query: string,
  rows: InventoryRow[]
): ParsedNaturalQuery {
  const lower = query.toLowerCase();
  const result: ParsedNaturalQuery = {};

  // 1) Color
  for (const c of COLOR_KEYWORDS) {
    if (lower.includes(c)) {
      result.color = c;
      break;
    }
  }

  // 2) Model number – match against known model numbers from data
  const allModelNumbers = new Set(
    rows
      .map((r) => (r["Model Number"] || "").toString().toUpperCase())
      .filter(Boolean)
  );
  const tokens = (query.toUpperCase().match(/[A-Z0-9]+/g) || []) as string[];
  for (const token of tokens) {
    if (allModelNumbers.has(token)) {
      result.modelNumber = token;
      break;
    }
  }

  // 3) Model – match against known models (full names)
  const knownModels = Array.from(
    new Set(rows.map((r) => (r.Model || "").toString()))
  );
  for (const m of knownModels) {
    if (!m) continue;
    if (lower.includes(m.toLowerCase())) {
      result.model = m;
      break;
    }
  }

  // Heuristic for “silverado 1500”
  if (!result.model && lower.includes("silverado") && lower.includes("1500")) {
    result.model = "SILVERADO 1500";
  }

  return result;
}

/* ------------------------------------------------- */

const App: FC = () => {
  const { rows, error, sortedRows, modelPieData } = useInventoryData();

  const [searchTerm, setSearchTerm] = useState("");
  const [intentQuery, setIntentQuery] = useState(""); // smart search field

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

  const newArrivalRows = useMemo(
    () =>
      rows
        .filter((r) => r.Age <= 7)
        .sort((a, b) => a.Model.localeCompare(b.Model)),
    [rows]
  );

  // FILTER + SEARCH
  const filteredRows = useMemo(() => {
    let data = [...sortedRows];

    // Structured filters
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
      const min = Number(filters.priceMin);
      if (!Number.isNaN(min)) {
        data = data.filter((r) => r.MSRP >= min);
      }
    }

    if (filters.priceMax) {
      const max = Number(filters.priceMax);
      if (!Number.isNaN(max)) {
        data = data.filter((r) => r.MSRP <= max);
      }
    }

    if (filters.atRiskOnly) {
      data = data.filter((r) => r.Age > 90);
    }

    // Natural-language smart search
    if (intentQuery.trim()) {
      const parsed = parseNaturalQuery(intentQuery, rows);

      if (parsed.model) {
        const modelLower = parsed.model.toLowerCase();
        data = data.filter(
          (r) => (r.Model || "").toLowerCase() === modelLower
        );
      }

      if (parsed.modelNumber) {
        const modelNumberUpper = parsed.modelNumber.toUpperCase();
        data = data.filter(
          (r) =>
            (r["Model Number"] || "").toString().toUpperCase() ===
            modelNumberUpper
        );
      }

      if (parsed.color) {
        const colorLower = parsed.color.toLowerCase();
        data = data.filter((r) =>
          (r["Exterior Color"] || "").toLowerCase().includes(colorLower)
        );
      }

      // Fallback: generic text match if nothing was parsed
      if (!parsed.model && !parsed.modelNumber && !parsed.color) {
        const q = intentQuery.toLowerCase();
        data = data.filter((r) => {
          const blob = `${r.Make} ${r.Model} ${r["Exterior Color"]} ${
            r["Model Number"]
          } ${r["Stock Number"]}`.toLowerCase();
          return blob.includes(q);
        });
      }
    }

    // Header search bar (stock #, VIN, model, model number)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();

      data = data.filter((row) => {
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
    }

    return data;
  }, [sortedRows, filters, searchTerm, intentQuery, rows]);

  // Shared drill-down grouping logic
  const buildGroups = (items: InventoryRow[]) => {
    const groups: Record<string, InventoryRow[]> = {};

    items.forEach((r) => {
      const make = (r.Make || "").toString().trim();
      const model = (r.Model || "").toString().trim();
      const modelNumber = (r["Model Number"] || "").toString().trim();

      let key: string;

      // Special handling: SILVERADO 1500 split by Model Number
      if (model.toUpperCase() === "SILVERADO 1500" && modelNumber) {
        key = `${make}|${model}|${modelNumber}`;
      } else {
        key = `${make}|${model}`;
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });

    // Sort each group by Age descending (oldest first)
    Object.keys(groups).forEach((k) => {
      groups[k].sort((a, b) => b.Age - a.Age);
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

  const handleRowClick = (row: InventoryRow) => setSelectedVehicle(row);
  const handleCloseDetail = () => setSelectedVehicle(null);

  // Voice search using Web Speech API (when supported)
  const handleVoiceSearch = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIntentQuery(transcript);
    };

    recognition.onerror = () => {
      alert("Sorry, there was a problem understanding your voice.");
    };

    recognition.start();
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
              intentQuery={intentQuery}
              onIntentQueryChange={setIntentQuery}
              onVoiceSearch={handleVoiceSearch}
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
