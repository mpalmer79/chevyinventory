// src/components/DrilldownTable.tsx
import React, { FC } from "react";
import { InventoryRow } from "../types";
import { generateVehicleUrl } from "../utils/vehicleUrl";
import { isInTransit, formatAgeShort, sortByAgeDescending } from "../utils/inventoryUtils";
import { useIsMobile } from "../hooks/useMediaQuery";

type Props = {
  groups: Record<string, InventoryRow[]>;
  onBack: () => void;
  onRowClick: (row: InventoryRow) => void;
  title?: string;
};

export const DrilldownTable: FC<Props> = ({ groups, onBack, onRowClick, title }) => {
  const isMobile = useIsMobile();
  const groupKeys = Object.keys(groups);

  // Calculate total count across all groups
  const totalCount = groupKeys.reduce((sum, key) => {
    const groupRows = groups[key];
    return sum + (groupRows ? groupRows.length : 0);
  }, 0);

  // Handle stock number click - open in new tab
  const handleStockClick = (e: React.MouseEvent, row: InventoryRow) => {
    e.stopPropagation();
    const url = generateVehicleUrl(row);
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <section className="panel drilldown-section">
      <div className="drill-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <div className="drill-title">
          {title || "Drilldown View"}
          {title && <span style={{ fontWeight: 400, marginLeft: 8 }}>({totalCount} vehicles)</span>}
        </div>
      </div>

      {groupKeys.map((key) => {
        const parts = key.split("|");
        const make = parts[0] ?? "";
        const model = parts[1] ?? "";
        const modelNumber = parts[2] ?? null;
        const groupRows = groups[key];
        if (!groupRows) return null;
        const rowsForGroup = sortByAgeDescending(groupRows);
        const groupTitle = modelNumber
          ? `${make} ${model} ${modelNumber} - ${rowsForGroup.length}`
          : `${make} ${model} - ${rowsForGroup.length}`;

        return (
          <div key={key} className="drill-group" style={{ marginTop: 16 }}>
            <div
              className="drill-group-title"
              style={{
                background: "#ffffff",
                color: "#000000",
                padding: "12px 16px",
                fontWeight: 700,
                fontSize: 15,
                borderRadius: 8,
                marginBottom: 8,
              }}
            >
              {groupTitle}
            </div>

            {isMobile ? (
              <div className="mobile-card-list">
                {rowsForGroup.map((r) => (
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
              </div>
            ) : (
              <table className="table-shell">
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
                  {rowsForGroup.map((r) => (
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
                </tbody>
              </table>
            )}
          </div>
        );
      })}
    </section>
  );
};
