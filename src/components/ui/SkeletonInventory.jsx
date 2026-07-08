import { Skeleton } from "./Skeleton";

export function SkeletonInventoryRow({ index = 0 }) {
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
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <td style={{ padding: "12px 14px" }}>{s(20)}</td>
      <td style={{ padding: "12px 14px" }}>
        <Skeleton
          width={44}
          height={44}
          borderRadius={10}
          style={{ animationDelay: delay }}
        />
      </td>
      <td style={{ padding: "12px 14px" }}>{s(130)}</td>
      <td style={{ padding: "12px 14px" }}>
        <Skeleton
          width={72}
          height={22}
          borderRadius={20}
          style={{ animationDelay: delay }}
        />
      </td>
      <td style={{ padding: "12px 14px" }}>{s(65)}</td>
      <td style={{ padding: "12px 14px" }}>{s(30)}</td>
      <td style={{ padding: "12px 14px" }}>{s(85)}</td>
      <td style={{ padding: "12px 14px" }}>
        <Skeleton
          width={80}
          height={22}
          borderRadius={20}
          style={{ animationDelay: delay }}
        />
      </td>
      <td style={{ padding: "12px 14px" }}>
        <Skeleton
          width={36}
          height={36}
          borderRadius={8}
          style={{ animationDelay: delay }}
        />
      </td>
    </tr>
  );
}

export function SkeletonInventoryTable({ rows = 8 }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonInventoryRow key={i} index={i} />
      ))}
    </>
  );
}

export function SkeletonRestockModal() {
  const field = (labelW, inputH = 42) => (
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
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <Skeleton width={140} height={22} borderRadius={8} />
        <Skeleton width={36} height={36} borderRadius={50} />
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
            width={55}
            height={12}
            borderRadius={4}
            style={{ marginBottom: "8px" }}
          />
          <Skeleton width="100%" height={42} borderRadius={10} />
        </div>
        <div>
          <Skeleton
            width={70}
            height={12}
            borderRadius={4}
            style={{ marginBottom: "8px" }}
          />
          <Skeleton width="100%" height={42} borderRadius={10} />
        </div>
      </div>
      {field(120)}
      <div style={{ marginBottom: "24px" }}>
        <Skeleton
          width={40}
          height={12}
          borderRadius={4}
          style={{ marginBottom: "8px" }}
        />
        <Skeleton width="100%" height={80} borderRadius={10} />
      </div>
      <div style={{ display: "flex", gap: "12px" }}>
        <Skeleton
          width="100%"
          height={46}
          borderRadius={12}
          style={{ flex: 1 }}
        />
        <Skeleton
          width="100%"
          height={46}
          borderRadius={12}
          style={{ flex: 1 }}
        />
      </div>
    </div>
  );
}

export function SkeletonStockRow({ index = 0 }) {
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
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <td style={{ padding: "12px 14px" }}>{s(20)}</td> {/* # */}
      <td style={{ padding: "12px 14px" }}>{s(120)}</td> {/* Product */}
      <td style={{ padding: "12px 14px" }}>
        {" "}
        {/* Action badge */}
        <Skeleton
          width={72}
          height={24}
          borderRadius={20}
          style={{ animationDelay: delay }}
        />
      </td>
      <td style={{ padding: "12px 14px" }}>{s(30)}</td> {/* Qty */}
      <td style={{ padding: "12px 14px" }}>{s(30)}</td> {/* Before */}
      <td style={{ padding: "12px 14px" }}>{s(30)}</td> {/* After */}
      <td style={{ padding: "12px 14px" }}>{s(90)}</td> {/* Supplier */}
      <td style={{ padding: "12px 14px" }}>{s(110)}</td> {/* Note */}
      <td style={{ padding: "12px 14px" }}>{s(70)}</td> {/* By */}
      <td style={{ padding: "12px 14px" }}>
        {" "}
        {/* Date */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {s(70)} {s(55)}
        </div>
      </td>
    </tr>
  );
}

export function SkeletonStockTable({ rows = 10 }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonStockRow key={i} index={i} />
      ))}
    </>
  );
}
