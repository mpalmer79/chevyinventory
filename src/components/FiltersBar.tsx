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
  const [smartQuery, setSmartQuery] = useState("");
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any | null>(null);

  const handleFilterChange = (patch: Partial<Filters>) => {
    onChange({ ...filters, ...patch });
  };

  const handleSmartSubmit = (value: string) => {
    const q = value.trim();
    setSmartQuery(q);
    onSmartSearch(q);
  };

  const handleSmartInputKeyDown: React.KeyboardEventHandler<HTMLInputElement> =
    (e) => {
      if (e.key === "Enter") {
        handleSmartSubmit((e.target as HTMLInputElement).value);
      }
    };

  const handleMicClick = () => {
    const w = window as any;
    const SpeechRecognition =
      w.SpeechRecognition || w.webkitSpeechRecognition || null;

    if (!SpeechRecognition) {
      alert(
        "Voice search is not supported in this browser. Please type your request."
      );
      return;
    }

    if (!recognitionRef.current) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = "en-US";

      recog.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.trim();
        setSmartQuery(transcript);
        onSmartSearch(transcript);
      };

      recog.onend = () => setListening(false);

      recognitionRef.current = recog;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setListening(true);
      recognitionRef.current.start();
    }
  };

  return (
    <section className="panel filters-panel">
      <div className="filters-layout">

        {/* COLUMN 1 — MODEL + YEAR */}
        <div className="filters-column">
          {/* MODEL */}
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

          {/* YEAR DROPDOWN (ALL, 2025, 2026) */}
          <div className="filter-row" style={{ marginTop: 16 }}>
            <label className="filter-label">Choose Year</label>
            <select
              className="filter-select"
              value={filters.yearMin}
              onChange={(e) => {
                const yr = e.target.value;
                if (yr === "ALL") {
                  handleFilterChange({ yearMin: "", yearMax: "" });
                } else {
                  handleFilterChange({ yearMin: yr, yearMax: yr });
                }
              }}
            >
              <option value="ALL">ALL</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>
        </div>

        {/* COLUMN 2 — MSRP RANGE */}
        <div className="filters-column">
          <div className="filter-row">
            <label className="filter-label">MSRP Range</label>
            <div className="filter-row-inline">
              <input
                type="number"
                className="filter-input"
                placeholder="Min"
                value={filters.priceMin}
                onChange={(e) =>
                  handleFilterChange({ priceMin: e.target.value || "" })
                }
              />
              <input
                type="number"
                className="filter-input"
                placeholder="Max"
                value={filters.priceMax}
                onChange={(e) =>
                  handleFilterChange({ priceMax: e.target.value || "" })
                }
              />
            </div>

            {/* SEARCH BUTTON */}
            <button
              style={{
                marginTop: 10,
                padding: "8px 18px",
                borderRadius: 999,
                background: "#22c55e",
                color: "#000",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
                width: "fit-content",
              }}
              onClick={() => onSmartSearch(smartQuery)}
            >
              SEARCH
            </button>
          </div>
        </div>

        {/* COLUMN 3 — SMART SEARCH */}
        <div className="nl-search-column">
          <label className="filter-label">Smart Search</label>

          <div className="nl-search-shell">
            {/* MICROPHONE ALWAYS VISIBLE */}
            <button
              type="button"
              onClick={handleMicClick}
              className="mic-button"
              aria-label="Voice search"
              style={{
                borderColor: listening ? "#22c55e" : "rgba(148,163,184,0.6)",
              }}
            >
              🎤
            </button>

            <input
              type="text"
              value={smartQuery}
              onChange={(e) => setSmartQuery(e.target.value)}
              onKeyDown={handleSmartInputKeyDown}
              placeholder="Tell me what you're looking for."
              className="nl-search-input"
            />
          </div>

          <div className="nl-search-hint">
            Try “blue Silverado 1500” or “white Silverado CK10543”.
          </div>
        </div>
      </div>
    </section>
  );
};
