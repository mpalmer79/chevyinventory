// src/components/VehicleDetailDrawer.tsx
import React, { FC } from "react";
import { InventoryRow } from "../types";
import { formatCurrency } from "../inventoryHelpers";

type Props = {
  vehicle: InventoryRow | null;
  onClose: () => void;
};

export const VehicleDetailDrawer: FC<Props> = ({ vehicle, onClose }) => {
  if (!vehicle) return null;

  const summary = `${vehicle.Year} ${vehicle.Make} ${vehicle.Model} ${vehicle.Trim}, ${vehicle["Exterior Color"]}, stock #${vehicle["Stock Number"]}, MSRP ${formatCurrency(
    vehicle.MSRP
  )}, ${vehicle.Age} days in stock.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
    } catch (err) {
      console.error("Clipboard error:", err);
    }
  };

  return (
    <div className="detail-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
        <div className="detail-header">
          <h2>
            {vehicle.Year} {vehicle.Make} {vehicle.Model} {vehicle.Trim}
          </h2>
          <button className="detail-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="detail-body">
          <div className="detail-row">
            <span className="detail-label">Stock #</span>
            <span>{vehicle["Stock Number"]}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Short VIN</span>
            <span>{vehicle["Short VIN"]}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Exterior Color</span>
            <span>{vehicle["Exterior Color"]}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Model #</span>
            <span>{vehicle["Model Number"]}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Cylinders</span>
            <span>{vehicle.Cylinders}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Age in Stock</span>
            <span>{vehicle.Age} days</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">MSRP</span>
            <span>{formatCurrency(vehicle.MSRP)}</span>
          </div>
        </div>

        <div className="detail-footer">
          <button className="copy-button" onClick={handleCopy}>
            Copy Summary
          </button>
        </div>
      </div>
    </div>
  );
};

