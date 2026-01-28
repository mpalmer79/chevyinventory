// src/components/NewArrivalsPanel.tsx
import React, { FC, memo } from "react";
import { InventoryRow } from "../types";
import { generateVehicleUrl } from "../utils/vehicleUrl";

interface Props {
  rows: InventoryRow[];
}

export const NewArrivalsPanel: FC<Props> = memo(({ rows }) => {
  if (!rows.length) return null;

  const handleStockClick = (e: React.MouseEvent, row: InventoryRow) => {
    e.stopPropagation();
    const url = generateVehicleUrl(row);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className="panel mb-6">
      <div className="section-title">New Arrivals · Last 7 Days</div>
      <div className="arrivals-list">
        {rows.slice(0, 15).map((row) => (
          <div 
            key={row["Stock Number"]} 
            className="arrival-card"
            onClick={(e) => handleStockClick(e, row)}
          >
            <div className="arrival-info">
              <span className="arrival-stock">#{row["Stock Number"]}</span>
              <span className="arrival-title">
                {row.Year} CHEVROLET {row.Model} {row.Trim}
              </span>
            </div>
            <div className="arrival-meta">
              <span className="arrival-color">{row["Exterior Color"] || "Color TBD"}</span>
              <span className="arrival-age">{row.Age} days in stock</span>
              <span className="arrival-price">${Number(row.MSRP).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

NewArrivalsPanel.displayName = "NewArrivalsPanel";
