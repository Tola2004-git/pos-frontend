import { ArrowSwapHorizontal } from "iconsax-react";
import { WidgetCard, CardSkeleton } from "./DashboardPrimitives";

export function CashMovementsWidget({ loading, cashMovements, t }) {
  return (
    <WidgetCard
      icon={
        <ArrowSwapHorizontal
          size={20}
          color="#fff"
          variant="Linear"
          style={{ animation: "float 3s ease-in-out infinite" }}
        />
      }
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
  );
}

export default CashMovementsWidget;
