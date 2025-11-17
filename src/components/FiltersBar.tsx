// src/components/FiltersBar.tsx
import React, { FC, useRef, useState } from "react";
import { Filters } from "../types";

type FiltersBarProps = {
  models: string[];
  filters: Filters;
  onChange: (filters: Filters) => void;
  // New: Smart Search callback (voice or typed)
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
    if (typeof window === "undefined") return;

    const w = window as any;
    const SpeechRecognition =
      w.SpeechRecognition || w.webkitSpeechRecognition || null;

    if (!SpeechRecognition) {
      // Browser does not support Web Speech API – fall back to manual typing
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
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join(" ")
          .trim();

        if (transcript) {
          setSmartQuery(transcript);
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
        {/* Standard filters */}
        <div>
          <div className="section-title">Model</div>
          <select
            value={filters.model}
            onChange={(e) => handleFilterChange({ model: e.target.value })}
            style={{ width: "100%" }}
          >
            <option value="">All Models</option>
            {models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <div className="section-title" style={{ marginTop: 16 }}>
            Year Range
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="number"
              placeholder="Min"
              value={filters.yearMin}
              onChange={(e) =>
                handleFilterChange({ yearMin: e.target.value || "" })
              }
              style={{ flex: 1 }}
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.yearMax}
              onChange={(e) =>
                handleFilterChange({ yearMax: e.target.value || "" })
              }
              style={{ flex: 1 }}
            />
          </div>

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
              style={{ flex: 1 }}
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.priceMax}
              onChange={(e) =>
                handleFilterChange({ priceMax: e.target.value || "" })
              }
              style={{ flex: 1 }}
            />
          </div>

          <div style={{ marginTop: 16, fontSize: 13 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                type="checkbox"
                checked={filters.atRiskOnly}
                onChange={(e) =>
                  handleFilterChange({ atRiskOnly: e.target.checked })
                }
              />
              <span>At Risk Only</span>
            </label>
            <div style={{ marginLeft: 18, marginTop: 4, fontSize: 11 }}>
              90+ days
            </div>
          </div>
        </div>

        {/* Spacer columns to match your existing layout */}
        <div />
        <div />

        {/* SMART SEARCH block */}
        <div>
          <div className="section-title">Smart Search</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(15,23,42,0.95)",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.4)",
              padding: "6px 12px",
            }}
          >
            <button
              type="button"
              onClick={handleMicClick}
              aria-label="Voice search"
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: `1px solid ${
                  listening ? "rgba(34,197,94,0.9)" : "rgba(148,163,184,0.7)"
                }`,
                background: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              {/* Simple mic icon */}
              <span
                style={{
                  width: 10,
                  height: 16,
                  borderRadius: 999,
                  border: "2px solid #e5e7eb",
                  borderBottom: "none",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: -6,
                    width: 14,
                    height: 8,
                    borderRadius: 999,
                    border: "2px solid #e5e7eb",
                    borderTop: "none",
                    transform: "translateX(-50%)",
                  }}
                />
              </span>
            </button>

            <input
              type="text"
              placeholder="Tell me what you're looking for."
              value={smartQuery}
              onChange={(e) => setSmartQuery(e.target.value)}
              onKeyDown={handleSmartInputKeyDown}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                color: "#e5e7eb",
                fontSize: 14,
              }}
            />
          </div>
          <div style={{ fontSize: 11, marginTop: 6, color: "#9ca3af" }}>
            Try “blue Silverado 1500” or “white Silverado CK10543”.
          </div>
        </div>
      </div>
    </section>
  );
};
