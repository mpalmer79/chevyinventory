// src/components/InventoryTable.tsx
import React, { FC, useMemo, memo } from "react";
import { InventoryRow } from "../types";
import { generateVehicleUrl } from "../utils/vehicleUrl";
import { isInTransit, formatAgeShort, sortByAgeDescending } from "../utils/inventoryUtils";
import { useIsMobile } from "../hooks/useMediaQuery";
import { VirtualizedTable } from "./VirtualizedTable";

type Props = {
  rows: InventoryRow[];
  onRowClick: (row: InventoryRow) => void;
};

type GroupedRows = {
  year: number;
  model: string;
  modelNumber: string;
  displayName: string;
  rows: InventoryRow[];
};

const shouldSubgroup = (model: string): boolean => {
  return model === "SILVERADO 1500" || 
         model === "SILVERADO 2500HD" || 
         model === "SILVERADO 3500HD";
};

const VIRTUALIZATION_THRESHOLD = 100;

export const InventoryTable: FC<Props> = memo(({ rows, onRowClick }) => {
  const isMobile = useIsMobile();

  // Move useMemo BEFORE any conditional returns
  const groupedRows = useMemo(() => {
    if (!rows.length) return [];
    
    const groups: GroupedRows[] = [];
    const groupMap: Record<string, InventoryRow[]> = {};

    rows.forEach((row) => {
      let key: string;
      if (shouldSubgroup(row.Model) && row["Model Number"]) {
        key = `${row.Year}|${row.Model}|${row["Model Number"]}`;
      } else {
        key = `${row.Year}|${row.Model}|`;
      }
      if (!groupMap[key]) {
        groupMap[key] = [];
      }
      groupMap[key]?.push(row);
    });

    Object.entries(groupMap).forEach(([key, groupRows]) => {
      const parts = key.split("|");
      const year = parts[0] ?? "0";
      const model = parts[1] ?? "";
      const modelNumber = parts[2] ?? "";
      
      let displayName = model;
      if (shouldSubgroup(model) && modelNumber) {
        displayName = `${model} ${modelNumber}`;
      }
      
      groups.push({
        year: parseInt(year),
        model,
        modelNumber: modelNumber || "",
        displayName,
        rows: sortByAgeDescending(groupRows),
      });
    });

    groups.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      if (a.model !== b.model) return a.model.localeCompare(b.model);
      return a.modelNumber.localeCompare(b.modelNumber);
    });

    return groups;
  }, [rows]);

  // Now safe to do early returns AFTER all hooks
  if (!rows.length) return null;

  // Use virtualized table for large datasets on desktop
  if (!isMobile && rows.length > VIRTUALIZATION_THRESHOLD) {
    return <VirtualizedTable rows={rows} onRowClick={onRowClick} />;
  }

  const handleStockClick = (e: React.MouseEvent, row: InventoryRow) => {
    e.stopPropagation();
    const url = generateVehicleUrl(row);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // ---------- MOBILE CARD VIEW (<768px) ----------
  if (isMobile) {
    return (
      <section className="panel">
        <div className="section-title">Inventory</div>

        <div className="mobile-card-list">
          {groupedRows.map((group) => (
            <React.Fragment key={`${group.year}-${group.model}-${group.modelNumber}`}>
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
                {group.year} {group.displayName} - {group.rows.length}
              </div>

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

  // ---------- DESKTOP TABLE VIEW (small datasets) ----------
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
            <React.Fragment key={`${group.year}-${group.model}-${group.modelNumber}`}>
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
                  {group.year} {group.displayName} - {group.rows.length}
                </td>
              </tr>

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
});

InventoryTable.displayName = "InventoryTable";
