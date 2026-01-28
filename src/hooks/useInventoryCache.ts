// src/hooks/useInventoryCache.ts
import { useState, useEffect, useCallback, useRef } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  etag?: string;
}

interface CacheOptions {
  /** Time in milliseconds before cache is considered stale (default: 5 minutes) */
  staleTime?: number;
  /** Time in milliseconds before cache is completely invalid (default: 30 minutes) */
  cacheTime?: number;
  /** Key for localStorage persistence */
  persistKey?: string;
}

interface UseCacheResult<T> {
  data: T | null;
  isLoading: boolean;
  isStale: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
}

const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_CACHE_TIME = 30 * 60 * 1000; // 30 minutes

/**
 * Custom hook for caching data with stale-while-revalidate pattern
 */
export function useCache<T>(
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): UseCacheResult<T> {
  const {
    staleTime = DEFAULT_STALE_TIME,
    cacheTime = DEFAULT_CACHE_TIME,
    persistKey,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStale, setIsStale] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const cacheRef = useRef<CacheEntry<T> | null>(null);
  const fetchingRef = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (persistKey) {
      try {
        const stored = localStorage.getItem(persistKey);
        if (stored) {
          const parsed: CacheEntry<T> = JSON.parse(stored);
          const age = Date.now() - parsed.timestamp;

          // Only use if not completely expired
          if (age < cacheTime) {
            cacheRef.current = parsed;
            setData(parsed.data);
            setLastUpdated(new Date(parsed.timestamp));
            setIsStale(age > staleTime);
            setIsLoading(false);
          }
        }
      } catch (e) {
        console.warn("Failed to load cache from localStorage:", e);
      }
    }
  }, [persistKey, cacheTime, staleTime]);

  // Fetch function
  const fetchData = useCallback(async (force = false) => {
    // Prevent duplicate fetches
    if (fetchingRef.current && !force) return;

    const cache = cacheRef.current;
    const now = Date.now();

    // If we have fresh cache, don't fetch
    if (cache && !force) {
      const age = now - cache.timestamp;
      if (age < staleTime) {
        setIsLoading(false);
        return;
      }
    }

    fetchingRef.current = true;

    // If we have stale data, show it while fetching (stale-while-revalidate)
    if (cache) {
      setIsStale(true);
    } else {
      setIsLoading(true);
    }

    try {
      const result = await fetchFn();
      
      const entry: CacheEntry<T> = {
        data: result,
        timestamp: now,
      };

      cacheRef.current = entry;
      setData(result);
      setLastUpdated(new Date(now));
      setIsStale(false);
      setError(null);

      // Persist to localStorage
      if (persistKey) {
        try {
          localStorage.setItem(persistKey, JSON.stringify(entry));
        } catch (e) {
          console.warn("Failed to persist cache:", e);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Unknown error"));
      // Keep showing stale data on error
      if (!cache) {
        setData(null);
      }
    } finally {
      setIsLoading(false);
      fetchingRef.current = false;
    }
  }, [fetchFn, staleTime, persistKey]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Background revalidation interval
  useEffect(() => {
    const interval = setInterval(() => {
      const cache = cacheRef.current;
      if (cache) {
        const age = Date.now() - cache.timestamp;
        if (age > staleTime) {
          fetchData();
        }
      }
    }, staleTime);

    return () => clearInterval(interval);
  }, [staleTime, fetchData]);

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  return {
    data,
    isLoading,
    isStale,
    error,
    refetch,
    lastUpdated,
  };
}

/**
 * Hook specifically for caching inventory data with ArrayBuffer support
 */
export function useInventoryCache(url: string, options?: CacheOptions) {
  const fetchInventory = useCallback(async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    return response.arrayBuffer();
  }, [url]);

  return useCache(fetchInventory, {
    persistKey: `inventory-cache-${url}`,
    ...options,
  });
}

export default useCache;
