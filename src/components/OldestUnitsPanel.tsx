// src/components/OldestUnitsPanel.tsx
import React, { FC, useMemo } from "react";
import { InventoryRow } from "../types";
import { isInTransit } from "../utils/inventoryUtils";
import { generateVehicleUrl } from "../utils/vehicleUrl";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, ExternalLink } from "lucide-react";

interface Props {
  rows: InventoryRow[];
  onRowClick: (row: InventoryRow) => void;
}

export const OldestUnitsPanel: FC<Props> = ({ rows, onRowClick }) => {
  const oldestUnits = useMemo(() => {
    return [...rows]
      .filter((r) => !isInTransit(r) && r.Age > 0)
      .sort((a, b) => b.Age - a.Age)
      .slice(0, 10);
  }, [rows]);

  if (oldestUnits.length === 0) return null;

  const getAgeBadgeVariant = (age: number): "normal" | "watch" | "risk" => {
    if (age <= 60) return "normal";
    if (age <= 90) return "watch";
    return "risk";
  };

  // Open vehicle URL in new window
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
          <Clock className="h-5 w-5 text-orange-500" />
          Oldest Units on Lot
          <Badge variant="watch" className="ml-2">{oldestUnits.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {oldestUnits.map((row) => (
            <div
              key={row["Stock Number"]}
              className="group flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span 
                  className="text-sm font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1"
                  onClick={(e) => handleStockClick(e, row)}
                >
                  {row["Stock Number"]}
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <span className="text-sm text-muted-foreground">
                  {row.Year} {row.Model} {row.Trim}
                </span>
              </div>
              <Badge variant={getAgeBadgeVariant(row.Age)} className="text-xs">
                {row.Age} days
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
