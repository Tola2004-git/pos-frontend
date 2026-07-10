import { Skeleton } from "./Skeleton";

export function SkeletonOrdersRow({ index = 0 }) {
  const delay = `${index * 0.07}s`;

  const s = (width, height = 13, borderRadius = 5) => (
    <Skeleton
      width={width}
      height={height}
      borderRadius={borderRadius}
      style={{ animationDelay: delay }}
    />
  );

  return (
    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <td style={{ padding: "12px 14px" }}>{s(20)}</td>
      <td style={{ padding: "12px 14px" }}>{s(100)}</td>
      <td style={{ padding: "12px 14px" }}>{s(110)}</td>
      <td style={{ padding: "12px 14px" }}>{s(40)}</td>
      <td style={{ padding: "12px 14px" }}>{s(60)}</td>
      <td style={{ padding: "12px 14px" }}>{s(90)}</td>
      <td style={{ padding: "12px 14px" }}>{s(90)}</td>
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
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Skeleton
            width={90}
            height={13}
            borderRadius={5}
            style={{ animationDelay: delay }}
          />
          <Skeleton
            width={70}
            height={13}
            borderRadius={5}
            style={{ animationDelay: delay }}
          />
        </div>
      </td>
      <td style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          <Skeleton
            width={28}
            height={28}
            borderRadius={8}
            style={{ animationDelay: delay }}
          />
          <Skeleton
            width={28}
            height={28}
            borderRadius={8}
            style={{ animationDelay: delay }}
          />
          <Skeleton
            width={28}
            height={28}
            borderRadius={8}
            style={{ animationDelay: delay }}
          />
        </div>
      </td>
    </tr>
  );
}

export function SkeletonOrdersTable({ rows = 8 }) {
  return (
    <>
      {Array.from({ length: rows }, (_, index) => (
        <SkeletonOrdersRow key={index} index={index} />
      ))}
    </>
  );
}
