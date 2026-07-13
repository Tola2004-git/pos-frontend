import { Skeleton, SkeletonCell } from "./Skeleton";

export function SkeletonRow({ index = 0 }) {
  const delay = `${index * 0.08}s`;
  const cell = (w, h = 14, radius = 6) => (
    <Skeleton
      width={w}
      height={h}
      borderRadius={radius}
      style={{ animationDelay: delay }}
    />
  );

  return (
    <tr style={{ height: "56px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <SkeletonCell>{cell(20)}</SkeletonCell>
      <SkeletonCell>{cell(40, 40, 50)}</SkeletonCell>
      <SkeletonCell>{cell(110)}</SkeletonCell>
      <SkeletonCell>{cell(160)}</SkeletonCell>
      <SkeletonCell>{cell(60, 22, 20)}</SkeletonCell>
      <SkeletonCell>{cell(80)}</SkeletonCell>
      <SkeletonCell>{cell(80)}</SkeletonCell>
      <SkeletonCell>
        <div style={{ display: "flex", gap: "8px" }}>
          <Skeleton
            width={62}
            height={30}
            borderRadius={8}
            style={{ animationDelay: delay }}
          />
          <Skeleton
            width={74}
            height={30}
            borderRadius={8}
            style={{ animationDelay: delay }}
          />
        </div>
      </SkeletonCell>
    </tr>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonRow key={i} index={i} />
      ))}
    </>
  );
}

export function SkeletonModal() {
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
        <Skeleton width={80} height={80} borderRadius={50} />
        <Skeleton
          width={100}
          height={10}
          borderRadius={4}
          style={{ marginTop: "8px" }}
        />
      </div>
      {field(70)}
      {field(40)}
      {field(60)}
      <div style={{ display: "flex", gap: "4px", marginBottom: "16px" }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton
            key={i}
            width="100%"
            height={4}
            borderRadius={2}
            style={{ flex: 1 }}
          />
        ))}
      </div>
      {field(30, 40)}
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
