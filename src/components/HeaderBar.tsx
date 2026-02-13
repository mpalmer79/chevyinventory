// src/components/HeaderBar.tsx
import { FC } from "react";

export const HeaderBar: FC = () => {
  return (
    <header className="relative overflow-hidden">
      {/* Mobile/Tablet Image - shown below md breakpoint (768px) */}
      <div 
        className="md:hidden relative h-[180px] sm:h-[220px] bg-no-repeat"
        style={{ 
          backgroundImage: "url('/chevy-showroom-mobile.png')",
          backgroundPosition: "center top",
          backgroundSize: "contain"
        }}
      >
        {/* Light overlay */}
        <div className="absolute inset-0 bg-white/5" />
        
        {/* Bottom fade gradient */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[60px] sm:h-[80px]"
          style={{ 
            background: "linear-gradient(to bottom, transparent 0%, hsl(var(--background)) 100%)" 
          }} 
        />
      </div>

      {/* Desktop Image - shown at md breakpoint and above (768px+) */}
      <div 
        className="hidden md:block relative h-[380px] bg-cover bg-top bg-no-repeat"
        style={{ backgroundImage: "url('/chevy-showroom.png')" }}
      >
        {/* Light overlay */}
        <div className="absolute inset-0 bg-white/5" />
        
        {/* Bottom fade gradient */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[150px]"
          style={{ 
            background: "linear-gradient(to bottom, transparent 0%, hsl(var(--background)) 100%)" 
          }} 
        />
      </div>
    </header>
  );
};
