import { Skeleton } from "../ui/Skeleton";
import { glassCard } from "../../utils/styles";

export default function SkeletonTable({ delay = 0 }) {
  const style = { animationDelay: `${delay}s` };

  return (
    <div
      style={{
        ...glassCard,
        position: "relative",
        borderRadius: "20px",
        padding: "20px",
        transition: "all 0.3s",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Skeleton width={24} height={24} borderRadius={12} style={style} />
      </div>

      <div style={{ textAlign: "center", marginBottom: "14px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            margin: "0 auto 8px",
            borderRadius: "50%",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Skeleton width={130} height={130} borderRadius={40} style={style} />
        </div>
        <Skeleton width="80%" height={22} borderRadius={12} style={style} />
      </div>

      <div style={{ display: "flex", justifyContent: "end", gap: "8px" }}>
        <Skeleton width={30} height={30} borderRadius={12} style={style} />
        <Skeleton width={30} height={30} borderRadius={12} style={style} />
      </div>
    </div>
  );
}
