import { MoneyChange } from "iconsax-react";
import { WidgetCard, CardSkeleton } from "./DashboardPrimitives";

export function PaymentMixWidget({ loading, paymentMix, exchangeRate, lang, t }) {
  return (
    <WidgetCard
      icon={
        <MoneyChange
          size={20}
          color="#fff"
          variant="Linear"
          style={{ animation: "float 3s ease-in-out infinite" }}
        />
      }
      title={t.dashboardPaymentMixTitle}
    >
      {loading ? (
        <div className="flex gap-3 flex-wrap">
          {Array.from({ length: 2 }).map((_, i) => (
            <CardSkeleton key={i} minWidth="160px" />
          ))}
        </div>
      ) : paymentMix.cashUsd === 0 && paymentMix.cashKhr === 0 && paymentMix.digital === 0 ? (
        <p className="text-white/50 text-sm m-0">{t.noSalesInRangeMsg}</p>
      ) : (
        <>
          {(() => {
            const cashUsdEquiv =
              Number(paymentMix.cashUsd || 0) + Number(paymentMix.cashKhr || 0) / exchangeRate;
            const digitalUsdEquiv = Number(paymentMix.digital || 0);
            const mixTotal = cashUsdEquiv + digitalUsdEquiv;
            const cashPct = mixTotal > 0 ? (cashUsdEquiv / mixTotal) * 100 : 50;
            const digitalPct = 100 - cashPct;
            return (
              <div className="mb-3">
                <div
                  className="h-3 rounded-full overflow-hidden flex"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  {cashPct > 0 && (
                    <div
                      style={{
                        width: `${cashPct}%`,
                        background: "#3498db",
                        marginRight: digitalPct > 0 ? "2px" : 0,
                      }}
                    />
                  )}
                  {digitalPct > 0 && (
                    <div style={{ width: `${digitalPct}%`, background: "#1abc9c" }} />
                  )}
                </div>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <span className="flex items-center gap-1.5 text-white/60 text-xs">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: "#3498db" }}
                    />
                    {t.dashboardCashLabel} · {cashPct.toFixed(0)}%
                  </span>
                  <span className="flex items-center gap-1.5 text-white/60 text-xs">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: "#1abc9c" }}
                    />
                    {t.dashboardDigitalLabel} · {digitalPct.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })()}
          <div className="flex gap-3 flex-wrap">
            <div
              className="rounded-[14px] px-4 py-3 flex-1"
              style={{
                minWidth: "160px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="text-white/60 text-xs mb-1">{t.dashboardCashLabel}</div>
              <div className="text-white font-bold text-lg">
                ${Number(paymentMix.cashUsd || 0).toFixed(2)}
              </div>
              {paymentMix.cashKhr > 0 && (
                <div className="text-white/40 text-[0.72rem] mt-1">
                  ៛{Number(paymentMix.cashKhr || 0).toLocaleString(lang === "kh" ? "km-KH" : "en-US")}
                </div>
              )}
            </div>
            <div
              className="rounded-[14px] px-4 py-3 flex-1"
              style={{
                minWidth: "160px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="text-white/60 text-xs mb-1">{t.dashboardDigitalLabel}</div>
              <div className="text-white font-bold text-lg">
                ${Number(paymentMix.digital || 0).toFixed(2)}
              </div>
            </div>
          </div>
        </>
      )}
    </WidgetCard>
  );
}

export default PaymentMixWidget;
