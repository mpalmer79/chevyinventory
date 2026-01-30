// src/components/VehicleDetailDrawer.tsx
import React, { FC, memo } from "react";
import { InventoryRow } from "../types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ExternalLink, Car, Calendar, Palette, Tag, Hash, FileText } from "lucide-react";

interface Props {
  vehicle: InventoryRow | null;
  onClose: () => void;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getAgingBadgeVariant = (age: number): "fresh" | "normal" | "watch" | "risk" => {
  if (age <= 30) return "fresh";
  if (age <= 60) return "normal";
  if (age <= 90) return "watch";
  return "risk";
};

const DetailRow: FC<{ label: string; value: string | number; icon?: React.ReactNode }> = ({ 
  label, 
  value,
  icon 
}) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
    <span className="text-sm text-muted-foreground flex items-center gap-2">
      {icon}
      {label}
    </span>
    <span className="text-sm font-medium">{value}</span>
  </div>
);

export const VehicleDetailDrawer: FC<Props> = memo(({ vehicle, onClose }) => {
  if (!vehicle) return null;

  const vinSolutionsUrl = `https://apps.vinmanager.com/vinconnect/#/vehicles/${vehicle.VIN}`;
  const agingVariant = getAgingBadgeVariant(vehicle.Age);

  return (
    <Sheet open={!!vehicle} onOpenChange={() => onClose()}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            {vehicle.Year} {vehicle.Make} {vehicle.Model}
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            Stock #{vehicle["Stock Number"]}
            <Badge variant={agingVariant}>{vehicle.Age} days</Badge>
          </SheetDescription>
        </SheetHeader>

        {/* Price Card */}
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                MSRP
              </div>
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(vehicle.MSRP)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Details */}
        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Vehicle Information
            </h4>
            <Card>
              <CardContent className="p-4">
                <DetailRow 
                  label="Trim" 
                  value={vehicle.Trim || "N/A"} 
                  icon={<Tag className="h-3.5 w-3.5" />}
                />
                <DetailRow 
                  label="Exterior Color" 
                  value={vehicle["Exterior Color"] || "N/A"}
                  icon={<Palette className="h-3.5 w-3.5" />}
                />
                <DetailRow 
                  label="Model Number" 
                  value={vehicle["Model Number"] || "N/A"}
                  icon={<Hash className="h-3.5 w-3.5" />}
                />
                <DetailRow 
                  label="Cylinders" 
                  value={vehicle.Cylinders || "N/A"}
                  icon={<Car className="h-3.5 w-3.5" />}
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Status & Identification
            </h4>
            <Card>
              <CardContent className="p-4">
                <DetailRow 
                  label="Status" 
                  value={vehicle.Status || "On Lot"}
                  icon={<FileText className="h-3.5 w-3.5" />}
                />
                <DetailRow 
                  label="Days on Lot" 
                  value={`${vehicle.Age} days`}
                  icon={<Calendar className="h-3.5 w-3.5" />}
                />
                <div className="pt-2.5">
                  <span className="text-sm text-muted-foreground block mb-1">VIN</span>
                  <code className="text-xs font-mono bg-muted px-2 py-1 rounded block overflow-x-auto">
                    {vehicle.VIN}
                  </code>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-2">
          <Button 
            className="w-full gap-2" 
            onClick={() => window.open(vinSolutionsUrl, "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
            View in VIN Solutions
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
});

VehicleDetailDrawer.displayName = "VehicleDetailDrawer";
