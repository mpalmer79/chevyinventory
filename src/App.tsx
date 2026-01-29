import React, { FC, useCallback, useMemo } from "react";
import "./index.css";
import "./styles/theme.css";

import { useInventoryStore } from "./store/inventoryStore";
import { useInventoryLoader } from "./hooks/useInventoryLoader";
import { isInTransit, sortByAgeDescending } from "./utils/inventoryUtils";
import { AgingBuckets, InventoryRow } from "./types";

import { ErrorBoundary, SectionErrorBoundary } from "./components/ErrorBoundary";
import { HeaderBar } from "./components/HeaderBar";
import { FiltersBar } from "./components/FiltersBar";
import { KpiBar } from "./components/KpiBar";
import { ChartsSection } from "./components/ChartsSection";
import { NewArrivalsPanel } from "./components/NewArrivalsPanel";
import { OldestUnitsPanel } from "./components/OldestUnitsPanel";
import { InventoryTable } from "./components/InventoryTable";
import { DrilldownTable } from "./components/DrilldownTable";
import { VehicleDetailDrawer } from "./components/VehicleDetailDrawer";
import { LoadingIndicator } from "./components/LoadingIndicator";
import { StaleIndicator } from "./components/StaleIndicator";

const STOP_WORDS = new Set([
  "i", "im", "i'm", "looking", "for", "to", "the", "a", "an",
  "with", "show", "me", "find", "need", "want", "please",
]);

// Models that should be split by Model Number
const SPLIT_BY_MODEL_NUMBER = ["SILVERADO 1500", "SILVERADO 2500HD", "SIERRA 1500"];

