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

    if (drillType === "total") return buildGroups(sortedRows);

    let result: InventoryRow[] = [];

    if (drillType === "new") result = [...newArrivalRows];
    if (drillType === "0_30") result = rows.filter((r) => r.Age <= 30);
    if (drillType === "31_60")
      result = rows.filter((r) => r.Age > 30 && r.Age <= 60);
    if (drillType === "61_90")
      result = rows.filter((r) => r.Age > 60 && r.Age <= 90);
    if (drillType === "90_plus") result = rows.filter((r) => r.Age > 90);

    return buildGroups(result);
  }, [drillType, rows, sortedRows, newArrivalRows]);

  return (
    <div className="app-root">
      <HeaderBar />

      <main className="container">
        {error && (
          <section className="panel">
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

            {/* InventoryHealthPanel now receives drillType/drillData so it can render a drilldown
                inside the same panel (replacing the summary when an aging bucket is selected). */}
            <InventoryHealthPanel
              rows={rows}
              agingBuckets={agingBuckets}
              drillType={drillType}
              drillData={drillData}
              onBack={() => setDrillType(null)}
              onRowClick={(r) => setSelectedVehicle(r)}
            />

            {/* Hide NewArrivalsPanel when viewing an aging bucket drill so the InventoryHealth panel
                shows the selected bucket's inventory in-place (per your request). */}
            {!(
              drillType === "0_30" ||
              drillType === "31_60" ||
              drillType === "61_90" ||
              drillType === "90_plus"
            ) && <NewArrivalsPanel rows={newArrivalRows} />}

            {/* Keep the main inventory table and optional drilldown table below */}
            <InventoryTable
              rows={sortedRows}
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
