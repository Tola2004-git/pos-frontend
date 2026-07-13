import { Skeleton } from "./Skeleton";

export function SkeletonProductRow({ index = 0 }) {
  const delay = `${index * 0.07}s`;
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
      <td style={{ padding: "12px 14px" }}>{s(20)}</td>
      <td style={{ padding: "12px 14px" }}>
        <Skeleton
          width={44}
          height={44}
          borderRadius={10}
          style={{ animationDelay: delay }}
        />
      </td>
      <td style={{ padding: "12px 14px" }}>{s(120)}</td>
      <td style={{ padding: "12px 14px" }}>
        <Skeleton
          width={70}
          height={22}
          borderRadius={20}
          style={{ animationDelay: delay }}
        />
      </td>
      <td style={{ padding: "12px 14px" }}>{s(60)}</td>
      <td style={{ padding: "12px 14px" }}>{s(28)}</td>
      <td style={{ padding: "12px 14px" }}>{s(50)}</td>
      <td style={{ padding: "12px 14px" }}>{s(80)}</td>
      <td style={{ padding: "12px 14px" }}>
        <Skeleton
          width={58}
          height={22}
          borderRadius={20}
          style={{ animationDelay: delay }}
        />
      </td>
      <td style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          <Skeleton
            width={54}
            height={28}
            borderRadius={8}
            style={{ animationDelay: delay }}
          />
          <Skeleton
            width={62}
            height={28}
            borderRadius={8}
            style={{ animationDelay: delay }}
          />
        </div>
      </td>
    </tr>
  );
}

export function SkeletonProductTable({ rows = 8 }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonProductRow key={i} index={i} />
      ))}
    </>
  );
}

export function SkeletonProductModal() {
  const field = (labelW = 60, inputH = 40) => (
    <div style={{ marginBottom: "16px" }}>
      <Skeleton
        width={labelW}
        height={12}
        borderRadius={4}
        style={{ marginBottom: "8px" }}
      />
      <Skeleton width="100%" height={inputH} borderRadius={10} />
    </div>
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Skeleton width={100} height={100} borderRadius={16} />
        <Skeleton
          width={120}
          height={10}
          borderRadius={4}
          style={{ marginTop: "8px" }}
        />
      </div>
      {field(100)}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <div>
          <Skeleton
            width={60}
            height={12}
            borderRadius={4}
            style={{ marginBottom: "8px" }}
          />
          <Skeleton width="100%" height={40} borderRadius={10} />
        </div>
        <div>
          <Skeleton
            width={50}
            height={12}
            borderRadius={4}
            style={{ marginBottom: "8px" }}
          />
          <Skeleton width="100%" height={40} borderRadius={10} />
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <div>
          <Skeleton
            width={30}
            height={12}
            borderRadius={4}
            style={{ marginBottom: "8px" }}
          />
          <Skeleton width="100%" height={40} borderRadius={10} />
        </div>
        <div>
          <Skeleton
            width={30}
            height={12}
            borderRadius={4}
            style={{ marginBottom: "8px" }}
          />
          <Skeleton width="100%" height={40} borderRadius={10} />
        </div>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              paddingTop: "8px",
            }}
          >
            <Skeleton width={50} height={14} borderRadius={4} />
            <Skeleton width={46} height={24} borderRadius={12} />
            <Skeleton width={50} height={14} borderRadius={4} />
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <Skeleton
          width="100%"
          height={44}
          borderRadius={12}
          style={{ flex: 1 }}
        />
        <Skeleton
          width="100%"
          height={44}
          borderRadius={12}
          style={{ flex: 1 }}
        />
      </div>
    </div>
  );
}

export function SkeletonCategoryList({ rows = 5 }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <Skeleton
            width={120}
            height={14}
            borderRadius={6}
            style={{ animationDelay: `${i * 0.07}s` }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Skeleton
              width={38}
              height={20}
              borderRadius={10}
              style={{ animationDelay: `${i * 0.07}s` }}
            />
            <Skeleton
              width={32}
              height={30}
              borderRadius={7}
              style={{ animationDelay: `${i * 0.07}s` }}
            />
            <Skeleton
              width={32}
              height={30}
              borderRadius={7}
              style={{ animationDelay: `${i * 0.07}s` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
