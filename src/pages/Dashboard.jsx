import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoneyRecive,
  ReceiptText,
  BoxSearch,
  Wallet2,
  Chart2,
  Box,
  Warning2,
  ReceiptDiscount,
  Refresh2,
  CloseCircle,
  Printer,
} from "iconsax-react";
import Layout from "../components/layout/Layout";
import { glassCard } from "../utils/styles";
import { useTranslations } from "../hooks/useTranslations";
import { useLowStock } from "../context/LowStockContext";
import { useDashboard, MAX_CUSTOM_RANGE_DAYS } from "../hooks/useDashboard";
import { useCashierShift } from "../hooks/useCashierShift";
import { Skeleton } from "../components/ui/Skeleton";
import SalesTrendChart from "../components/dashboard/SalesTrendChart";
import { StatCard, TrendBadge } from "../components/dashboard/DashboardPrimitives";
import SalesByCashierWidget from "../components/dashboard/SalesByCashierWidget";
import TableStatusWidget from "../components/dashboard/TableStatusWidget";
import RecentOrdersWidget from "../components/dashboard/RecentOrdersWidget";
import LowStockWidget from "../components/dashboard/LowStockWidget";
import ProfitMarginWidget from "../components/dashboard/ProfitMarginWidget";
import TopProductsWidget from "../components/dashboard/TopProductsWidget";
import CategorySalesWidget from "../components/dashboard/CategorySalesWidget";
import PaymentMixWidget from "../components/dashboard/PaymentMixWidget";
import CashMovementsWidget from "../components/dashboard/CashMovementsWidget";
import DailyExportWidget from "../components/dashboard/DailyExportWidget";
import ActivePromotionsWidget from "../components/dashboard/ActivePromotionsWidget";
import SecurityAlertBanner from "../components/dashboard/SecurityAlertBanner";
import DateRangePicker from "../components/common/DateRangePicker";
import apiClient from "../api/apiClient";
import { fetchTableCounts } from "../api/tableApi";
import { getCachedUser, setCachedUser } from "../utils/currentUserCache";

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
            <Printer size={15} color="currentColor" variant="Linear" className="text-white" />
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
              color="currentColor"
              variant="Linear"
              className={`text-white ${refreshing ? "animate-spin" : ""}`}
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
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  period === p ? "text-white" : "text-white/50"
                }`}
                style={{
                  background: period === p ? "var(--surface-tint-15)" : "transparent",
                }}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isAdmin && <SecurityAlertBanner t={t} />}

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
        <div className="no-print mb-5 -mt-3" style={glassCard}>
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
            color="currentColor"
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
        <SalesByCashierWidget loading={loading} salesByCashier={salesByCashier} t={t} />
        <TableStatusWidget tableLoading={tableLoading} tableCounts={tableCounts} t={t} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RecentOrdersWidget
          loading={loading}
          recentOrders={recentOrders}
          statusLabels={STATUS_LABELS}
          t={t}
        />
        <LowStockWidget
          lowStockLoading={lowStockLoading}
          lowStockProducts={lowStockProducts}
          isAdmin={isAdmin}
          t={t}
        />
      </div>

      {isAdmin && (
        <ProfitMarginWidget
          loading={loading}
          profit={profit}
          exchangeRate={exchangeRate}
          lang={lang}
          t={t}
          refetch={refetch}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <TopProductsWidget loading={loading} topProducts={topProducts} t={t} />
        <CategorySalesWidget loading={loading} categorySales={categorySales} t={t} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <PaymentMixWidget
          loading={loading}
          paymentMix={paymentMix}
          exchangeRate={exchangeRate}
          lang={lang}
          t={t}
        />
        <CashMovementsWidget loading={loading} cashMovements={cashMovements} t={t} />
      </div>

      {isAdmin && <DailyExportWidget t={t} />}

      <ActivePromotionsWidget loading={loading} activePromotions={activePromotions} t={t} />
      </div>
    </Layout>
  );
}

export default Dashboard;
