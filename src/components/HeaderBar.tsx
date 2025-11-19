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
      <div className="brand-block">
        <div className="brand-main">QUIRK CHEVROLET</div>
        <div className="brand-sub">MANCHESTER NH</div>
      </div>
    </header>
  );
};
