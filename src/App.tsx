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

const App: FC = () => {
  const { rows, error, sortedRows, modelPieData } = useInventoryData();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>({
    model: "",
    year: "ALL",     // NEW unified year filter
    priceMin: "",
    priceMax: "",
  });

  const [drillType, setDrillType] = useState<DrillType>(null);
  const [selectedVehicle, setSelectedVehicle] =
    useState<InventoryRow | null>(null);

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

  // -----------------------------------------------------------
  // SMART SEARCH SYSTEM (voice + text)
  // -----------------------------------------------------------
  const applySmartSearch = (input: string) => {
    setSearchTerm(input);
  };

  // -----------------------------------------------------------
  // FILTER + SEARCH PIPELINE
  // -----------------------------------------------------------
  const filteredRows = useMemo(() => {
    let data = [...sortedRows];

    // MODEL
    if (filters.model) {
      data = data.filter((r) => r.Model === filters.model);
    }

    // UNIFIED YEAR (ALL / 2025 / 2026)
    if (filters.year !== "ALL") {
      const yr = Number(filters.year);
      data = data.filter((r) => r.Year === yr);
    }

    // PRICE RANGE
    if (filters.priceMin) {
      const val = Number(filters.priceMin);
      if (!Number.isNaN(val)) data = data.filter((r) => r.MSRP >= val);
    }
    if (filters.priceMax) {
      const val = Number(filters.priceMax);
      if (!Number.isNaN(val)) data = data.filter((r) => r.MSRP <= val);
    }

    // SMART SEARCH text/vocal
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

        return tokens.every((t) => haystack.includes(t));
      });
    }

    return data;
  }, [sortedRows, filters, searchTerm]);

  // -----------------------------------------------------------
  // GROUPING LOGIC (Default + Drilldown)
  // -----------------------------------------------------------
  const buildGroups = (items: InventoryRow[]) => {
    const groups: Record<string, InventoryRow[]> = {};

    items.forEach((r) => {
      const make = (r.Make || "").trim();
      const model = (r.Model || "").trim();
      const modelNumber = (r["Model Number"] || "").trim();

      let key: string;

      if (model.toUpperCase() === "SILVERADO 1500" && modelNumber) {
        key = `${make}|${model}|${modelNumber}`;
      } else {
        key = `${make}|${model}`;
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });

    // Sort inside groups by age
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

  // -----------------------------------------------------------
  // RESET TO DEFAULT VIEW
  // -----------------------------------------------------------
  const resetView = () => {
    setDrillType(null);
    setSearchTerm("");
    setFilters({
      model: "",
      year: "ALL",
      priceMin: "",
      priceMax: "",
    });
  };

  const handleRowClick = (row: InventoryRow) => setSelectedVehicle(row);
  const handleCloseDetail = () => setSelectedVehicle(null);

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
              onSmartSearch={applySmartSearch}
              onApplySearch={() => {}} // SEARCH pill handled inside FiltersBar
            />

            <KpiBar
              totalUnits={rows.length}
              newArrivalCount={newArrivalRows.length}
              onSelectTotalUnits={resetView}
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

            {!drillType && (
              <InventoryHealthPanel
                rows={rows}
                agingBuckets={agingBuckets}
              />
            )}

            {!drillType && <NewArrivalsPanel rows={newArrivalRows} />}

            {drillType ? (
              drillData && (
                <DrilldownTable
                  groups={drillData}
                  onBack={resetView}
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
