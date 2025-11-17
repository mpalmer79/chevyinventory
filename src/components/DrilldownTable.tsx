// src/components/DrilldownTable.tsx
import React, { FC, useMemo } from "react";
import { InventoryRow } from "../types";
import { exportToCsv, formatCurrency } from "../inventoryHelpers";

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
  const flatRows = useMemo(
    () =>
      Object.keys(groups)
        .sort()
        .flatMap((model) => groups[model]),
    [groups]
  );

  return (
    <section className="panel">
      <div className="drill-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <div className="drill-title">Drill-Down Results</div>
        <button
          className="export-button"
          onClick={() => exportToCsv("drilldown_inventory.csv", flatRows)}
        >
          Export CSV
        </button>
      </div>

      {Object.keys(groups).map((model) => (
        <div key={model} className="drill-group">
          <div className="drill-group-title">{model}</div>
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Stock #</th>
                  <th>Year</th>
                  <th>Make</th>
                  <th>Model</th>
                  <th>Trim</th>
                  <th>Exterior Color</th>
                  <th>Short VIN</th>
                  <th>Age</th>
                  <th>MSRP</th>
                </tr>
              </thead>
              <tbody>
                {groups[model].map((row) => (
                  <tr
                    key={row["Stock Number"]}
                    onClick={() => onRowClick(row)}
                    className="click-row"
                  >
                    <td>{row["Stock Number"]}</td>
                    <td>{row.Year}</td>
                    <td>{row.Make}</td>
                    <td>{row.Model}</td>
                    <td>{row.Trim}</td>
                    <td>{row["Exterior Color"]}</td>
                    <td>{row["Short VIN"]}</td>
                    <td>{row.Age}</td>
                    <td>{formatCurrency(row.MSRP)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </section>
  );
};
