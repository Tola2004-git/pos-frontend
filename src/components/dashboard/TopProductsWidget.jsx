import { Crown1 } from "iconsax-react";
import { WidgetCard, RowSkeleton } from "./DashboardPrimitives";

export function TopProductsWidget({ loading, topProducts, t }) {
  return (
    <WidgetCard
      icon={
        <Crown1
          size={20}
          color="currentColor"
          variant="Linear"
          style={{ animation: "float 3s ease-in-out infinite" }}
        />
      }
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
                background: "var(--surface-tint-05)",
                border: "1px solid var(--surface-tint-08)",
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
  );
}

export default TopProductsWidget;
