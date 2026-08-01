import { Chart2 } from "iconsax-react";
import { WidgetCard, CardSkeleton } from "./DashboardPrimitives";

export function SalesByCashierWidget({ loading, salesByCashier, t }) {
  return (
    <WidgetCard
      icon={
        <Chart2
          size={20}
          color="currentColor"
          variant="Linear"
          style={{ animation: "float 3s ease-in-out infinite" }}
        />
      }
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
                background: "var(--surface-tint-06)",
                border: "1px solid var(--surface-tint-10)",
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
  );
}

export default SalesByCashierWidget;
