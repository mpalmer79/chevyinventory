// src/components/NewArrivalsPanel.tsx
import React, { FC } from "react";
import { InventoryRow } from "../types";
import { formatCurrency } from "../inventoryHelpers";
import { generateVehicleUrl } from "../utils/vehicleUrl";

type Props = {
  rows: InventoryRow[];
};

export const NewArrivalsPanel: FC<Props> = ({ rows }) => {
  if (!rows.length) return null;

  // Handle stock number click - open in new tab
  const handleStockClick = (e: React.MouseEvent, row: InventoryRow) => {
    e.stopPropagation();
    const url = generateVehicleUrl(row);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className="panel">
      <div className="section-title">New Arrivals · Last 7 Days</div>
      <div className="new-arrivals">
        {rows.map((row) => (
          <div className="arrival-card" key={row["Stock Number"]}>
            <div className="arrival-main">
              <span
                className="arrival-stock stock-link"
                onClick={(e) => handleStockClick(e, row)}
                style={{
                  color: "#4fc3f7",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                #{row["Stock Number"]}
              </span>
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
