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
