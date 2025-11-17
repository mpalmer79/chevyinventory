// src/components/FiltersBar.tsx
import React, { FC } from "react";
import { Filters } from "../types";
import { SmartSearch } from "./SmartSearch";

type FiltersBarProps = {
  models: string[];
  filters: Filters;
  onChange: (filters: Filters) => void;
  onSmartSearch: (query: string) => void;
};

export const FiltersBar: FC<FiltersBarProps> = ({
  models,
  filters,
  onChange,
  onSmartSearch,
}) => {
  const handleFilterChange = (patch: Partial<Filters>) => {
    onChange({ ...filters, ...patch });
  };

  const handleSearchButton = () => {
    onChange({ ...filters }); // triggers table recompute
  };

  return (
    <section className="panel filters-panel">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 260px 260px 1fr",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        {/*  LEFT COLUMN  */}
        <div>
          {/* MODEL */}
          <div className="section-title" style={{ color: "#ffffff" }}>
            Model
          </div>
          <select
            value={filters.model}
            onChange={(e) => handleFilterChange({ model: e.target.value })}
            style={{ width: "100%", color: "#ffffff" }}
          >
            <option value="">All Models</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* CHOOSE YEAR */}
          <div
            className="section-title"
            style={{ marginTop: 16, color: "#ffffff" }}
          >
            Choose Year
          </div>
          <select
            value={filters.year}
            onChange={(e) => handleFilterChange({ year: e.target.value })}
            style={{ width: "100%", color: "#ffffff" }}
          >
            <option value="ALL">ALL</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>

          {/* MSRP RANGE */}
          <div
            className="section-title"
            style={{ marginTop: 16, color: "#ffffff" }}
          >
            MSRP Range
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="number"
              placeholder="Min"
              value={filters.priceMin}
              onChange={(e) =>
                handleFilterChange({ priceMin: e.target.value || "" })
              }
              style={{
                flex: 1,
                color: "#ffffff",
              }}
            />

            <input
              type="number"
              placeholder="Max"
              value={filters.priceMax}
              onChange={(e) =>
                handleFilterChange({ priceMax: e.target.value || "" })
              }
              style={{
                flex: 1,
                color: "#ffffff",
              }}
            />
          </div>

          {/* SEARCH BUTTON */}
          <button
            onClick={handleSearchButton}
            style={{
              marginTop: 14,
              width: "100%",
              background: "#22c55e",
              border: "none",
              padding: "10px 0",
              borderRadius: 999,
              fontWeight: 600,
              color: "#000",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            SEARCH
          </button>
        </div>

        {/* SPACERS TO KEEP YOUR ORIGINAL LAYOUT */}
        <div />
        <div />

        {/* SMART SEARCH COLUMN (VOICE + TEXT) */}
        <div>
          <div className="section-title">Smart Search</div>

          <SmartSearch rows={[]} onResults={() => {}} />

          <div style={{ fontSize: 11, marginTop: 6, color: "#9ca3af" }}>
            Try “blue Silverado 1500” or “white Silverado CK10543”.
          </div>
        </div>
      </div>
    </section>
  );
};
