import { Skeleton } from "./Skeleton";

export function SkeletonPromotion({ index = 0 }) {
  const delay = `${index * 0.07}s`;
  const cell = (children, align = "center") => (
    <td style={{ padding: "12px 14px", textAlign: align }}>{children}</td>
  );
  const s = (w, h = 18, r = 6) => (
    <Skeleton
      width={w}
      height={h}
      borderRadius={r}
      style={{ animationDelay: delay }}
    />
  );

  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", height: 56 }}>
      {cell(
        <div style={{ display: "flex", justifyContent: "center" }}>
          {s(28)}
        </div>,
      )}
      {cell(s("65%"), "left")}
      {cell(
        <div style={{ display: "flex", justifyContent: "center" }}>
          {s(32, 28, 8)}
        </div>,
      )}
      {cell(
        <div style={{ display: "flex", justifyContent: "center" }}>
          {s(64)}
        </div>,
      )}
      {cell(
        <div style={{ display: "flex", justifyContent: "center" }}>
          {s(80)}
        </div>,
      )}
      {cell(
        <div style={{ display: "flex", justifyContent: "center" }}>
          {s(90)}
        </div>,
      )}
      {cell(
        <div style={{ display: "flex", justifyContent: "center" }}>
          {s(90)}
        </div>,
      )}
      {cell(
        <div style={{ display: "flex", justifyContent: "center" }}>
          {s(60, 26, 999)}
        </div>,
      )}
      {cell(
        <div style={{ display: "flex", justifyContent: "center" }}>
          {s(52, 26, 999)}
        </div>,
      )}
      {cell(
        <div style={{ display: "flex", justifyContent: "center", gap: 16 }}>
          {s(28, 28, 8)}
          {s(28, 28, 8)}
        </div>,
      )}
    </tr>
  );
}

export function SkeletonProductPickerItem({ index = 0 }) {
  const delay = `${index * 0.06}s`;
  const s = (w, h = 14, r = 6) => (
    <Skeleton
      width={w}
      height={h}
      borderRadius={r}
      style={{ animationDelay: delay }}
    />
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        marginBottom: 8,
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08",
      }}
    >
      {s(16, 16, 4)}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 8,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {s("100%", "100%", 8)}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {s("65%", 14, 6)}
        <div style={{ height: 8 }} />
        {s("40%", 12, 6)}
      </div>
    </div>
  );
}

export function SkeletonCategoryChips({ count = 4 }) {
  const widths = ["72px", "98px", "84px", "64px", "80px"];
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            flexShrink: 0,
            padding: "8px 14px",
            borderRadius: 50,
            width: widths[i] || "80px",
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Skeleton
            width="70%"
            height={12}
            borderRadius={999}
            style={{ animationDelay: `${i * 0.06}s` }}
          />
        </div>
      ))}
    </>
  );
}

export function SkeletonPromotionTable({ rows = 8 }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonPromotion key={i} index={i} />
      ))}
    </>
  );
}

export function SkeletonProductPickerList({ rows = 6 }) {
  return Array.from({ length: rows }).map((_, i) => (
    <SkeletonProductPickerItem key={i} index={i} />
  ));
}
