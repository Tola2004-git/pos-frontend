import { useNavigate } from "react-router-dom";
import { TicketDiscount } from "iconsax-react";
import { glassCard } from "../../utils/styles";
import { formatDiscount, formatDate } from "../../constants/promotionConstants";
import { CardSkeleton } from "./DashboardPrimitives";

export function ActivePromotionsWidget({ loading, activePromotions, t }) {
  const navigate = useNavigate();

  return (
    <div style={glassCard} className="rounded-[20px] p-5 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold text-base m-0 flex items-center gap-2">
          <TicketDiscount
            size={20}
            color="currentColor"
            variant="Linear"
            style={{ animation: "float 3s ease-in-out infinite" }}
          />
          {t.dashboardActivePromotionsTitle}
        </h3>
        <button
          onClick={() => navigate("/promotions")}
          className="no-print text-xs font-semibold text-white/60 hover:text-white transition-colors"
        >
          {t.dashboardViewAllAction}
        </button>
      </div>
      {loading ? (
        <div className="flex gap-3 flex-wrap">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} minWidth="180px" />
          ))}
        </div>
      ) : activePromotions.length === 0 ? (
        <p className="text-white/50 text-sm m-0">{t.dashboardNoActivePromotionsMsg}</p>
      ) : (
        <div className="flex gap-3 flex-wrap">
          {activePromotions.map((promo) => (
            <div
              key={promo.id}
              className="rounded-[14px] px-4 py-3 flex-1"
              style={{
                minWidth: "180px",
                background: "var(--surface-tint-06)",
                border: "1px solid var(--surface-tint-10)",
              }}
            >
              <div className="text-white font-semibold text-sm truncate">{promo.name}</div>
              <div className="text-[#8b5cf6] font-bold text-lg">
                {formatDiscount(promo.type, promo.value)}
              </div>
              <div className="text-white/40 text-[0.72rem] mt-1">
                {t.endDateLabel}: {formatDate(promo.end_date)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivePromotionsWidget;
