// src/components/HeaderBar.tsx
import React, { FC } from "react";

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const HeaderBar: FC<Props> = () => {
  return (
    <header className="header">
      <div className="header-hero">
        {/* Image only - no controls */}
      </div>
    </header>
  );
};
