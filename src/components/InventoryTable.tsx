// src/components/InventoryTable.tsx
import React, { FC } from "react";
import { InventoryRow } from "../types";
import { exportToCsv, formatCurrency } from "../inventoryHelpers";

type Props = {
  rows: InventoryRow[];
  onRowClick: (row: InventoryRow) => void;
};

export const InventoryTable: FC<Props> = ({ rows, onRowClick }) => {
  if (!rows.length) return null;

  const visibleRows = rows.slice(0, 500);

  return (
    <section className="panel">
      <div className="inventory-header">
        <div className="section-title">
          Inventory Detail · Grouped by Model / Model Number
        </div>
        <button
          className="export-button"
          onClick={() => exportToCsv("inventory_view.csv", visibleRows)}
        >
          Export CSV
        </button>
      </div>

      <div className="table-shell">
        <table>
          <thead>
            <tr>
              <th>Stock #</th>
              <th>Year</th>
              <th>Make</th>
              <th>Model</th>
              <th>Exterior Color</th>
              <th>Trim</th>
              <th>Model #</th>
              <th>Cyl</th>
              <th>Short VIN</th>
              <th>Age</th>
              <th>MSRP</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr
                key={row["Stock Number"]}
                onClick={() => onRowClick(row)}
                className="click-row"
              >
                <td>{row["Stock Number"]}</td>
                <td>{row.Year}</td>
                <td>{row.Make}</td>
                <td>{row.Model}</td>
                <td>{row["Exterior Color"]}</td>
                <td>{row.Trim}</td>
                <td>{row["Model Number"]}</td>
                <td>{row.Cylinders}</td>
                <td>{row["Short VIN"]}</td>
                <td>{row.Age}</td>
                <td>{formatCurrency(row.MSRP)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

