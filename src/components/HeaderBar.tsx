// src/components/HeaderBar.tsx
import React, { FC } from "react";

interface Props {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const HeaderBar: FC<Props> = () => {
  return (
    <header className="relative overflow-hidden">
      {/* Hero Image - bg-top ensures QUIRK logo is visible */}
      <div 
        className="relative h-[280px] sm:h-[320px] md:h-[380px] bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: "url('/chevy-showroom.png')" }}
      >
        {/* Light overlay */}
        <div className="absolute inset-0 bg-white/5" />
        
        {/* Bottom fade gradient */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[80px] sm:h-[120px] md:h-[150px]"
          style={{ 
            background: "linear-gradient(to bottom, transparent 0%, hsl(var(--background)) 100%)" 
          }} 
        />
      </div>
    </header>
  );
};
