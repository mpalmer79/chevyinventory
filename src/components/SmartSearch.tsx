// src/components/SmartSearch.tsx
import React, { useRef } from "react";
import { InventoryRow } from "../types";

// Web Speech API type definitions
interface SpeechRecognitionResult {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResults {
  readonly length: number;
  item(index: number): SpeechRecognitionResultList;
  [index: number]: SpeechRecognitionResultList;
}

interface SpeechRecognitionEvent {
  readonly results: SpeechRecognitionResults;
}

interface SpeechRecognitionErrorEvent {
  readonly error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

// Extend Window interface for Speech Recognition API
interface SpeechRecognitionWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

interface Props {
  rows: InventoryRow[];
  onResults: (r: InventoryRow[]) => void;
}

export const SmartSearch: React.FC<Props> = ({ rows, onResults }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleVoiceSearch = () => {
    // Web Speech API with vendor prefix support
    const windowWithSpeech = window as SpeechRecognitionWindow;
    const SpeechRecognitionAPI =
      windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      alert("Voice search not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
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

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.error("Speech error:", e.error);
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
        Try "blue Silverado 1500" or "white Silverado CK10543".
      </div>
    </div>
  );
};
