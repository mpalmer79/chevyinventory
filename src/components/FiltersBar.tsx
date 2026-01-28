// src/components/FiltersBar.tsx
import React, { FC, memo } from "react";
import { Filters, DrillType, AgingBuckets, InventoryRow } from "../types";
import { InventoryHealthPanel } from "./InventoryHealthPanel";
import { ThemeToggle } from "./ui/ThemeToggle";

interface Props {
  makes: string[];
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
}

export const FiltersBar: FC<Props> = memo(({
  makes,
  models,
  filters,
  onChange,
  rows,
  agingBuckets,
  onRowClick,
  searchTerm,
  onSearchChange,
}) => {
  const years = Array.from(new Set(rows.map((r) => r.Year)))
    .filter((y) => y > 0)
    .sort((a, b) => b - a);

  return (
    <div className="panel mb-6">
      <div className="filters-bar">
        <div className="filter-group">
          <label className="filter-label">Make</label>
          <select
            className="filter-select"
            value={filters.make}
            onChange={(e) => onChange({ make: e.target.value })}
          >
            <option value="">All Makes</option>
            {makes.map((m) => (
              <option key={m} value={m}>
                {m}
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
