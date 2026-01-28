import { create } from "zustand";
import { InventoryRow, Filters, DrillType } from "../types";

interface InventoryState {
  rows: InventoryRow[];
  isLoading: boolean;
  isStale: boolean;
  error: string | null;
  lastUpdated: Date | null;
  filters: Filters;
  searchTerm: string;
  drillType: DrillType;
  selectedVehicle: InventoryRow | null;
  isRefreshing: boolean;

  setRows: (rows: InventoryRow[]) => void;
  setLoading: (isLoading: boolean) => void;
  setStale: (isStale: boolean) => void;
  setError: (error: string | null) => void;
  setLastUpdated: (date: Date | null) => void;
  setFilters: (filters: Partial<Filters>) => void;
  setSearchTerm: (term: string) => void;
  setDrillType: (type: DrillType) => void;
  setSelectedVehicle: (vehicle: InventoryRow | null) => void;
  setRefreshing: (isRefreshing: boolean) => void;
  resetAll: () => void;
}

const DEFAULT_FILTERS: Filters = {
  make: "",
  model: "",
  year: "ALL",
  priceMin: "",
  priceMax: "",
  stockNumber: "",
};

export const useInventoryStore = create<InventoryState>()((set, get) => ({
  rows: [],
  isLoading: true,
  isStale: false,
  error: null,
  lastUpdated: null,
  filters: DEFAULT_FILTERS,
  searchTerm: "",
  drillType: null,
  selectedVehicle: null,
  isRefreshing: false,

  setRows: (rows) => set({ rows }),
  setLoading: (isLoading) => set({ isLoading }),
  setStale: (isStale) => set({ isStale }),
  setError: (error) => set({ error }),
  setLastUpdated: (lastUpdated) => set({ lastUpdated }),
  setFilters: (newFilters) => {
    const currentFilters = get().filters;
    set({ filters: { ...currentFilters, ...newFilters } });
  },
  setSearchTerm: (searchTerm) => set({ searchTerm }),
  setDrillType: (drillType) => set({ drillType }),
  setSelectedVehicle: (selectedVehicle) => set({ selectedVehicle }),
  setRefreshing: (isRefreshing) => set({ isRefreshing }),
  resetAll: () => set({
    filters: DEFAULT_FILTERS,
    searchTerm: "",
    drillType: null,
    selectedVehicle: null,
  }),
}));
