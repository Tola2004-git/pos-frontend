import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { useTranslations } from "../../hooks/useTranslations";
import { useCashierShift, resetCashierShiftCache } from "../../hooks/useCashierShift";
import { useBackgroundChanger } from "../../hooks/useBackgroundChanger";
import { alertSuccess, alertConfirmWarning } from "../../utils/alert.jsx";
import { glass, glassCard, colors } from "../../utils/styles";
import LangDropdown from "./LangDropdown";
import UserProfile from "./UserProfile";
import BackgroundChanger from "../BackgroundChanger";
import { getCachedUser, setCachedUser, clearCachedUser } from "../../utils/currentUserCache";
import {
  Logout,
  Grid3,
  ReceiptText,
  MoneyRecive,
  MoneySend,
  TickCircle,
  Warning2,
  DollarCircle,
  Note,
  Brush,
} from "iconsax-react";
import { HiLockClosed, HiLockOpen } from "react-icons/hi2";
import logo from "../../assets/logo.png";

const NAV_TABS = [
  { path: "/cashier", labelKey: "navTables", icon: Grid3 },
  { path: "/cashier/orders", labelKey: "navMySales", icon: ReceiptText },
];

let hasCheckedShiftThisSession = false;

const fieldStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.07)",
  color: "white",
  fontSize: "0.95rem",
  outline: "none",
};

const labelStyle = {
  color: "rgba(255,255,255,0.65)",
  fontSize: "0.8rem",
  display: "block",
  marginBottom: "6px",
};

const badgeFloatStyles = `
@keyframes badge-float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-5px); }
}
.badge-float { animation: badge-float 2.2s ease-in-out infinite; }

@keyframes spin-loader {
  to { transform: rotate(360deg); }
}
.spin-loader {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin-loader 0.7s linear infinite;
}

@keyframes confirm-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes confirm-pop {
  from { opacity: 0; transform: scale(0.95) translateY(20px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
`;

function fmtUsd(v) {
  return `$${(Number(v) || 0).toFixed(2)}`;
}
function fmtKhr(v) {
  return `${Math.round(Number(v) || 0).toLocaleString()} ៛`;
}

