// src/components/KpiBar.tsx
import React, { FC } from "react";

type KpiBarProps = {
  totalUnits: number;
  newArrivalCount: number;
  onSelectTotalUnits: () => void;
  onSelectNewArrivals: () => void;
};

export const KpiBar: FC<KpiBarProps> = ({
  totalUnits,
  newArrivalCount,
  onSelectTotalUnits,
  onSelectNewArrivals,
}) => (
  <div className="kpi-row">
    <div className="kpi-card" onClick={onSelectTotalUnits}>
      <div className="kpi-label">Total Units</div>
      <div className="kpi-value clickable">{totalUnits}</div>
    </div>

    <div className="kpi-card" onClick={onSelectNewArrivals}>
      <div className="kpi-label">New Arrivals (≤ 7 days)</div>
      <div className="kpi-value clickable">{newArrivalCount}</div>
    </div>
  </div>
);

