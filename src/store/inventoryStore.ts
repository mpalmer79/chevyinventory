import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { InventoryRow, Filters, DrillType, AgingBuckets } from "../types";
import { isInTransit, sortByAgeDescending } from "../utils/inventoryUtils";

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
  resetFilters: () => void;
  resetAll: () => void;
}

const DEFAULT_FILTERS: Filters = {
  model: "",
  year: "ALL",
  priceMin: "",
  priceMax: "",
  stockNumber: "",
};

const getFiltersFromURL = (): Partial<Filters> => {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const filters: Partial<Filters> = {};
  const model = params.get("model");
  const year = params.get("year");
  const priceMin = params.get("priceMin");
  const priceMax = params.get("priceMax");
  const stockNumber = params.get("stock");
  if (model) filters.model = model;
  if (year) filters.year = year;
  if (priceMin) filters.priceMin = priceMin;
  if (priceMax) filters.priceMax = priceMax;
  if (stockNumber) filters.stockNumber = stockNumber;
  return filters;
};

const syncFiltersToURL = (filters: Filters) => {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams();
  if (filters.model) params.set("model", filters.model);
  if (filters.year && filters.year !== "ALL") params.set("year", filters.year);
  if (filters.priceMin) params.set("priceMin", filters.priceMin);
  if (filters.priceMax) params.set("priceMax", filters.priceMax);
  if (filters.stockNumber) params.set("stock", filters.stockNumber);
  const newURL = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;
  window.history.replaceState({}, "", newURL);
};

export const useInventoryStore = create<InventoryState>()(
  subscribeWithSelector((set, get) => ({
    rows: [],
    isLoading: true,
    isStale: false,
    error: null,
    lastUpdated: null,
    filters: { ...DEFAULT_FILTERS, ...getFiltersFromURL() },
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
      const updatedFilters = { ...currentFilters, ...newFilters };
      syncFiltersToURL(updatedFilters);
      set({ filters: updatedFilters });
    },
    setSearchTerm: (searchTerm) => set({ searchTerm }),
    setDrillType: (drillType) => set({ drillType }),
    setSelectedVehicle: (selectedVehicle) => set({ selectedVehicle }),
    setRefreshing: (isRefreshing) => set({ isRefreshing }),
    resetFilters: () => {
      syncFiltersToURL(DEFAULT_FILTERS);
      set({ filters: DEFAULT_FILTERS, searchTerm: "", drillType: null });
    },
    resetAll: () => {
      syncFiltersToURL(DEFAULT_FILTERS);
      set({
        filters: DEFAULT_FILTERS,
        searchTerm: "",
        drillType: null,
        selectedVehicle: null,
      });
    },
  }))
);

export const useModelsList = () => {
  return useInventoryStore((state) => {
    const modelsSet = new Set<string>();
    state.rows.forEach((r) => {
      if (r.Model === "SILVERADO 1500" && r["Model Number"]) {
        modelsSet.add(`SILVERADO 1500 ${r["Model Number"]}`);
      } else if (r.Model === "SILVERADO 2500HD" && r["Model Number"]) {
        modelsSet.add(`SILVERADO 2500HD ${r["Model Number"]}`);
      } else {
        modelsSet.add(r.Model);
      }
    });
    return Array.from(modelsSet).sort();
  });
};

export const useAgingBuckets = (): AgingBuckets => {
  return useInventoryStore((state) => {
    const b = { bucket0_30: 0, bucket31_60: 0, bucket61_90: 0, bucket90_plus: 0 };
    state.rows.forEach((r) => {
      if (isInTransit(r)) return;
      if (r.Age <= 30) b.bucket0_30++;
      else if (r.Age <= 60) b.bucket31_60++;
      else if (r.Age <= 90) b.bucket61_90++;
      else b.bucket90_plus++;
    });
    return b;
  });
};

export const useSortedRows = () => {
  return useInventoryStore((state) => {
    return [...state.rows].sort((a, b) => {
      if (a.Model !== b.Model) return a.Model.localeCompare(b.Model);
      return b.Age - a.Age;
    });
  });
};

