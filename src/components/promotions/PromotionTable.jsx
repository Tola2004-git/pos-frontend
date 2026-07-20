import { TicketDiscount } from "iconsax-react";
import { glassCard } from "../../utils/styles";
import PromotionRow from "./PromotionRow.jsx";
import { Skeleton } from "../ui/Skeleton.jsx";
import { SkeletonPromotion, SkeletonPromotionTable } from "../ui/SkeletonPromotion.jsx";

export default function PromotionTable({
  promotions,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  t,
}) {
  const COLUMNS = [
    t.promoColId,
    t.promoColName,
    t.promoColType,
    t.promoColDiscount,
    t.promoColApplyTo,
    t.promoColStartDate,
    t.promoColEndDate,
    t.productColStatus,
    t.promoColEnable,
    t.promoColAction,
  ];

  if (loading) {
    return (
      <div style={{ ...glassCard, borderRadius: 16, overflow: "hidden" }}>
        <div className="table-scroll-x" style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              // tableLayout: "fixed",
              color: "white",
              fontSize: "0.85rem",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                {COLUMNS.map((col, colIndex) => (
                  <th
                    key={col}
                    style={{
                      padding: "12px 14px",
                      textAlign: colIndex === 1 ? "left" : "center",
                      fontWeight: 600,
                      color: "white",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <SkeletonPromotionTable rows={8} />
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <div
        style={{
          borderRadius: 16,
          padding: "48px 24px",
          textAlign: "center",
          color: "rgba(255,255,255,0.5)",
          ...glassCard,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TicketDiscount
          size={80}
          color="rgba(255,255,255,0.5)"
          variant="Linear"
        />
        {t.noPromotionsFoundMsg}
      </div>
    );
  }

  return (
    <div style={{ ...glassCard, borderRadius: 16, overflow: "hidden" }}>
      <div className="table-scroll-x" style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            // tableLayout: "fixed",
            color: "white",
            fontSize: "0.85rem",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              {COLUMNS.map((col, colIndex) => (
                <th
                  key={col}
                  style={{
                    padding: "12px 14px",
                    textAlign: colIndex === 1 ? "left" : "center",
                    fontWeight: 600,
                    color: "white",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {promotions.map((promo, index) => (
              <PromotionRow
                key={promo.id ?? index}
                index={index}
                promo={promo}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
                t={t}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
