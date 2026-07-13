import { Skeleton } from "./Skeleton";

export function SkeletonIngredientRow({ index = 0 }) {
  const delay = `${index * 0.07}s`;

  const centered = (children) => (
    <div style={{ display: "flex", justifyContent: "center" }}>{children}</div>
  );

  const s = (w, h = 13, r = 5) => (
    <Skeleton
      width={w}
      height={h}
      borderRadius={r}
      style={{ animationDelay: delay }}
    />
  );

  return (
    <tr style={{ height: "64px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <td style={{ padding: "12px 14px", textAlign: "center" }}>{centered(s(20))}</td>
      <td style={{ padding: "12px 14px" }}>{s(120)}</td>
      <td style={{ padding: "12px 14px", textAlign: "center" }}>
        {centered(<Skeleton width={70} height={22} borderRadius={20} style={{ animationDelay: delay }} />)}
      </td>
      <td style={{ padding: "12px 14px", textAlign: "center" }}>{centered(s(36))}</td>
      <td style={{ padding: "12px 14px", textAlign: "center" }}>{centered(s(40))}</td>
      <td style={{ padding: "12px 14px", textAlign: "center" }}>{centered(s(50))}</td>
      <td style={{ padding: "12px 14px", textAlign: "center" }}>{centered(s(90))}</td>
      <td style={{ padding: "12px 14px", textAlign: "center" }}>
        {centered(<Skeleton width={80} height={22} borderRadius={20} style={{ animationDelay: delay }} />)}
      </td>
      <td style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Skeleton width={32} height={32} borderRadius={8} style={{ animationDelay: delay }} />
          <Skeleton width={32} height={32} borderRadius={8} style={{ animationDelay: delay }} />
          <Skeleton width={32} height={32} borderRadius={8} style={{ animationDelay: delay }} />
        </div>
      </td>
    </tr>
  );
}

export function SkeletonIngredientTable({ rows = 8 }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonIngredientRow key={i} index={i} />
      ))}
    </>
  );
}

export function SkeletonIngredientModal() {
  const field = (labelW = 60, inputH = 40) => (
    <div style={{ marginBottom: "16px" }}>
      <Skeleton width={labelW} height={12} borderRadius={4} style={{ marginBottom: "8px" }} />
      <Skeleton width="100%" height={inputH} borderRadius={10} />
    </div>
  );

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
        <div style={{ gridColumn: "1 / -1" }}>{field(120)}</div>
        {field(70)}
        {field(50)}
        {field(90)}
        {field(110)}
        {field(80)}
      </div>
      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <Skeleton width="100%" height={44} borderRadius={12} style={{ flex: 1 }} />
        <Skeleton width="100%" height={44} borderRadius={12} style={{ flex: 1 }} />
      </div>
    </div>
  );
}
