import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  MoneyRecive,
  ReceiptText,
  BoxSearch,
  Wallet2,
  Chart2,
  Grid3,
  Box,
  TrendUp,
  TrendDown,
  TicketDiscount,
  Warning2,
  Crown1,
  Category2,
  MoneyChange,
  ArrowSwapHorizontal,
  DocumentDownload,
  ReceiptDiscount,
  Chart21,
  InfoCircle,
  Refresh2,
  CloseCircle,
  Printer,
} from "iconsax-react";
import Layout from "../components/layout/Layout";
import { glassCard, colors } from "../utils/styles";
import { useTranslations } from "../hooks/useTranslations";
import { useLowStock } from "../context/LowStockContext";
import { useDashboard, MAX_CUSTOM_RANGE_DAYS } from "../hooks/useDashboard";
import { useCashierShift } from "../hooks/useCashierShift";
import { getStatusStyle } from "../utils/orderHelpers";
import { formatDiscount, formatDate } from "../constants/promotionConstants";
import { Skeleton } from "../components/ui/Skeleton";
import SalesTrendChart from "../components/dashboard/SalesTrendChart";
import DateRangePicker from "../components/common/DateRangePicker";
import apiClient from "../api/apiClient";
import { fetchTableCounts } from "../api/tableApi";
import {
  generateDailyExportApi,
  downloadDailyExportApi,
} from "../api/dailyExportApi";
import { getCachedUser, setCachedUser } from "../utils/currentUserCache";

