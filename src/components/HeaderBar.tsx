// src/components/HeaderBar.tsx
import React, { FC, useRef, useState } from "react";

type HeaderBarProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
};

export const HeaderBar: FC<HeaderBarProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [listening, setListening] = useState(false);

  const handleMicClick = () => {
    const w = window as any;
    const SpeechRecognition =
      w.SpeechRecognition || w.webkitSpeechRecognition || null;

    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = "en-US";
    recog.interimResults = false;
    recog.continuous = false;

    recog.onstart = () => setListening(true);
    recog.onend = () => setListening(false);

    recog.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.trim();
      if (inputRef.current) inputRef.current.value = transcript;
      onSearchChange(transcript);
    };

    recog.start(); // Must be triggered directly by user gesture
  };

  return (
    <header className="app-header">
      <div className="brand-block">
        <div className="brand-main">QUIRK CHEVROLET</div>
        <div className="brand-sub">MANCHESTER NH</div>
      </div>

      <div className="header-controls">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(15,23,42,0.95)",
            borderRadius: 999,
            border: "1px solid rgba(148,163,184,0.4)",
            padding: "6px 14px",
          }}
        >
          <button
            type="button"
            onClick={handleMicClick}
            aria-label="Voice search"
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: listening
                ? "2px solid rgba(34,197,94,0.9)"
                : "2px solid rgba(148,163,184,0.7)",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 16,
              color: "#e5e7eb",
              flexShrink: 0,
            }}
          >
            🎤
          </button>

          <input
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder="Tell me what you're looking for."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#e5e7eb",
              fontSize: 14,
            }}
          />
        </div>
      </div>
    </header>
  );
};
