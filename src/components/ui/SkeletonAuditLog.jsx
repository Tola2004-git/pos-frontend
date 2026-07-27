import { Skeleton } from "./Skeleton";

export function SkeletonAuditLogRow({ index = 0 }) {
  const delay = `${index * 0.07}s`;
  const s = (w, h = 13, r = 5) => (
    <Skeleton width={w} height={h} borderRadius={r} style={{ animationDelay: delay }} />
  );

  return (
    <tr className="border-b border-white/5">
      <td className="px-4 py-3.5">{s(110)}</td>
      <td className="px-4 py-3.5">{s(100, 22, 20)}</td>
      <td className="px-4 py-3.5">{s(220)}</td>
      <td className="px-4 py-3.5">{s(130)}</td>
    </tr>
  );
}

export function SkeletonAuditLogTable({ rows = 8 }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonAuditLogRow key={i} index={i} />
      ))}
    </>
  );
}
