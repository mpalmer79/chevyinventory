// src/components/DrilldownTable.tsx
import React, { FC } from "react";
import { InventoryRow } from "../types";
import { generateVehicleUrl } from "../utils/vehicleUrl";
import { isInTransit, formatAgeShort, sortByAgeDescending } from "../utils/inventoryUtils";
import { useIsMobile } from "../hooks/useMediaQuery";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";

type Props = {
  groups: Record<string, InventoryRow[]>;
  onBack: () => void;
  onRowClick: (row: InventoryRow) => void;
  title?: string;
};

/**
 * Formats the body description for display in group headers
 * Converts "4WD Crew Cab 147" w/3SB" to "4WD CREW CAB 147" WB"
 * Converts "4WD Reg Cab 142"" to "4WD REG CAB 142" WB"
 */
function formatBodyDescription(body: string | undefined): string {
  if (!body) return "";
  
  // Remove "w/3SB" and similar suffixes, clean up extra spaces
  let cleaned = body
    .replace(/\s*w\/\d+SB\s*/gi, "")
    .replace(/\s*,\s*\d+"\s*CA\s*/gi, "")  // Remove ", 60" CA" suffix for HD trucks
    .trim();
  
  // Extract the main body style components
  // Pattern: "4WD Crew Cab 147"" or "4WD Double Cab 147"" or "4WD Reg Cab 142""
  const match = cleaned.match(/^(4WD|2WD|AWD)?\s*(Crew Cab|Double Cab|Reg Cab|Regular Cab)?\s*(\d+)?[""']?/i);
  
  if (match) {
    const driveType = match[1] || "";
    let cabStyle = match[2] || "";
    const wheelbase = match[3] || "";
    
    // Normalize "Regular Cab" to "REG CAB"
    if (cabStyle.toLowerCase() === "regular cab") {
      cabStyle = "REG CAB";
    }
    
    // Build the formatted string
    const parts: string[] = [];
    if (driveType) parts.push(driveType.toUpperCase());
    if (cabStyle) parts.push(cabStyle.toUpperCase());
    if (wheelbase) parts.push(`${wheelbase}" WB`);
    
    return parts.join(" ");
  }
  
  // Fallback: just uppercase the cleaned string
  return cleaned.toUpperCase();
}

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
    <div className="space-y-4">
      {/* Centered Back Button and Title */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="lg"
          onClick={onBack}
          className="gap-2 px-8"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </Button>
        
        {title && (
          <div className="text-center">
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {totalCount} vehicles
            </p>
          </div>
        )}
      </div>

      {/* Groups */}
      <Card>
        <CardContent className="p-0">
          {groupKeys.map((key, groupIndex) => {
            const parts = key.split("|");
            const model = parts[1] ?? "";
            const modelNumber = parts[2] ?? null;
            const groupRows = groups[key];
            if (!groupRows) return null;
            const rowsForGroup = sortByAgeDescending(groupRows);
            
            // Get body description from first row in group
            const firstRow = rowsForGroup[0];
            const bodyDescription = firstRow?.Body ? formatBodyDescription(firstRow.Body) : "";
            
            // Build group title: Model + ModelNumber + Body Description
            // Format: "SIERRA 1500 TK10543 4WD CREW CAB 147" WB"
            let groupTitle = model;
            if (modelNumber) {
              groupTitle += ` ${modelNumber}`;
              if (bodyDescription) {
                groupTitle += ` ${bodyDescription}`;
              }
            }

            return (
              <div key={key} className={groupIndex > 0 ? "border-t" : ""}>
                {/* Mobile View */}
                {isMobile ? (
                  <>
                    {/* Mobile Group Header */}
                    <div className="p-4 bg-primary/10">
                      <span className="font-bold text-sm">{groupTitle}  -  {rowsForGroup.length}</span>
                    </div>
                    <div className="p-4 space-y-2">
                      {rowsForGroup.map((r) => (
                        <div
                          key={r["Stock Number"]}
                          className="p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors cursor-pointer"
                          onClick={() => onRowClick(r)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="text-sm font-semibold text-primary flex items-center gap-1"
                              onClick={(e) => handleStockClick(e, r)}
                            >
                              #{r["Stock Number"]}
                              <ExternalLink className="h-3 w-3" />
                            </span>
                            <span className="text-sm font-medium">
                              {r.Year} {r.Model}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Trim</span>
                              <span>{r.Trim}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Exterior</span>
                              <span>{r["Exterior Color"]}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Model #</span>
                              <span>{r["Model Number"]}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Age</span>
                              <span className={isInTransit(r) ? "text-amber-500 font-semibold" : ""}>
                                {formatAgeShort(r)}{!isInTransit(r) && " days"}
                              </span>
                            </div>
                            <div className="flex justify-between col-span-2">
                              <span className="text-muted-foreground">MSRP</span>
                              <span className="font-semibold">${Number(r.MSRP).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  /* Desktop Table View */
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/30">
                          <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stock #</th>
                          <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Year</th>
                          <th className="text-left p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Model</th>
                          <th className="p-3"></th>
                          <th className="p-3"></th>
                          <th className="p-3"></th>
                          <th className="p-3"></th>
                          <th className="p-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Group Header Row */}
                        <tr className="bg-primary/10">
                          <td colSpan={3} className="p-3 font-bold text-sm">
                            {groupTitle}  -  {rowsForGroup.length}
                          </td>
                          <td className="p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Exterior Color</td>
                          <td className="p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Trim</td>
                          <td className="p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Model #</td>
                          <td className="p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Age</td>
                          <td className="p-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">MSRP</td>
                        </tr>
                        {rowsForGroup.map((r) => (
                          <tr
                            key={r["Stock Number"]}
                            className="border-b hover:bg-accent/30 transition-colors cursor-pointer"
                            onClick={() => onRowClick(r)}
                          >
                            <td className="p-3">
                              <span
                                className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                                onClick={(e) => handleStockClick(e, r)}
                              >
                                {r["Stock Number"]}
                                <ExternalLink className="h-3 w-3" />
                              </span>
                            </td>
                            <td className="p-3 text-sm">{r.Year}</td>
                            <td className="p-3 text-sm">{r.Model}</td>
                            <td className="p-3 text-sm">{r["Exterior Color"]}</td>
                            <td className="p-3 text-sm">{r.Trim}</td>
                            <td className="p-3 text-sm">{r["Model Number"]}</td>
                            <td className="p-3 text-sm">
                              <span className={isInTransit(r) ? "text-amber-500 font-semibold" : ""}>
                                {formatAgeShort(r)}
                              </span>
                            </td>
                            <td className="p-3 text-sm font-medium">${Number(r.MSRP).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
