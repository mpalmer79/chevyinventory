// src/components/InventoryHealthPanel.tsx
import React, { FC } from "react";
import { AgingBuckets, InventoryRow } from "../types";

type Props = {
  rows: InventoryRow[];
  agingBuckets: AgingBuckets;
  // new props to allow showing drilldown inside this panel
  drillType?: string | null;
  drillData?: Record<string, InventoryRow[]> | null;
  onBack?: () => void;
  onRowClick?: (row: InventoryRow) => void;
};

export const InventoryHealthPanel: FC<Props> = ({
  rows,
  agingBuckets,
  drillType = null,
  drillData = null,
  onBack,
  onRowClick,
}) => {
  if (!rows.length) return null;

  // Summary calculations (existing)
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

  // If drillType is set and we have drillData, render the drilldown groups inside this panel
  if (drillType && drillData) {
    const groupKeys = Object.keys(drillData || {});
    const isMobile = window.innerWidth < 768;

    return (
      <section className="panel inventory-health-panel">
        <div className="drill-header">
          {onBack && (
            <button className="back-button" onClick={onBack}>
              Back
            </button>
          )}
          <div className="drill-title">Filtered Inventory</div>
        </div>

        {groupKeys.map((key) => {
          const parts = key.split("|");
          const make = parts[0];
          const model = parts[1];
          const modelNumber = parts[2] || null;
          const rowsForGroup = drillData[key];
          const title = modelNumber
            ? `${make} ${model} ${modelNumber} - ${rowsForGroup.length}`
            : `${make} ${model} - ${rowsForGroup.length}`;

          return (
            <div key={key} className="drill-group" style={{ marginTop: 12 }}>
              <div className="drill-group-title">{title}</div>

              {isMobile ? (
                <div className="mobile-card-list">
                  {rowsForGroup.map((r) => (
                    <div
                      key={r["Stock Number"]}
                      className="mobile-card"
                      onClick={() => onRowClick && onRowClick(r)}
                    >
                      <div className="mobile-card-header">
                        <span className="mc-stock">#{r["Stock Number"]}</span>
                        <span className="mc-title">
                          {r.Year} {r.Model}
                        </span>
                      </div>

                      <div className="mobile-card-row">
                        <span>Trim</span>
                        <span>{r.Trim}</span>
                      </div>

                      <div className="mobile-card-row">
                        <span>Exterior</span>
                        <span>{r["Exterior Color"]}</span>
                      </div>

                      <div className="mobile-card-row">
                        <span>Model #</span>
                        <span>{r["Model Number"]}</span>
                      </div>

                      <div className="mobile-card-row">
                        <span>Age</span>
                        <span>{r.Age} days</span>
                      </div>

                      <div className="mobile-card-row">
                        <span>MSRP</span>
                        <span>${Number(r.MSRP).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <table className="table-shell" style={{ marginTop: 12 }}>
                  <thead>
                    <tr>
                      <th>Stock #</th>
                      <th>Year</th>
                      <th>Model</th>
                      <th>Exterior</th>
                      <th>Trim</th>
                      <th>Model #</th>
                      <th>Age</th>
                      <th>MSRP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rowsForGroup.map((r) => (
                      <tr
                        key={r["Stock Number"]}
                        className="click-row"
                        onClick={() => onRowClick && onRowClick(r)}
                      >
                        <td>{r["Stock Number"]}</td>
                        <td>{r.Year}</td>
                        <td>{r.Model}</td>
                        <td>{r["Exterior Color"]}</td>
                        <td>{r.Trim}</td>
                        <td>{r["Model Number"]}</td>
                        <td>{r.Age} days</td>
                        <td>${Number(r.MSRP).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </section>
    );
  }

  // Default summary view (unchanged)
  return (
    <section className="panel inventory-health-panel">
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

export default InventoryHealthPanel;
