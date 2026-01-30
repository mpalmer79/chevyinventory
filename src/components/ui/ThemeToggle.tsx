// src/components/ui/ThemeToggle.tsx
import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { Button } from "./button";
import { Sun, Moon } from "lucide-react";
import { cn } from "../../lib/utils";

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col gap-1.5">
      {/* Hide "THEME" label on mobile (below md breakpoint) */}
      <span className="hidden md:block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Theme
      </span>
      <div className="inline-flex items-center rounded-lg border bg-muted p-0.5">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 sm:h-8 px-2 sm:px-3 gap-1 sm:gap-1.5 rounded-md transition-all",
            theme === "light" 
              ? "bg-background shadow-sm text-foreground" 
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => theme !== "light" && toggleTheme()}
        >
          <Sun className="h-4 w-4" />
          <span className="text-xs font-medium">Light</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 sm:h-8 px-2 sm:px-3 gap-1 sm:gap-1.5 rounded-md transition-all",
            theme === "dark" 
              ? "bg-background shadow-sm text-foreground" 
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => theme !== "dark" && toggleTheme()}
        >
          <Moon className="h-4 w-4" />
          <span className="text-xs font-medium">Dark</span>
        </Button>
      </div>
    </div>
  );
};
