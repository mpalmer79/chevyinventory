// src/components/InventoryTable.tsx
import React, { FC, useMemo } from "react";
import { InventoryRow } from "../types";
import { exportToCsv, formatCurrency } from "../inventoryHelpers";

type Props = {
  rows: InventoryRow[];
  onRowClick: (row: InventoryRow) => void;
};

type Group = {
  key: string;
  title: string;
  rows: InventoryRow[];
};

const buildGroups = (rows: InventoryRow[]): Group[] => {
  const map: Record<string, Group> = {};

  rows.forEach((r) => {
    const make = (r.Make || "").toString().trim();
    const model = (r.Model || "").toString().trim();
    const modelNumber = (r["Model Number"] || "").toString().trim();

    let groupKey: string;
    let baseTitle: string;

    // Special handling for SILVERADO 1500: group by model number
    if (model.toUpperCase() === "SILVERADO 1500" && modelNumber) {
      groupKey = `${make}|${model}|${modelNumber}`;
      baseTitle = `${make.toUpperCase()} ${model.toUpperCase()} ${modelNumber}`;
    } else {
      groupKey = `${make}|${model}`;
      baseTitle = `${make.toUpperCase()} ${model.toUpperCase()}`;
    }

    if (!map[groupKey]) {
      map[groupKey] = {
        key: groupKey,
        title: baseTitle,
        rows: [],
      };
    }

    map[groupKey].rows.push(r);
  });

  const groups: Group[] = Object.values(map).map((g) => {
    // Sort rows inside each group by Age descending (oldest first)
    const sortedRows = [...g.rows].sort((a, b) => b.Age - a.Age);
    return {
      ...g,
      title: `${g.title} - ${sortedRows.length}`,
      rows: sortedRows,
    };
  });

  // Sort groups alphabetically by title
  groups.sort((a, b) => a.title.localeCompare(b.title));

  return groups;
};

export const InventoryTable: FC<Props> = ({ rows, onRowClick }) => {
  if (!rows.length) return null;

  const groups = useMemo(() => buildGroups(rows), [rows]);
  const flatRows = useMemo(
    () => groups.flatMap((g) => g.rows),
    [groups]
  );

  return (
    <section className="panel">
      <div className="inventory-header">
        <div className="section-title">
          Inventory Detail · Grouped by Model / Model Number
        </div>
        <button
          className="export-button"
          onClick={() => exportToCsv("inventory_view.csv", flatRows)}
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
            {groups.map((group) => (
              <React.Fragment key={group.key}>
                {/* White header bar for the group */}
                <tr className="group-header-row">
                  <td colSpan={11}>{group.title}</td>
                </tr>

                {group.rows.map((row) => (
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
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
