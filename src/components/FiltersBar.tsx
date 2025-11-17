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

  const handleMicClick = () => {
    const w = window as any;
    const SpeechRecognition =
      w.SpeechRecognition || w.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search is not supported on this browser.");
      return;
    }

    if (!recognitionRef.current) {
      const recog = new SpeechRecognition();
      recog.lang = "en-US";
      recog.continuous = false;
      recog.interimResults = false;

      recog.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.trim();
        if (transcript) {
          onSmartSearch(transcript);
        }
      };

      recog.onend = () => {
        setListening(false);
      };

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

  const handleSearchClick = () => {
    onSmartSearch("manual-search");
  };

  return (
    <section className="panel">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 260px 260px 1fr",
          gap: 16,
          alignItems: "flex-start",
        }}
      >
        {/* MODEL DROPDOWN */}
        <div>
          <div className="section-title">Model</div>
          <select
            value={filters.model}
            onChange={(e) => handleFilterChange({ model: e.target.value })}
            style={{
              width: "100%",
              background: "white",
              color: "black",
              padding: "6px 8px",
              borderRadius: 8,
            }}
          >
            <option value="">All Models</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* YEAR DROPDOWN */}
          <div className="section-title" style={{ marginTop: 16 }}>
            Choose Year
          </div>

          <select
            value={filters.yearMin}
            onChange={(e) =>
              handleFilterChange({
                yearMin: e.target.value,
                yearMax: e.target.value,
              })
            }
            style={{
              width: "100%",
              background: "white",
              color: "black",
              padding: "6px 8px",
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
              type="number"
              placeholder="Min"
              value={filters.priceMin}
              onChange={(e) =>
                handleFilterChange({ priceMin: e.target.value || "" })
              }
              style={{
                flex: 1,
                background: "white",
                color: "black",
                padding: "6px 8px",
                borderRadius: 8,
                border: "1px solid #ccc",
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
                background: "white",
                color: "black",
                padding: "6px 8px",
                borderRadius: 8,
                border: "1px solid #ccc",
              }}
            />
          </div>

          {/* SEARCH PILL */}
          <button
            onClick={handleSearchClick}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "10px 0",
              borderRadius: 999,
              border: "1px solid #22c55e",
              background: "#0f172a",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </div>

        {/* SPACERS TO PRESERVE GRID SHAPE */}
        <div></div>
        <div></div>

        {/* MICROPHONE BUTTON OUTSIDE THE SEARCH BAR */}
        <div>
          <div className="section-title">Voice Search</div>

          <button
            onClick={handleMicClick}
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              border: listening
                ? "2px solid #22c55e"
                : "2px solid rgba(148,163,184,0.6)",
              background: "#0f172a",
              color: "white",
              fontSize: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 10,
            }}
          >
            🎤
          </button>

          <div style={{ fontSize: 11, color: "#9ca3af" }}>
            Tap the microphone and speak a model, trim, or color.
          </div>
        </div>
      </div>
    </section>
  );
};
