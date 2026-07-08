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
}) {
  if (loading) {
    return (
      <div style={{ ...glassCard, borderRadius: 16, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              // tableLayout: "fixed",
              color: "white",
              fontSize: "0.88rem",
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.12)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                {[
                  "ID",
                  "Promotion Name",
                  "Type",
                  "Discount",
                  "Apply To",
                  "Start Date",
                  "End Date",
                  "Status",
                  "Enable",
                  "Action",
                ].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: "12px 14px",
                      // textAlign: "center",
                      // color: "rgba(255,255,255,0.7)",
                      textAlign: col === "Promotion Name" ? "left" : "center",
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
        No promotions found
      </div>
    );
  }

  return (
    <div style={{ ...glassCard, borderRadius: 16, overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            // tableLayout: "fixed",
            color: "white",
            fontSize: "0.88rem",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(255,255,255,0.03)",
              }}
            >
              {[
                "ID",
                "Promotion Name",
                "Type",
                "Discount",
                "Apply To",
                "Start Date",
                "End Date",
                "Status",
                "Enable",
                "Action",
              ].map((col) => (
                <th
                  key={col}
                  style={{
                    padding: "12px 14px",
                    textAlign: col === "Promotion Name" ? "left" : "center",
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
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
