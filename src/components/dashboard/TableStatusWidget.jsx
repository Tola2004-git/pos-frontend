import { Grid3 } from "iconsax-react";
import { WidgetCard, TableCountSkeleton } from "./DashboardPrimitives";

export function TableStatusWidget({ tableLoading, tableCounts, t }) {
  return (
    <WidgetCard
      icon={
        <Grid3
          size={20}
          color="#fff"
          variant="Linear"
          style={{ animation: "float 3s ease-in-out infinite" }}
        />
      }
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
          ? Array.from({ length: 3 }).map((_, i) => <TableCountSkeleton key={i} />)
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
  );
}

export default TableStatusWidget;