const App: FC = () => {
  const { refetch } = useInventoryLoader();

  const rows = useInventoryStore((s) => s.rows);
  const error = useInventoryStore((s) => s.error);
  const isLoading = useInventoryStore((s) => s.isLoading);
  const isStale = useInventoryStore((s) => s.isStale);
  const lastUpdated = useInventoryStore((s) => s.lastUpdated);
  const isRefreshing = useInventoryStore((s) => s.isRefreshing);
  const filters = useInventoryStore((s) => s.filters);
  const searchTerm = useInventoryStore((s) => s.searchTerm);
  const drillType = useInventoryStore((s) => s.drillType);
  const selectedVehicle = useInventoryStore((s) => s.selectedVehicle);
  const selectedMake = useInventoryStore((s) => s.selectedMake);

  const setFilters = useInventoryStore((s) => s.setFilters);
  const setSearchTerm = useInventoryStore((s) => s.setSearchTerm);
  const setDrillType = useInventoryStore((s) => s.setDrillType);
  const setSelectedVehicle = useInventoryStore((s) => s.setSelectedVehicle);
  const setSelectedMake = useInventoryStore((s) => s.setSelectedMake);
  const resetAll = useInventoryStore((s) => s.resetAll);
  const setRefreshing = useInventoryStore((s) => s.setRefreshing);

  // Filter out invalid rows first
  const validRows = useMemo(() => {
    return rows.filter((r) => r["Stock Number"] && r.Model && r.Year > 0);
  }, [rows]);

  const modelsList = useMemo(() => {
    const modelsSet = new Set<string>();
    validRows.forEach((r) => {
      if (SPLIT_BY_MODEL_NUMBER.includes(r.Model) && r["Model Number"]) {
        modelsSet.add(`${r.Model} ${r["Model Number"]}`);
      } else {
        modelsSet.add(r.Model);
      }
    });
    return Array.from(modelsSet).sort();
  }, [validRows]);

  const agingBuckets = useMemo<AgingBuckets>(() => {
    const b = { bucket0_30: 0, bucket31_60: 0, bucket61_90: 0, bucket90_plus: 0 };
    validRows.forEach((r) => {
      if (isInTransit(r)) return;
      if (r.Age <= 30) b.bucket0_30++;
      else if (r.Age <= 60) b.bucket31_60++;
      else if (r.Age <= 90) b.bucket61_90++;
      else b.bucket90_plus++;
    });
    return b;
  }, [validRows]);

  const sortedRows = useMemo(() => {
    return [...validRows].sort((a, b) => {
      if (a.Model !== b.Model) return a.Model.localeCompare(b.Model);
      return b.Age - a.Age;
    });
  }, [validRows]);

  const filteredRows = useMemo(() => {
    return sortedRows.filter((row) => {
      // Filter by Make
      if (filters.make && row.Make !== filters.make) return false;
      
      // Filter by Model (handle split models)
      if (filters.model) {
        // Check if filter is for a split model (e.g., "SIERRA 1500 TK10543")
        const splitModelMatch = SPLIT_BY_MODEL_NUMBER.find(m => filters.model.startsWith(`${m} `));
        if (splitModelMatch) {
          const modelNumber = filters.model.replace(`${splitModelMatch} `, "");
          if (row.Model !== splitModelMatch || row["Model Number"] !== modelNumber) return false;
        } else {
          if (row.Model !== filters.model) return false;
        }
      }
      
      if (filters.year !== "ALL" && String(row.Year) !== filters.year) return false;
      if (filters.priceMin) {
        const minPrice = Number(filters.priceMin);
        if (!isNaN(minPrice) && row.MSRP < minPrice) return false;
      }
      if (filters.priceMax) {
        const maxPrice = Number(filters.priceMax);
        if (!isNaN(maxPrice) && row.MSRP > maxPrice) return false;
      }
      if (filters.stockNumber) {
        const stockNum = filters.stockNumber.toLowerCase().trim();
        const rowStockNum = row["Stock Number"].toLowerCase().trim();
        if (!rowStockNum.includes(stockNum)) return false;
      }
      return true;
    });
  }, [sortedRows, filters]);

  const filteredNewArrivals = useMemo(() => {
    return filteredRows.filter((r) => r.Age > 0 && r.Age <= 7 && !isInTransit(r));
  }, [filteredRows]);

  const filteredInTransit = useMemo(() => {
    return filteredRows.filter((r) => isInTransit(r));
  }, [filteredRows]);

  const modelPieData = useMemo(() => {
    const countByModel: Record<string, number> = {};
    validRows.forEach((r) => {
      countByModel[r.Model] = (countByModel[r.Model] ?? 0) + 1;
    });
    return Object.entries(countByModel)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [validRows]);

  const newArrivalRows = useMemo(() => {
    return validRows.filter((r) => r.Age > 0 && r.Age <= 7 && !isInTransit(r));
  }, [validRows]);

  const inTransitRows = useMemo(() => {
    return validRows.filter((r) => isInTransit(r));
  }, [validRows]);

  const drillData = useMemo(() => {
    if (!drillType) return null;

    const buildGroups = (inputRows: InventoryRow[]) => {
      const groups: Record<string, InventoryRow[]> = {};
      inputRows.forEach((r) => {
        const modelNumber = r["Model Number"] ? String(r["Model Number"]) : "";
        const key = r.Make && r.Model
          ? `${r.Make}|${r.Model}${modelNumber ? `|${modelNumber}` : ""}`
          : `${r.Make || "Unknown"}|${r.Model || "Unknown"}`;
        if (!groups[key]) groups[key] = [];
        groups[key]?.push(r);
      });
      Object.keys(groups).forEach((key) => {
        const group = groups[key];
        if (group) groups[key] = sortByAgeDescending(group);
      });
      return groups;
    };

    if (drillType === "total") return buildGroups(filteredRows);
    if (drillType === "in_transit") return buildGroups(inTransitRows);

    let result: InventoryRow[] = [];
    if (drillType === "new") result = [...newArrivalRows];
    if (drillType === "0_30") result = validRows.filter((r) => r.Age <= 30 && !isInTransit(r));
    if (drillType === "31_60") result = validRows.filter((r) => r.Age > 30 && r.Age <= 60 && !isInTransit(r));
    if (drillType === "61_90") result = validRows.filter((r) => r.Age > 60 && r.Age <= 90 && !isInTransit(r));
    if (drillType === "90_plus") result = validRows.filter((r) => r.Age > 90 && !isInTransit(r));

    return buildGroups(result);
  }, [drillType, validRows, filteredRows, newArrivalRows, inTransitRows]);

  const hasModelFilter = !!filters.model;

  const handleSmartSearch = useCallback((text: string) => {
    setSearchTerm(text);
    const tokens = text.toLowerCase().split(/\s+/).filter((t) => t && !STOP_WORDS.has(t));
    if (tokens.length === 0) {
      setFilters({ model: "" });
      return;
    }
    const token = tokens[0];
    if (token) {
      const found = modelsList.find((m: string) => m.toLowerCase().includes(token));
      if (found) setFilters({ model: found });
    }
  }, [modelsList, setFilters, setSearchTerm]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
  }, [refetch, setRefreshing]);

  if (isLoading && validRows.length === 0) {
    return (
      <div className="app-root">
        <HeaderBar searchTerm="" onSearchChange={() => {}} />
        <main className="container">
          <LoadingIndicator message="Loading inventory..." size="large" />
        </main>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app-root">
        <HeaderBar searchTerm={searchTerm} onSearchChange={handleSmartSearch} />
        <main className="container">
          {lastUpdated && (
            <StaleIndicator
              isStale={isStale}
              lastUpdated={lastUpdated}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing}
            />
          )}

          {error && (
            <section className="panel">
              <div className="section-title">File Error</div>
              <p>{error}</p>
            </section>
          )}

          {validRows.length > 0 && (
            <>
              <FiltersBar
                models={modelsList}
                filters={filters}
                onChange={setFilters}
                onSmartSearch={handleSmartSearch}
                rows={validRows}
                agingBuckets={agingBuckets}
                drillType={drillType}
                drillData={drillData}
                onSetDrillType={setDrillType}
                onRowClick={setSelectedVehicle}
                onReset={resetAll}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedMake={selectedMake}
                onMakeChange={setSelectedMake}
              />

              {!hasModelFilter && (
                <SectionErrorBoundary section="KPI metrics">
                  <KpiBar
                    totalUnits={filteredRows.length}
                    newArrivalCount={filteredNewArrivals.length}
                    inTransitCount={filteredInTransit.length}
                    onSelectTotalUnits={resetAll}
                    onSelectNewArrivals={() => setDrillType("new")}
                    onSelectInTransit={() => setDrillType("in_transit")}
                  />
                </SectionErrorBoundary>
              )}

              {drillType === "in_transit" && drillData && (
                <SectionErrorBoundary section="in-transit inventory">
                  <DrilldownTable
                    groups={drillData}
                    onBack={() => setDrillType(null)}
                    onRowClick={setSelectedVehicle}
                  />
                </SectionErrorBoundary>
              )}

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

              {!(
                drillType === "0_30" ||
                drillType === "31_60" ||
                drillType === "61_90" ||
                drillType === "90_plus" ||
                drillType === "in_transit" ||
                filters.model
              ) && (
                <SectionErrorBoundary section="oldest units">
                  <OldestUnitsPanel rows={validRows} onRowClick={setSelectedVehicle} />
                </SectionErrorBoundary>
              )}

              {drillType !== "in_transit" && (
                <SectionErrorBoundary section="inventory table">
                  <InventoryTable rows={filteredRows} onRowClick={setSelectedVehicle} />
                </SectionErrorBoundary>
              )}

              {drillType === "total" && drillData && (
                <SectionErrorBoundary section="drilldown">
                  <DrilldownTable
                    groups={drillData}
                    onBack={() => setDrillType(null)}
                    onRowClick={setSelectedVehicle}
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
