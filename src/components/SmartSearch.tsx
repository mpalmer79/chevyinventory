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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert("Voice search not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-US";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";
      if (inputRef.current) {
        inputRef.current.value = transcript;
      }

      const lower = transcript.toLowerCase();
      const results = rows.filter((r) => {
        return (
          r.Model.toLowerCase().includes(lower) ||
          r["Model Number"].toLowerCase().includes(lower) ||
          r["Exterior Color"].toLowerCase().includes(lower)
        );
      });
      onResults(results);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error("Speech error:", event.error);
    };

    recognition.start();
  };

  const handleManualSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.toLowerCase();
    const results = rows.filter((r) => {
      return (
        r.Model.toLowerCase().includes(input) ||
        r["Model Number"].toLowerCase().includes(input) ||
        r["Exterior Color"].toLowerCase().includes(input)
      );
    });
    onResults(results);
  };

  return (
    <div className="smart-search-container">
      <button className="mic-btn" onClick={handleVoiceSearch}>🎤</button>
      <input
        ref={inputRef}
        type="text"
        placeholder="Tell me what you're looking for."
        className="smart-search-input"
        onChange={handleManualSearch}
      />
      <div className="smart-search-tips">
        Try "blue Silverado 1500" or "white Silverado CK10543".
      </div>
    </div>
  );
};
