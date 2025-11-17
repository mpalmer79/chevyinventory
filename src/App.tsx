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

//
// STOP WORDS for Smart Search
//
const STOP_WORDS = new Set([
  "i", "im", "i'm", "looking", "for", "to", "the", "a", "an",
  "with", "show", "me", "find", "need", "want", "please",
]);

//
// Normalize text
//
const normalize = (str: any) =>
  (str || "").toString().trim().toLowerCase();


//
// Extract meaningful tokens from user speech/text
//
function extractTokens(input: string): string[] {
  const raw = normalize(input)
    .split(/\s+/)
    .filter(Boolean);

  const meaningful = raw.filter((t) => !STOP_WORDS.has(t));

  return meaningful.length > 0 ? meaningful : raw;
}

//
// Test if a row matches a Smart Search query
//
function matchesSmartSearch(row: InventoryRow, query: string): boolean {
  if (!query.trim()) return true;

  const tokens = extractTokens(query);

  const haystack = normalize(
    [
      row["Stock Number"],
      row["Short VIN"],
      row.Make,
      row.Model,
      row["Model Number"],
      row["Exterior Color"],
      row.Trim,
      row.Year,
    ].join(" ")
  );

  return tokens.every((t) => haystack.includes(t));
}

//
// MAIN APP
//
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
  const [selectedVehicle, setSelectedVehicle] =
    useState<InventoryRow | null>(null);

  const modelsList = useMemo(
    () => Array.from(new Set(rows.map((r) => r.Model))).sort(),
    [rows]
  );

  //
  // AGING BUCKETS
  //
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

  //
  // NEW ARRIVALS
  //
  const newArrivalRows = useMemo(
    () => rows.filter((r) => r.Age <= 7).sort((a, b) => a.Model.localeCompare(b.Model)),
    [rows]
  );

  //
  // MASTER FILTER PIPELINE
  //
  const filteredRows = useMemo(() => {
    let data = [...sortedRows];

    // Model filter
    if (filters.model) {
      data = data.filter((r) => r.Model === filters.model);
    }

    // Year range
    if (filters.yearMin) {
      const y = Number(filters.yearMin);
      if (!Number.isNaN(y)) {
        data = data.filter((r) => r.Year >= y);
      }
    }
    if (filters.yearMax) {
      const y = Number(filters.yearMax);
      if (!Number.isNaN(y)) {
        data = data.filter((r) => r.Year <= y);
      }
    }

    // MSRP range
    if (filters.priceMin) {
      const p = Number(filters.priceMin);
      if (!Number.isNaN(p)) {
        data = data.filter((r) => r.MSRP >= p);
      }
    }
    if (filters.priceMax) {
      const p = Number(filters.priceMax);
      if (!Number.isNaN(p)) {
        data = data.filter((r) => r.MSRP <= p);
      }
    }

    // At-risk filter
    if (filters.atRiskOnly) {
      data = data.filter((r) => r.Age > 90);
    }

    // Smart Search + Top Bar Search
    if (searchTerm.trim()) {
      data = data.filter((row) => matchesSmartSearch(row, searchTerm));
    }

    return data;
  }, [sortedRows, filters, searchTerm]);

  //
  // GROUPING LOGIC FOR DRILL-DOWN
  //
  const buildGroups = (items: InventoryRow[]) => {
    const groups: Record<string, InventoryRow[]> = {};

    items.forEach((r) => {
      const make = normalize(r.Make);
      const model = normalize(r.Model);
      const modelNumber = normalize(r["Model Number"]);

      let key = `${make}|${model}`;

      if (model === "silverado 1500" && modelNumber) {
        key = `${make}|${model}|${modelNumber}`;
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });

    Object.keys(groups).forEach((k) => {
      groups[k].sort((a, b) => b.Age - a.Age);
    });

    return groups;
  };

  const drillData = useMemo(() => {
    if (!drillType) return null;

    let data: InventoryRow[] = [];

    switch (drillType) {
      case "total":
        data = [...sortedRows];
        break;
      case "new":
        data = [...newArrivalRows];
        break;
      case "0_30":
        data = rows.filter((r) => r.Age <= 30);
        break;
      case "31_60":
        data = rows.filter((r) => r.Age > 30 && r.Age <= 60);
        break;
      case "61_90":
        data = rows.filter((r) => r.Age > 60 && r.Age <= 90);
        break;
      case "90_plus":
        data = rows.filter((r) => r.Age > 90);
        break;
    }

    data.sort((a, b) => a.Model.localeCompare(b.Model));
    return buildGroups(data);
  }, [drillType, rows, sortedRows, newArrivalRows]);

  //
  // EVENTS
  //
  const handleRowClick = (row: InventoryRow) => setSelectedVehicle(row);
  const handleCloseDetail = () => setSelectedVehicle(null);

  // Smart Search — updates the same state used by header search
  const handleSmartSearch = (query: string) => {
    setSearchTerm(query);
  };

  //
  // RENDER
  //
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
              onSmartSearch={handleSmartSearch}
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
