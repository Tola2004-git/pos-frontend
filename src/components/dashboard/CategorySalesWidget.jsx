import { Category2 } from "iconsax-react";
import { WidgetCard, RowSkeleton } from "./DashboardPrimitives";

export function CategorySalesWidget({ loading, categorySales, t }) {
  return (
    <WidgetCard
      icon={
        <Category2
          size={20}
          color="currentColor"
          variant="Linear"
          style={{ animation: "float 3s ease-in-out infinite" }}
        />
      }
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
        <div className="thin-light-scrollbar flex flex-col gap-3 overflow-y-auto pr-1" style={{ maxHeight: "17rem" }}>
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
                    style={{ background: "var(--surface-tint-08)" }}
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
  );
}

export default CategorySalesWidget;
