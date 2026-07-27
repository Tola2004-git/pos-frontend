import { Skeleton } from "./Skeleton";

export function SkeletonDailyExportRow({ index = 0 }) {
  const delay = `${index * 0.07}s`;
  const s = (w, h = 13, r = 5) => (
    <Skeleton width={w} height={h} borderRadius={r} style={{ animationDelay: delay }} />
  );

  return (
    <tr className="border-b border-white/5">
      <td className="px-4 py-3.5">{s(85)}</td>
      <td className="px-4 py-3.5">{s(30)}</td>
      <td className="px-4 py-3.5">{s(60)}</td>
      <td className="px-4 py-3.5">{s(110)}</td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2 justify-start">
          <Skeleton width={90} height={28} borderRadius={8} style={{ animationDelay: delay }} />
          <Skeleton width={18} height={18} borderRadius={6} style={{ animationDelay: delay }} />
        </div>
      </td>
    </tr>
  );
}

export function SkeletonDailyExportTable({ rows = 6 }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonDailyExportRow key={i} index={i} />
      ))}
    </>
  );
}
