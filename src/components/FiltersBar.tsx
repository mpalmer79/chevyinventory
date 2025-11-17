// src/components/FiltersBar.tsx
import React, { FC, useState } from "react";
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
  const [smartQuery, setSmartQuery] = useState("");
  const [listening, setListening] = useState(false);

  const handleFilterChange = (patch: Partial<Filters>) => {
    onChange({ ...filters, ...patch });
  };

  /** ---------------- SMART SEARCH TEXT SUBMIT ---------------- */
  const handleSmartSubmit = (value: string) => {
    const q = value.trim();
    setSmartQuery(q);
    onSmartSearch(q);
  };

  /** ---------------- SMART SEARCH MANUAL ENTER ---------------- */
  const handleSmartInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> =
    (e) => {
      if (e.key === "Enter") {
        handleSmartSubmit((e.target as HTMLInputElement).value);
      }
    };

  /** ---------------- MICROPHONE CLICK (ANDROID-SAFE) ---------------- */
  const handleMicClick = () => {
    const w = window as any;
    const SpeechRecognition =
      w.SpeechRecognition || w.webkitSpeechRecognition || null;

    if (!SpeechRecognition) {
      alert("Voice search is not supported on this device.");
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = "en-US";

    recog.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      setSmartQuery(transcript);
      onSmartSearch(transcript);
    };

    recog.onerror = () => setListening(false);
    recog.onend = () => setListening(false);

    setListening(true);
    recog.start(); // MUST be called directly on click for Android
  };

  /** ---------------- RESET SEARCH ---------------- */
  const handleSearchPillClick = () => {
    onSmartSearch(
      `${filters.yearMin || ""} ${filters.priceMin || ""} ${filters.priceMax || ""}`
    );
  };

  return (
    <section className="panel filters-panel">
      <div className="filters-layout">
        {/* ---------------- LEFT COLUMN (MODEL + YEAR) ---------------- */}
        <div className="filters-column">
          <div className="filter-row">
            <label className="filter-label">Model</label>
            <select
              className="filter-select"
              value={filters.model}
              onChange={(e) => handleFilterChange({ model: e.target.value })}
            >
              <option value="">All Models</option>
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-row" style={{ marginTop: 16 }}>
            <label className="filter-label">Choose Year</label>
            <select
              className="filter-select"
              value={filters.yearMin}
              onChange={(e) =>
                handleFilterChange({
                  yearMin: e.target.value,
                  yearMax: e.target.value,
                })
              }
            >
              <option value="">ALL</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </div>

        {/* ---------------- MIDDLE COLUMN SPACERS (PRESERVE LAYOUT) ---------------- */}
        <div className="filters-column" />
        <div className="filters-column" />

        {/* ---------------- RIGHT COLUMN (SMART SEARCH + MSRP) ---------------- */}
        <div className="filters-column nl-search-column">
          {/* SMART SEARCH */}
          <label className="filter-label">Smart Search</label>
          <div className="nl-search-shell">
            <button
              type="button"
              onClick={handleMicClick}
              aria-label="Voice search"
              className="mic-button"
              style={{
                borderColor: listening
                  ? "rgba(34,197,94,0.9)"
                  : "rgba(148,163,184,0.7)",
              }}
            >
              🎤
            </button>

            <input
              type="text"
              className="nl-search-input"
              placeholder="Tell me what you're looking for."
              value={smartQuery}
              onChange={(e) => setSmartQuery(e.target.value)}
              onKeyDown={handleSmartInputKeyDown}
            />
          </div>

          {/* MSRP RANGE */}
          <div className="filter-row" style={{ marginTop: 20 }}>
            <label className="filter-label">MSRP Range</label>

            <div className="filter-row-inline">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceMin}
                onChange={(e) =>
                  handleFilterChange({ priceMin: e.target.value })
                }
                className="filter-input"
              />

              <input
                type="number"
                placeholder="Max"
                value={filters.priceMax}
                onChange={(e) =>
                  handleFilterChange({ priceMax: e.target.value })
                }
                className="filter-input"
              />
            </div>
          </div>

          {/* SEARCH PILL */}
          <button
            onClick={handleSearchPillClick}
            style={{
              marginTop: 10,
              padding: "8px 16px",
              borderRadius: 999,
              background: "#22c55e",
              color: "black",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
              width: "fit-content",
            }}
          >
            SEARCH
          </button>
        </div>
      </div>
    </section>
  );
};
