// src/components/FiltersBar.tsx
import React, { FC, ChangeEvent } from "react";
import { Filters } from "../types";

type Props = {
  models: string[];
  filters: Filters;
  onChange: (filters: Filters) => void;
  intentQuery: string;
  onIntentQueryChange: (value: string) => void;
  onVoiceSearch: () => void;
};

export const FiltersBar: FC<Props> = ({
  models,
  filters,
  onChange,
  intentQuery,
  onIntentQueryChange,
  onVoiceSearch,
}) => {
  const handleField =
    (field: keyof Filters) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (e.target.type === "checkbox") {
        const checked = (e.target as HTMLInputElement).checked;
        onChange({ ...filters, [field]: checked } as Filters);
      } else {
        onChange({ ...filters, [field]: e.target.value } as Filters);
      }
    };

  return (
    <section className="panel filters-panel">
      <div className="filters-layout">
        <div className="filters-column">
          <div className="filter-row">
            <label className="filter-label">Model</label>
            <select
              className="filter-select"
              value={filters.model}
              onChange={handleField("model")}
            >
              <option value="">All Models</option>
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-row-inline">
            <div className="filter-field">
              <label className="filter-label">Year Range</label>
              <input
                className="filter-input"
                placeholder="Min"
                value={filters.yearMin}
                onChange={handleField("yearMin")}
              />
            </div>
            <div className="filter-field">
              <label className="filter-label invisible-label">Year Max</label>
              <input
                className="filter-input"
                placeholder="Max"
                value={filters.yearMax}
                onChange={handleField("yearMax")}
              />
            </div>
          </div>

          <div className="filter-row-inline">
            <div className="filter-field">
              <label className="filter-label">MSRP Range</label>
              <input
                className="filter-input"
                placeholder="Min"
                value={filters.priceMin}
                onChange={handleField("priceMin")}
              />
            </div>
            <div className="filter-field">
              <label className="filter-label invisible-label">MSRP Max</label>
              <input
                className="filter-input"
                placeholder="Max"
                value={filters.priceMax}
                onChange={handleField("priceMax")}
              />
            </div>
          </div>

          <div className="filter-row checkbox-row">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.atRiskOnly}
                onChange={handleField("atRiskOnly")}
              />
              <span>At Risk Only</span>
            </label>
            <span className="filter-note">90+ days</span>
          </div>
        </div>

        <div className="nl-search-column">
          <label className="filter-label">Smart Search</label>
          <div className="nl-search-shell">
            <button
              type="button"
              className="mic-button"
              onClick={onVoiceSearch}
              aria-label="Voice search"
            >
              🎤
            </button>
            <input
              type="text"
              className="nl-search-input"
              placeholder="Tell me what you're looking for."
              value={intentQuery}
              onChange={(e) => onIntentQueryChange(e.target.value)}
            />
          </div>
          <div className="nl-search-hint">
            Try: “blue Silverado 1500” or “white Silverado CK10543”
          </div>
        </div>
      </div>
    </section>
  );
};
