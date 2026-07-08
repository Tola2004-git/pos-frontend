import { Skeleton } from "../../components/ui/Skeleton";
import { glass } from "../../utils/styles";

export function PaymentMethodSkeletonCard({ delay = 0 }) {
  const style = { animationDelay: `${delay}s` };

  return (
    <div
      style={{
        ...glass,
        borderRadius: "20px",
        padding: "28px 24px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "14px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Skeleton width={120} height={120} borderRadius={100} style={style} />
      </div>

      <Skeleton width="55%" height={24} borderRadius={12} style={style} />
      <Skeleton width="35%" height={14} borderRadius={10} style={{ ...style, opacity: 0.75 }} />

      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "4px",
        }}
      >
        <Skeleton width={80} height={28} borderRadius={20} style={style} />

        <div style={{ display: "flex", gap: "8px" }}>
          <Skeleton width={38} height={38} borderRadius={12} style={style} />
          <Skeleton width={38} height={38} borderRadius={12} style={style} />
          <Skeleton width={38} height={38} borderRadius={12} style={style} />
        </div>
      </div>
    </div>
  );
}