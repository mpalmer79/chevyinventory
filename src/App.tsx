// src/App.tsx
import React, { FC, useMemo, useState } from "react";
import "./style.css";

import { useInventoryData } from "./hooks/useInventoryData";
import { AgingBuckets, DrillType, Filters, InventoryRow } from "./types";

import { ErrorBoundary, SectionErrorBoundary } from "./components/ErrorBoundary";
import { HeaderBar } from "./components/HeaderBar";
import { FiltersBar } from "./components/FiltersBar";
import { KpiBar } from "./components/KpiBar";
import { ChartsSection } from "./components/ChartsSection";
import { NewArrivalsPanel } from "./components/NewArrivalsPanel";
import { InventoryTable } from "./components/InventoryTable";
import { DrilldownTable } from "./components/DrilldownTable";
import { VehicleDetailDrawer } from "./components/VehicleDetailDrawer";
import { isInTransit, sortByAgeDescending } from "./utils/inventoryUtils";

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
    stockNumber: "",
  });

  const [drillType, setDrillType] = useState<DrillType>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<InventoryRow | null>(
    null
  );

  const modelsList = useMemo(() => {
    const modelsSet = new Set<string>();
    
    rows.forEach((r) => {
      if (r.Model === "SILVERADO 1500" && r["Model Number"]) {
        modelsSet.add(`SILVERADO 1500 ${r["Model Number"]}`);
      } 
      else if (r.Model === "SILVERADO 2500HD" && r["Model Number"]) {
        modelsSet.add(`SILVERADO 2500HD ${r["Model Number"]}`);
      }
      else {
        modelsSet.add(r.Model);
      }
    });
    
    return Array.from(modelsSet).sort();
  }, [rows]);

  const agingBuckets = useMemo<AgingBuckets>(() => {
    const b = {
      bucket0_30: 0,
      bucket31_60: 0,
      bucket61_90: 0,
      bucket90_plus: 0,
    };
    // Only count ON DEALER LOT vehicles for aging buckets
    rows.forEach((r) => {
      if (isInTransit(r)) return; // Skip in-transit for aging buckets
      if (r.Age <= 30) b.bucket0_30++;
      else if (r.Age <= 60) b.bucket31_60++;
      else if (r.Age <= 90) b.bucket61_90++;
      else b.bucket90_plus++;
    });
    return b;
  }, [rows]);

  const newArrivalRows = useMemo(() => 
    rows.filter((r) => r.Age <= 7 && !isInTransit(r)), 
    [rows]
  );

  const inTransitRows = useMemo(() => 
    rows.filter((r) => isInTransit(r)), 
    [rows]
  );

  // Apply filters to sorted rows
  const filteredRows = useMemo(() => {
    return sortedRows.filter((row) => {
      if (filters.model) {
        if (filters.model.startsWith("SILVERADO 1500 ")) {
          const modelNumber = filters.model.replace("SILVERADO 1500 ", "");
          if (row.Model !== "SILVERADO 1500" || row["Model Number"] !== modelNumber) {
            return false;
          }
        } 
        else if (filters.model.startsWith("SILVERADO 2500HD ")) {
          const modelNumber = filters.model.replace("SILVERADO 2500HD ", "");
          if (row.Model !== "SILVERADO 2500HD" || row["Model Number"] !== modelNumber) {
            return false;
          }
        }
        else {
          if (row.Model !== filters.model) {
            return false;
          }
        }
      }

      if (filters.year !== "ALL" && String(row.Year) !== filters.year) {
        return false;
      }

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

      if (filters.stockNumber) {
        const stockNum = filters.stockNumber.toLowerCase().trim();
        const rowStockNum = row["Stock Number"].toLowerCase().trim();
        if (!rowStockNum.includes(stockNum)) {
          return false;
        }
      }

      return true;
    });
  }, [sortedRows, filters]);

  // Filtered new arrivals - applies filters to new arrivals (exclude IN TRANSIT)
  const filteredNewArrivals = useMemo(() => {
    return filteredRows.filter((r) => r.Age <= 7 && !isInTransit(r));
  }, [filteredRows]);

  // Filtered in-transit
  const filteredInTransit = useMemo(() => {
    return filteredRows.filter((r) => isInTransit(r));
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
    setFilters({ model: "", year: "ALL", priceMin: "", priceMax: "", stockNumber: "" });
    setSearchTerm("");
    setDrillType(null);
  };

  // Build grouped drill data
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

    // Sort each group using the utility function
    Object.keys(groups).forEach((key) => {
      groups[key] = sortByAgeDescending(groups[key]);
    });
    
    return groups;
  };

  const drillData = useMemo(() => {
    if (!drillType) return null;

    if (drillType === "total") return buildGroups(filteredRows);
    if (drillType === "in_transit") return buildGroups(inTransitRows);

    let result: InventoryRow[] = [];

    if (drillType === "new") result = [...newArrivalRows];
    if (drillType === "0_30") result = rows.filter((r) => r.Age <= 30 && !isInTransit(r));
    if (drillType === "31_60") result = rows.filter((r) => r.Age > 30 && r.Age <= 60 && !isInTransit(r));
    if (drillType === "61_90") result = rows.filter((r) => r.Age > 60 && r.Age <= 90 && !isInTransit(r));
    if (drillType === "90_plus") result = rows.filter((r) => r.Age > 90 && !isInTransit(r));

    return buildGroups(result);
  }, [drillType, rows, filteredRows, newArrivalRows, inTransitRows]);

  // Check if model filter is active
  const hasModelFilter = !!filters.model;

  return (
    <ErrorBoundary>
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
                onReset={handleReset}
              />

              {/* Hide KpiBar when model filter is active */}
              {!hasModelFilter && (
                <SectionErrorBoundary section="KPI metrics">
                  <KpiBar
                    totalUnits={filteredRows.length}
                    newArrivalCount={filteredNewArrivals.length}
                    inTransitCount={filteredInTransit.length}
                    onSelectTotalUnits={handleReset}
                    onSelectNewArrivals={() => setDrillType("new")}
                    onSelectInTransit={() => setDrillType("in_transit")}
                  />
                </SectionErrorBoundary>
              )}

              {/* Show IN TRANSIT drilldown directly below KPI bar */}
              {drillType === "in_transit" && drillData && (
                <SectionErrorBoundary section="in-transit inventory">
                  <DrilldownTable
                    groups={drillData}
                    onBack={() => setDrillType(null)}
                    onRowClick={(r) => setSelectedVehicle(r)}
                  />
                </SectionErrorBoundary>
              )}

              {/* Hide ChartsSection when model filter is active or in_transit drill is active */}
              {!hasModelFilter && drillType !== "in_transit" && (
                <SectionErrorBoundary section="charts">
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
                </SectionErrorBoundary>
              )}

              {/* NewArrivalsPanel - hidden during drills or model filter */}
              {!(
                drillType === "0_30" ||
                drillType === "31_60" ||
                drillType === "61_90" ||
                drillType === "90_plus" ||
                drillType === "in_transit" ||
                filters.model
              ) && (
                <SectionErrorBoundary section="new arrivals">
                  <NewArrivalsPanel rows={filteredNewArrivals} />
                </SectionErrorBoundary>
              )}

              {/* Hide main inventory table when in_transit drill is active */}
              {drillType !== "in_transit" && (
                <SectionErrorBoundary section="inventory table">
                  <InventoryTable
                    rows={filteredRows}
                    onRowClick={(r) => setSelectedVehicle(r)}
                  />
                </SectionErrorBoundary>
              )}

              {drillType === "total" && drillData && (
                <SectionErrorBoundary section="drilldown">
                  <DrilldownTable
                    groups={drillData}
                    onBack={() => setDrillType(null)}
                    onRowClick={(r) => setSelectedVehicle(r)}
                  />
                </SectionErrorBoundary>
              )}

              <VehicleDetailDrawer
                vehicle={selectedVehicle}
                onClose={() => setSelectedVehicle(null)}
              />
            </>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default App;
