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
  onReset: () => void;
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
  onReset,
}) => {
  const handleFilterChange = (patch: Partial<Filters>) => {
    onChange({ ...filters, ...patch });
  };

  const handleSearchClick = () => {
    onSmartSearch("manual");
  };

  // Check if model filter is active
  const hasModelFilter = !!filters.model;
  
  // Check for special models that display images
  const isSilverado1500CK10543 = filters.model === "SILVERADO 1500 CK10543";
  const isColorado = filters.model === "COLORADO";
  
  // Check if desktop mode (window width >= 768px)
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;

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
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>

          <div className="section-title" style={{ marginTop: 16 }}>
            Stock Number
          </div>
          <input
            className="filter-select"
            placeholder="STOCK #"
            value={filters.stockNumber}
            onChange={(e) => handleFilterChange({ stockNumber: e.target.value })}
            style={{ 
              width: "100%",
              borderRadius: 8,
              background: "#ffffff",
              color: "#000000",
              padding: "8px 12px",
              border: "1px solid rgba(148,163,184,0.3)",
            }}
          />

          <div style={{ marginTop: 12 }}>
            <button 
              className="btn-search" 
              onClick={handleSearchClick}
              style={{
                background: "#000000",
                color: "#ffffff",
                padding: "10px 24px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: "0.05em",
                width: "100%",
              }}
            >
              SEARCH
            </button>
          </div>

          <div style={{ marginTop: 8 }}>
            <button 
              onClick={onReset}
              style={{
                background: "#000000",
                color: "#ffffff",
                padding: "10px 24px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: "0.05em",
                width: "100%",
              }}
            >
              VIEW ALL
            </button>
          </div>
        </div>

        {/* RIGHT: conditional display area */}
        <div className="nl-search-column" style={{ flex: 1, minHeight: 220 }}>
          {/* Show SILVERADO 1500 CK10543 image on desktop only */}
          {isSilverado1500CK10543 && isDesktop ? (
            <div 
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                borderRadius: 12,
                padding: 20,
                minHeight: 400,
              }}
            >
              <img 
                src="/CK10543.jpg" 
                alt="2026 Chevrolet Silverado 1500 CK10543"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  borderRadius: 8,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                }}
              />
            </div>
          ) : /* Show COLORADO image on desktop only */
          isColorado && isDesktop ? (
            <div 
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                borderRadius: 12,
                padding: 20,
                minHeight: 400,
              }}
            >
              <img 
                src="/14C43.jpg" 
                alt="Chevrolet Colorado"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  borderRadius: 8,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                }}
              />
            </div>
          ) : (
            /* Show InventoryHealthPanel when model filter is NOT active or not a special model */
            !hasModelFilter && (
              <InventoryHealthPanel
                rows={rows}
                agingBuckets={agingBuckets}
                drillType={drillType}
                drillData={drillData}
                onBack={() => onSetDrillType(null)}
                onRowClick={onRowClick}
              />
            )
          )}
        </div>
      </div>
    </section>
  );
};
