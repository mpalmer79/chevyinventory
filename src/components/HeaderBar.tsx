// src/components/HeaderBar.tsx
import React, { FC } from "react";
import { ThemeToggle } from "./ui/ThemeToggle";

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const HeaderBar: FC<Props> = ({ searchTerm, onSearchChange }) => {
  return (
    <header className="header">
      <div className="header-hero">
        <div className="header-content">
          <div className="header-search">
            <svg 
              className="header-search-icon" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search inventory..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
