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
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any | null>(null);

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

  // ---- MICROPHONE ----
  const handleMicClick = () => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search is not supported on this device.");
      return;
    }

    if (!recognitionRef.current) {
      const recog = new SpeechRecognition();
      recog.lang = "en-US";
      recog.continuous = false;
      recog.interimResults = false;

      recog.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.trim();
        if (transcript) onSmartSearch(transcript);
      };

      recog.onend = () => setListening(false);

      recognitionRef.current = recog;
    }

    setListening(true);
    recognitionRef.current.start();
  };

  const handleSearchClick = () => {
    onSmartSearch("manual");
  };

  return (
    <section className="panel filters-panel">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 260px 260px 1fr",
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

        {/* --- EMPTY SPACERS TO MAINTAIN GRID LAYOUT --- */}
        <div></div>
        <div></div>

        {/* ------------- COLUMN 4: MICROPHONE BUTTON ---------------- */}
        <div className="filters-column">
          <div className="section-title">Voice Search</div>

          <button
            onClick={handleMicClick}
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              background: "#0f172a",
              border: listening
                ? "2px solid #22c55e"
                : "2px solid rgba(148,163,184,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              color: "white",
              cursor: "pointer",
            }}
          >
            🎤
          </button>

          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
            Tap and say a model, trim, or color.
          </div>
        </div>
      </div>
    </section>
  );
};
