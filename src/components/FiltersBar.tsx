// src/components/FiltersBar.tsx
import React, { FC, useRef, useState } from "react";
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
  const [smartValue, setSmartValue] = useState("");
  const recognitionRef = useRef<any>(null);
  const [listening, setListening] = useState(false);

  const handleFilterChange = (patch: Partial<Filters>) => {
    onChange({ ...filters, ...patch });
  };

  /* ----------------------  Voice Search Trigger  ---------------------- */
  const handleMicClick = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = false;
    recog.lang = "en-US";

    recog.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      setSmartValue(transcript);
      onSmartSearch(transcript);
    };

    recog.onend = () => setListening(false);

    setListening(true);
    recog.start();
    recognitionRef.current = recog;
  };

  const handleSmartSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSmartSearch(smartValue.trim());
    }
  };

  return (
    <section className="panel filters-panel">

      {/* -------------------- NEW: Voice Search Trigger -------------------- */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button
          onClick={handleMicClick}
          aria-label="Voice Search"
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: listening
              ? "2px solid #4ade80"
              : "2px solid rgba(148,163,184,0.6)",
            background: "rgba(15,23,42,0.85)",
            color: "#fff",
            fontSize: 20,
          }}
        >
          🎤
        </button>
      </div>

      <div className="filters-layout">

        {/* LEFT COLUMN: MODEL + YEAR + MSRP */}
        <div className="filters-column">
          {/* MODEL */}
          <div className="filter-row">
            <label className="filter-label">MODEL</label>
            <select
              className="filter-select"
              value={filters.model}
              onChange={(e) => handleFilterChange({ model: e.target.value })}
              style={{ color: "#fff", background: "rgba(15,23,42,0.9)" }}
            >
              <option value="">All Models</option>
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* YEAR DROPDOWN */}
          <div className="filter-row" style={{ marginTop: 14 }}>
            <label className="filter-label" style={{ color: "#fff" }}>
              CHOOSE YEAR
            </label>
            <select
              className="filter-select"
              value={filters.yearMin}
              onChange={(e) => handleFilterChange({ yearMin: e.target.value })}
              style={{ color: "#fff", background: "rgba(15,23,42,0.9)" }}
            >
              <option value="">ALL</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>

          {/* MSRP RANGE */}
          <div className="filter-row" style={{ marginTop: 14 }}>
            <label className="filter-label" style={{ color: "#fff" }}>
              MSRP RANGE
            </label>
            <div className="filter-row-inline">
              <input
                type="number"
                placeholder="Min"
                className="filter-input"
                value={filters.priceMin}
                onChange={(e) =>
                  handleFilterChange({ priceMin: e.target.value })
                }
                style={{ color: "#fff" }}
              />
              <input
                type="number"
                placeholder="Max"
                className="filter-input"
                value={filters.priceMax}
                onChange={(e) =>
                  handleFilterChange({ priceMax: e.target.value })
                }
                style={{ color: "#fff" }}
              />
            </div>
          </div>

          {/* NEW SEARCH PILL BUTTON */}
          <div style={{ marginTop: 14 }}>
            <button
              onClick={() =>
                onSmartSearch(
                  `${filters.model} ${filters.yearMin} ${filters.priceMin}-${filters.priceMax}`
                )
              }
              style={{
                width: "100%",
                padding: "10px 0",
                background: "#22c55e",
                color: "#000",
                fontWeight: 600,
                borderRadius: 999,
                border: "none",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              SEARCH
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Smart Search text box */}
        <div className="nl-search-column">
          <label className="filter-label" style={{ color: "#fff" }}>
            SMART SEARCH
          </label>

          <input
            className="nl-search-input"
            type="text"
            value={smartValue}
            placeholder="Type something or press the mic..."
            onChange={(e) => setSmartValue(e.target.value)}
            onKeyDown={handleSmartSubmit}
          />

          <div className="nl-search-hint">
            Try “blue Silverado 1500” or “Traverse 3LT 2025”.
          </div>
        </div>
      </div>
    </section>
  );
};
