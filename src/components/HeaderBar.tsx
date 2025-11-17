// src/components/HeaderBar.tsx
import React, { FC } from "react";

type HeaderBarProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
};

export const HeaderBar: FC<HeaderBarProps> = ({
  searchTerm,
  onSearchChange,
}) => (
  <header className="app-header">
    <div className="brand-block">
      <div className="brand-main">QUIRK CHEVROLET</div>
      <div className="brand-sub">MANCHESTER NH</div>
    </div>

    <div className="header-controls">
      <input
        className="search-input"
        type="text"
        placeholder="Search stock #, VIN, model..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  </header>
);

