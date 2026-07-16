import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import apiClient from "../api/apiClient";

// Cache key only - the backend (`settings` table, via /settings/low-stock-threshold)
// is the source of truth so every device/session (admin desktop, cashier
// terminal, ...) agrees on the same threshold. Without this, each browser
// used to fall back to its own default the moment it didn't match whichever
// machine last saved a value in localStorage.
const LOW_STOCK_THRESHOLD_CACHE_KEY = "low_stock_threshold";
const DEFAULT_THRESHOLD = 10;
const POLL_INTERVAL_MS = 30000;

const LowStockContext = createContext(null);

function readCachedThreshold() {
  return Number(localStorage.getItem(LOW_STOCK_THRESHOLD_CACHE_KEY)) || DEFAULT_THRESHOLD;
}

export function LowStockProvider({ children }) {
  // Paint instantly from the last-known local value, then reconcile with
  // the server as soon as fetchThreshold() below resolves.
  const [threshold, setThresholdState] = useState(readCachedThreshold);
  const [products, setProducts] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(() => new Set());

  const applyThreshold = useCallback((value) => {
    const numeric = Number(value) || DEFAULT_THRESHOLD;
    localStorage.setItem(LOW_STOCK_THRESHOLD_CACHE_KEY, String(numeric));
    setThresholdState(numeric);
  }, []);

  const fetchThreshold = useCallback(async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const res = await apiClient.get("/settings/low-stock-threshold");
      applyThreshold(res.data.threshold);
    } catch (err) {
      console.error("Failed to fetch low stock threshold", err);
    }
  }, [applyThreshold]);

  // Admin-only write (route is role:admin-gated server-side); updates the
  // shared setting so every other session picks it up on its next poll.
  const setThreshold = useCallback(async (next) => {
    const value = Number(next) || DEFAULT_THRESHOLD;
    try {
      const res = await apiClient.put("/settings/low-stock-threshold", { threshold: value });
      applyThreshold(res.data.threshold);
    } catch (err) {
      console.error("Failed to save low stock threshold", err);
      throw err;
    }
  }, [applyThreshold]);

  const fetchProducts = useCallback(async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const res = await apiClient.get("/products?per_page=1000");
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch products for low stock tracking", err);
    }
  }, []);

  useEffect(() => {
    fetchThreshold();
    fetchProducts();
    const interval = setInterval(() => {
      fetchThreshold();
      fetchProducts();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchThreshold, fetchProducts]);

  const lowStockProducts = useMemo(
    () => products.filter((p) => Number(p.qty) > 0 && Number(p.qty) <= threshold),
    [products, threshold],
  );

  // Let a dismissed item alert again if it drops back into low stock later.
  useEffect(() => {
    const lowStockIds = new Set(lowStockProducts.map((p) => p.id));
    setDismissedIds((prev) => {
      const next = new Set([...prev].filter((id) => lowStockIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [lowStockProducts]);

  const visibleLowStockProducts = useMemo(
    () => lowStockProducts.filter((p) => !dismissedIds.has(p.id)),
    [lowStockProducts, dismissedIds],
  );

  const dismissLowStock = useCallback((productId) => {
    setDismissedIds((prev) => new Set(prev).add(productId));
  }, []);

  const value = useMemo(
    () => ({
      threshold,
      setThreshold,
      lowStockProducts: visibleLowStockProducts,
      dismissLowStock,
      refreshLowStockProducts: fetchProducts,
    }),
    [threshold, setThreshold, visibleLowStockProducts, dismissLowStock, fetchProducts],
  );

  return (
    <LowStockContext.Provider value={value}>{children}</LowStockContext.Provider>
  );
}

export function useLowStock() {
  const ctx = useContext(LowStockContext);
  if (!ctx) {
    throw new Error("useLowStock must be used within a LowStockProvider");
  }
  return ctx;
}
