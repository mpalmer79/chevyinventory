// src/components/InventoryHealthPanel.tsx
import { FC, useMemo } from "react";
import { InventoryRow, AgingBuckets } from "../types";
import { isInTransit } from "../utils/inventoryUtils";
import { TrendingUp, AlertTriangle } from "lucide-react";

interface Props {
  rows: InventoryRow[];
  agingBuckets: AgingBuckets;
  onRowClick: (row: InventoryRow) => void;
}

export const InventoryHealthPanel: FC<Props> = ({ rows, agingBuckets }) => {
  const totalOnLot = useMemo(() => {
    return rows.filter((r) => !isInTransit(r)).length;
  }, [rows]);

  const freshPercent = totalOnLot > 0
    ? Math.round((agingBuckets.bucket0_30 / totalOnLot) * 100)
    : 0;

  const atRiskPercent = totalOnLot > 0
    ? Math.round((agingBuckets.bucket90_plus / totalOnLot) * 100)
    : 0;

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-muted-foreground mb-4">
        Inventory Health · At a Glance
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fresh Inventory */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
          <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Fresh Inventory (0–30 days)
            </p>
            <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {freshPercent}%
            </p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
              of {totalOnLot} units
            </p>
          </div>
        </div>

        {/* At-Risk Inventory */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-red-700 dark:text-red-300">
              At-Risk Inventory (90+ days)
            </p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {atRiskPercent}%
            </p>
            <p className="text-xs text-red-600/70 dark:text-red-400/70">
              of {totalOnLot} units
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
