// src/components/InventoryTable.tsx
import React, { FC } from "react";
import { InventoryRow } from "../types";

type Props = {
  rows: InventoryRow[];
  onRowClick: (row: InventoryRow) => void;
};

export const InventoryTable: FC<Props> = ({ rows, onRowClick }) => {
  if (!rows.length) return null;

  // ---------- MOBILE CARD VIEW (<768px) ----------
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    return (
      <section className="panel">
        <div className="section-title">Inventory</div>

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
      </section>
    );
  }

  // ---------- DESKTOP TABLE VIEW ----------
  return (
    <section className="panel table-shell">
      <table>
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
    </section>
  );
};
