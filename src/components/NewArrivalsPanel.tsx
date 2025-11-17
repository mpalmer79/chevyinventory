// src/components/NewArrivalsPanel.tsx
import React, { FC } from "react";
import { InventoryRow } from "../types";
import { formatCurrency } from "../inventoryHelpers";

type Props = {
  rows: InventoryRow[];
};

export const NewArrivalsPanel: FC<Props> = ({ rows }) => {
  if (!rows.length) return null;

  return (
    <section className="panel">
      <div className="section-title">New Arrivals · Last 7 Days</div>
      <div className="new-arrivals">
        {rows.map((row) => (
          <div className="arrival-card" key={row["Stock Number"]}>
            <div className="arrival-main">
              <span className="arrival-stock">#{row["Stock Number"]}</span>
              <span className="arrival-title">
                {row.Year} {row.Make} {row.Model} {row.Trim}
              </span>
            </div>

            <div className="arrival-meta">
              <span className="arrival-pill">
                {row["Exterior Color"] || "Color TBD"}
              </span>
              <span className="arrival-pill">
                {row.Age} day{row.Age === 1 ? "" : "s"} in stock
              </span>
              <span className="arrival-price">
                {formatCurrency(row.MSRP)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

