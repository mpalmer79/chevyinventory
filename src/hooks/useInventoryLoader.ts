import { useEffect, useCallback } from "react";
import * as XLSX from "xlsx";
import { InventoryRow } from "../types";
import { useInventoryStore } from "../store/inventoryStore";
import { DEFAULT_INVENTORY_PATH } from "../inventoryHelpers";

const CACHE_KEY = "inventory-data-cache";
const STALE_TIME = 5 * 60 * 1000;
const CACHE_TIME = 30 * 60 * 1000;

interface CachedData {
  rows: InventoryRow[];
  timestamp: number;
}

export function useInventoryLoader() {
  const {
    setRows,
    setLoading,
    setStale,
    setError,
    setLastUpdated,
    setRefreshing,
    rows,
  } = useInventoryStore();

  const parseArrayBuffer = useCallback((data: ArrayBuffer): InventoryRow[] => {
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error("No sheets found");
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) throw new Error("Worksheet not found");

    const rawData: unknown[][] = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: "",
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
        if (age < CACHE_TIME) return parsed;
        localStorage.removeItem(CACHE_KEY);
      }
    } catch (e) {
      console.warn("Cache load failed:", e);
    }
    return null;
  }, []);

  const saveToCache = useCallback((data: InventoryRow[]) => {
    try {
      const cacheData: CachedData = { rows: data, timestamp: Date.now() };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (e) {
      console.warn("Cache save failed:", e);
    }
  }, []);

  const fetchInventory = useCallback(async (useCache = true) => {
    if (useCache) {
      const cached = loadFromCache();
      if (cached) {
        const age = Date.now() - cached.timestamp;
        setRows(cached.rows);
        setLastUpdated(new Date(cached.timestamp));
        setStale(age > STALE_TIME);
        setLoading(false);
        if (age <= STALE_TIME) return;
      }
    }

    try {
      const res = await fetch(DEFAULT_INVENTORY_PATH);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.arrayBuffer();
      const parsed = parseArrayBuffer(data);
      
      setRows(parsed);
      setError(null);
      setLastUpdated(new Date());
      setStale(false);
      saveToCache(parsed);
    } catch (err) {
      console.error("Inventory load failed:", err);
      if (rows.length === 0) {
        setError("Error loading inventory data.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadFromCache, parseArrayBuffer, saveToCache, setRows, setLoading, setStale, setError, setLastUpdated, setRefreshing, rows.length]);

  const refetch = useCallback(async () => {
    setRefreshing(true);
    await fetchInventory(false);
  }, [fetchInventory, setRefreshing]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    const interval = setInterval(() => {
      const lastUpdated = useInventoryStore.getState().lastUpdated;
      if (lastUpdated) {
        const age = Date.now() - lastUpdated.getTime();
        if (age > STALE_TIME) {
          setStale(true);
          fetchInventory(false);
        }
      }
    }, STALE_TIME);
    return () => clearInterval(interval);
  }, [fetchInventory, setStale]);

  return { refetch };
}