export const useFilteredRows = () => {
  const sortedRows = useSortedRows();
  const filters = useInventoryStore((state) => state.filters);
  return sortedRows.filter((row) => {
    if (filters.model) {
      if (filters.model.startsWith("SILVERADO 1500 ")) {
        const modelNumber = filters.model.replace("SILVERADO 1500 ", "");
        if (row.Model !== "SILVERADO 1500" || row["Model Number"] !== modelNumber) return false;
      } else if (filters.model.startsWith("SILVERADO 2500HD ")) {
        const modelNumber = filters.model.replace("SILVERADO 2500HD ", "");
        if (row.Model !== "SILVERADO 2500HD" || row["Model Number"] !== modelNumber) return false;
      } else {
        if (row.Model !== filters.model) return false;
      }
    }
    if (filters.year !== "ALL" && String(row.Year) !== filters.year) return false;
    if (filters.priceMin) {
      const minPrice = Number(filters.priceMin);
      if (!isNaN(minPrice) && row.MSRP < minPrice) return false;
    }
    if (filters.priceMax) {
      const maxPrice = Number(filters.priceMax);
      if (!isNaN(maxPrice) && row.MSRP > maxPrice) return false;
    }
    if (filters.stockNumber) {
      const stockNum = filters.stockNumber.toLowerCase().trim();
      const rowStockNum = row["Stock Number"].toLowerCase().trim();
      if (!rowStockNum.includes(stockNum)) return false;
    }
    return true;
  });
};

export const useNewArrivals = () => {
  return useInventoryStore((state) => state.rows.filter((r) => r.Age <= 7 && !isInTransit(r)));
};

export const useInTransitRows = () => {
  return useInventoryStore((state) => state.rows.filter((r) => isInTransit(r)));
};

export const useFilteredNewArrivals = () => {
  const filteredRows = useFilteredRows();
  return filteredRows.filter((r) => r.Age <= 7 && !isInTransit(r));
};

export const useFilteredInTransit = () => {
  const filteredRows = useFilteredRows();
  return filteredRows.filter((r) => isInTransit(r));
};

export const useModelPieData = () => {
  return useInventoryStore((state) => {
    const countByModel: Record<string, number> = {};
    state.rows.forEach((r) => {
      countByModel[r.Model] = (countByModel[r.Model] ?? 0) + 1;
    });
    return Object.entries(countByModel)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  });
};

export const useDrillData = () => {
  const rows = useInventoryStore((state) => state.rows);
  const drillType = useInventoryStore((state) => state.drillType);
  const filteredRows = useFilteredRows();
  const newArrivalRows = useNewArrivals();
  const inTransitRows = useInTransitRows();

  if (!drillType) return null;

  const buildGroups = (inputRows: InventoryRow[]) => {
    const groups: Record<string, InventoryRow[]> = {};
    inputRows.forEach((r) => {
      const modelNumber = r["Model Number"] ? String(r["Model Number"]) : "";
      const key = r.Make && r.Model
        ? `${r.Make}|${r.Model}${modelNumber ? `|${modelNumber}` : ""}`
        : `${r.Make || "Unknown"}|${r.Model || "Unknown"}`;
      if (!groups[key]) groups[key] = [];
      groups[key]?.push(r);
    });
    Object.keys(groups).forEach((key) => {
      const group = groups[key];
      if (group) groups[key] = sortByAgeDescending(group);
    });
    return groups;
  };

  if (drillType === "total") return buildGroups(filteredRows);
  if (drillType === "in_transit") return buildGroups(inTransitRows);

  let result: InventoryRow[] = [];
  if (drillType === "new") result = [...newArrivalRows];
  if (drillType === "0_30") result = rows.filter((r) => r.Age <= 30 && !isInTransit(r));
  if (drillType === "31_60") result = rows.filter((r) => r.Age > 30 && r.Age <= 60 && !isInTransit(r));
  if (drillType === "61_90") result = rows.filter((r) => r.Age > 60 && r.Age <= 90 && !isInTransit(r));
  if (drillType === "90_plus") result = rows.filter((r) => r.Age > 90 && !isInTransit(r));

  return buildGroups(result);
};

export const useHasModelFilter = () => {
  return useInventoryStore((state) => !!state.filters.model);
};
