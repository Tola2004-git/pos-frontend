import { useState, useEffect } from "react";
import { DollarCircle, MoneySend, Note } from "iconsax-react";
import { glassCard } from "../../utils/styles";
import { fieldStyle, labelStyle, badgeFloatStyles } from "./cashierModalShared";

export function CashMovementModal({ visible = true, recording, onSubmit, onCancel, t }) {
  const [type, setType] = useState("cash_out");
  const [usd, setUsd] = useState("");
  const [khr, setKhr] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !recording) onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, recording]);

  const currencyFieldStyle = (field) => ({
    ...fieldStyle,
    paddingLeft: "40px",
    border:
      focusedField === field
        ? "1px solid var(--accent-border-soft)"
        : "1px solid var(--surface-border)",
    transition: "border 0.2s",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if ((Number(usd) || 0) <= 0 && (Number(khr) || 0) <= 0) {
      setError(t.cashMovementValidationAmount);
      return;
    }
    if (!reason.trim()) {
      setError(t.cashMovementValidationReason);
      return;
    }
    try {
      await onSubmit({
        type,
        amount_usd: Number(usd) || 0,
        amount_khr: Number(khr) || 0,
        reason: reason.trim(),
      });
    } catch (err) {
      setError(err.response?.data?.message || t.cashMovementError);
    }
  };

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
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !recording) onCancel();
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
          <div className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-none">
            <MoneySend size={32} color="currentColor" variant="Outline" />
          </div>
          <div>
            <h3 className="text-lg font-bold m-0">{t.cashMovementTitle}</h3>
            <p className="text-white/55 text-[0.8rem] m-0">
              {t.cashMovementSubtitle}
            </p>
          </div>
        </div>
        <p className="text-white/70 text-sm leading-relaxed my-4">
          {t.cashMovementDesc}
        </p>

        {error && (
          <div className="mb-4 rounded-[10px] bg-[#c0392b]/25 border border-[#c0392b]/50 text-[#ff8a80] text-sm px-3 py-2.5">
            {error}
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={() => setType("cash_in")}
            className={`flex-1 py-2.5 rounded-[10px] text-sm font-semibold transition-colors ${
              type === "cash_in"
                ? "bg-[#2ecc71] text-white"
                : "bg-white/10 text-white/70 hover:text-white"
            }`}
          >
            {t.cashIn}
          </button>
          <button
            type="button"
            onClick={() => setType("cash_out")}
            className={`flex-1 py-2.5 rounded-[10px] text-sm font-semibold transition-colors ${
              type === "cash_out"
                ? "bg-[#e74c3c] text-white"
                : "bg-white/10 text-white/70 hover:text-white"
            }`}
          >
            {t.cashOut}
          </button>
        </div>

        <div className="mb-3">
          <label style={labelStyle}>{t.amountUsd}</label>
          <div className="relative">
            <DollarCircle
              size={18}
              color="currentColor"
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
        <div className="mb-3">
          <label style={labelStyle}>{t.amountKhr}</label>
          <div className="relative">
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--accent-border-full)",
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
        <div className="mb-5">
          <label style={labelStyle}>{t.reason}</label>
          <div className="relative">
            <Note
              size={18}
              color="currentColor"
              variant="Outline"
              style={{
                position: "absolute",
                left: "12px",
                top: "14px",
                opacity: focusedField === "reason" ? 1 : 0.4,
                transition: "opacity 0.2s",
                pointerEvents: "none",
              }}
            />
            <textarea
              style={{
                ...fieldStyle,
                paddingLeft: "40px",
                resize: "vertical",
                minHeight: "64px",
                border:
                  focusedField === "reason"
                    ? "1px solid var(--accent-border-soft)"
                    : "1px solid var(--surface-border)",
                transition: "border 0.2s",
              }}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              onFocus={() => setFocusedField("reason")}
              onBlur={() => setFocusedField("")}
              placeholder={t.cashMovementReasonPlaceholder}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={recording}
            className="btn-cancel-glass flex-1 py-3.5 rounded-[12px] font-medium text-sm"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={recording}
            className="btn-shine-blue flex-1 py-3.5 rounded-[12px] font-semibold text-sm disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {recording ? (
              <>
                <span className="spin-loader" />
                {t.cashMovementSaving}
              </>
            ) : (
              t.cashMovementSubmit
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CashMovementModal;
