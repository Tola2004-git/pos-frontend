import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchSalesByCashierApi,
  fetchSalesSummaryApi,
  fetchOrdersApi,
  fetchTopProductsApi,
  fetchCategorySalesApi,
  fetchProfitSummaryApi,
} from "../api/ordersApi";
import { fetchShiftsApi, fetchCashMovementsSummaryApi } from "../api/shiftApi";
import { fetchProducts } from "../api/productApi";
import { promotionService } from "../api/promotionService";

function dateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const REFRESH_INTERVAL_MS = 60000;

// Bucket keys expected back from the sales-summary trend series, one per
// period granularity - must mirror the backend's grouping windows
// (OrderController::resolvePeriodRanges) so every bucket gets a point even
// when it had zero sales, keeping the chart's x-axis evenly spaced.
function trendBucketDates(period) {
  const pad = (n) => String(n).padStart(2, "0");
  const toStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (period === "week") {
    const monday = new Date();
    const day = monday.getDay();
    monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
    return Array.from({ length: 8 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(d.getDate() - 7 * (7 - i));
      return toStr(d);
    });
  }
  if (period === "month") {
    const first = new Date();
    first.setDate(1);
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(first);
      d.setMonth(d.getMonth() - (5 - i));
      return toStr(d);
    });
  }
  if (period === "year") {
    const jan1 = new Date();
    jan1.setMonth(0, 1);
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(jan1);
      d.setFullYear(d.getFullYear() - (4 - i));
      return toStr(d);
    });
  }
  return Array.from({ length: 7 }, (_, i) => dateStr(6 - i));
}

// Unwraps a Promise.allSettled() result, falling back to `fallback` on
// rejection so one failing endpoint degrades its own widget instead of
// blanking the whole dashboard.
function settledValue(result, fallback) {
  return result.status === "fulfilled" ? result.value : fallback;
}

export function useDashboard(period = "day") {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [salesByCashier, setSalesByCashier] = useState([]);
  const [paymentMix, setPaymentMix] = useState({
    cashUsd: 0,
    cashKhr: 0,
    digital: 0,
  });
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
  const [trend, setTrend] = useState([]);
  const [salesCurrent, setSalesCurrent] = useState(0);
  const [salesPrevious, setSalesPrevious] = useState(0);
  const [ordersCurrent, setOrdersCurrent] = useState(0);
  const [refunds, setRefunds] = useState({ count: 0, total: 0 });
  const [totalProducts, setTotalProducts] = useState(0);
  const [activePromotions, setActivePromotions] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [profit, setProfit] = useState({
    revenue: 0,
    cogs: 0,
    profit: 0,
    marginPct: 0,
    productsWithoutRecipeCount: 0,
  });
  const [cashMovements, setCashMovements] = useState({
    cashInUsd: 0,
    cashOutUsd: 0,
    cashInKhr: 0,
    cashOutKhr: 0,
    netUsd: 0,
    netKhr: 0,
  });
  const isFirstLoad = useRef(true);

  const fetchDashboard = useCallback(async () => {
    // Only show the full-page skeleton on the very first load - background
    // refreshes and period switches shouldn't wipe already-visible data off
    // the screen.
    if (isFirstLoad.current) setLoading(true);
    const buckets = trendBucketDates(period);
    const periodStart = period === "day" ? dateStr(0) : buckets[buckets.length - 1];
    const today = dateStr(0);

    const results = await Promise.allSettled([
      fetchSalesSummaryApi({ period }),
      fetchSalesByCashierApi({ dateFrom: periodStart, dateTo: today }),
      fetchShiftsApi({ status: "pending_review", page: 1 }),
      fetchOrdersApi({
        search: "",
        statusFilter: "all",
        dateFrom: periodStart,
        dateTo: today,
        page: 1,
      }),
      fetchProducts("?per_page=1"),
      promotionService.fetchPromotions(),
      fetchTopProductsApi({ period }),
      fetchCategorySalesApi({ period }),
      fetchCashMovementsSummaryApi({ dateFrom: periodStart, dateTo: today }),
      fetchProfitSummaryApi({ period }),
    ]);

    const [
      summaryRes,
      cashierRes,
      shiftsRes,
      ordersRes,
      productsRes,
      promotions,
      topProductsRes,
      categorySalesRes,
      cashMovementsRes,
      profitRes,
    ] = results;

    const summary = settledValue(summaryRes, null)?.data;
    const byBucket = new Map(
      (summary?.trend || []).map((row) => [row.bucket, Number(row.total_sales || 0)]),
    );
    const trendData = buckets.map((bucket) => ({
      date: bucket,
      total: byBucket.get(bucket) || 0,
    }));

    setTrend(trendData);
    setSalesCurrent(summary?.current?.total_sales || 0);
    setSalesPrevious(summary?.previous?.total_sales || 0);
    setOrdersCurrent(summary?.current?.orders_count || 0);
    setRefunds({
      count: summary?.refunds?.count || 0,
      total: summary?.refunds?.total || 0,
    });

    const cashierRows = settledValue(cashierRes, null)?.data || [];
    setSalesByCashier(cashierRows);
    setPaymentMix(
      cashierRows.reduce(
        (acc, row) => ({
          cashUsd: acc.cashUsd + Number(row.cash_usd_total || 0),
          cashKhr: acc.cashKhr + Number(row.cash_khr_total || 0),
          digital: acc.digital + Number(row.digital_total || 0),
        }),
        { cashUsd: 0, cashKhr: 0, digital: 0 },
      ),
    );

    setPendingReviewsCount(settledValue(shiftsRes, null)?.data.total || 0);
    setRecentOrders((settledValue(ordersRes, null)?.data.data || []).slice(0, 5));
    setTotalProducts(settledValue(productsRes, null)?.data.total || 0);
    setActivePromotions(
      (settledValue(promotions, []) || []).filter((p) => p.status && !p.is_expired).slice(0, 5),
    );
    setTopProducts(settledValue(topProductsRes, null)?.data || []);
    setCategorySales(settledValue(categorySalesRes, null)?.data || []);

    const profitData = settledValue(profitRes, null)?.data;
    setProfit({
      revenue: profitData?.revenue || 0,
      cogs: profitData?.cogs || 0,
      profit: profitData?.profit || 0,
      marginPct: profitData?.margin_pct || 0,
      productsWithoutRecipeCount: profitData?.products_without_recipe_count || 0,
    });

    const movements = settledValue(cashMovementsRes, null)?.data;
    setCashMovements({
      cashInUsd: movements?.cash_in_usd || 0,
      cashOutUsd: movements?.cash_out_usd || 0,
      cashInKhr: movements?.cash_in_khr || 0,
      cashOutKhr: movements?.cash_out_khr || 0,
      netUsd: movements?.net_usd || 0,
      netKhr: movements?.net_khr || 0,
    });

    // Only surface the page-level error banner when the core sales summary
    // (the widget every other stat card derives its "today" number from)
    // failed to load - a single secondary widget failing degrades quietly.
    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length) {
      failures.forEach((f) => console.error("Failed to load dashboard data", f.reason));
    }
    setError(summaryRes.status === "rejected");

    setLoading(false);
    isFirstLoad.current = false;
  }, [period]);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  return {
    loading,
    error,
    salesByCashier,
    paymentMix,
    salesCurrent,
    salesPrevious,
    ordersCurrent,
    refunds,
    pendingReviewsCount,
    recentOrders,
    trend,
    totalProducts,
    activePromotions,
    topProducts,
    categorySales,
    cashMovements,
    profit,
    refetch: fetchDashboard,
  };
}

export default useDashboard;
