import { Skeleton } from "./Skeleton";

export function SkeletonBackupRow({ index = 0 }) {
  const delay = `${index * 0.07}s`;
  const s = (w, h = 13, r = 5) => (
    <Skeleton width={w} height={h} borderRadius={r} style={{ animationDelay: delay }} />
  );

  return (
    <tr className="border-b border-white/5">
      <td className="px-4 py-3.5">{s(170)}</td>
      <td className="px-4 py-3.5">{s(70, 22, 20)}</td>
      <td className="px-4 py-3.5">{s(55)}</td>
      <td className="px-4 py-3.5">{s(90)}</td>
      <td className="px-4 py-3.5">{s(120)}</td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2 justify-start">
          <Skeleton width={26} height={26} borderRadius={8} style={{ animationDelay: delay }} />
          <Skeleton width={26} height={26} borderRadius={8} style={{ animationDelay: delay }} />
          <Skeleton width={26} height={26} borderRadius={8} style={{ animationDelay: delay }} />
        </div>
      </td>
    </tr>
  );
}

export function SkeletonBackupTable({ rows = 6 }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonBackupRow key={i} index={i} />
      ))}
    </>
  );
}
