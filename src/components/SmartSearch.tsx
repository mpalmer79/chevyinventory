// src/components/SmartSearch.tsx
import React, { useRef } from "react";
import { InventoryRow } from "../types";

interface Props {
  rows: InventoryRow[];
  onResults: (r: InventoryRow[]) => void;
}

export const SmartSearch: React.FC<Props> = ({ rows, onResults }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleVoiceSearch = () => {
    // Required for Android Chrome: must exist directly in the click handler
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      inputRef.current!.value = transcript;

      const lower = transcript.toLowerCase();

      const results = rows.filter((r) => {
        return (
          r.Model.toLowerCase().includes(lower) ||
          r["Model Number"].toLowerCase().includes(lower) ||
          r.Exterior.toLowerCase().includes(lower)
        );
      });

      onResults(results);
    };

    recognition.onerror = (e: any) => {
      console.error("Speech error:", e.error);
    };

    recognition.start(); // Must be directly connected to user gesture
  };

  const handleManualSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.toLowerCase();

    const results = rows.filter((r) => {
      return (
        r.Model.toLowerCase().includes(input) ||
        r["Model Number"].toLowerCase().includes(input) ||
        r.Exterior.toLowerCase().includes(input)
      );
    });

    onResults(results);
  };

  return (
    <div className="smart-search-container">
      <button className="mic-btn" onClick={handleVoiceSearch}>
        🎤
      </button>

      <input
        ref={inputRef}
        type="text"
        placeholder="Tell me what you're looking for."
        className="smart-search-input"
        onChange={handleManualSearch}
      />

      <div className="smart-search-tips">
        Try “blue Silverado 1500” or “white Silverado CK10543”.
      </div>
    </div>
  );
};
