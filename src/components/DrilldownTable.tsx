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
  // Keys look like "CHEVROLET|EQUINOX" or "CHEVROLET|SILVERADO 1500|CK10543"
  const sortedKeys = useMemo(
    () => Object.keys(groups).sort(),
    [groups]
  );

  const flatRows = useMemo(
    () => sortedKeys.flatMap((key) => groups[key]),
    [groups, sortedKeys]
  );

  const getTitle = (key: string): string => {
    const parts = key.split("|");
    const make = (parts[0] || "").toUpperCase();
    const model = (parts[1] || "").toUpperCase();
    const modelNumber = parts[2] || "";
    const count = groups[key]?.length || 0;

    if (modelNumber) {
      return `${make} ${model} ${modelNumber} - ${count}`;
    }
    return `${make} ${model} - ${count}`;
  };

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

      {sortedKeys.map((key) => (
        <div key={key} className="drill-group">
          <div className="drill-group-title">{getTitle(key)}</div>
          <div className="table-shell">
            <table>
              <thead>
                <tr>
                  <th>Stock #</th>
                  <th>Year</th>
                  <th>Make</th>
                  <th>Model</th>
                  <th>Trim</th>
                  <th>Model #</th>
                  <th>Exterior Color</th>
                  <th>Short VIN</th>
                  <th>Age</th>
                  <th>MSRP</th>
                </tr>
              </thead>
              <tbody>
                {groups[key].map((row) => (
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
                    <td>{row["Model Number"]}</td>
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
