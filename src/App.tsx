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
    yearMin: "",
    yearMax: "",
    priceMin: "",
    priceMax: "",
    atRiskOnly: false,
  });

  const [drillType, setDrillType] = useState<DrillType>(null);
  const [selectedVehicle, setSelectedVehicle] =
    useState<InventoryRow | null>(null);

  // RESET ALL STATE — runs when user clicks 259 Total Units
  const resetAll = () => {
    setSearchTerm("");
    setFilters({
      model: "",
      yearMin: "",
      yearMax: "",
      priceMin: "",
      priceMax: "",
      atRiskOnly: false,
    });
    setDrillType(null);
    setSelectedVehicle(null);
  };

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

  // FILTER + SMART SEARCH
  const filteredRows = useMemo(() => {
    let data = [...sortedRows];

    if (filters.model) data = data.filter((r) => r.Model === filters.model);

    if (filters.yearMin) {
      const min = Number(filters.yearMin);
      if (!Number.isNaN(min)) data = data.filter((r) => r.Year >= min);
    }

    if (filters.yearMax) {
      const max = Number(filters.yearMax);
      if (!Number.isNaN(max)) data = data.filter((r) => r.Year <= max);
    }

    if (filters.priceMin) {
      const min = Number(filters.priceMin);
      if (!Number.isNaN(min)) data = data.filter((r) => r.MSRP >= min);
    }

    if (filters.priceMax) {
      const max = Number(filters.priceMax);
      if (!Number.isNaN(max)) data = data.filter((r) => r.MSRP <= max);
    }

    if (filters.atRiskOnly) data = data.filter((r) => r.Age > 90);

    if (searchTerm.trim()) {
      const rawTokens = searchTerm.toLowerCase().split(/\s+/).filter(Boolean);
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

  // GROUPING LOGIC
  const buildGroups = (items: InventoryRow[]) => {
    const groups: Record<string, InventoryRow[]> = {};

    items.forEach((r) => {
      const make = (r.Make || "").trim();
      const model = (r.Model || "").trim();
      const modelNumber = (r["Model Number"] || "").trim();

      let key = `${make}|${model}`;
      if (model.toUpperCase() === "SILVERADO 1500" && modelNumber)
        key = `${make}|${model}|${modelNumber}`;

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

    let result: InventoryRow[] = [];

    if (drillType === "total") result = [...sortedRows];
    else if (drillType === "new") result = [...newArrivalRows];
    else if (drillType === "0_30") result = rows.filter((r) => r.Age <= 30);
    else if (drillType === "31_60")
      result = rows.filter((r) => r.Age > 30 && r.Age <= 60);
    else if (drillType === "61_90")
      result = rows.filter((r) => r.Age > 60 && r.Age <= 90);
    else if (drillType === "90_plus") result = rows.filter((r) => r.Age > 90);

    result.sort((a, b) => a.Model.localeCompare(b.Model));

    return buildGroups(result);
  }, [drillType, rows, sortedRows, newArrivalRows]);

  const handleRowClick = (row: InventoryRow) => setSelectedVehicle(row);
  const handleCloseDetail = () => setSelectedVehicle(null);

  const handleSmartSearch = (query: string) => {
    setSearchTerm(query);
    setDrillType(null);
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
              onSelectTotalUnits={resetAll} // ← FIXED RESET BEHAVIOR
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
              <InventoryHealthPanel rows={rows} agingBuckets={agingBuckets} />
            )}

            {!drillType && <NewArrivalsPanel rows={newArrivalRows} />}

            {drillType ? (
              drillData && (
                <DrilldownTable
                  groups={drillData}
                  onBack={resetAll}
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
