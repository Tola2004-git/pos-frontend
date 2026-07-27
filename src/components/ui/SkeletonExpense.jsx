import { Skeleton } from "./Skeleton";

export function SkeletonExpenseRow({ index = 0 }) {
  const delay = `${index * 0.07}s`;
  const s = (w, h = 13, r = 5) => (
    <Skeleton width={w} height={h} borderRadius={r} style={{ animationDelay: delay }} />
  );

  return (
    <tr className="border-b border-white/5">
      <td className="px-4 py-3.5">{s(16)}</td>
      <td className="px-4 py-3.5">{s(140)}</td>
      <td className="px-4 py-3.5">
        <Skeleton width={80} height={22} borderRadius={20} style={{ animationDelay: delay }} />
      </td>
      <td className="px-4 py-3.5">{s(70)}</td>
      <td className="px-4 py-3.5">{s(80)}</td>
      <td className="px-4 py-3.5">{s(90)}</td>
      <td className="px-4 py-3.5">
        <div className="flex gap-2 justify-start">
          <Skeleton width={18} height={18} borderRadius={6} style={{ animationDelay: delay }} />
          <Skeleton width={18} height={18} borderRadius={6} style={{ animationDelay: delay }} />
        </div>
      </td>
    </tr>
  );
}

export function SkeletonExpenseTable({ rows = 8 }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonExpenseRow key={i} index={i} />
      ))}
    </>
  );
}
