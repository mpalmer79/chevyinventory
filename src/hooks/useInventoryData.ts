// src/hooks/useInventoryData.ts
import { useEffect, useMemo, useState, useCallback } from "react";
import * as XLSX from "xlsx";
import { InventoryRow, ModelPieDatum } from "../types";
import { DEFAULT_INVENTORY_PATH } from "../inventoryHelpers";

interface InventoryDataResult {
  rows: InventoryRow[];
  error: string | null;
  sortedRows: InventoryRow[];
  modelPieData: ModelPieDatum[];
  isLoading: boolean;
  isStale: boolean;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
}

const CACHE_KEY = "inventory-data-cache";
const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_TIME = 30 * 60 * 1000; // 30 minutes

interface CachedData {
  rows: InventoryRow[];
  timestamp: number;
}

export function useInventoryData(): InventoryDataResult {
  const [rows, setRows] = useState<InventoryRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const parseArrayBuffer = useCallback((data: ArrayBuffer): InventoryRow[] => {
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error("No sheets found in workbook");
    }
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error("Worksheet not found");
    }
    
    const rawData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: "" 
    });

    return rawData
      .filter((row): row is unknown[] => Array.isArray(row) && row.length >= 10 && row[0] != null)
      .map((row) => ({
        "Stock Number": String(row[0] ?? ""),
        Year: Number(row[1]) || 0,
        Make: String(row[2] ?? ""),
        Model: String(row[3] ?? ""),
        "Exterior Color": String(row[4] ?? ""),
        Trim: String(row[5] ?? ""),
        "Model Number": String(row[6] ?? ""),
        Cylinders: Number(row[7]) || 0,
        Age: Number(row[8]) || 0,
        MSRP: Number(row[9]) || 0,
        Status: String(row[10] ?? ""),
        VIN: String(row[11] ?? ""),
      }));
  }, []);

  const loadFromCache = useCallback((): CachedData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed: CachedData = JSON.parse(cached);
        const age = Date.now() - parsed.timestamp;
        
        if (age < CACHE_TIME) {
          return parsed;
        }
        // Cache expired, remove it
        localStorage.removeItem(CACHE_KEY);
      }
    } catch (e) {
      console.warn("Failed to load from cache:", e);
    }
    return null;
  }, []);

  const saveToCache = useCallback((data: InventoryRow[]) => {
    try {
      const cacheData: CachedData = {
        rows: data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (e) {
      console.warn("Failed to save to cache:", e);
    }
  }, []);

  const fetchInventory = useCallback(async (useCache = true) => {
    // Try to load from cache first
    if (useCache) {
      const cached = loadFromCache();
      if (cached) {
        const age = Date.now() - cached.timestamp;
        setRows(cached.rows);
        setLastUpdated(new Date(cached.timestamp));
        setIsStale(age > STALE_TIME);
        setIsLoading(false);
        
        // If stale, continue to fetch fresh data in background
        if (age <= STALE_TIME) {
          return;
        }
      }
    }

    try {
      const res = await fetch(DEFAULT_INVENTORY_PATH);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.arrayBuffer();
      const parsed = parseArrayBuffer(data);
      
      setRows(parsed);
      setError(null);
      setLastUpdated(new Date());
      setIsStale(false);
      saveToCache(parsed);
    } catch (err) {
      console.error("Failed to load inventory:", err);
      // Only set error if we don't have cached data
      if (rows.length === 0) {
        setError("Error loading inventory data. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadFromCache, parseArrayBuffer, saveToCache, rows.length]);

  // Initial load
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Background refresh interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastUpdated) {
        const age = Date.now() - lastUpdated.getTime();
        if (age > STALE_TIME) {
          setIsStale(true);
          fetchInventory(false); // Fetch without using cache
        }
      }
    }, STALE_TIME);

    return () => clearInterval(interval);
  }, [lastUpdated, fetchInventory]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    await fetchInventory(false);
  }, [fetchInventory]);

  const sortedRows = useMemo<InventoryRow[]>(() => {
    return [...rows].sort((a, b) => {
      if (a.Model !== b.Model) return a.Model.localeCompare(b.Model);
      return b.Age - a.Age;
    });
  }, [rows]);

  const modelPieData = useMemo<ModelPieDatum[]>(() => {
    const countByModel: Record<string, number> = {};
    rows.forEach((r) => {
      countByModel[r.Model] = (countByModel[r.Model] ?? 0) + 1;
    });

    return Object.entries(countByModel)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [rows]);

  return { 
    rows, 
    error, 
    sortedRows, 
    modelPieData,
    isLoading,
    isStale,
    lastUpdated,
    refetch,
  };
}
