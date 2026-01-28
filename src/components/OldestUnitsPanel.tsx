// src/components/OldestUnitsPanel.tsx
import React, { FC, useMemo } from "react";
import { InventoryRow } from "../types";
import { isInTransit } from "../utils/inventoryUtils";

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

  return (
    <section className="panel mb-6">
      <div className="section-title">Oldest Units on Lot</div>
      <div className="oldest-units-list p-4">
        {oldestUnits.map((row) => (
          <button
            key={row["Stock Number"]}
            className="oldest-unit"
            onClick={() => onRowClick(row)}
          >
            {row["Stock Number"]} {row.Year} {row.Model} {row.Trim} {row.Age} days
          </button>
        ))}
      </div>
    </section>
  );
};
