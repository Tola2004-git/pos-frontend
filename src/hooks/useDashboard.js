import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchSalesByCashierApi,
  fetchSalesTrendApi,
  fetchOrdersApi,
} from "../api/ordersApi";
import { fetchShiftsApi } from "../api/shiftApi";
import { fetchProducts } from "../api/productApi";
import { promotionService } from "../api/promotionService";

function dateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const TREND_DAYS = 7;
const REFRESH_INTERVAL_MS = 60000;

function sumOrders(rows) {
  return (rows || []).reduce((sum, row) => sum + Number(row.orders_count || 0), 0);
}

export function useDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [salesByCashier, setSalesByCashier] = useState([]);
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [trend, setTrend] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [activePromotions, setActivePromotions] = useState([]);
  const isFirstLoad = useRef(true);

  const fetchDashboard = useCallback(async () => {
    // Only show the full-page skeleton on the very first load - background
    // refreshes shouldn't wipe already-visible data off the screen.
    if (isFirstLoad.current) setLoading(true);
    const days = Array.from({ length: TREND_DAYS }, (_, i) =>
      dateStr(TREND_DAYS - 1 - i),
    );
    const today = days[days.length - 1];

    try {
      const [trendRes, todayCashierRes, shiftsRes, ordersRes, productsRes, promotions] =
        await Promise.all([
          fetchSalesTrendApi({ dateFrom: days[0], dateTo: today }),
          fetchSalesByCashierApi({ dateFrom: today, dateTo: today }),
          fetchShiftsApi({ status: "pending_review", page: 1 }),
          fetchOrdersApi({
            search: "",
            statusFilter: "all",
            dateFrom: "",
            dateTo: "",
            page: 1,
          }),
          fetchProducts("?per_page=1"),
          promotionService.fetchPromotions(),
        ]);

      const byDate = new Map(
        (trendRes.data || []).map((row) => [row.date, Number(row.total_sales || 0)]),
      );
      const trendData = days.map((day) => ({
        date: day,
        total: byDate.get(day) || 0,
      }));

      setTrend(trendData);
      setSalesByCashier(todayCashierRes.data || []);
      setPendingReviewsCount(shiftsRes.data.total || 0);
      setRecentOrders((ordersRes.data.data || []).slice(0, 5));
      setTotalProducts(productsRes.data.total || 0);
      setActivePromotions(
        (promotions || []).filter((p) => p.status && !p.is_expired).slice(0, 5),
      );
      setError(false);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      setError(true);
    } finally {
      setLoading(false);
      isFirstLoad.current = false;
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const salesToday = trend.length ? trend[trend.length - 1].total : 0;
  const salesYesterday = trend.length > 1 ? trend[trend.length - 2].total : 0;
  const ordersToday = sumOrders(salesByCashier);

  return {
    loading,
    error,
    salesByCashier,
    salesToday,
    salesYesterday,
    ordersToday,
    pendingReviewsCount,
    recentOrders,
    trend,
    totalProducts,
    activePromotions,
    refetch: fetchDashboard,
  };
}

export default useDashboard;
