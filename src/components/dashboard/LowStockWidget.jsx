import { useNavigate } from "react-router-dom";
import { BoxSearch } from "iconsax-react";
import { colors } from "../../utils/styles";
import { WidgetCard, RowSkeleton } from "./DashboardPrimitives";

export function LowStockWidget({ lowStockLoading, lowStockProducts, isAdmin, t }) {
  const navigate = useNavigate();

  return (
    <WidgetCard
      icon={
        <BoxSearch
          size={20}
          color="currentColor"
          variant="Linear"
          style={{ animation: "float 3s ease-in-out infinite" }}
        />
      }
      title={t.dashboardLowStockTitle}
      action={
        isAdmin && (
          <button
            onClick={() => navigate("/inventory", { state: { stockFilter: "low_stock" } })}
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
        <p className="text-white/50 text-sm m-0">{t.dashboardAllStockedUpMsg}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {lowStockProducts.slice(0, 5).map((p) => {
            const isOutOfStock = Number(p.qty) <= 0;
            return (
              <div
                key={p.id}
                className="flex items-center justify-between gap-3 rounded-[12px] px-3 py-2.5"
                style={{
                  background: "var(--surface-tint-05)",
                  border: `1px solid ${isOutOfStock ? "rgba(231,76,60,0.3)" : "var(--surface-tint-08)"}`,
                }}
              >
                <span className="text-white text-sm truncate" style={{ color: colors.whiteFull }}>
                  {p.name}
                </span>
                <span
                  className="font-semibold text-sm whitespace-nowrap"
                  style={{ color: isOutOfStock ? "#e74c3c" : "#f1c40f" }}
                >
                  {isOutOfStock ? t.stockFilterOutOfStock : `${p.qty} ${t.itemsUnitLabel}`}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </WidgetCard>
  );
}

export default LowStockWidget;
