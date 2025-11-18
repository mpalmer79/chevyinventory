// src/components/FiltersBar.tsx
import React, { FC } from "react";
import { Filters } from "../types";

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

  // ---- Format numeric input as currency (50,000.00) ----
  const formatCurrency = (value: string) => {
    const numeric = value.replace(/\D/g, "");
    if (!numeric) return "";

    const num = Number(numeric);
    return num.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });
  };

  const handleSearchClick = () => {
    onSmartSearch("manual");
  };

  return (
    <section className="panel filters-panel">
      <div
        style={{
          display: "grid",
          // reduced to 3 cols so the right-side "VOICE SEARCH" panel is removed
          gridTemplateColumns: "260px 260px 260px",
          gap: 20,
          alignItems: "flex-start",
        }}
      >
        {/* ------------- COLUMN 1: MODEL / YEAR / PRICE ---------------- */}
        <div className="filters-column">
          {/* MODEL DROPDOWN */}
          <div className="section-title">Model</div>

          <select
            value={filters.model}
            onChange={(e) => handleFilterChange({ model: e.target.value })}
            className="filter-select"
            style={{
              background: "rgba(15,23,42,0.9)",
              color: "white",
              borderRadius: 8,
            }}
          >
            <option value="">All Models</option>
            {models.map((m) => (
              <option key={m} value={m} style={{ color: "black" }}>
                {m}
              </option>
            ))}
          </select>

          {/* YEAR DROPDOWN */}
          <div className="section-title" style={{ marginTop: 16 }}>
            Choose Year
          </div>

          <select
            value={filters.year}
            onChange={(e) =>
              handleFilterChange({
                year: e.target.value,
              })
            }
            className="filter-select"
            style={{
              background: "rgba(15,23,42,0.9)",
              color: "white",
              borderRadius: 8,
            }}
          >
            <option value="">ALL</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>

          {/* MSRP RANGE */}
          <div className="section-title" style={{ marginTop: 16 }}>
            MSRP Range
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              placeholder="Min"
              value={filters.priceMin}
              onChange={(e) =>
                handleFilterChange({
                  priceMin: formatCurrency(e.target.value),
                })
              }
              className="filter-input"
              style={{
                background: "rgba(15,23,42,0.9)",
                color: "white",
                border: "1px solid rgba(148,163,184,0.35)",
                borderRadius: 8,
              }}
            />

            <input
              type="text"
              placeholder="Max"
              value={filters.priceMax}
              onChange={(e) =>
                handleFilterChange({
                  priceMax: formatCurrency(e.target.value),
                })
              }
              className="filter-input"
              style={{
                background: "rgba(15,23,42,0.9)",
                color: "white",
                border: "1px solid rgba(148,163,184,0.35)",
                borderRadius: 8,
              }}
            />
          </div>

          {/* SEARCH BUTTON */}
          <button
            onClick={handleSearchClick}
            style={{
              marginTop: 14,
              width: "100%",
              padding: "10px 0",
              borderRadius: 999,
              border: "1px solid #22c55e",
              background: "#0f172a",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            SEARCH
          </button>
        </div>

        {/* --- COLUMN 2: (kept as spacer / for future content) --- */}
        <div></div>

        {/* --- COLUMN 3: (kept as spacer / for future content) --- */}
        <div></div>
      </div>
    </section>
  );
};
