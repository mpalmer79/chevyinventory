// src/components/FiltersBar.tsx
import React, { FC, memo, useMemo } from "react";
import { Filters, DrillType, AgingBuckets, InventoryRow, DealerSource } from "../types";
import { InventoryHealthPanel } from "./InventoryHealthPanel";
import { ThemeToggle } from "./ui/ThemeToggle";
import { DEALER_LABELS } from "../inventoryHelpers";

interface Props {
  models: string[];
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
  onSmartSearch: (text: string) => void;
  rows: InventoryRow[];
  agingBuckets: AgingBuckets;
  drillType: DrillType;
  drillData: Record<string, InventoryRow[]> | null;
  onSetDrillType: (type: DrillType) => void;
  onRowClick: (row: InventoryRow) => void;
  onReset: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedMake: DealerSource;
  onMakeChange: (make: DealerSource) => void;
}

// Models that should be split by Model Number
const SPLIT_BY_MODEL_NUMBER = ["SILVERADO 1500", "SILVERADO 2500HD", "SIERRA 1500"];

export const FiltersBar: FC<Props> = memo(({
  models,
  filters,
  onChange,
  rows,
  agingBuckets,
  onRowClick,
  selectedMake,
  onMakeChange,
}) => {
  const years = Array.from(new Set(rows.map((r) => r.Year)))
    .filter((y) => y > 0)
    .sort((a, b) => b - a);

  // Get unique Makes from the current inventory
  const makes = useMemo(() => {
    const makeSet = new Set<string>();
    rows.forEach((r) => {
      if (r.Make && r.Make.trim() !== "") {
        makeSet.add(r.Make);
      }
    });
    return Array.from(makeSet).sort();
  }, [rows]);

  // Filter models based on selected make filter
  const filteredModels = useMemo(() => {
    if (!filters.make) return models;
    const modelsForMake = new Set<string>();
    rows.forEach((r) => {
      if (r.Make === filters.make) {
        if (SPLIT_BY_MODEL_NUMBER.includes(r.Model) && r["Model Number"]) {
          modelsForMake.add(`${r.Model} ${r["Model Number"]}`);
        } else {
          modelsForMake.add(r.Model);
        }
      }
    });
    return Array.from(modelsForMake).sort();
  }, [rows, filters.make, models]);

  const dealerOptions: DealerSource[] = ["chevrolet", "buick-gmc"];

  return (
    <div className="panel mb-6">
      <div className="filters-bar">
        {/* DEALERSHIP */}
        <div className="filter-group">
          <label className="filter-label">Dealership</label>
          <select
            className="filter-select"
            value={selectedMake}
            onChange={(e) => onMakeChange(e.target.value as DealerSource)}
          >
            {dealerOptions.map((d) => (
              <option key={d} value={d}>
                {DEALER_LABELS[d]}
              </option>
            ))}
          </select>
        </div>

        {/* YEAR */}
        <div className="filter-group">
          <label className="filter-label">Year</label>
          <select
            className="filter-select"
            value={filters.year}
            onChange={(e) => onChange({ year: e.target.value })}
          >
            <option value="ALL">All Years</option>
            {years.map((y) => (
              <option key={y} value={String(y)}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* MAKE */}
        <div className="filter-group">
          <label className="filter-label">Make</label>
          <select
            className="filter-select"
            value={filters.make || ""}
            onChange={(e) => onChange({ make: e.target.value, model: "" })}
          >
            <option value="">All Makes</option>
            {makes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* MODEL */}
        <div className="filter-group">
          <label className="filter-label">Model</label>
          <select
            className="filter-select"
            value={filters.model}
            onChange={(e) => onChange({ model: e.target.value })}
          >
            <option value="">All Models</option>
            {filteredModels.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* STOCK NUMBER */}
        <div className="filter-group">
          <label className="filter-label">Stock Number</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Search stock #"
            value={filters.stockNumber}
            onChange={(e) => onChange({ stockNumber: e.target.value })}
          />
        </div>

        {/* ACTIONS - Search button and Theme toggle aligned */}
        <div className="filter-actions-aligned">
          <div className="filter-group">
            <label className="filter-label">&nbsp;</label>
            <button className="btn btn-primary" onClick={() => {}}>
              Search
            </button>
          </div>
          <ThemeToggle />
        </div>
      </div>

      <InventoryHealthPanel
        rows={rows}
        agingBuckets={agingBuckets}
        onRowClick={onRowClick}
      />
    </div>
  );
});

FiltersBar.displayName = "FiltersBar";
