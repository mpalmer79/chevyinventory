// src/components/NewArrivalsPanel.tsx
import React, { FC, memo } from "react";
import { InventoryRow } from "../types";
import { generateVehicleUrl } from "../utils/vehicleUrl";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Sparkles, ExternalLink } from "lucide-react";

interface Props {
  rows: InventoryRow[];
}

export const NewArrivalsPanel: FC<Props> = memo(({ rows }) => {
  if (!rows.length) return null;

  const handleStockClick = (e: React.MouseEvent, row: InventoryRow) => {
    e.stopPropagation();
    const url = generateVehicleUrl(row);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-5 w-5 text-amber-500" />
          New Arrivals · Last 7 Days
          <Badge variant="secondary" className="ml-2">{rows.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {rows.slice(0, 15).map((row) => (
            <div 
              key={row["Stock Number"]} 
              className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all cursor-pointer"
              onClick={(e) => handleStockClick(e, row)}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-primary flex items-center gap-1">
                  #{row["Stock Number"]}
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <span className="text-sm font-medium">
                  {row.Year} {row.Make} {row.Model} {row.Trim}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="hidden sm:inline">{row["Exterior Color"] || "Color TBD"}</span>
                <Badge variant="fresh" className="text-xs">
                  {row.Age} {row.Age === 1 ? "day" : "days"}
                </Badge>
                <span className="font-semibold text-foreground">
                  ${Number(row.MSRP).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

NewArrivalsPanel.displayName = "NewArrivalsPanel";