function OpenShiftModal({ visible = true, opening, onOpen, onLogout, t }) {
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
        ? "1px solid rgba(255,255,255,0.8)"
        : "1px solid rgba(255,255,255,0.18)",
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
            <HiLockClosed size={32} color="#fff" />
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

function CloseShiftModal({ visible = true, closing, onClose, onCancel, t }) {
  const [usd, setUsd] = useState("");
  const [khr, setKhr] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState("");

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !closing) onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, closing]);

  const currencyFieldStyle = (field) => ({
    ...fieldStyle,
    paddingLeft: "40px",
    border:
      focusedField === field
        ? "1px solid rgba(255,255,255,0.8)"
        : "1px solid rgba(255,255,255,0.18)",
    transition: "border 0.2s",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (usd === "" && khr === "") {
      setError(t.closeShiftValidation);
      return;
    }
    try {
      await onClose({
        counted_cash_usd: Number(usd) || 0,
        counted_cash_khr: Number(khr) || 0,
        note: note || null,
      });
    } catch (err) {
      setError(err.response?.data?.message || t.closeShiftError);
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
        if (e.target === e.currentTarget && !closing) onCancel();
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
        className="w-full max-w-[440px] rounded-[24px] p-7 text-white border border-white/15"
      >
        <style>{badgeFloatStyles}</style>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-none">
            <MoneyRecive
              size={32}
              color="#fff"
              variant="Outline"
              style={{ animation: "float 3s ease-in-out infinite" }}
            />
          </div>
          <div>
            <h3 className="text-lg font-bold m-0">{t.closeShiftTitle}</h3>
            <p className="text-white/55 text-[0.8rem] m-0">
              {t.closeShiftSubtitle}
            </p>
          </div>
        </div>
        <p className="text-white/70 text-sm leading-relaxed my-4">
          {t.closeShiftDesc}
        </p>

        {error && (
          <div className="mb-4 rounded-[10px] bg-[#c0392b]/25 border border-[#c0392b]/50 text-[#ff8a80] text-sm px-3 py-2.5">
            {error}
          </div>
        )}

        <div className="mb-3">
          <label style={labelStyle}>{t.countedCashUsd}</label>
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
        <div className="mb-3">
          <label style={labelStyle}>{t.countedCashKhr}</label>
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
        <div className="mb-5">
          <label style={labelStyle}>{t.noteOptional}</label>
          <div className="relative">
            <Note
              size={18}
              color="white"
              variant="Outline"
              style={{
                position: "absolute",
                left: "12px",
                top: "14px",
                opacity: focusedField === "note" ? 1 : 0.4,
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
                  focusedField === "note"
                    ? "1px solid rgba(255,255,255,0.8)"
                    : "1px solid rgba(255,255,255,0.18)",
                transition: "border 0.2s",
              }}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onFocus={() => setFocusedField("note")}
              onBlur={() => setFocusedField("")}
              placeholder={t.closeShiftNotePlaceholder}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={closing}
            className="btn-cancel-glass flex-1 py-3.5 rounded-[12px] font-medium text-sm"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={closing}
            className="btn-shine-blue flex-1 py-3.5 rounded-[12px] font-semibold text-sm disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {closing ? (
              <>
                <span className="spin-loader" />
                {t.closeShiftSubmitting}
              </>
            ) : (
              <>
                <HiLockClosed size={18} color="white" />
                {t.closeShiftSubmit}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function CashMovementModal({ visible = true, recording, onSubmit, onCancel, t }) {
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
        ? "1px solid rgba(255,255,255,0.8)"
        : "1px solid rgba(255,255,255,0.18)",
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
            <MoneySend size={32} color="#fff" variant="Outline" />
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
        <div className="mb-5">
          <label style={labelStyle}>{t.reason}</label>
          <div className="relative">
            <Note
              size={18}
              color="white"
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
                    ? "1px solid rgba(255,255,255,0.8)"
                    : "1px solid rgba(255,255,255,0.18)",
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

function CloseSummaryModal({ visible = true, summary, onDismiss, t }) {
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

function CashierLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang, setLang } = useTranslations();
  const [user, setUser] = useState(getCachedUser());
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [isCloseModalMounted, setIsCloseModalMounted] = useState(false);
  const [isCloseModalVisible, setIsCloseModalVisible] = useState(false);
  const [showCashMovementModal, setShowCashMovementModal] = useState(false);
  const [isCashMovementMounted, setIsCashMovementMounted] = useState(false);
  const [isCashMovementVisible, setIsCashMovementVisible] = useState(false);

  useEffect(() => {
    let timeout;
    if (showCloseModal) {
      setIsCloseModalMounted(true);
      requestAnimationFrame(() => setIsCloseModalVisible(true));
    } else {
      setIsCloseModalVisible(false);
      timeout = setTimeout(() => setIsCloseModalMounted(false), 300);
    }
    return () => clearTimeout(timeout);
  }, [showCloseModal]);

  useEffect(() => {
    let timeout;
    if (showCashMovementModal) {
      setIsCashMovementMounted(true);
      requestAnimationFrame(() => setIsCashMovementVisible(true));
    } else {
      setIsCashMovementVisible(false);
      timeout = setTimeout(() => setIsCashMovementMounted(false), 300);
    }
    return () => clearTimeout(timeout);
  }, [showCashMovementModal]);

  const {
    shift,
    loading: shiftLoading,
    fetchError: shiftFetchError,
    opening,
    closing,
    closeSummary,
    openShift,
    closeShift,
    dismissCloseSummary,
    refreshShift,
    addCashMovement,
    recordingMovement,
  } = useCashierShift();

  const {
    bgStyle,
    isBgChangerMounted,
    isBgChangerVisible,
    openBgChanger,
    closeBgChanger,
    applyBg,
    selected,
    customUrl,
    previewUpload,
    bgPresets,
    handleSelectPreset,
    handleImageUpload,
    handleCustomUrlChange,
    compressing,
    uploadError,
  } = useBackgroundChanger(
    () => {},
    () => {},
  );

  useEffect(() => {
    let active = true;
    apiClient
      .get("/me")
      .then((res) => {
        setCachedUser(res.data);
        if (active) setUser(res.data);
      })
      .catch((err) => console.error("Failed to fetch user:", err));
    return () => {
      active = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    hasCheckedShiftThisSession = false;
    clearCachedUser();
    resetCashierShiftCache();
    navigate("/login");
  };

  const confirmLogout = async () => {
    const result = await alertConfirmWarning(
      t.logoutConfirmTitle,
      t.logoutConfirmMsg,
      t.logoutConfirmBtn,
      t.cancel,
    );
    if (result.isConfirmed) handleLogout();
  };

  const handleCloseSummaryDismiss = () => {
    dismissCloseSummary();
    handleLogout();
  };

  const isCashier = localStorage.getItem("role") === "cashier";
  const showShiftChecking =
    isCashier && shiftLoading && !hasCheckedShiftThisSession;

  useEffect(() => {
    if (!shiftLoading) hasCheckedShiftThisSession = true;
  }, [shiftLoading]);
  const showStatusError =
    isCashier && !shiftLoading && shiftFetchError && !closeSummary;
  const showOpenGate =
    isCashier && !shiftLoading && !shiftFetchError && !shift && !closeSummary;

  const [isOpenGateMounted, setIsOpenGateMounted] = useState(false);
  const [isOpenGateVisible, setIsOpenGateVisible] = useState(false);
  useEffect(() => {
    let timeout;
    if (showOpenGate) {
      setIsOpenGateMounted(true);
      requestAnimationFrame(() => setIsOpenGateVisible(true));
    } else {
      setIsOpenGateVisible(false);
      timeout = setTimeout(() => setIsOpenGateMounted(false), 300);
    }
    return () => clearTimeout(timeout);
  }, [showOpenGate]);

  const [isCloseSummaryMounted, setIsCloseSummaryMounted] = useState(false);
  const [isCloseSummaryVisible, setIsCloseSummaryVisible] = useState(false);
  const [localCloseSummary, setLocalCloseSummary] = useState(null);
  useEffect(() => {
    let timeout;
    if (closeSummary) {
      setLocalCloseSummary(closeSummary);
      setIsCloseSummaryMounted(true);
      requestAnimationFrame(() => setIsCloseSummaryVisible(true));
    } else {
      setIsCloseSummaryVisible(false);
      timeout = setTimeout(() => setIsCloseSummaryMounted(false), 300);
    }
    return () => clearTimeout(timeout);
  }, [closeSummary]);

  return (
    <div
      style={bgStyle}
      className="min-h-screen bg-cover bg-center bg-no-repeat transition-all duration-500"
    >
      <div className="fixed inset-0 bg-black/50 pointer-events-none z-0" />
      {isBgChangerMounted && (
        <BackgroundChanger
          visible={isBgChangerVisible}
          onClose={closeBgChanger}
          onApply={applyBg}
          selected={selected}
          customUrl={customUrl}
          previewUpload={previewUpload}
          bgPresets={bgPresets}
          handleSelectPreset={handleSelectPreset}
          handleImageUpload={handleImageUpload}
          handleCustomUrlChange={handleCustomUrlChange}
          compressing={compressing}
          uploadError={uploadError}
          t={t}
        />
      )}
      <div className="relative z-10 flex flex-col min-h-screen">
        <header
          style={glass}
          className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 md:gap-3 mx-2 sm:mx-4 mt-2 sm:mt-4 px-3 sm:px-4 md:px-6 py-2.5 md:py-3 rounded-[20px]"
        >
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src={logo} alt="Logo" className="w-9 h-9 object-contain shrink-0" />
              <h1 className="text-white font-bold text-lg m-0 whitespace-nowrap hidden sm:block">
                The Temple Sourdough
              </h1>
            </div>
            <nav className="flex items-center gap-1 bg-white/10 rounded-[12px] p-1">
              {NAV_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = location.pathname === tab.path;
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-[9px] text-sm font-semibold no-underline whitespace-nowrap transition-colors ${
                      active
                        ? "bg-white text-[#1a1a2e]"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    <Icon
                      size={16}
                      color={active ? "#1a1a2e" : "currentColor"}
                      variant="Linear"
                    />
                    <span className="hidden lg:inline">{t[tab.labelKey]}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 md:gap-3">
            {isCashier && shift && (
              <button
                onClick={() => setShowCashMovementModal(true)}
                className="flex items-center gap-2 px-2.5 md:px-3.5 py-2 rounded-[10px] border border-[#8b5cf6]/40 bg-[#8b5cf6]/15 hover:bg-[#8b5cf6]/25 text-[#8b5cf6] font-semibold text-[0.8rem] whitespace-nowrap transition-colors cursor-pointer"
              >
                <MoneySend size={16} color="#8b5cf6" variant="Bold" />
                <span className="hidden xl:inline">{t.cashInOutBtn}</span>
              </button>
            )}
            {isCashier && shift && (
              <button
                onClick={() => setShowCloseModal(true)}
                className="flex items-center gap-2 px-2.5 md:px-3.5 py-2 rounded-[10px] border border-[#f39c12]/40 bg-[#f39c12]/15 hover:bg-[#f39c12]/25 text-[#f39c12] font-semibold text-[0.8rem] whitespace-nowrap transition-colors cursor-pointer"
              >
                <MoneyRecive size={16} color="#f39c12" variant="Bold" />
                <span className="hidden xl:inline">
                  {t.shiftOpenSince}{" "}
                  {new Date(shift.opened_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="xl:hidden">{t.closeShiftBtn}</span>
              </button>
            )}
            <button
              onClick={openBgChanger}
              className="btn-shine-blue flex items-center gap-[6px] px-2.5 md:px-3.5 py-2 rounded-[10px] text-[0.8rem] font-semibold whitespace-nowrap transition-transform active:scale-95"
            >
              <Brush size={16} color="white" variant="Linear" />
              <span className="hidden xl:inline">{t.backgroundBtn}</span>
            </button>
            <LangDropdown lang={lang} setLang={setLang} />
            <div className="hidden sm:block w-[1px] h-[30px] bg-white/20" />
            <UserProfile user={user} t={t} />
            <button
              onClick={confirmLogout}
              className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-[10px] bg-[#c0392b]/80 hover:bg-[#c0392b] text-white font-semibold text-sm whitespace-nowrap transition-colors cursor-pointer"
            >
              <Logout size={18} color="white" variant="Linear" />
              <span className="hidden sm:inline">{t.logoutBtn}</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {showShiftChecking ? (
            <>
              <style>{badgeFloatStyles}</style>
              <div className="flex items-center justify-center py-24">
                <span
                  className="spin-loader"
                  style={{ width: "28px", height: "28px" }}
                />
              </div>
            </>
          ) : showOpenGate || showStatusError ? null : (
            children
          )}
        </main>
      </div>

      {showStatusError && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-6 bg-black/60">
          <div
            style={glassCard}
            className="w-full max-w-[400px] rounded-[24px] p-7 text-white border border-white/15 text-center"
          >
            <div className="w-11 h-11 rounded-[12px] bg-[#c0392b]/20 flex items-center justify-center mx-auto mb-3">
              <Warning2 size={22} color="#e74c3c" variant="Bold" />
            </div>
            <h3 className="text-lg font-bold m-0 mb-1.5">
              {t.shiftCheckErrorTitle}
            </h3>
            <p className="text-white/65 text-sm mb-5">
              {t.shiftCheckErrorMsg}
            </p>
            <button
              onClick={refreshShift}
              className="btn-shine-blue w-full py-3 rounded-[12px] font-semibold text-sm"
            >
              {t.retry}
            </button>
          </div>
        </div>
      )}

      {isOpenGateMounted && (
        <OpenShiftModal
          visible={isOpenGateVisible}
          opening={opening}
          onOpen={openShift}
          onLogout={handleLogout}
          t={t}
        />
      )}

      {isCashMovementMounted && (
        <CashMovementModal
          visible={isCashMovementVisible}
          recording={recordingMovement}
          onCancel={() => setShowCashMovementModal(false)}
          onSubmit={async (payload) => {
            await addCashMovement(payload);
            setShowCashMovementModal(false);
            alertSuccess(
              payload.type === "cash_in" ? t.cashInRecorded : t.cashOutRecorded,
              t.cashMovementRecordedDesc,
            );
          }}
          t={t}
        />
      )}

      {isCloseModalMounted && (
        <CloseShiftModal
          visible={isCloseModalVisible}
          closing={closing}
          onCancel={() => setShowCloseModal(false)}
          onClose={async (payload) => {
            await closeShift(payload);
            setShowCloseModal(false);
          }}
          t={t}
        />
      )}

      {isCloseSummaryMounted && (
        <CloseSummaryModal
          visible={isCloseSummaryVisible}
          summary={localCloseSummary}
          onDismiss={handleCloseSummaryDismiss}
          t={t}
        />
      )}
    </div>
  );
}

export default CashierLayout;
