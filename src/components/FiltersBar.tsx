// src/components/FiltersBar.tsx
import React, { FC } from "react";
import { Filters } from "../types";

type FiltersBarProps = {
  models: string[];
  filters: Filters;
  onChange: (next: Filters) => void;
};

export const FiltersBar: FC<FiltersBarProps> = ({
  models,
  filters,
  onChange,
}) => {
  const handleChange = (field: keyof Filters, value: string | boolean) => {
    onChange({ ...filters, [field]: value as never });
  };

  return (
    <section className="panel filters-panel">
      <div className="filters-row">
        <div className="filter-group">
          <div className="filter-label">Model</div>
          <select
            className="filter-input"
            value={filters.model}
            onChange={(e) => handleChange("model", e.target.value)}
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
          <div className="filter-label">Year Range</div>
          <div className="filter-inline">
            <input
              className="filter-input"
              type="number"
              placeholder="Min"
              value={filters.yearMin}
              onChange={(e) => handleChange("yearMin", e.target.value)}
            />
            <span className="filter-separator">–</span>
            <input
              className="filter-input"
              type="number"
              placeholder="Max"
              value={filters.yearMax}
              onChange={(e) => handleChange("yearMax", e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group">
          <div className="filter-label">MSRP Range</div>
          <div className="filter-inline">
            <input
              className="filter-input"
              type="number"
              placeholder="Min"
              value={filters.priceMin}
              onChange={(e) => handleChange("priceMin", e.target.value)}
            />
            <span className="filter-separator">–</span>
            <input
              className="filter-input"
              type="number"
              placeholder="Max"
              value={filters.priceMax}
              onChange={(e) => handleChange("priceMax", e.target.value)}
            />
          </div>
        </div>

        <div className="filter-group">
          <div className="filter-label">At Risk Only</div>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.atRiskOnly}
              onChange={(e) => handleChange("atRiskOnly", e.target.checked)}
            />
            <span>90+ days</span>
          </label>
        </div>
      </div>
    </section>
  );
};

