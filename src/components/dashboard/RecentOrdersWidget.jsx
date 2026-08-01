import { useNavigate } from "react-router-dom";
import { ReceiptText } from "iconsax-react";
import { getStatusStyle } from "../../utils/orderHelpers";
import { WidgetCard, RowSkeleton } from "./DashboardPrimitives";

export function RecentOrdersWidget({ loading, recentOrders, statusLabels, t }) {
  const navigate = useNavigate();

  return (
    <WidgetCard
      icon={
        <ReceiptText
          size={20}
          color="currentColor"
          variant="Linear"
          style={{ animation: "float 3s ease-in-out infinite" }}
        />
      }
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
                  background: "var(--surface-tint-05)",
                  border: "1px solid var(--surface-tint-08)",
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
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}

export default RecentOrdersWidget;
