// src/components/FiltersBar.tsx
import React, { FC, memo } from "react";
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

export const FiltersBar: FC<Props> = memo(({
  models,
  filters,
  onChange,
  rows,
  agingBuckets,
  onRowClick,
  onReset,
  searchTerm,
  onSearchChange,
  selectedMake,
  onMakeChange,
}) => {
  const years = Array.from(new Set(rows.map((r) => r.Year)))
    .filter((y) => y > 0)
    .sort((a, b) => b - a);

  const dealerOptions: DealerSource[] = ["chevrolet", "buick-gmc"];

  return (
    <div className="panel mb-6">
      <div className="filters-bar">
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

        <div className="filter-group">
          <label className="filter-label">Model</label>
          <select
            className="filter-select"
            value={filters.model}
            onChange={(e) => onChange({ model: e.target.value })}
          >
            <option value="">All Models</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

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

        <div className="filter-group filter-search-group">
          <label className="filter-label">Search Inventory</label>
          <input
            type="text"
            className="filter-input filter-search-input"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="filter-actions">
          <button className="btn btn-primary" onClick={() => {}}>
            Search
          </button>
          <button className="btn btn-secondary" onClick={onReset}>
            View All
          </button>
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
