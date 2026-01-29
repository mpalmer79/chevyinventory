// src/components/ui/ThemeToggle.tsx
import React from "react";
import { useTheme } from "../../context/ThemeContext";

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="theme-toggle-group">
      <label className="filter-label">Theme</label>
      <div className="theme-toggle-segmented">
        <button
          type="button"
          className={`theme-segment ${theme === "light" ? "active" : ""}`}
          onClick={() => theme !== "light" && toggleTheme()}
          aria-label="Light mode"
        >
          <span className="theme-icon">☀️</span>
          <span className="theme-label">Light</span>
        </button>
        <button
          type="button"
          className={`theme-segment ${theme === "dark" ? "active" : ""}`}
          onClick={() => theme !== "dark" && toggleTheme()}
          aria-label="Dark mode"
        >
          <span className="theme-icon">🌙</span>
          <span className="theme-label">Dark</span>
        </button>
      </div>
    </div>
  );
};
