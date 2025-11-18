// src/App.tsx
import React, { FC, useMemo, useState } from "react";
import "./style.css";

import { useInventoryData } from "./hooks/useInventoryData";
import { AgingBuckets, DrillType, Filters, InventoryRow } from "./types";

import { HeaderBar } from "./components/HeaderBar";
import { FiltersBar } from "./components/FiltersBar";
import { KpiBar } from "./components/KpiBar";
import { ChartsSection } from "./components/ChartsSection";
// InventoryHealthPanel is now rendered inside FiltersBar (moved), so no longer rendered here.
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
    year: "ALL",
    priceMin: "",
    priceMax: "",
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

  const newArrivalRows = useMemo(() => rows.filter((r) => r.Age <= 7), [rows]);

  // Apply filters to sorted rows
  const filteredRows = useMemo(() => {
    return sortedRows.filter((row) => {
      // Filter by model
      if (filters.model && row.Model !== filters.model) {
        return false;
      }

      // Filter by year
      if (filters.year !== "ALL" && String(row.Year) !== filters.year) {
        return false;
      }

      // Filter by price range
      if (filters.priceMin) {
        const minPrice = Number(filters.priceMin);
        if (!isNaN(minPrice) && row.MSRP < minPrice) {
          return false;
        }
      }

      if (filters.priceMax) {
        const maxPrice = Number(filters.priceMax);
        if (!isNaN(maxPrice) && row.MSRP > maxPrice) {
          return false;
        }
      }

      return true;
    });
  }, [sortedRows, filters]);

  // Filtered new arrivals - applies filters to new arrivals
  const filteredNewArrivals = useMemo(() => {
    return filteredRows.filter((r) => r.Age <= 7);
  }, [filteredRows]);

  const handleSmartSearch = (text: string) => {
    setSearchTerm(text);
    const tokens = text
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t && !STOP_WORDS.has(t));

    if (tokens.length === 0) {
      setFilters((f) => ({ ...f, model: "" }));
      return;
    }

    const token = tokens[0];
    const found = modelsList.find((m) => m.toLowerCase().includes(token));
    if (found) {
      setFilters((f) => ({ ...f, model: found }));
    }
  };

  const handleReset = () => {
    setFilters({ model: "", year: "ALL", priceMin: "", priceMax: "" });
    setSearchTerm("");
    setDrillType(null);
  };

  // Build grouped drill data for InventoryHealthPanel
  const buildGroups = (inputRows: InventoryRow[]) => {
    const groups: Record<string, InventoryRow[]> = {};

    inputRows.forEach((r) => {
      const modelNumber = r["Model Number"] ? String(r["Model Number"]) : "";
      const key = r.Make && r.Model
        ? `${r.Make}|${r.Model}${modelNumber ? `|${modelNumber}` : ""}`
        : `${r.Make || "Unknown"}|${r.Model || "Unknown"}`;

      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });

    Object.values(groups).forEach((g) => g.sort((a, b) => b.Age - a.Age));
    return groups;
  };

  const drillData = useMemo(() => {
    if (!drillType) return null;

    if (drillType === "total") return buildGroups(filteredRows);

    let result: InventoryRow[] = [];

    if (drillType === "new") result = [...newArrivalRows];
    if (drillType === "0_30") result = rows.filter((r) => r.Age <= 30);
    if (drillType === "31_60")
      result = rows.filter((r) => r.Age > 30 && r.Age <= 60);
    if (drillType === "61_90")
      result = rows.filter((r) => r.Age > 60 && r.Age <= 90);
    if (drillType === "90_plus") result = rows.filter((r) => r.Age > 90);

    return buildGroups(result);
  }, [drillType, rows, filteredRows, newArrivalRows]);

  return (
    <div className="app-root">
      <HeaderBar 
        searchTerm={searchTerm}
        onSearchChange={handleSmartSearch}
      />

      <main className="container">
        {error && (
          <section className="panel">
            <div className="section-title">File Error</div>
            <p>{error}</p>
          </section>
        )}

        {rows.length > 0 && (
          <>
            {/* Pass inventory and drill props into FiltersBar so the Inventory Health card
                can render inside the filters panel right-side area (red rectangle). */}
            <FiltersBar
              models={modelsList}
              filters={filters}
              onChange={setFilters}
              onSmartSearch={handleSmartSearch}
              rows={rows}
              agingBuckets={agingBuckets}
              drillType={drillType}
              drillData={drillData}
              onSetDrillType={setDrillType}
              onRowClick={(r) => setSelectedVehicle(r)}
            />

            <KpiBar
              totalUnits={filteredRows.length}
              newArrivalCount={filteredNewArrivals.length}
              onSelectTotalUnits={handleReset}
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

            {/* NewArrivalsPanel remains below; it will be hidden when:
                1. An aging bucket drill is active, OR
                2. A model filter is selected */}
            {!(
              drillType === "0_30" ||
              drillType === "31_60" ||
              drillType === "61_90" ||
              drillType === "90_plus" ||
              filters.model
            ) && <NewArrivalsPanel rows={newArrivalRows} />}

            <InventoryTable
              rows={filteredRows}
              onRowClick={(r) => setSelectedVehicle(r)}
            />

            {drillType === "total" && drillData && (
              <DrilldownTable
                groups={drillData}
                onRowClick={(r) => setSelectedVehicle(r)}
              />
            )}

            <VehicleDetailDrawer
              vehicle={selectedVehicle}
              onClose={() => setSelectedVehicle(null)}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default App;
