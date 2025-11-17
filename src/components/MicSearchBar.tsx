// src/components/MicSearchBar.tsx
import React, { useRef, useState } from "react";

type Props = {
  onVoiceResult: (value: string) => void;
};

export const MicSearchBar: React.FC<Props> = ({ onVoiceResult }) => {
  const recognitionRef = useRef<any | null>(null);
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

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
        let transcript = event.results[0][0].transcript.trim();

        // 🔥 FIX #1 — REMOVE ALL SPACES inside the spoken VIN/model code
        const cleaned = transcript.replace(/\s+/g, "");

        // 🔥 FIX #2 — AUTO-SEARCH
        onVoiceResult(cleaned);
      };

      recog.onend = () => setListening(false);

      recognitionRef.current = recog;
    }

    setListening(true);
    recognitionRef.current.start();
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 520,
        margin: "0 auto 12px auto",
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "rgba(15,23,42,0.9)",
        borderRadius: 999,
        border: "1px solid rgba(148,163,184,0.35)",
        padding: "10px 14px",
      }}
    >
      <button
        onClick={startListening}
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: listening
            ? "2px solid #22c55e"
            : "2px solid rgba(148,163,184,0.6)",
          background: "#0f172a",
          color: "white",
          fontSize: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        🎤
      </button>

      <input
        type="text"
        placeholder="Speak or type a model, stock#, VIN..."
        onChange={(e) => onVoiceResult(e.target.value)} // 🔥 FIX #3 — instant search on typing
        style={{
          flex: 1,
          background: "transparent",
          border: "none",
          outline: "none",
          color: "white",
          fontSize: 15,
        }}
      />
    </div>
  );
};
