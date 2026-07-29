import { useState } from "react";
import { createPortal } from "react-dom";
import { Chart21, InfoCircle } from "iconsax-react";
import { glassCard } from "../../utils/styles";
import apiClient from "../../api/apiClient";
import { CardSkeleton } from "./DashboardPrimitives";

export function ProfitMarginWidget({ loading, profit, exchangeRate, lang, t, refetch }) {
  const [showRateEditor, setShowRateEditor] = useState(false);
  const [tempRate, setTempRate] = useState("");
  const [savingRate, setSavingRate] = useState(false);

  const saveExchangeRate = async () => {
    const value = Number(tempRate);
    if (!value || value <= 0) return;
    setSavingRate(true);
    try {
      await apiClient.put("/exchange-rates", { rate: value });
      setShowRateEditor(false);
      refetch();
    } catch (err) {
      console.error("Failed to update exchange rate:", err);
    } finally {
      setSavingRate(false);
    }
  };

  return (
    <div style={glassCard} className="rounded-[20px] p-5 mt-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-white font-bold text-base m-0 flex items-center gap-2">
          <Chart21
            size={20}
            color="#fff"
            variant="Linear"
            style={{ animation: "float 3s ease-in-out infinite" }}
          />
          {t.dashboardProfitTitle}
        </h3>
        <button
          onClick={() => {
            setTempRate(String(exchangeRate));
            setShowRateEditor(true);
          }}
          className="no-print text-xs font-semibold text-white/60 hover:text-white transition-colors"
        >
          {t.dashboardExchangeRateMsg.replace(
            "{n}",
            Number(exchangeRate).toLocaleString(lang === "kh" ? "km-KH" : "en-US"),
          )}
        </button>
        {showRateEditor &&
          createPortal(
            <div
              className="no-print fixed inset-0 z-[10000] flex items-center justify-center p-6"
              style={{ ...glassCard }}
              onClick={() => setShowRateEditor(false)}
            >
              <div
                style={glassCard}
                className="w-full max-w-[320px] rounded-2xl p-5 text-white border border-white/15"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-sm font-bold m-0 mb-3">
                  {t.dashboardSetExchangeRateMsg}
                </h3>
                <input
                  type="number"
                  min="1"
                  autoFocus
                  value={tempRate}
                  onChange={(e) => setTempRate(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 mb-3 text-sm text-white bg-white/10 border border-white/20 outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRateEditor(false)}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold bg-white/10 text-white hover:bg-white/15 transition-colors"
                  >
                    {t.closeAction}
                  </button>
                  <button
                    onClick={saveExchangeRate}
                    disabled={savingRate}
                    className="btn-shine-blue flex-1 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
                  >
                    {savingRate ? t.savingAction : t.saveAction}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
      {loading ? (
        <div className="flex gap-3 flex-wrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} minWidth="140px" />
          ))}
        </div>
      ) : (
        <>
          <div className="flex gap-3 flex-wrap">
            <div
              className="rounded-[14px] px-4 py-3 flex-1"
              style={{
                minWidth: "140px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="text-white/60 text-xs mb-1">{t.dashboardRevenueLabel}</div>
              <div className="text-white font-bold text-lg">
                ${Number(profit.revenue || 0).toFixed(2)}
              </div>
            </div>
            <div
              className="rounded-[14px] px-4 py-3 flex-1"
              style={{
                minWidth: "140px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="text-white/60 text-xs mb-1">{t.dashboardCogsLabel}</div>
              <div className="text-[#e74c3c] font-bold text-lg">
                ${Number(profit.cogs || 0).toFixed(2)}
              </div>
            </div>
            <div
              className="rounded-[14px] px-4 py-3 flex-1"
              style={{
                minWidth: "140px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="text-white/60 text-xs mb-1">{t.dashboardProfitLabel}</div>
              <div className="text-[#2ecc71] font-bold text-lg">
                ${Number(profit.profit || 0).toFixed(2)}
              </div>
            </div>
            <div
              className="rounded-[14px] px-4 py-3 flex-1"
              style={{
                minWidth: "140px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="text-white/60 text-xs mb-1">{t.dashboardMarginLabel}</div>
              <div className="text-white font-bold text-lg">
                {Number(profit.marginPct || 0).toFixed(1)}%
              </div>
            </div>
            <div
              className="rounded-[14px] px-4 py-3 flex-1"
              style={{
                minWidth: "140px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="text-white/60 text-xs mb-1">{t.dashboardExpensesLabel}</div>
              <div className="text-[#e74c3c] font-bold text-lg">
                ${Number(profit.expensesUsd || 0).toFixed(2)}
              </div>
              {profit.expensesKhr > 0 && (
                <div className="text-white/40 text-[0.72rem] mt-1">
                  ៛
                  {Number(profit.expensesKhr || 0).toLocaleString(
                    lang === "kh" ? "km-KH" : "en-US",
                  )}
                </div>
              )}
            </div>
            <div
              className="rounded-[14px] px-4 py-3 flex-1"
              style={{
                minWidth: "140px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="text-white/60 text-xs mb-1">{t.dashboardNetProfitLabel}</div>
              <div
                className="font-bold text-lg"
                style={{ color: profit.netProfit >= 0 ? "#2ecc71" : "#e74c3c" }}
              >
                ${Number(profit.netProfit || 0).toFixed(2)}
              </div>
            </div>
          </div>
          {profit.productsWithoutRecipeCount > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <InfoCircle size={16} color="#f1c40f" variant="Linear" />
              <span className="text-[#f1c40f] text-xs">
                {t.dashboardProfitApproxMsg.replace(
                  "{n}",
                  profit.productsWithoutRecipeCount,
                )}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ProfitMarginWidget;
