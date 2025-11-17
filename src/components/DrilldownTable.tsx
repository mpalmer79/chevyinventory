// src/components/DrilldownTable.tsx
import React, { FC } from "react";
import { InventoryRow } from "../types";

type Props = {
  groups: Record<string, InventoryRow[]>;
  onBack: () => void;
  onRowClick: (row: InventoryRow) => void;
};

export const DrilldownTable: FC<Props> = ({
  groups,
  onBack,
  onRowClick,
}) => {
  const groupKeys = Object.keys(groups);
  const isMobile = window.innerWidth < 768;

  return (
    <section className="panel">
      <div className="drill-header">
        <button className="back-button" onClick={onBack}>Back</button>
        <div className="drill-title">Filtered Inventory</div>
      </div>

      {groupKeys.map((key) => {
        const parts = key.split("|");
        const make = parts[0];
        const model = parts[1];
        const modelNumber = parts[2] || null;
        const rows = groups[key];
        const title = modelNumber
          ? `${make} ${model} ${modelNumber} - ${rows.length}`
          : `${make} ${model} - ${rows.length}`;

        return (
          <div key={key} className="drill-group">
            <div className="drill-group-title">{title}</div>

            {/* ----- MOBILE CARDS ----- */}
            {isMobile ? (
              <div className="mobile-card-list">
                {rows.map((r) => (
                  <div
                    key={r["Stock Number"]}
                    className="mobile-card"
                    onClick={() => onRowClick(r)}
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
              // DESKTOP TABLE
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
                  {rows.map((r) => (
                    <tr
                      key={r["Stock Number"]}
                      className="click-row"
                      onClick={() => onRowClick(r)}
                    >
                      <td>{r["Stock Number"]}</td>
                      <td>{r.Year}</td>
                      <td>{r.Model}</td>
                      <td>{r["Exterior Color"]}</td>
                      <td>{r.Trim}</td>
                      <td>{r["Model Number"]}</td>
                      <td>{r.Age}</td>
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
};
