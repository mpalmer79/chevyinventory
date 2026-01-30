// src/components/KpiBar.tsx
import React, { FC, memo } from "react";
import { Card, CardContent } from "./ui/card";
import { Car, Package, Clock, TrendingUp } from "lucide-react";
import { cn } from "../lib/utils";

interface Props {
  totalVehicles: number;
  totalNew: number;
  inTransit: number;
  avgAge: number;
  onTotalClick: () => void;
  onNewClick: () => void;
  onTransitClick: () => void;
}

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  onClick?: () => void;
  highlight?: boolean;
}

const KpiCard: FC<KpiCardProps> = ({ label, value, icon, onClick, highlight }) => (
  <Card 
    className={cn(
      "cursor-pointer transition-all hover:shadow-md hover:border-primary/50",
      highlight && "border-primary bg-primary/5"
    )}
    onClick={onClick}
  >
    <CardContent className="p-4">
      <div className="flex flex-col items-center text-center">
        <span className="text-xs font-semibold uppercase tracking-wide text-black dark:text-white mb-2">
          {label}
        </span>
        <span className="text-3xl font-bold tabular-nums mb-2">
          {value}
        </span>
        <div className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center",
          highlight ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export const KpiBar: FC<Props> = memo(({
  totalVehicles,
  totalNew,
  inTransit,
  avgAge,
  onTotalClick,
  onNewClick,
  onTransitClick,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <KpiCard
        label="Total Vehicles"
        value={totalVehicles}
        icon={<Car className="h-5 w-5" />}
        onClick={onTotalClick}
        highlight
      />
      <KpiCard
        label="New Arrivals"
        value={totalNew}
        icon={<Package className="h-5 w-5" />}
        onClick={onNewClick}
      />
      <KpiCard
        label="In Transit"
        value={inTransit}
        icon={<TrendingUp className="h-5 w-5" />}
        onClick={onTransitClick}
      />
      <KpiCard
        label="Avg. Age"
        value={`${avgAge} days`}
        icon={<Clock className="h-5 w-5" />}
      />
    </div>
  );
});

KpiBar.displayName = "KpiBar";
