// src/components/InventoryHealthPanel.tsx
import React, { FC, useMemo } from "react";
import { InventoryRow, AgingBuckets } from "../types";
import { isInTransit } from "../utils/inventoryUtils";

interface Props {
  rows: InventoryRow[];
  agingBuckets: AgingBuckets;
  onRowClick: (row: InventoryRow) => void;
}

export const InventoryHealthPanel: FC<Props> = ({ rows, agingBuckets }) => {
  const totalOnLot = useMemo(() => {
    return rows.filter((r) => !isInTransit(r)).length;
  }, [rows]);

  const freshPercent = totalOnLot > 0
    ? Math.round((agingBuckets.bucket0_30 / totalOnLot) * 100)
    : 0;

  const atRiskPercent = totalOnLot > 0
    ? Math.round((agingBuckets.bucket90_plus / totalOnLot) * 100)
    : 0;

  return (
    <div className="panel-body">
      <div className="section-title" style={{ padding: "0 0 16px 0", border: "none" }}>
        Inventory Health · At a Glance
      </div>
      <div className="health-panel">
        <div className="health-stat">
          <div className="health-stat-label">Fresh Inventory (0–30 days)</div>
          <div className="health-stat-value" style={{ color: "var(--quirk-green)" }}>
            {freshPercent}%
          </div>
          <div className="health-stat-subtext">of {totalOnLot} units</div>
        </div>
        <div className="health-stat">
          <div className="health-stat-label">At-Risk Inventory (90+ days)</div>
          <div className="health-stat-value" style={{ color: "var(--status-risk)" }}>
            {atRiskPercent}%
          </div>
          <div className="health-stat-subtext">of {totalOnLot} units</div>
        </div>
      </div>
    </div>
  );
};
