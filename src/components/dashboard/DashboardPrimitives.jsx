import { TrendUp, TrendDown } from "iconsax-react";
import { glassCard } from "../../utils/styles";
import { Skeleton } from "../ui/Skeleton";

export function StatCard({ label, value, sub, color, StatIcon, onClick, loading, badge }) {
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
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
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

export function CardSkeleton({ minWidth }) {
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

export function RowSkeleton() {
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

export function TableCountSkeleton() {
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

export function WidgetCard({ icon, title, action, children }) {
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

export function TrendBadge({ current, previous, title, t, invert = false }) {
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
