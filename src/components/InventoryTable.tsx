// src/components/InventoryTable.tsx
import React, { FC, useMemo } from "react";
import { InventoryRow } from "../types";
import { generateVehicleUrl } from "../utils/vehicleUrl";
import { isInTransit, formatAgeShort, sortByAgeDescending } from "../utils/inventoryUtils";

type Props = {
  rows: InventoryRow[];
  onRowClick: (row: InventoryRow) => void;
};

type GroupedRows = {
  year: number;
  model: string;
  rows: InventoryRow[];
};

export const InventoryTable: FC<Props> = ({ rows, onRowClick }) => {
  if (!rows.length) return null;

  // Group rows by Year and Model, then sort within each group
  const groupedRows = useMemo(() => {
    const groups: GroupedRows[] = [];
    const groupMap: Record<string, InventoryRow[]> = {};

    // First, group all rows
    rows.forEach((row) => {
      const key = `${row.Year}|${row.Model}`;
      if (!groupMap[key]) {
        groupMap[key] = [];
      }
      groupMap[key].push(row);
    });

    // Convert to array, sort each group's rows, then sort groups
    Object.entries(groupMap).forEach(([key, groupRows]) => {
      const [year, model] = key.split("|");
      groups.push({
        year: parseInt(year),
        model,
        rows: sortByAgeDescending(groupRows), // Sort within group
      });
    });

    groups.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year; // Newest year first
      return a.model.localeCompare(b.model); // Then alphabetical by model
    });

    return groups;
  }, [rows]);

  // Handle stock number click - open in new tab
  const handleStockClick = (e: React.MouseEvent, row: InventoryRow) => {
    e.stopPropagation();
    const url = generateVehicleUrl(row);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // ---------- MOBILE CARD VIEW (<768px) ----------
  const isMobile = window.innerWidth < 768;
  if (isMobile) {
    return (
      <section className="panel">
        <div className="section-title">Inventory</div>

        <div className="mobile-card-list">
          {groupedRows.map((group) => (
            <React.Fragment key={`${group.year}-${group.model}`}>
              {/* Group Header */}
              <div
                style={{
                  background: "#ffffff",
                  color: "#000000",
                  padding: "12px 16px",
                  fontWeight: 700,
                  fontSize: 15,
                  marginTop: 16,
                  marginBottom: 8,
                  borderRadius: 8,
                }}
              >
                {group.year} {group.model} - {group.rows.length}
              </div>

              {/* Group Rows */}
              {group.rows.map((r) => (
                <div
                  key={r["Stock Number"]}
                  className="mobile-card"
                  onClick={() => onRowClick(r)}
                >
                  <div className="mobile-card-header">
                    <span
                      className="mc-stock stock-link"
                      onClick={(e) => handleStockClick(e, r)}
                      style={{
                        color: "#4fc3f7",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      #{r["Stock Number"]}
                    </span>
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
                    <span style={isInTransit(r) ? { color: "#fbbf24", fontWeight: 600 } : undefined}>
                      {formatAgeShort(r)}{!isInTransit(r) && " days"}
                    </span>
                  </div>

                  <div className="mobile-card-row">
                    <span>MSRP</span>
                    <span>${Number(r.MSRP).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </React.Fragment>
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
          {groupedRows.map((group) => (
            <React.Fragment key={`${group.year}-${group.model}`}>
              {/* Group Header Row */}
              <tr>
                <td
                  colSpan={8}
                  style={{
                    background: "#ffffff",
                    color: "#000000",
                    fontWeight: 700,
                    fontSize: 15,
                    padding: "12px 16px",
                    textAlign: "left",
                    borderTop: "2px solid #1e293b",
                  }}
                >
                  {group.year} {group.model} - {group.rows.length}
                </td>
              </tr>

              {/* Group Data Rows */}
              {group.rows.map((r) => (
                <tr
                  key={r["Stock Number"]}
                  className="click-row"
                  onClick={() => onRowClick(r)}
                >
                  <td>
                    <span
                      className="stock-link"
                      onClick={(e) => handleStockClick(e, r)}
                      style={{
                        color: "#4fc3f7",
                        textDecoration: "underline",
                        cursor: "pointer",
                      }}
                    >
                      {r["Stock Number"]}
                    </span>
                  </td>
                  <td>{r.Year}</td>
                  <td>{r.Model}</td>
                  <td>{r["Exterior Color"]}</td>
                  <td>{r.Trim}</td>
                  <td>{r["Model Number"]}</td>
                  <td style={isInTransit(r) ? { color: "#fbbf24", fontWeight: 600 } : undefined}>
                    {formatAgeShort(r)}
                  </td>
                  <td>${Number(r.MSRP).toLocaleString()}</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </section>
  );
};
