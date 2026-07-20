import { Skeleton } from "./Skeleton";

export function SkeletonShiftRow({ index = 0 }) {
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
    <tr className="border-b border-white/5">
      <td className="px-4 py-3.5">{s(90)}</td>
      <td className="px-4 py-3.5">{s(110)}</td>
      <td className="px-4 py-3.5">{s(110)}</td>
      <td className="px-4 py-3.5">{s(60)}</td>
      <td className="px-4 py-3.5">{s(60)}</td>
      <td className="px-4 py-3.5">{s(60)}</td>
      <td className="px-4 py-3.5">
        <Skeleton
          width={72}
          height={22}
          borderRadius={20}
          style={{ animationDelay: delay }}
        />
      </td>
      <td className="px-4 py-3.5">
        <Skeleton
          width={80}
          height={22}
          borderRadius={20}
          style={{ animationDelay: delay }}
        />
      </td>
      <td className="px-4 py-3.5 text-right">
        <div className="flex justify-end">
          <Skeleton
            width={70}
            height={26}
            borderRadius={8}
            style={{ animationDelay: delay }}
          />
        </div>
      </td>
    </tr>
  );
}

export function SkeletonShiftTable({ rows = 8 }) {
  return (
    <>
      {Array.from({ length: rows }, (_, index) => (
        <SkeletonShiftRow key={index} index={index} />
      ))}
    </>
  );
}
