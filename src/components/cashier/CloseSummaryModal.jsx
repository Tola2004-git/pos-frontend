import { TickCircle, Warning2 } from "iconsax-react";
import { glassCard } from "../../utils/styles";
import { badgeFloatStyles, fmtUsd, fmtKhr } from "./cashierModalShared";

export function CloseSummaryModal({ visible = true, summary, onDismiss, t }) {
  const varianceUsd = Number(summary.variance_usd) || 0;
  const varianceKhr = Number(summary.variance_khr) || 0;
  const balanced = Math.abs(varianceUsd) < 0.01 && Math.abs(varianceKhr) < 1;

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center p-6"
      style={{
        ...glassCard,
        opacity: visible ? 1 : 0,
        animation: visible ? "confirm-fade-in 0.2s ease forwards" : "none",
        transition: "opacity 220ms ease",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div
        style={{
          ...glassCard,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          opacity: visible ? 1 : 0,
          animation: visible
            ? "confirm-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
            : "none",
          transition: "transform 220ms ease, opacity 220ms ease",
        }}
        className="w-full max-w-[440px] rounded-[24px] p-7 text-white border border-white/15"
      >
        <style>{badgeFloatStyles}</style>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-none">
            {balanced ? (
              <TickCircle
                size={32}
                color="#2ecc71"
                variant="Outline"
                style={{ animation: "float 3s ease-in-out infinite" }}
              />
            ) : (
              <Warning2
                size={32}
                color="#e67e22"
                variant="Outline"
                style={{ animation: "float 3s ease-in-out infinite" }}
              />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold m-0">{t.shiftClosedTitle}</h3>
            <p className="text-white/55 text-[0.8rem] m-0">
              {t.shiftClosedSubmitted}
              {" — "}
              {balanced ? t.shiftClosedBalanced : t.shiftClosedVariance}
            </p>
          </div>
        </div>

        <div className="rounded-[14px] bg-white/[0.06] border border-white/10 overflow-hidden mb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/50 text-left">
                <th className="font-medium px-4 py-2.5"> </th>
                <th className="font-medium px-4 py-2.5 text-right">USD</th>
                <th className="font-medium px-4 py-2.5 text-right">KHR</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-white/10">
                <td className="px-4 py-2.5 text-white/70">{t.expected}</td>
                <td className="px-4 py-2.5 text-right">
                  {fmtUsd(summary.expected_cash_usd)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {fmtKhr(summary.expected_cash_khr)}
                </td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="px-4 py-2.5 text-white/70">{t.counted}</td>
                <td className="px-4 py-2.5 text-right">
                  {fmtUsd(summary.counted_cash_usd)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {fmtKhr(summary.counted_cash_khr)}
                </td>
              </tr>
              <tr className="border-t border-white/10 font-bold">
                <td className="px-4 py-2.5">{t.variance}</td>
                <td
                  className="px-4 py-2.5 text-right"
                  style={{
                    color: Math.abs(varianceUsd) < 0.01 ? "#2ecc71" : "#e67e22",
                  }}
                >
                  {varianceUsd >= 0 ? "+" : ""}
                  {fmtUsd(varianceUsd)}
                </td>
                <td
                  className="px-4 py-2.5 text-right"
                  style={{
                    color: Math.abs(varianceKhr) < 1 ? "#2ecc71" : "#e67e22",
                  }}
                >
                  {varianceKhr >= 0 ? "+" : ""}
                  {fmtKhr(varianceKhr)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <button
          onClick={onDismiss}
          className="btn-shine-blue w-full py-3.5 rounded-[12px] font-semibold text-sm"
        >
          {t.doneAndLogout}
        </button>
      </div>
    </div>
  );
}

export default CloseSummaryModal;
