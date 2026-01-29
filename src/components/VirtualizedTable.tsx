// src/components/VirtualizedTable.tsx
import React, { FC, useRef, useMemo, memo, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
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
  modelNumber: string;
  displayName: string;
  rows: InventoryRow[];
};

type FlattenedRow = 
  | { type: "header"; group: GroupedRows; id: string }
  | { type: "row"; row: InventoryRow; id: string };

const shouldSubgroup = (model: string): boolean => {
  return model === "SILVERADO 1500" || 
         model === "SILVERADO 2500HD" || 
         model === "SILVERADO 3500HD" ||
         model === "SIERRA 1500";
};

const ROW_HEIGHT = 48;
const HEADER_HEIGHT = 52;

export const VirtualizedTable: FC<Props> = memo(({ rows, onRowClick }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  // Group and flatten rows for virtualization
  const flattenedRows = useMemo<FlattenedRow[]>(() => {
    if (!rows.length) return [];

    const groupMap: Record<string, InventoryRow[]> = {};

    // Group rows
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

    // Convert to sorted groups
    const groups: GroupedRows[] = [];
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
        modelNumber,
        displayName,
        rows: sortByAgeDescending(groupRows),
      });
    });

    // Sort groups
    groups.sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      if (a.model !== b.model) return a.model.localeCompare(b.model);
      return a.modelNumber.localeCompare(b.modelNumber);
    });

    // Flatten for virtualization
    const flattened: FlattenedRow[] = [];
    groups.forEach((group) => {
      flattened.push({ 
        type: "header", 
        group, 
        id: `header-${group.year}-${group.model}-${group.modelNumber}` 
      });
      group.rows.forEach((row) => {
        flattened.push({ 
          type: "row", 
          row, 
          id: `row-${row["Stock Number"]}` 
        });
      });
    });

    return flattened;
  }, [rows]);

  // Virtual row height estimator
  const getItemSize = useCallback((index: number) => {
    const item = flattenedRows[index];
    return item?.type === "header" ? HEADER_HEIGHT : ROW_HEIGHT;
  }, [flattenedRows]);

  // Virtualizer
  const virtualizer = useVirtualizer({
    count: flattenedRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: getItemSize,
    overscan: 10, // Render 10 extra rows above/below viewport
  });

  // Handle stock click
  const handleStockClick = useCallback((e: React.MouseEvent, row: InventoryRow) => {
    e.stopPropagation();
    const url = generateVehicleUrl(row);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, []);

  if (!rows.length) return null;

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <section className="panel table-shell">
      {/* Fixed header */}
      <div 
        style={{ 
          position: "sticky", 
          top: 0, 
          zIndex: 10,
          background: "#0f172a",
          borderBottom: "1px solid rgba(148,163,184,0.2)",
        }}
      >
        <table style={{ width: "100%", tableLayout: "fixed" }}>
          <thead>
            <tr>
              <th style={{ width: "12%" }}>Stock #</th>
              <th style={{ width: "8%" }}>Year</th>
              <th style={{ width: "18%" }}>Model</th>
              <th style={{ width: "14%" }}>Exterior</th>
              <th style={{ width: "18%" }}>Trim</th>
              <th style={{ width: "10%" }}>Model #</th>
              <th style={{ width: "8%" }}>Age</th>
              <th style={{ width: "12%" }}>MSRP</th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Virtualized body */}
      <div
        ref={parentRef}
        style={{
          height: "600px",
          overflow: "auto",
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualItems.map((virtualRow) => {
            const item = flattenedRows[virtualRow.index];
            if (!item) return null;

            if (item.type === "header") {
              return (
                <div
                  key={item.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div
                    style={{
                      background: "#ffffff",
                      color: "#000000",
                      fontWeight: 700,
                      fontSize: 15,
                      padding: "14px 16px",
                      borderTop: "2px solid #1e293b",
                    }}
                  >
                    {item.group.year} {item.group.displayName} - {item.group.rows.length}
                  </div>
                </div>
              );
            }

            const r = item.row;
            return (
              <div
                key={item.id}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <table style={{ width: "100%", tableLayout: "fixed" }}>
                  <tbody>
                    <tr
                      className="click-row"
                      onClick={() => onRowClick(r)}
                      style={{ cursor: "pointer" }}
                    >
                      <td style={{ width: "12%" }}>
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
                      <td style={{ width: "8%" }}>{r.Year}</td>
                      <td style={{ width: "18%" }}>{r.Model}</td>
                      <td style={{ width: "14%" }}>{r["Exterior Color"]}</td>
                      <td style={{ width: "18%" }}>{r.Trim}</td>
                      <td style={{ width: "10%" }}>{r["Model Number"]}</td>
                      <td 
                        style={{ 
                          width: "8%",
                          color: isInTransit(r) ? "#fbbf24" : undefined,
                          fontWeight: isInTransit(r) ? 600 : undefined,
                        }}
                      >
                        {formatAgeShort(r)}
                      </td>
                      <td style={{ width: "12%" }}>${Number(r.MSRP).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      </div>

      {/* Row count indicator */}
      <div
        style={{
          padding: "8px 16px",
          fontSize: "12px",
          color: "#64748b",
          borderTop: "1px solid rgba(148,163,184,0.2)",
          textAlign: "right",
        }}
      >
        Showing {rows.length} vehicles
      </div>
    </section>
  );
});

VirtualizedTable.displayName = "VirtualizedTable";

export default VirtualizedTable;
