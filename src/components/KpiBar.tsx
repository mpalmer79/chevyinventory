// src/components/KpiBar.tsx
import React, { FC } from "react";

type KpiBarProps = {
  totalUnits: number;
  newArrivalCount: number;
  inTransitCount: number;
  onSelectTotalUnits: () => void;
  onSelectNewArrivals: () => void;
  onSelectInTransit: () => void;
};

export const KpiBar: FC<KpiBarProps> = ({
  totalUnits,
  newArrivalCount,
  inTransitCount,
  onSelectTotalUnits,
  onSelectNewArrivals,
  onSelectInTransit,
}) => (
  <div className="kpi-row kpi-row-3">
    <div className="kpi-card" onClick={onSelectTotalUnits}>
      <div className="kpi-label">Total Units</div>
      <div className="kpi-value clickable">{totalUnits}</div>
    </div>

    <div className="kpi-card" onClick={onSelectNewArrivals}>
      <div className="kpi-label">New Arrivals (≤ 7 days)</div>
      <div className="kpi-value clickable">{newArrivalCount}</div>
    </div>

    <div className="kpi-card" onClick={onSelectInTransit}>
      <div className="kpi-label">In Transit</div>
      <div className="kpi-value clickable" style={{ color: "#fbbf24" }}>
        {inTransitCount}
      </div>
    </div>
  </div>
);
