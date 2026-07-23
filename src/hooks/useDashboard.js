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
import { fetchExpenseSummaryApi } from "../api/expenseApi";
import apiClient from "../api/apiClient";

const DEFAULT_EXCHANGE_RATE = 4100;

function dateStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const REFRESH_INTERVAL_MS = 60000;

function trendBucketDates(period) {
  const pad = (n) => String(n).padStart(2, "0");
  const toStr = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

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

// Mirrors OrderController::MAX_CUSTOM_RANGE_DAYS - keeps the frontend's
// bucket list in sync with what the backend actually queries, so a range
// wider than this never renders empty trailing buckets the API didn't return.
const MAX_CUSTOM_RANGE_DAYS = 366;

function toDateKey(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function mondayOf(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return d;
}

// Clamps a custom range to MAX_CUSTOM_RANGE_DAYS (anchored to dateTo), same
// as OrderController::resolveRange does server-side.
function clampCustomRange(dateFrom, dateTo) {
  const from = new Date(`${dateFrom}T00:00:00`);
  const to = new Date(`${dateTo}T00:00:00`);
  const spanDays = Math.round((to - from) / 86400000) + 1;
  if (spanDays <= MAX_CUSTOM_RANGE_DAYS) {
    return { from: dateFrom, to: dateTo };
  }
  const clampedFrom = new Date(to);
  clampedFrom.setDate(clampedFrom.getDate() - (MAX_CUSTOM_RANGE_DAYS - 1));
  return { from: toDateKey(clampedFrom), to: dateTo };
}

// Custom-range trend buckets scale their granularity with the span - day
// buckets for <=35 days, week buckets (Monday-keyed) for <=180 days, month
// buckets beyond that - mirroring OrderController::resolveRange's groupExpr
// selection so the frontend's bucket keys line up with the backend's rows.
function customBucketDates(dateFrom, dateTo) {
  const from = new Date(`${dateFrom}T00:00:00`);
  const to = new Date(`${dateTo}T00:00:00`);
  const spanDays = Math.round((to - from) / 86400000) + 1;

  if (spanDays <= 35) {
    const dates = [];
    const cur = new Date(from);
    while (cur <= to) {
      dates.push(toDateKey(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  }

  if (spanDays <= 180) {
    const dates = [];
    const cur = mondayOf(from);
    while (cur <= to) {
      dates.push(toDateKey(cur));
      cur.setDate(cur.getDate() + 7);
    }
    return dates;
  }

  const dates = [];
  const cur = new Date(from.getFullYear(), from.getMonth(), 1);
  while (cur <= to) {
    dates.push(toDateKey(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  return dates;
}

function settledValue(result, fallback) {
  return result.status === "fulfilled" ? result.value : fallback;
}

export function useDashboard(period = "day", isAdmin = false, customRange = null) {
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
    expensesUsd: 0,
    expensesKhr: 0,
    netProfit: 0,
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
    if (isFirstLoad.current) setLoading(true);
    const isCustom = period === "custom" && customRange?.from && customRange?.to;
    const clampedCustom = isCustom
      ? clampCustomRange(customRange.from, customRange.to)
      : null;
    const buckets = isCustom
      ? customBucketDates(clampedCustom.from, clampedCustom.to)
      : trendBucketDates(period);
    const periodStart = isCustom
      ? clampedCustom.from
      : period === "day"
        ? dateStr(0)
        : buckets[buckets.length - 1];
    const today = isCustom ? clampedCustom.to : dateStr(0);
    const rangeParams = isCustom
      ? { dateFrom: clampedCustom.from, dateTo: clampedCustom.to }
      : {};

    const results = await Promise.allSettled([
      fetchSalesSummaryApi({ period, ...rangeParams }),
      fetchSalesByCashierApi({ dateFrom: periodStart, dateTo: today }),
      fetchShiftsApi({ status: "pending_review", page: 1 }),
      fetchOrdersApi({
        search: "",
        statusFilter: "all",
        dateFrom: periodStart,
        dateTo: today,
        page: 1,
        perPage: 5,
      }),
      fetchProducts("?per_page=1"),
      promotionService.fetchPromotions(),
      fetchTopProductsApi({ period, ...rangeParams }),
      fetchCategorySalesApi({ period, ...rangeParams }),
      fetchCashMovementsSummaryApi({ dateFrom: periodStart, dateTo: today }),
      // Profit/COGS/margin and expense totals are admin-only on the backend -
      // skip them for cashiers so they don't generate a guaranteed 403 on
      // every refresh.
      isAdmin ? fetchProfitSummaryApi({ period, ...rangeParams }) : Promise.resolve(null),
      isAdmin
        ? fetchExpenseSummaryApi(period, rangeParams.dateFrom || "", rangeParams.dateTo || "")
        : Promise.resolve(null),
      // Cambodia runs on both USD and KHR side by side - expenses can be
      // recorded in either currency, so KHR expenses need this rate to fold
      // into a single USD net profit figure.
      isAdmin ? apiClient.get("/exchange-rates") : Promise.resolve(null),
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
      expensesRes,
      exchangeRateRes,
    ] = results;

    const summary = settledValue(summaryRes, null)?.data;
    const byBucket = new Map(
      (summary?.trend || []).map((row) => [
        row.bucket,
        Number(row.total_sales || 0),
      ]),
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
    setRecentOrders(settledValue(ordersRes, null)?.data.data || []);
    setTotalProducts(settledValue(productsRes, null)?.data.total || 0);
    setActivePromotions(
      (settledValue(promotions, []) || [])
        .filter((p) => p.status && !p.is_expired)
        .slice(0, 5),
    );
    setTopProducts(settledValue(topProductsRes, null)?.data || []);
    setCategorySales(settledValue(categorySalesRes, null)?.data || []);

    const profitData = isAdmin ? settledValue(profitRes, null)?.data : null;
    const expensesData = isAdmin ? settledValue(expensesRes, null)?.data : null;
    const exchangeRate = isAdmin
      ? settledValue(exchangeRateRes, null)?.data?.usd_to_khr || DEFAULT_EXCHANGE_RATE
      : DEFAULT_EXCHANGE_RATE;
    const grossProfit = profitData?.profit || 0;
    const expensesUsd = expensesData?.total_usd || 0;
    const expensesKhr = expensesData?.total_khr || 0;
    const netProfit = isAdmin
      ? grossProfit - (expensesUsd + expensesKhr / exchangeRate)
      : 0;
    setProfit({
      revenue: profitData?.revenue || 0,
      cogs: profitData?.cogs || 0,
      profit: grossProfit,
      marginPct: profitData?.margin_pct || 0,
      productsWithoutRecipeCount:
        profitData?.products_without_recipe_count || 0,
      expensesUsd,
      expensesKhr,
      netProfit,
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
      failures.forEach((f) =>
        console.error("Failed to load dashboard data", f.reason),
      );
    }
    setError(summaryRes.status === "rejected");

    setLoading(false);
    isFirstLoad.current = false;
  }, [period, isAdmin, customRange]);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, REFRESH_INTERVAL_MS);
    window.addEventListener("orders:refresh", fetchDashboard);

    return () => {
      clearInterval(interval);
      window.removeEventListener("orders:refresh", fetchDashboard);
    };
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
