// src/components/OldestUnitsPanel.tsx
import React, { FC, useMemo } from "react";
import { InventoryRow } from "../types";
import { isInTransit } from "../utils/inventoryUtils";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, ChevronRight } from "lucide-react";

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
            <button
              key={row["Stock Number"]}
              className="w-full group flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors text-left"
              onClick={() => onRowClick(row)}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary">
                  {row["Stock Number"]}
                </span>
                <span className="text-sm text-muted-foreground">
                  {row.Year} {row.Model} {row.Trim}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getAgeBadgeVariant(row.Age)} className="text-xs">
                  {row.Age} days
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
