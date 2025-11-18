// src/components/FiltersBar.tsx
import React, { FC } from "react";
import { Filters, InventoryRow, AgingBuckets, DrillType } from "../types";
import { InventoryHealthPanel } from "./InventoryHealthPanel";
import { formatCurrency } from "../inventoryHelpers";

type FiltersBarProps = {
  models: string[];
  filters: Filters;
  onChange: (filters: Filters) => void;
  onSmartSearch: (query: string) => void;

  // new props to support rendering the Inventory Health card inside the filters panel
  rows: InventoryRow[];
  agingBuckets: AgingBuckets;
  drillType: DrillType;
  drillData: Record<string, InventoryRow[]> | null;
  onSetDrillType: (d: DrillType) => void;
  onRowClick: (r: InventoryRow) => void;
};

export const FiltersBar: FC<FiltersBarProps> = ({
  models,
  filters,
  onChange,
  onSmartSearch,
  rows,
  agingBuckets,
  drillType,
  drillData,
  onSetDrillType,
  onRowClick,
}) => {
  const handleFilterChange = (patch: Partial<Filters>) => {
    onChange({ ...filters, ...patch });
  };

  const handleSearchClick = () => {
    onSmartSearch("manual");
  };

  return (
    <section className="panel filters-panel">
      <div
        className="filters-layout"
        style={{
          display: "flex",
          gap: 20,
          alignItems: "flex-start",
        }}
      >
        {/* LEFT: filter controls column */}
        <div className="filters-column" style={{ minWidth: 260 }}>
          <div className="section-title">Model</div>
          <select
            value={filters.model}
            onChange={(e) => handleFilterChange({ model: e.target.value })}
            className="filter-select"
            style={{ borderRadius: 8 }}
          >
            <option value="">All Models</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <div className="section-title" style={{ marginTop: 16 }}>
            Choose Year
          </div>
          <select
            value={filters.year}
            onChange={(e) => handleFilterChange({ year: e.target.value })}
            className="filter-select"
            style={{ borderRadius: 8 }}
          >
            <option value="ALL">ALL</option>
            {/* years omitted for brevity; keep existing options */}
          </select>

          <div className="section-title" style={{ marginTop: 16 }}>
            MSRP Range
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="filter-input"
              placeholder="Min"
              value={filters.priceMin}
              onChange={(e) => handleFilterChange({ priceMin: e.target.value })}
            />
            <input
              className="filter-input"
              placeholder="Max"
              value={filters.priceMax}
              onChange={(e) => handleFilterChange({ priceMax: e.target.value })}
            />
          </div>

          <div style={{ marginTop: 12 }}>
            <button className="btn-search" onClick={handleSearchClick}>
              SEARCH
            </button>
          </div>
        </div>

        {/* RIGHT: natural language search / InventoryHealth placeholder */}
        <div className="nl-search-column" style={{ flex: 1, minHeight: 220 }}>
          {/* Render the Inventory Health card inside this right-side area.
              When drillType is set, InventoryHealthPanel will show the drilldown.
              We pass onSetDrillType to allow the panel to clear (Back). */}
          <InventoryHealthPanel
            rows={rows}
            agingBuckets={agingBuckets}
            drillType={drillType}
            drillData={drillData}
            onBack={() => onSetDrillType(null)}
            onRowClick={onRowClick}
          />
        </div>
      </div>
    </section>
  );
};
