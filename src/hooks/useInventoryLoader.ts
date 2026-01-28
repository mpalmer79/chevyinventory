import { useEffect, useCallback, useRef } from "react";
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
  const setRows = useInventoryStore((s) => s.setRows);
  const setLoading = useInventoryStore((s) => s.setLoading);
  const setStale = useInventoryStore((s) => s.setStale);
  const setError = useInventoryStore((s) => s.setError);
  const setLastUpdated = useInventoryStore((s) => s.setLastUpdated);
  const setRefreshing = useInventoryStore((s) => s.setRefreshing);
  
  const hasFetched = useRef(false);

  const parseArrayBuffer = useCallback((data: ArrayBuffer): InventoryRow[] => {
    const workbook = XLSX.read(data, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error("No sheets found");
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) throw new Error("Worksheet not found");

    // Parse with headers - this automatically skips the header row
    const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

    return rawData
      .filter((row) => row["Stock Number"] != null && String(row["Stock Number"]).trim() !== "")
      .map((row) => ({
        "Stock Number": String(row["Stock Number"] ?? ""),
        Year: Number(row["Year"]) || 0,
        Make: String(row["Make"] ?? ""),
        Model: String(row["Model"] ?? ""),
        "Exterior Color": String(row["Exterior Color"] ?? ""),
        Trim: String(row["Trim"] ?? ""),
        "Model Number": String(row["Model Number"] ?? ""),
        Cylinders: Number(row["Cylinders"]) || 0,
        Age: Number(row["Age"]) || 0,
        MSRP: Number(row["MSRP"]) || 0,
        Status: String(row["Status"] ?? ""),
        VIN: String(row["VIN"] ?? ""),
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
      setError("Error loading inventory data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadFromCache, parseArrayBuffer, saveToCache, setRows, setLoading, setStale, setError, setLastUpdated, setRefreshing]);

  const refetch = useCallback(async () => {
    setRefreshing(true);
    await fetchInventory(false);
  }, [fetchInventory, setRefreshing]);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    const interval = setInterval(() => {
      const lastUpdated = useInventoryStore.getState().lastUpdated;
      if (lastUpdated) {
        const age = Date.now() - lastUpdated.getTime();
        if (age > STALE_TIME) {
          setStale(true);
        }
      }
    }, STALE_TIME);
    return () => clearInterval(interval);
  }, [setStale]);

  return { refetch };
}
