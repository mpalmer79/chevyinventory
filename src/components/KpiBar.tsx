// src/components/KpiBar.tsx
import React, { FC, memo } from "react";

interface Props {
  totalUnits: number;
  newArrivalCount: number;
  inTransitCount: number;
  onSelectTotalUnits: () => void;
  onSelectNewArrivals: () => void;
  onSelectInTransit: () => void;
}

export const KpiBar: FC<Props> = memo(({
  totalUnits,
  newArrivalCount,
  inTransitCount,
  onSelectTotalUnits,
  onSelectNewArrivals,
  onSelectInTransit,
}) => {
  return (
    <div className="kpi-grid">
      <div 
        className="kpi-card highlight-blue" 
        onClick={onSelectTotalUnits}
        role="button"
        tabIndex={0}
      >
        <div className="kpi-label">Total Units</div>
        <div className="kpi-value">{totalUnits}</div>
      </div>

      <div 
        className="kpi-card highlight-green" 
        onClick={onSelectNewArrivals}
        role="button"
        tabIndex={0}
      >
        <div className="kpi-label">New Arrivals (≤ 7 Days)</div>
        <div className="kpi-value">{newArrivalCount}</div>
      </div>

      <div 
        className="kpi-card highlight-yellow" 
        onClick={onSelectInTransit}
        role="button"
        tabIndex={0}
      >
        <div className="kpi-label">In Transit</div>
        <div className="kpi-value">{inTransitCount}</div>
      </div>
    </div>
  );
});

KpiBar.displayName = "KpiBar";
