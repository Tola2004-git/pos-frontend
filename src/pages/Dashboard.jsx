import { useState, useEffect } from "react";
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
} from "iconsax-react";
import Layout from "../components/layout/Layout";
import { glassCard, colors } from "../utils/styles";
import { useTranslations } from "../hooks/useTranslations";
import { useLowStock } from "../context/LowStockContext";
import { useDashboard } from "../hooks/useDashboard";
import { getStatusStyle } from "../utils/orderHelpers";
import { formatDiscount, formatDate } from "../constants/promotionConstants";
import { Skeleton } from "../components/ui/Skeleton";
import SalesTrendChart from "../components/dashboard/SalesTrendChart";
import apiClient from "../api/apiClient";
import { fetchTables } from "../api/tableApi";

function StatCard({ label, value, color, StatIcon, onClick, loading, badge }) {
  const IconComponent = StatIcon;
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      className="p-5 rounded-2xl flex items-center gap-4 cursor-pointer transition-transform hover:scale-[1.02]"
      style={glassCard}
    >
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
      <div className="min-w-0">
        <p className="text-white/60 text-xs m-0 mb-1 truncate">{label}</p>
        {loading ? (
          <Skeleton width={70} height={22} />
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-white m-0">{value}</p>
            {badge}
          </div>
        )}
      </div>
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

function Dashboard() {
  const { t, lang } = useTranslations();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tableCounts, setTableCounts] = useState({
    available: 0,
    occupied: 0,
    reserved: 0,
  });
  const {
    lowStockProducts,
    loading: lowStockLoading,
    refreshLowStockProducts,
  } = useLowStock();
  const {
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
    refetch,
  } = useDashboard();

  const STATUS_LABELS = {
    completed: t.statusCompleted,
    pending: t.statusPending,
    cancelled: t.statusCancelled,
    refunded: t.statusRefunded,
  };

  useEffect(() => {
    apiClient
      .get("/me")
      .then((res) => setUser(res.data))
      .catch((err) => console.error("Failed to fetch user:", err));

    // LowStockProvider mounts app-wide before login, so its first fetch runs
    // without a token and never resolves the loading flag. Force a fresh
    // fetch now that we know a token exists (Dashboard is a protected route),
    // instead of waiting on the provider's next 30s poll tick.
    refreshLowStockProducts();
  }, [refreshLowStockProducts]);

  useEffect(() => {
    const loadTableCounts = () => {
      fetchTables()
        .then((res) => {
          const tables = res.data || [];
          setTableCounts({
            available: tables.filter((tb) => tb.status === "available").length,
            occupied: tables.filter((tb) => tb.status === "occupied").length,
            reserved: tables.filter((tb) => tb.status === "reserved").length,
          });
        })
        .catch((err) => console.error("Failed to fetch tables:", err));
    };

    loadTableCounts();
    const interval = setInterval(loadTableCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  const hasTrendData = salesToday > 0 || salesYesterday > 0;
  const isNewTrend = salesYesterday === 0 && salesToday > 0;
  const trendPct = salesYesterday > 0
    ? ((salesToday - salesYesterday) / salesYesterday) * 100
    : 0;
  const trendUp = trendPct >= 0;
  const TrendIcon = trendUp ? TrendUp : TrendDown;
  const trendColor = isNewTrend ? "#3498db" : trendUp ? "#2ecc71" : "#e74c3c";
  const trendBadge = !loading && hasTrendData && (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[0.7rem] font-semibold"
      style={{
        color: trendColor,
        background: `${trendColor}26`,
      }}
      title={t.dashboardVsYesterdayLabel}
    >
      {isNewTrend ? (
        t.dashboardNewLabel
      ) : (
        <>
          <TrendIcon size={12} color={trendColor} variant="Linear" />
          {Math.abs(trendPct).toFixed(0)}%
        </>
      )}
    </span>
  );

  const STAT_CARDS = [
    {
      key: "sales",
      label: t.dashboardTodaySalesLabel,
      value: `$${salesToday.toFixed(2)}`,
      color: "#2ecc71",
      StatIcon: MoneyRecive,
      onClick: () => navigate("/orders"),
      badge: trendBadge,
    },
    {
      key: "orders",
      label: t.dashboardTodayOrdersLabel,
      value: ordersToday,
      color: "#3498db",
      StatIcon: ReceiptText,
      onClick: () => navigate("/orders"),
    },
    {
      key: "low_stock",
      label: t.dashboardLowStockItemsLabel,
      value: lowStockProducts.length,
      color: "#f1c40f",
      StatIcon: BoxSearch,
      onClick: () => navigate("/inventory"),
    },
    {
      key: "pending_reviews",
      label: t.dashboardPendingReviewsLabel,
      value: pendingReviewsCount,
      color: "#8b5cf6",
      StatIcon: Wallet2,
      onClick: () => navigate("/shifts"),
    },
    {
      key: "total_products",
      label: t.dashboardTotalProductsLabel,
      value: totalProducts,
      color: "#1abc9c",
      StatIcon: Box,
      onClick: () => navigate("/products"),
    },
  ];

  return (
    <Layout>
      <h2 className="text-white font-bold text-2xl m-0 mb-6">
        {t.welcome}
        {user?.name ? `, ${user.name}` : ""}
      </h2>

      {error && (
        <div
          className="rounded-2xl p-4 mb-5 flex items-center justify-between gap-3 flex-wrap"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-5">
        {STAT_CARDS.map((s) => (
          <StatCard
            key={s.key}
            label={s.label}
            value={s.value}
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
          {t.dashboardSalesTrendTitle}
        </h3>
        {loading ? (
          <Skeleton width="100%" height={140} borderRadius={12} />
        ) : (
          <SalesTrendChart
            data={trend}
            lang={lang}
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
              <Skeleton width="100%" height={70} borderRadius={14} />
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
        >
          <div className="grid grid-cols-3 gap-3">
            {[
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
              className="text-xs font-semibold text-white/60 hover:text-white transition-colors"
            >
              {t.dashboardViewAllAction}
            </button>
          }
        >
          {loading ? (
            <Skeleton width="100%" height={140} borderRadius={12} />
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
            <button
              onClick={() => navigate("/inventory")}
              className="text-xs font-semibold text-white/60 hover:text-white transition-colors"
            >
              {t.dashboardViewAllAction}
            </button>
          }
        >
          {lowStockProducts.length === 0 ? (
            <p className="text-white/50 text-sm m-0">
              {t.dashboardAllStockedUpMsg}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {lowStockProducts.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between gap-3 rounded-[12px] px-3 py-2.5"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <span
                    className="text-white text-sm truncate"
                    style={{ color: colors.whiteFull }}
                  >
                    {p.name}
                  </span>
                  <span className="text-[#f1c40f] font-semibold text-sm whitespace-nowrap">
                    {p.qty} {t.itemsUnitLabel}
                  </span>
                </div>
              ))}
            </div>
          )}
        </WidgetCard>
      </div>

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
            className="text-xs font-semibold text-white/60 hover:text-white transition-colors"
          >
            {t.dashboardViewAllAction}
          </button>
        </div>
        {loading ? (
          <Skeleton width="100%" height={70} borderRadius={14} />
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
    </Layout>
  );
}

export default Dashboard;
