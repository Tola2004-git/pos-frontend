import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import apiClient from "../api/apiClient";

const LOW_STOCK_THRESHOLD_CACHE_KEY = "low_stock_threshold";
const DEFAULT_THRESHOLD = 10;
const POLL_INTERVAL_MS = 30000;

const LowStockContext = createContext(null);

function readCachedThreshold() {
  return (
    Number(localStorage.getItem(LOW_STOCK_THRESHOLD_CACHE_KEY)) ||
    DEFAULT_THRESHOLD
  );
}

export function LowStockProvider({ children }) {
  const [threshold, setThresholdState] = useState(readCachedThreshold);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const setThreshold = useCallback(
    async (next) => {
      const value = Number(next) || DEFAULT_THRESHOLD;
      try {
        const res = await apiClient.put("/settings/low-stock-threshold", {
          threshold: value,
        });
        applyThreshold(res.data.threshold);
      } catch (err) {
        console.error("Failed to save low stock threshold", err);
        throw err;
      }
    },
    [applyThreshold],
  );

  const fetchProducts = useCallback(async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const res = await apiClient.get("/products?per_page=1000");
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch products for low stock tracking", err);
    } finally {
      setLoading(false);
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
    () => products.filter((p) => Number(p.qty) <= threshold),
    [products, threshold],
  );

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
      // Full current low-stock list - always reflects real stock levels, so
      // dashboard widgets/counters stay correct regardless of which toast
      // popups the user has dismissed.
      lowStockProducts,
      // Same list minus anything the user dismissed from the toast stack -
      // only the popup notifications should use this one.
      toastLowStockProducts: visibleLowStockProducts,
      loading,
      dismissLowStock,
      refreshLowStockProducts: fetchProducts,
    }),
    [
      threshold,
      setThreshold,
      lowStockProducts,
      visibleLowStockProducts,
      loading,
      dismissLowStock,
      fetchProducts,
    ],
  );

  return (
    <LowStockContext.Provider value={value}>
      {children}
    </LowStockContext.Provider>
  );
}

export function useLowStock() {
  const ctx = useContext(LowStockContext);
  if (!ctx) {
    throw new Error("useLowStock must be used within a LowStockProvider");
  }
  return ctx;
}
