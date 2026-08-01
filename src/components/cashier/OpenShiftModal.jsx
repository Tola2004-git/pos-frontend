import { useState } from "react";
import { DollarCircle } from "iconsax-react";
import { HiLockClosed, HiLockOpen } from "react-icons/hi2";
import { glassCard } from "../../utils/styles";
import { fieldStyle, labelStyle, badgeFloatStyles } from "./cashierModalShared";

export function OpenShiftModal({ visible = true, opening, onOpen, onLogout, t }) {
  const [usd, setUsd] = useState("");
  const [khr, setKhr] = useState("");
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (usd === "" && khr === "") {
      setError(t.openShiftValidation);
      return;
    }
    try {
      await onOpen({
        opening_cash_usd: Number(usd) || 0,
        opening_cash_khr: Number(khr) || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || t.openShiftError);
    }
  };

  const currencyFieldStyle = (field) => ({
    ...fieldStyle,
    paddingLeft: "40px",
    border:
      focusedField === field
        ? "1px solid var(--accent-border-soft)"
        : "1px solid var(--surface-border)",
    transition: "border 0.2s",
  });

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
      <form
        onSubmit={handleSubmit}
        style={{
          ...glassCard,
          transform: visible ? "translateY(0)" : "translateY(24px)",
          opacity: visible ? 1 : 0,
          animation: visible
            ? "confirm-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
            : "none",
          transition: "transform 220ms ease, opacity 220ms ease",
        }}
        className="w-full max-w-[420px] rounded-[24px] p-7 text-white border border-white/15"
      >
        <style>{badgeFloatStyles}</style>
        <div className="flex items-center gap-3 mb-2">
          <div className="badge-float w-11 h-11 rounded-[12px] flex items-center justify-center flex-none">
            <HiLockClosed size={32} color="currentColor" />
          </div>
          <div>
            <h3 className="text-lg font-bold m-0">{t.openShiftTitle}</h3>
            <p className="text-white/55 text-[0.8rem] m-0">
              {t.openShiftSubtitle}
            </p>
          </div>
        </div>
        <p className="text-white/70 text-sm leading-relaxed my-4">
          {t.openShiftDesc}
        </p>

        {error && (
          <div className="mb-4 rounded-[10px] bg-[#c0392b]/25 border border-[#c0392b]/50 text-[#ff8a80] text-sm px-3 py-2.5">
            {error}
          </div>
        )}

        <div className="mb-3">
          <label style={labelStyle}>{t.startingCashUsd}</label>
          <div className="relative">
            <DollarCircle
              size={18}
              color="white"
              variant="Outline"
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                opacity: focusedField === "usd" ? 1 : 0.4,
                transition: "opacity 0.2s",
                pointerEvents: "none",
              }}
            />
            <input
              style={currencyFieldStyle("usd")}
              type="number"
              step="0.01"
              min="0"
              value={usd}
              onChange={(e) => setUsd(e.target.value)}
              onFocus={() => setFocusedField("usd")}
              onBlur={() => setFocusedField("")}
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="mb-5">
          <label style={labelStyle}>{t.startingCashKhr}</label>
          <div className="relative">
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "white",
                opacity: focusedField === "khr" ? 1 : 0.4,
                transition: "opacity 0.2s",
                pointerEvents: "none",
              }}
            >
              ៛
            </span>
            <input
              style={currencyFieldStyle("khr")}
              type="number"
              step="1"
              min="0"
              value={khr}
              onChange={(e) => setKhr(e.target.value)}
              onFocus={() => setFocusedField("khr")}
              onBlur={() => setFocusedField("")}
              placeholder="0"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={opening}
          className="btn-shine-blue w-full py-3.5 rounded-[12px] font-semibold text-sm disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {opening ? (
            <>
              <span className="spin-loader" />
              {t.openShiftSubmitting}
            </>
          ) : (
            <>
              <HiLockOpen size={18} color="white" />
              {t.openShiftSubmit}
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onLogout}
          disabled={opening}
          className="w-full mt-3 py-2 text-white/50 hover:text-white/80 text-sm font-medium transition-colors bg-transparent border-none cursor-pointer"
        >
          {t.openShiftLogout}
        </button>
      </form>
    </div>
  );
}

export default OpenShiftModal;