function StatCard({ label, value, sub, color, StatIcon, onClick, loading, badge }) {
  const IconComponent = StatIcon;
  const clickable = !!onClick;
  return (
    <div
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`relative p-5 rounded-2xl flex items-center gap-4 overflow-hidden transition-transform ${clickable ? "cursor-pointer hover:scale-[1.02]" : ""}`}
      style={glassCard}
    >
      {!loading && badge}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        // style={{ background: `${color}22` }}
      >
        <IconComponent
          size={34}
          color={color}
          variant="Linear"
          style={{ animation: "float 3s ease-in-out infinite" }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-white/60 text-xs m-0 mb-1 truncate">{label}</p>
        {loading ? (
          <Skeleton width={70} height={22} />
        ) : (
          <>
            <p className="text-2xl font-bold text-white m-0">{value}</p>
            {sub && (
              <p className="text-white/40 text-[0.68rem] m-0 mt-0.5 truncate">
                {sub}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CardSkeleton({ minWidth }) {
  return (
    <div
      className="rounded-[14px] px-4 py-3 flex-1"
      style={{
        minWidth,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <Skeleton width="50%" height={10} style={{ marginBottom: 8 }} />
      <Skeleton width="70%" height={20} style={{ marginBottom: 8 }} />
      <Skeleton width="40%" height={9} />
    </div>
  );
}

function RowSkeleton() {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-[12px] px-3 py-2.5"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="min-w-0 flex-1">
        <Skeleton width="55%" height={13} style={{ marginBottom: 6 }} />
        <Skeleton width="35%" height={10} />
      </div>
      <Skeleton width={54} height={20} borderRadius={999} />
    </div>
  );
}

function TableCountSkeleton() {
  return (
    <div
      className="rounded-[14px] px-3 py-3 flex flex-col items-center"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <Skeleton width={28} height={24} style={{ marginBottom: 8 }} />
      <Skeleton width={42} height={10} />
    </div>
  );
}

function WidgetCard({ icon, title, action, children }) {
  return (
    <div style={glassCard} className="rounded-[20px] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-base m-0 flex items-center gap-2">
          {icon}
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function TrendBadge({ current, previous, title, t, invert = false }) {
  const hasTrendData = current > 0 || previous > 0;
  if (!hasTrendData) return null;

  const isNewTrend = previous === 0 && current > 0;
  const trendPct = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  const trendUp = trendPct >= 0;
  const TrendIcon = trendUp ? TrendUp : TrendDown;
  const isGood = invert ? !trendUp : trendUp;
  const trendColor = isNewTrend
    ? invert
      ? "#e74c3c"
      : "#3498db"
    : isGood
      ? "#2ecc71"
      : "#e74c3c";
  const trendPctDisplay =
    Math.abs(trendPct) > 999 ? "999%+" : `${Math.abs(trendPct).toFixed(0)}%`;

  return (
    <div
      className="absolute -left-10 top-3 w-36 -rotate-45 flex items-center justify-center gap-1 py-0.5 text-[0.62rem] font-bold text-white shadow-md"
      style={{ background: trendColor }}
      title={title}
    >
      {isNewTrend ? (
        t.dashboardNewLabel
      ) : (
        <>
          <TrendIcon size={10} color="#fff" variant="Linear" />
          {trendPctDisplay}
        </>
      )}
    </div>
  );
}

const PERIODS = ["day", "week", "month", "year", "custom"];
const TREND_POINT_COUNTS = { day: 7, week: 8, month: 6, year: 5, custom: 7 };

function defaultCustomRange() {
  const fmt = (d) => d.toISOString().slice(0, 10);
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 6);
  return { from: fmt(from), to: fmt(to) };
}

function Dashboard() {
  const { t, lang } = useTranslations();
  const navigate = useNavigate();
  const [user, setUser] = useState(getCachedUser());
  const [period, setPeriod] = useState("day");
  const [customRange, setCustomRange] = useState(defaultCustomRange);
  const [tableCounts, setTableCounts] = useState({
    available: 0,
    occupied: 0,
    reserved: 0,
  });
  const [tableLoading, setTableLoading] = useState(true);
  const isAdmin = user?.role === "admin";
  const {
    lowStockProducts,
    loading: lowStockLoading,
    refreshLowStockProducts,
  } = useLowStock();
  const { shift: currentShift, loading: shiftLoading } = useCashierShift(!isAdmin);
  const {
    loading,
    error,
    customRangeClamped,
    salesByCashier,
    paymentMix,
    salesCurrent,
    salesPrevious,
    ordersCurrent,
    ordersPrevious,
    refunds,
    cancelledOrdersCount,
    pendingReviewsCount,
    recentOrders,
    trend,
    totalProducts,
    activePromotions,
    topProducts,
    categorySales,
    cashMovements,
    profit,
    exchangeRate,
    lastUpdated,
    refetch,
  } = useDashboard(period, isAdmin, customRange);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);

  const [showRateEditor, setShowRateEditor] = useState(false);
  const [tempRate, setTempRate] = useState("");
  const [savingRate, setSavingRate] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const PERIOD_LABELS = {
    day: t.periodDayLabel,
    week: t.periodWeekLabel,
    month: t.periodMonthLabel,
    year: t.periodYearLabel,
    custom: t.periodCustomLabel,
  };
  const SALES_LABELS = {
    day: t.dashboardTodaySalesLabel,
    week: t.dashboardWeekSalesLabel,
    month: t.dashboardMonthSalesLabel,
    year: t.dashboardYearSalesLabel,
    custom: t.dashboardCustomSalesLabel,
  };
  const ORDERS_LABELS = {
    day: t.dashboardTodayOrdersLabel,
    week: t.dashboardWeekOrdersLabel,
    month: t.dashboardMonthOrdersLabel,
    year: t.dashboardYearOrdersLabel,
    custom: t.dashboardCustomOrdersLabel,
  };
  const VS_PREVIOUS_LABELS = {
    day: t.dashboardVsYesterdayLabel,
    week: t.dashboardVsLastWeekLabel,
    month: t.dashboardVsLastMonthLabel,
    year: t.dashboardVsLastYearLabel,
    custom: t.dashboardVsCustomLabel,
  };
  const TREND_TITLES = {
    day: t.dashboardTrendTitleDay,
    week: t.dashboardTrendTitleWeek,
    month: t.dashboardTrendTitleMonth,
    year: t.dashboardTrendTitleYear,
    custom: t.dashboardTrendTitleCustom,
  };

  const STATUS_LABELS = {
    completed: t.statusCompleted,
    pending: t.statusPending,
    cancelled: t.statusCancelled,
    refunded: t.statusRefunded,
  };

  useEffect(() => {
    apiClient
      .get("/me")
      .then((res) => {
        setCachedUser(res.data);
        setUser(res.data);
      })
      .catch((err) => console.error("Failed to fetch user:", err));
    refreshLowStockProducts();
  }, [refreshLowStockProducts]);

  useEffect(() => {
    const loadTableCounts = () => {
      fetchTableCounts()
        .then((res) => {
          setTableCounts({
            available: res.data.available || 0,
            occupied: res.data.occupied || 0,
            reserved: res.data.reserved || 0,
          });
        })
        .catch((err) => console.error("Failed to fetch table counts:", err))
        .finally(() => setTableLoading(false));
    };

    loadTableCounts();
    const interval = setInterval(() => {
      if (!document.hidden) loadTableCounts();
    }, 30000);
    const handleVisibility = () => {
      if (!document.hidden) loadTableCounts();
    };

    window.addEventListener("tables:refresh", loadTableCounts);
    window.addEventListener("orders:refresh", loadTableCounts);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener("tables:refresh", loadTableCounts);
      window.removeEventListener("orders:refresh", loadTableCounts);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const handleGenerateAndDownloadExport = async () => {
    setExporting(true);
    setExportError(false);
    const today = new Date().toISOString().slice(0, 10);
    try {
      await generateDailyExportApi(today);
      const res = await downloadDailyExportApi(today);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `daily-export-${today}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate/download daily export:", err);
      setExportError(true);
    } finally {
      setExporting(false);
    }
  };

  const saveExchangeRate = async () => {
    const value = Number(tempRate);
    if (!value || value <= 0) return;
    setSavingRate(true);
    try {
      await apiClient.put("/exchange-rates", { rate: value });
      setShowRateEditor(false);
      refetch();
    } catch (err) {
      console.error("Failed to update exchange rate:", err);
    } finally {
      setSavingRate(false);
    }
  };

  const salesTrendBadge = !loading && (
    <TrendBadge
      current={salesCurrent}
      previous={salesPrevious}
      title={VS_PREVIOUS_LABELS[period]}
      t={t}
    />
  );
  const ordersTrendBadge = !loading && (
    <TrendBadge
      current={ordersCurrent}
      previous={ordersPrevious}
      title={VS_PREVIOUS_LABELS[period]}
      t={t}
    />
  );
  const refundsTrendBadge = !loading && (
    <TrendBadge
      current={refunds.total}
      previous={refunds.previousTotal}
      title={VS_PREVIOUS_LABELS[period]}
      t={t}
      invert
    />
  );

  const STAT_CARDS = [
    {
      key: "sales",
      label: SALES_LABELS[period],
      value: `$${salesCurrent.toFixed(2)}`,
      color: "#2ecc71",
      StatIcon: MoneyRecive,
      onClick: () => navigate("/orders"),
      badge: salesTrendBadge,
    },
    {
      key: "orders",
      label: ORDERS_LABELS[period],
      value: ordersCurrent,
      color: "#3498db",
      StatIcon: ReceiptText,
      onClick: () => navigate("/orders"),
      badge: ordersTrendBadge,
    },
    {
      key: "cancelled_orders",
      label: t.dashboardCancelledOrdersLabel,
      value: cancelledOrdersCount,
      color: "#e67e22",
      StatIcon: CloseCircle,
      onClick: () => navigate("/orders", { state: { statusFilter: "cancelled" } }),
    },
    {
      key: "low_stock",
      label: t.dashboardLowStockItemsLabel,
      value: lowStockProducts.length,
      color: "#f1c40f",
      StatIcon: BoxSearch,
      onClick: isAdmin
        ? () => navigate("/inventory", { state: { stockFilter: "low_stock" } })
        : undefined,
    },
    {
      key: "pending_reviews",
      label: t.dashboardPendingReviewsLabel,
      value: pendingReviewsCount,
      color: "#8b5cf6",
      StatIcon: Wallet2,
      onClick: isAdmin ? () => navigate("/shifts") : undefined,
    },
    {
      key: "total_products",
      label: t.dashboardTotalProductsLabel,
      value: totalProducts,
      color: "#1abc9c",
      StatIcon: Box,
      onClick: isAdmin ? () => navigate("/products") : undefined,
    },
    {
      key: "refunds",
      label: t.dashboardRefundsLabel,
      value: `$${refunds.total.toFixed(2)}`,
      sub:
        refunds.count > 0
          ? t.dashboardRefundsCountMsg.replace("{n}", refunds.count)
          : null,
      color: "#e74c3c",
      StatIcon: ReceiptDiscount,
      onClick: () => navigate("/orders"),
      badge: refundsTrendBadge,
    },
  ];

  return (
    <Layout>
      <div className="print-area">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-white font-bold text-2xl m-0">
            {t.welcome}
            {user?.name ? `, ${user.name}` : ""}
          </h2>
          {user?.role && (
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                color: isAdmin ? "#8b5cf6" : "#3498db",
                background: isAdmin ? "rgba(139,92,246,0.15)" : "rgba(52,152,219,0.15)",
              }}
              title={isAdmin ? t.dashboardAdminViewDesc : t.dashboardCashierViewDesc}
            >
              {isAdmin ? t.dashboardAdminViewBadge : t.dashboardCashierViewBadge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {lastUpdated && (
            <span className="text-white/40 text-xs whitespace-nowrap">
              {t.dashboardLastUpdatedMsg.replace(
                "{time}",
                lastUpdated.toLocaleTimeString(lang === "kh" ? "km-KH" : "en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              )}
            </span>
          )}
          <button
            onClick={() => window.print()}
            title={t.dashboardPrintAction}
            className="no-print w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={glassCard}
          >
            <Printer size={15} color="#fff" variant="Linear" />
          </button>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing || loading}
            title={t.dashboardRefreshAction}
            className="no-print w-8 h-8 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
            style={glassCard}
          >
            <Refresh2
              size={15}
              color="#fff"
              variant="Linear"
              className={refreshing ? "animate-spin" : ""}
            />
          </button>
          <div
            className="no-print flex items-center gap-1 p-1 rounded-full"
            style={glassCard}
          >
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={{
                  background: period === p ? "rgba(255,255,255,0.15)" : "transparent",
                  color: period === p ? "#fff" : "rgba(255,255,255,0.5)",
                }}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {!isAdmin && !shiftLoading && (
        <div
          className="rounded-2xl px-4 py-3 mb-5 flex items-center justify-between gap-3 flex-wrap"
          style={glassCard}
        >
          <div className="flex items-center gap-2">
            <Wallet2
              size={18}
              color={currentShift ? "#2ecc71" : "#f1c40f"}
              variant="Linear"
            />
            <span className="text-sm text-white/80">
              {currentShift
                ? t.dashboardShiftOpenSinceMsg
                    .replace(
                      "{time}",
                      new Date(currentShift.opened_at).toLocaleTimeString(
                        lang === "kh" ? "km-KH" : "en-US",
                        { hour: "2-digit", minute: "2-digit" },
                      ),
                    )
                    .replace(
                      "{usd}",
                      Number(currentShift.opening_cash_usd || 0).toFixed(2),
                    )
                : t.dashboardNoOpenShiftMsg}
            </span>
          </div>
          {!currentShift && (
            <button
              onClick={() => navigate("/cashier")}
              className="no-print text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
              style={{ color: "#f1c40f", background: "rgba(241,196,15,0.15)" }}
            >
              {t.dashboardGoToPosAction}
            </button>
          )}
        </div>
      )}

      {period === "custom" && (
        <div className="no-print mb-5 -mt-3" style={{glassCard}}>
          <DateRangePicker
            dateFrom={customRange.from}
            dateTo={customRange.to}
            onDateFromChange={(from) => setCustomRange((r) => ({ ...r, from }))}
            onDateToChange={(to) => setCustomRange((r) => ({ ...r, to }))}
            maxDate={new Date()}
            placeholder={t.selectDateRange}
          />
          {customRangeClamped && (
            <p className="text-[#f1c40f] text-xs mt-2 mb-0">
              {t.dashboardCustomRangeClampedMsg.replaceAll(
                "{days}",
                MAX_CUSTOM_RANGE_DAYS,
              )}
            </p>
          )}
        </div>
      )}

      {error && (
        <div
          className="no-print rounded-2xl p-4 mb-5 flex items-center justify-between gap-3 flex-wrap"
          style={{
            background: "rgba(231,76,60,0.12)",
            border: "1px solid rgba(231,76,60,0.3)",
          }}
        >
          <span className="flex items-center gap-2 text-sm text-white/80">
            <Warning2
              size={18}
              color="#e74c3c"
              variant="Linear"
              style={{ animation: "float 3s ease-in-out infinite" }}
            />
            {t.dashboardLoadErrorMsg}
          </span>
          <button
            onClick={refetch}
            className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
            style={{
              color: "#e74c3c",
              background: "rgba(231,76,60,0.18)",
            }}
          >
            {t.dashboardRetryAction}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-5">
        {STAT_CARDS.map((s) => (
          <StatCard
            key={s.key}
            label={s.label}
            value={s.value}
            sub={s.sub}
            color={s.color}
            StatIcon={s.StatIcon}
            onClick={s.onClick}
            badge={s.badge}
            loading={s.key === "low_stock" ? lowStockLoading : loading}
          />
        ))}
      </div>

      <div style={glassCard} className="rounded-[20px] p-5 mb-4">
        <h3 className="text-white font-bold text-base m-0 mb-4 flex items-center gap-2">
          <Chart2
            size={20}
            color="#fff"
            variant="Linear"
            style={{ animation: "float 3s ease-in-out infinite" }}
          />
          {TREND_TITLES[period]}
        </h3>
        {loading ? (
          <div>
            <Skeleton width="100%" height={160} borderRadius={12} />
            <div className="flex mt-2">
              {Array.from({ length: TREND_POINT_COUNTS[period] }).map((_, i) => (
                <div key={i} className="flex-1 flex justify-center">
                  <Skeleton width={24} height={9} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <SalesTrendChart
            data={trend}
            lang={lang}
            period={period}
            emptyLabel={t.noSalesInRangeMsg}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <WidgetCard
          icon={<Chart2
            size={20}
            color="#fff"
            variant="Linear"
            style={{ animation: "float 3s ease-in-out infinite" }}
          />}
          title={t.salesByCashierTitle}
        >
          {loading ? (
            <div className="flex gap-3 flex-wrap">
              {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} minWidth="160px" />
              ))}
            </div>
          ) : salesByCashier.length === 0 ? (
            <p className="text-white/50 text-sm m-0">{t.noSalesInRangeMsg}</p>
          ) : (
            <div className="flex gap-3 flex-wrap">
              {salesByCashier.map((row) => (
                <div
                  key={row.user_id}
                  className="rounded-[14px] px-4 py-3 flex-1"
                  style={{
                    minWidth: "160px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div className="text-white/60 text-xs mb-1">{row.name}</div>
                  <div className="text-white font-bold text-lg">
                    ${Number(row.total_sales || 0).toFixed(2)}
                  </div>
                  <div className="text-white/40 text-[0.72rem] mt-1">
                    {row.orders_count}{" "}
                    {row.orders_count === 1 ? t.orderSingular : t.orderPlural}
                  </div>
                </div>
              ))}
            </div>
          )}
        </WidgetCard>

        <WidgetCard
          icon={<Grid3
              size={20}
              color="#fff"
              variant="Linear"
              style={{ animation: "float 3s ease-in-out infinite" }}
            />}
          title={t.dashboardTableStatusTitle}
          action={
            !tableLoading && (
              <span className="text-xs font-semibold text-white/50">
                {t.dashboardTableTotalMsg.replace(
                  "{n}",
                  tableCounts.available + tableCounts.occupied + tableCounts.reserved,
                )}
              </span>
            )
          }
        >
          <div className="grid grid-cols-3 gap-3">
            {tableLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <TableCountSkeleton key={i} />
                ))
              : [
                  {
                    label: t.tableStatAvailable,
                    value: tableCounts.available,
                    color: "#2ecc71",
                  },
                  {
                    label: t.tableStatOccupied,
                    value: tableCounts.occupied,
                    color: "#e74c3c",
                  },
                  {
                    label: t.tableStatReserved,
                    value: tableCounts.reserved,
                    color: "#f1c40f",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-[14px] px-3 py-3 text-center"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div className="text-2xl font-bold" style={{ color: s.color }}>
                      {s.value}
                    </div>
                    <div className="text-white/60 text-xs mt-1">{s.label}</div>
                  </div>
                ))}
          </div>
        </WidgetCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <WidgetCard
          icon={<ReceiptText
              size={20}
              color="#fff"
              variant="Linear"
              style={{ animation: "float 3s ease-in-out infinite" }}
            />}
          title={t.dashboardRecentOrdersTitle}
          action={
            <button
              onClick={() => navigate("/orders")}
              className="no-print text-xs font-semibold text-white/60 hover:text-white transition-colors"
            >
              {t.dashboardViewAllAction}
            </button>
          }
        >
          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <RowSkeleton key={i} />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-white/50 text-sm m-0">{t.noOrdersFound}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {recentOrders.map((order) => {
                const st = getStatusStyle(order.status);
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-3 rounded-[12px] px-3 py-2.5"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="min-w-0">
                      <div className="text-white text-sm font-semibold truncate">
                        {order.customer_name || t.walkIn}
                      </div>
                      <div className="text-white/40 text-xs truncate">
                        {order.order_number}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        ${Number(order.total || 0).toFixed(2)}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[0.7rem] font-semibold whitespace-nowrap"
                        style={{ color: st.color, background: st.bg }}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </WidgetCard>

        <WidgetCard
          icon={<BoxSearch
              size={20}
              color="#fff"
              variant="Linear"
              style={{ animation: "float 3s ease-in-out infinite" }}
            />}
          title={t.dashboardLowStockTitle}
          action={
            isAdmin && (
              <button
                onClick={() =>
                  navigate("/inventory", { state: { stockFilter: "low_stock" } })
                }
                className="no-print text-xs font-semibold text-white/60 hover:text-white transition-colors"
              >
                {t.dashboardViewAllAction}
              </button>
            )
          }
        >
          {lowStockLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <RowSkeleton key={i} />
              ))}
            </div>
          ) : lowStockProducts.length === 0 ? (
            <p className="text-white/50 text-sm m-0">
              {t.dashboardAllStockedUpMsg}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {lowStockProducts.slice(0, 5).map((p) => {
                const isOutOfStock = Number(p.qty) <= 0;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-[12px] px-3 py-2.5"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: `1px solid ${isOutOfStock ? "rgba(231,76,60,0.3)" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    <span
                      className="text-white text-sm truncate"
                      style={{ color: colors.whiteFull }}
                    >
                      {p.name}
                    </span>
                    <span
                      className="font-semibold text-sm whitespace-nowrap"
                      style={{ color: isOutOfStock ? "#e74c3c" : "#f1c40f" }}
                    >
                      {isOutOfStock
                        ? t.stockFilterOutOfStock
                        : `${p.qty} ${t.itemsUnitLabel}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </WidgetCard>
      </div>

      {isAdmin && (
      <div style={glassCard} className="rounded-[20px] p-5 mt-4">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h3 className="text-white font-bold text-base m-0 flex items-center gap-2">
            <Chart21
              size={20}
              color="#fff"
              variant="Linear"
              style={{ animation: "float 3s ease-in-out infinite" }}
            />
            {t.dashboardProfitTitle}
          </h3>
          <button
            onClick={() => {
              setTempRate(String(exchangeRate));
              setShowRateEditor(true);
            }}
            className="no-print text-xs font-semibold text-white/60 hover:text-white transition-colors"
          >
            {t.dashboardExchangeRateMsg.replace(
              "{n}",
              Number(exchangeRate).toLocaleString(
                lang === "kh" ? "km-KH" : "en-US",
              ),
            )}
          </button>
          {showRateEditor &&
            createPortal(
              <div
                className="no-print fixed inset-0 z-[10000] flex items-center justify-center p-6"
                style={{...glassCard }}
                onClick={() => setShowRateEditor(false)}
              >
                <div
                  style={glassCard}
                  className="w-full max-w-[320px] rounded-2xl p-5 text-white border border-white/15"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-sm font-bold m-0 mb-3">
                    {t.dashboardSetExchangeRateMsg}
                  </h3>
                  <input
                    type="number"
                    min="1"
                    autoFocus
                    value={tempRate}
                    onChange={(e) => setTempRate(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 mb-3 text-sm text-white bg-white/10 border border-white/20 outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowRateEditor(false)}
                      className="flex-1 py-2 rounded-lg text-sm font-semibold bg-white/10 text-white hover:bg-white/15 transition-colors"
                    >
                      {t.closeAction}
                    </button>
                    <button
                      onClick={saveExchangeRate}
                      disabled={savingRate}
                      className="btn-shine-blue flex-1 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
                    >
                      {savingRate ? t.savingAction : t.saveAction}
                    </button>
                  </div>
                </div>
              </div>,
              document.body,
            )}
        </div>
        {loading ? (
          <div className="flex gap-3 flex-wrap">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} minWidth="140px" />
            ))}
          </div>
        ) : (
          <>
            <div className="flex gap-3 flex-wrap">
              <div
                className="rounded-[14px] px-4 py-3 flex-1"
                style={{
                  minWidth: "140px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="text-white/60 text-xs mb-1">{t.dashboardRevenueLabel}</div>
                <div className="text-white font-bold text-lg">
                  ${Number(profit.revenue || 0).toFixed(2)}
                </div>
              </div>
              <div
                className="rounded-[14px] px-4 py-3 flex-1"
                style={{
                  minWidth: "140px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="text-white/60 text-xs mb-1">{t.dashboardCogsLabel}</div>
                <div className="text-[#e74c3c] font-bold text-lg">
                  ${Number(profit.cogs || 0).toFixed(2)}
                </div>
              </div>
              <div
                className="rounded-[14px] px-4 py-3 flex-1"
                style={{
                  minWidth: "140px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="text-white/60 text-xs mb-1">{t.dashboardProfitLabel}</div>
                <div className="text-[#2ecc71] font-bold text-lg">
                  ${Number(profit.profit || 0).toFixed(2)}
                </div>
              </div>
              <div
                className="rounded-[14px] px-4 py-3 flex-1"
                style={{
                  minWidth: "140px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="text-white/60 text-xs mb-1">{t.dashboardMarginLabel}</div>
                <div className="text-white font-bold text-lg">
                  {Number(profit.marginPct || 0).toFixed(1)}%
                </div>
              </div>
              <div
                className="rounded-[14px] px-4 py-3 flex-1"
                style={{
                  minWidth: "140px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="text-white/60 text-xs mb-1">{t.dashboardExpensesLabel}</div>
                <div className="text-[#e74c3c] font-bold text-lg">
                  ${Number(profit.expensesUsd || 0).toFixed(2)}
                </div>
                {profit.expensesKhr > 0 && (
                  <div className="text-white/40 text-[0.72rem] mt-1">
                    ៛
                    {Number(profit.expensesKhr || 0).toLocaleString(
                      lang === "kh" ? "km-KH" : "en-US",
                    )}
                  </div>
                )}
              </div>
              <div
                className="rounded-[14px] px-4 py-3 flex-1"
                style={{
                  minWidth: "140px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="text-white/60 text-xs mb-1">{t.dashboardNetProfitLabel}</div>
                <div
                  className="font-bold text-lg"
                  style={{ color: profit.netProfit >= 0 ? "#2ecc71" : "#e74c3c" }}
                >
                  ${Number(profit.netProfit || 0).toFixed(2)}
                </div>
              </div>
            </div>
            {profit.productsWithoutRecipeCount > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <InfoCircle size={16} color="#f1c40f" variant="Linear" />
                <span className="text-[#f1c40f] text-xs">
                  {t.dashboardProfitApproxMsg.replace(
                    "{n}",
                    profit.productsWithoutRecipeCount,
                  )}
                </span>
              </div>
            )}
          </>
        )}
      </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <WidgetCard
          icon={<Crown1
              size={20}
              color="#fff"
              variant="Linear"
              style={{ animation: "float 3s ease-in-out infinite" }}
            />}
          title={t.dashboardTopProductsTitle}
        >
          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <RowSkeleton key={i} />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <p className="text-white/50 text-sm m-0">{t.dashboardNoTopProductsMsg}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {topProducts.map((p, i) => (
                <div
                  key={p.product_id}
                  className="flex items-center justify-between gap-3 rounded-[12px] px-3 py-2.5"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="text-white/40 text-xs font-semibold w-4 flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-white text-sm truncate">{p.product_name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-white/40 text-xs whitespace-nowrap">
                      {p.quantity_sold} {t.itemsUnitLabel}
                    </span>
                    <span className="text-[#2ecc71] font-semibold text-sm whitespace-nowrap">
                      ${Number(p.revenue || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </WidgetCard>

        <WidgetCard
          icon={<Category2
              size={20}
              color="#fff"
              variant="Linear"
              style={{ animation: "float 3s ease-in-out infinite" }}
            />}
          title={t.dashboardCategorySalesTitle}
        >
          {loading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <RowSkeleton key={i} />
              ))}
            </div>
          ) : categorySales.length === 0 ? (
            <p className="text-white/50 text-sm m-0">{t.dashboardNoCategorySalesMsg}</p>
          ) : (
            <div
              className="flex flex-col gap-3 overflow-y-auto pr-1"
              style={{ maxHeight: "17rem" }}
            >
              {(() => {
                const maxRevenue = Number(categorySales[0]?.revenue) || 0;
                return categorySales.map((c) => {
                  const revenue = Number(c.revenue) || 0;
                  const pct = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
                  return (
                    <div key={c.category_id ?? "uncategorized"}>
                      <div className="flex items-center justify-between gap-3 mb-1.5">
                        <span className="text-white text-sm truncate">
                          {c.category_name || t.dashboardUncategorizedLabel}
                        </span>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-white/40 text-xs whitespace-nowrap">
                            {c.quantity_sold} {t.itemsUnitLabel}
                          </span>
                          <span className="text-[#2ecc71] font-semibold text-sm whitespace-nowrap">
                            ${revenue.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.08)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(pct, revenue > 0 ? 2 : 0)}%`,
                            background: "#3498db",
                          }}
                        />
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </WidgetCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <WidgetCard
          icon={<MoneyChange
              size={20}
              color="#fff"
              variant="Linear"
              style={{ animation: "float 3s ease-in-out infinite" }}
            />}
          title={t.dashboardPaymentMixTitle}
        >
          {loading ? (
            <div className="flex gap-3 flex-wrap">
              {Array.from({ length: 2 }).map((_, i) => (
                <CardSkeleton key={i} minWidth="160px" />
              ))}
            </div>
          ) : paymentMix.cashUsd === 0 && paymentMix.cashKhr === 0 && paymentMix.digital === 0 ? (
            <p className="text-white/50 text-sm m-0">{t.noSalesInRangeMsg}</p>
          ) : (
            <>
              {(() => {
                const cashUsdEquiv =
                  Number(paymentMix.cashUsd || 0) +
                  Number(paymentMix.cashKhr || 0) / exchangeRate;
                const digitalUsdEquiv = Number(paymentMix.digital || 0);
                const mixTotal = cashUsdEquiv + digitalUsdEquiv;
                const cashPct = mixTotal > 0 ? (cashUsdEquiv / mixTotal) * 100 : 50;
                const digitalPct = 100 - cashPct;
                return (
                  <div className="mb-3">
                    <div
                      className="h-3 rounded-full overflow-hidden flex"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                    >
                      {cashPct > 0 && (
                        <div
                          style={{
                            width: `${cashPct}%`,
                            background: "#3498db",
                            marginRight: digitalPct > 0 ? "2px" : 0,
                          }}
                        />
                      )}
                      {digitalPct > 0 && (
                        <div
                          style={{ width: `${digitalPct}%`, background: "#1abc9c" }}
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="flex items-center gap-1.5 text-white/60 text-xs">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: "#3498db" }}
                        />
                        {t.dashboardCashLabel} · {cashPct.toFixed(0)}%
                      </span>
                      <span className="flex items-center gap-1.5 text-white/60 text-xs">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: "#1abc9c" }}
                        />
                        {t.dashboardDigitalLabel} · {digitalPct.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })()}
              <div className="flex gap-3 flex-wrap">
                <div
                  className="rounded-[14px] px-4 py-3 flex-1"
                  style={{
                    minWidth: "160px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div className="text-white/60 text-xs mb-1">{t.dashboardCashLabel}</div>
                  <div className="text-white font-bold text-lg">
                    ${Number(paymentMix.cashUsd || 0).toFixed(2)}
                  </div>
                  {paymentMix.cashKhr > 0 && (
                    <div className="text-white/40 text-[0.72rem] mt-1">
                      ៛
                      {Number(paymentMix.cashKhr || 0).toLocaleString(
                        lang === "kh" ? "km-KH" : "en-US",
                      )}
                    </div>
                  )}
                </div>
                <div
                  className="rounded-[14px] px-4 py-3 flex-1"
                  style={{
                    minWidth: "160px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <div className="text-white/60 text-xs mb-1">{t.dashboardDigitalLabel}</div>
                  <div className="text-white font-bold text-lg">
                    ${Number(paymentMix.digital || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            </>
          )}
        </WidgetCard>

        <WidgetCard
          icon={<ArrowSwapHorizontal
              size={20}
              color="#fff"
              variant="Linear"
              style={{ animation: "float 3s ease-in-out infinite" }}
            />}
          title={t.dashboardCashMovementsTitle}
        >
          {loading ? (
            <div className="flex gap-3 flex-wrap">
              {Array.from({ length: 2 }).map((_, i) => (
                <CardSkeleton key={i} minWidth="160px" />
              ))}
            </div>
          ) : cashMovements.cashInUsd === 0 && cashMovements.cashOutUsd === 0 ? (
            <p className="text-white/50 text-sm m-0">{t.dashboardNoCashMovementsMsg}</p>
          ) : (
            <div className="flex gap-3 flex-wrap">
              <div
                className="rounded-[14px] px-4 py-3 flex-1"
                style={{
                  minWidth: "140px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="text-white/60 text-xs mb-1">{t.dashboardCashInLabel}</div>
                <div className="text-[#2ecc71] font-bold text-lg">
                  +${Number(cashMovements.cashInUsd || 0).toFixed(2)}
                </div>
              </div>
              <div
                className="rounded-[14px] px-4 py-3 flex-1"
                style={{
                  minWidth: "140px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="text-white/60 text-xs mb-1">{t.dashboardCashOutLabel}</div>
                <div className="text-[#e74c3c] font-bold text-lg">
                  -${Number(cashMovements.cashOutUsd || 0).toFixed(2)}
                </div>
              </div>
              <div
                className="rounded-[14px] px-4 py-3 flex-1"
                style={{
                  minWidth: "140px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="text-white/60 text-xs mb-1">{t.dashboardNetCashLabel}</div>
                <div className="text-white font-bold text-lg">
                  ${Number(cashMovements.netUsd || 0).toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </WidgetCard>
      </div>

      {isAdmin && (
        <div style={glassCard} className="no-print rounded-[20px] p-5 mt-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <DocumentDownload
                size={20}
                color="#fff"
                variant="Linear"
                style={{ animation: "float 3s ease-in-out infinite" }}
              />
              <div>
                <h3 className="text-white font-bold text-base m-0">
                  {t.dashboardDailyExportTitle}
                </h3>
                <p className="text-white/50 text-xs m-0 mt-0.5">
                  {t.dashboardDailyExportDesc}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => navigate("/daily-exports")}
                className="no-print text-xs font-semibold text-white/60 hover:text-white transition-colors"
              >
                {t.dashboardViewAllAction}
              </button>
              <button
                onClick={handleGenerateAndDownloadExport}
                disabled={exporting}
                className="text-xs font-semibold px-4 py-2 rounded-full transition-colors"
                style={{
                  color: "#1abc9c",
                  background: "rgba(26,188,156,0.15)",
                  opacity: exporting ? 0.6 : 1,
                  cursor: exporting ? "not-allowed" : "pointer",
                }}
              >
                {exporting
                  ? t.dashboardGeneratingExportAction
                  : t.dashboardGenerateExportAction}
              </button>
            </div>
          </div>
          {exportError && (
            <p className="text-[#e74c3c] text-xs mt-3 mb-0">{t.dashboardExportFailedMsg}</p>
          )}
        </div>
      )}

      <div style={glassCard} className="rounded-[20px] p-5 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-base m-0 flex items-center gap-2">
            <TicketDiscount
              size={20}
              color="#fff"
              variant="Linear"
              style={{ animation: "float 3s ease-in-out infinite" }}
            />
            {t.dashboardActivePromotionsTitle}
          </h3>
          <button
            onClick={() => navigate("/promotions")}
            className="no-print text-xs font-semibold text-white/60 hover:text-white transition-colors"
          >
            {t.dashboardViewAllAction}
          </button>
        </div>
        {loading ? (
          <div className="flex gap-3 flex-wrap">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} minWidth="180px" />
            ))}
          </div>
        ) : activePromotions.length === 0 ? (
          <p className="text-white/50 text-sm m-0">
            {t.dashboardNoActivePromotionsMsg}
          </p>
        ) : (
          <div className="flex gap-3 flex-wrap">
            {activePromotions.map((promo) => (
              <div
                key={promo.id}
                className="rounded-[14px] px-4 py-3 flex-1"
                style={{
                  minWidth: "180px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <div className="text-white font-semibold text-sm truncate">
                  {promo.name}
                </div>
                <div className="text-[#8b5cf6] font-bold text-lg">
                  {formatDiscount(promo.type, promo.value)}
                </div>
                <div className="text-white/40 text-[0.72rem] mt-1">
                  {t.endDateLabel}: {formatDate(promo.end_date)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
