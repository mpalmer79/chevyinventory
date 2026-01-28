// src/components/InventoryHealthPanel.tsx
import React, { FC, useMemo } from "react";
import { InventoryRow, AgingBuckets } from "../types";
import { generateVehicleUrl } from "../utils/vehicleUrl";
import { isInTransit } from "../utils/inventoryUtils";

interface Props {
  rows: InventoryRow[];
  agingBuckets: AgingBuckets;
  onRowClick: (row: InventoryRow) => void;
}

export const InventoryHealthPanel: FC<Props> = ({ rows, agingBuckets, onRowClick }) => {
  const totalOnLot = useMemo(() => {
    return rows.filter((r) => !isInTransit(r)).length;
  }, [rows]);

  const freshPercent = totalOnLot > 0 
    ? Math.round((agingBuckets.bucket0_30 / totalOnLot) * 100) 
    : 0;
  
  const atRiskPercent = totalOnLot > 0 
    ? Math.round((agingBuckets.bucket90_plus / totalOnLot) * 100) 
    : 0;

  const oldestUnits = useMemo(() => {
    return [...rows]
      .filter((r) => !isInTransit(r))
      .sort((a, b) => b.Age - a.Age)
      .slice(0, 10);
  }, [rows]);

  const handleStockClick = (e: React.MouseEvent, row: InventoryRow) => {
    e.preventDefault();
    e.stopPropagation();
    const url = generateVehicleUrl(row);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="panel-body">
      <div className="chart-title">Inventory Health · At a Glance</div>
      
      <div className="health-panel">
        <div className="health-stat">
          <div className="health-stat-label">Fresh Inventory (0–30 days)</div>
          <div className="health-stat-value">{freshPercent}%</div>
          <div className="health-stat-subtext">of {totalOnLot} units</div>
        </div>
        
        <div className="health-stat">
          <div className="health-stat-label">At-Risk Inventory (90+ days)</div>
          <div className="health-stat-value" style={{ color: atRiskPercent > 30 ? "var(--status-risk)" : undefined }}>
            {atRiskPercent}%
          </div>
          <div className="health-stat-subtext">of {totalOnLot} units</div>
        </div>
      </div>

      <div className="oldest-units-list">
        <div className="chart-title" style={{ marginTop: "16px" }}>Oldest Units on Lot</div>
        {oldestUnits.map((row) => (
          <a
            key={row["Stock Number"]}
            href="#"
            className="oldest-unit"
            onClick={(e) => handleStockClick(e, row)}
          >
            {row["Stock Number"]} {row.Year} {row.Model} {row.Trim} {row.Age} days
          </a>
        ))}
      </div>
    </div>
  );
};
