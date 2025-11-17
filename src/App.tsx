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

const STOP_WORDS = new Set([
  "i",
  "im",
  "i'm",
  "looking",
  "for",
  "to",
  "the",
  "a",
  "an",
  "with",
  "show",
  "me",
  "find",
  "need",
  "want",
  "please",
]);

const INITIAL_FILTERS: Filters = {
  model: "",
  year: "ALL", // ALL | 2025 | 2026 as string
  priceMin: "",
  priceMax: "",
};

const App: FC = () => {
  const { rows, error, sortedRows, modelPieData } = useInventoryData();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);

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

  // ---- FILTER + SEARCH (header search + Smart Search both feed searchTerm) ----
  const filteredRows = useMemo(() => {
    let data = [...sortedRows];

    // Model filter
    if (filters.model) {
      data = data.filter((r) => r.Model === filters.model);
    }

    // Year filter (ALL / 2025 / 2026)
    if (filters.year && filters.year !== "ALL") {
      const yr = Number(filters.year);
      if (!Number.isNaN(yr)) {
        data = data.filter((r) => r.Year === yr);
      }
    }

    // MSRP filters
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

    // Text / Smart search
    if (searchTerm.trim()) {
      const rawTokens = searchTerm
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean);

      const tokens =
        rawTokens.filter((t) => !STOP_WORDS.has(t)) || rawTokens;

      data = data.filter((r) => {
        const haystack = [
          r["Stock Number"],
          r["Short VIN"],
          r.Make,
          r.Model,
          r["Model Number"],
          r["Exterior Color"],
          r.Trim,
          String(r.Year),
        ]
          .join(" ")
          .toLowerCase();

        return tokens.every((token) => haystack.includes(token));
      });
    }

    return data;
  }, [sortedRows, filters, searchTerm]);

  // ---- Shared drill-down grouping logic ----
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

  // Smart Search (mic + text) feeds the same searchTerm as the top header box
  const handleSmartSearch = (query: string) => {
    setSearchTerm(query);
  };

  // Reset EVERYTHING to the initial "page just loaded" state
  const resetView = () => {
    setFilters(INITIAL_FILTERS);
    setSearchTerm("");
    setDrillType(null);
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
              onSmartSearch={handleSmartSearch}
            />

            <KpiBar
              totalUnits={rows.length}
              newArrivalCount={newArrivalRows.length}
              // Clicking 259 should reset the entire dashboard view
              onSelectTotalUnits={resetView}
              // 7-day arrivals still drill down
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
