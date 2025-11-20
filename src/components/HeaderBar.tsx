// src/components/HeaderBar.tsx
import React, { FC } from "react";

type HeaderBarProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
};

export const HeaderBar: FC<HeaderBarProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <header className="app-header">
      <a 
        href="https://www.quirkchevynh.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="brand-block"
        style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
      >
        <div className="brand-main">QUIRK CHEVROLET</div>
        <div className="brand-sub">MANCHESTER NH</div>
      </a>
    </header>
  );
};
