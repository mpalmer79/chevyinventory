// src/components/InventoryHealthPanel.tsx
import React, { FC } from "react";
import { AgingBuckets, InventoryRow } from "../types";

type Props = {
  rows: InventoryRow[];
  agingBuckets: AgingBuckets;
};

export const InventoryHealthPanel: FC<Props> = ({ rows, agingBuckets }) => {
  if (!rows.length) return null;

  const total = rows.length;
  const freshPct = total ? (agingBuckets.bucket0_30 / total) * 100 : 0;
  const atRiskPct = total ? (agingBuckets.bucket90_plus / total) * 100 : 0;

  const oldest = [...rows].sort((a, b) => b.Age - a.Age).slice(0, 3);

  const modelAges: Record<string, { totalAge: number; count: number }> = {};
  rows.forEach((r) => {
    if (!modelAges[r.Model]) modelAges[r.Model] = { totalAge: 0, count: 0 };
    modelAges[r.Model].totalAge += r.Age;
    modelAges[r.Model].count += 1;
  });
  const modelAgeArray = Object.entries(modelAges)
    .map(([model, v]) => ({
      model,
      avgAge: v.totalAge / v.count,
      count: v.count,
    }))
    .sort((a, b) => b.avgAge - a.avgAge)
    .slice(0, 5);

  return (
    <section className="panel">
      <div className="section-title">Inventory Health · At a Glance</div>
      <div className="health-grid">
        <div className="health-card">
          <div className="health-label">Fresh Inventory (0–30 days)</div>
          <div className="health-value">
            {freshPct.toFixed(0)}%
            <span className="health-sub"> of {total} units</span>
          </div>
        </div>
        <div className="health-card">
          <div className="health-label">At-Risk Inventory (90+ days)</div>
          <div className="health-value">
            {atRiskPct.toFixed(0)}%
            <span className="health-sub"> of {total} units</span>
          </div>
        </div>
      </div>

      <div className="health-layout">
        <div className="health-column">
          <div className="health-subtitle">Oldest Units on Lot</div>
          <ul className="health-list">
            {oldest.map((r) => (
              <li key={r["Stock Number"]}>
                <span>#{r["Stock Number"]}</span>
                <span>
                  {r.Year} {r.Model} {r.Trim}
                </span>
                <span>{r.Age} days</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="health-column">
          <div className="health-subtitle">Models with Highest Avg Age</div>
          <ul className="health-list">
            {modelAgeArray.map((m) => (
              <li key={m.model}>
                <span>{m.model}</span>
                <span>{m.count} units</span>
                <span>{m.avgAge.toFixed(0)} days avg</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

