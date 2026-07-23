import {
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const LINE_COLOR = "#2ecc71";
const CHART_HEIGHT = 160;

function bucketLabel(dateStr, locale, period) {
  const date = new Date(dateStr);
  if (period === "week" || period === "custom") {
    return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
  }
  if (period === "month") {
    return date.toLocaleDateString(locale, { month: "short", year: "2-digit" });
  }
  if (period === "year") {
    return date.toLocaleDateString(locale, { year: "numeric" });
  }
  return date.toLocaleDateString(locale, { weekday: "short" });
}
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { total } = payload[0].payload;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs font-semibold text-white"
      style={{
        background: "rgba(20,28,35,0.95)",
        border: "1px solid rgba(255,255,255,0.15)",
      }}
    >
      ${total.toFixed(2)}
    </div>
  );
}

function makeTodayDot(lastIndex) {
  return function TodayDot({ cx, cy, index }) {
    const isToday = index === lastIndex;
    return (
      <circle
        cx={cx}
        cy={cy}
        r={isToday ? 5 : 3.5}
        fill={isToday ? LINE_COLOR : "#1a1a2e"}
        stroke={LINE_COLOR}
        strokeWidth={2}
        style={
          isToday
            ? { filter: `drop-shadow(0 0 5px ${LINE_COLOR}99)` }
            : undefined
        }
      />
    );
  };
}

export default function SalesTrendChart({
  data,
  lang,
  emptyLabel,
  period = "day",
}) {
  const hasSales = data.some((d) => d.total > 0);
  if (!hasSales) {
    return <p className="text-white/50 text-sm m-0">{emptyLabel}</p>;
  }

  const locale = lang === "kh" ? "km-KH" : "en-US";
  const chartData = data.map((d) => ({
    ...d,
    label: bucketLabel(d.date, locale, period),
  }));

  return (
    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
      <AreaChart
        data={chartData}
        margin={{ top: 12, right: 8, left: 8, bottom: 0 }}
      >
        <defs>
          <linearGradient id="salesTrendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={LINE_COLOR} stopOpacity={0.35} />
            <stop offset="100%" stopColor={LINE_COLOR} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
        <XAxis
          dataKey="label"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
          padding={{ left: 12, right: 12 }}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: "rgba(255,255,255,0.2)", strokeDasharray: "3 3" }}
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke={LINE_COLOR}
          strokeWidth={2.5}
          fill="url(#salesTrendFill)"
          dot={makeTodayDot(chartData.length - 1)}
          activeDot={{ r: 6, fill: LINE_COLOR, stroke: LINE_COLOR }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
