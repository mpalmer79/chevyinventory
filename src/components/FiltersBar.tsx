// src/components/FiltersBar.tsx
import React, { FC, memo } from "react";
import { Filters, InventoryRow, AgingBuckets, DrillType } from "../types";
import { InventoryHealthPanel } from "./InventoryHealthPanel";
import { OptimizedImage } from "./OptimizedImage";

type FiltersBarProps = {
  models: string[];
  filters: Filters;
  onChange: (filters: Filters) => void;
  onSmartSearch: (query: string) => void;
  rows: InventoryRow[];
  agingBuckets: AgingBuckets;
  drillType: DrillType;
  drillData: Record<string, InventoryRow[]> | null;
  onSetDrillType: (d: DrillType) => void;
  onRowClick: (r: InventoryRow) => void;
  onReset: () => void;
};

// Vehicle image mapping
const VEHICLE_IMAGES: Record<string, { src: string; alt: string }> = {
  "SILVERADO 1500 CK10543": { src: "/CK10543.jpg", alt: "2026 Chevrolet Silverado 1500 CK10543" },
  "SILVERADO 1500 CK10703": { src: "/CK10703.jpg", alt: "2026 Chevrolet Silverado 1500 CK10703" },
  "SILVERADO 1500 CK10743": { src: "/CK10743.jpg", alt: "2026 Chevrolet Silverado 1500 CK10743" },
  "SILVERADO 1500 CK10753": { src: "/CK10753.jpg", alt: "2026 Chevrolet Silverado 1500 CK10753" },
  "SILVERADO 1500 CK10903": { src: "/CK10903.jpg", alt: "2026 Chevrolet Silverado 1500 CK10903" },
  "SILVERADO 2500HD CK20743": { src: "/CK20743.jpg", alt: "2026 Chevrolet Silverado 2500HD CK20743" },
  "SILVERADO 2500HD CK20753": { src: "/CK20753.jpg", alt: "2026 Chevrolet Silverado 2500HD CK20753" },
  "COLORADO": { src: "/14C43.jpg", alt: "Chevrolet Colorado" },
  "TAHOE": { src: "/TAHOE.jpg", alt: "Chevrolet Tahoe" },
  "EQUINOX": { src: "/EQUINOX.jpg", alt: "Chevrolet Equinox" },
  "EQUINOX EV": { src: "/EQUINOX.jpg", alt: "Chevrolet Equinox EV" },
  "CORVETTE": { src: "/CORVETTE.jpg", alt: "Chevrolet Corvette" },
  "TRAVERSE": { src: "/TRAVERSE.jpg", alt: "Chevrolet Traverse" },
};

export const FiltersBar: FC<FiltersBarProps> = memo(({
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

  const hasModelFilter = !!filters.model;
  
  // Get vehicle image info
  const vehicleImageInfo = VEHICLE_IMAGES[filters.model] ?? null;

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
          {vehicleImageInfo ? (
            <div 
              className="vehicle-image-container"
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
              <OptimizedImage 
                src={vehicleImageInfo.src}
                alt={vehicleImageInfo.alt}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  borderRadius: 8,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                }}
                placeholder="blur"
              />
            </div>
          ) : (
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
});

FiltersBar.displayName = "FiltersBar";
