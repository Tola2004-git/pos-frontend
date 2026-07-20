import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Wallet2, TickCircle, Warning2, CloseCircle } from "iconsax-react";
import Layout from "../components/layout/Layout";
import { glassCard, colors } from "../utils/styles";
import { useShiftReview } from "../hooks/useShiftReview";
import { useTranslations } from "../hooks/useTranslations";
import { SkeletonShiftTable } from "../components/ui/SkeletonShiftReview";

function fmtUsd(v) {
  return `$${(Number(v) || 0).toFixed(2)}`;
}
function fmtKhr(v) {
  return `${Math.round(Number(v) || 0).toLocaleString()} ៛`;
}
function fmtDate(v) {
  return v ? new Date(v).toLocaleString() : "—";
}

function VarianceBadge({ usd, khr }) {
  if (usd === null || usd === undefined)
    return <span className="text-white/40">—</span>;
  const balanced =
    Math.abs(Number(usd)) < 0.01 && Math.abs(Number(khr) || 0) < 1;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        background: balanced
          ? "rgba(46,204,113,0.15)"
          : "rgba(230,126,34,0.15)",
        color: balanced ? "#2ecc71" : "#e67e22",
        border: `1px solid ${balanced ? "rgba(46,204,113,0.35)" : "rgba(230,126,34,0.35)"}`,
      }}
    >
      {balanced ? (
        <TickCircle size={13} color="#2ecc71" variant="Bold" />
      ) : (
        <Warning2 size={13} color="#e67e22" variant="Bold" />
      )}
      {Number(usd) >= 0 ? "+" : ""}
      {fmtUsd(usd)}
    </span>
  );
}

function ReviewModal({ shift, show, submitting, onSubmit, onClose, t }) {
  const [note, setNote] = useState("");
  const [isMounted, setIsMounted] = useState(show);
  const [isVisible, setIsVisible] = useState(show);
  const [displayShift, setDisplayShift] = useState(shift);

  useEffect(() => {
    if (shift) setDisplayShift(shift);
  }, [shift]);

  useEffect(() => {
    let timeout;

    if (show) {
      setIsMounted(true);
      setNote("");
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
      timeout = setTimeout(() => setIsMounted(false), 300);
    }

    return () => clearTimeout(timeout);
  }, [show]);

  if (!isMounted || !displayShift) return null;

  const currentShift = displayShift;

  return createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-6 "
      style={{
        ...glassCard,
        opacity: isVisible ? 1 : 0,
        animation: isVisible ? "confirm-fade-in 0.2s ease forwards" : "none",
        transition: "opacity 220ms ease",
        pointerEvents: show ? "auto" : "none",
      }}
    >
      <div
        style={{
          ...glassCard,
          transform: isVisible ? "translateY(0)" : "translateY(24px)",
          opacity: isVisible ? 1 : 0,
          animation: isVisible
            ? "confirm-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
            : "none",
          transition: "transform 220ms ease, opacity 220ms ease",
        }}
        className="w-full max-w-[480px] rounded-[24px] p-7 text-white border border-white/15"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[#8b5cf6] text-[0.72rem] font-bold uppercase tracking-[1.6px] mb-1">
              {t.shiftReviewModalTitle}
            </div>
            <h3 className="text-lg font-bold m-0">
              {currentShift.user?.name || t.roleCashier}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-white/15 bg-white/10 text-white"
            style={{cursor: submitting ? "not-allowed" : "pointer",}}
          >
            ✕
          </button>
        </div>

        <div className="rounded-[14px] bg-white/[0.06] border border-white/10 overflow-hidden mb-4">
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
                <td className="px-4 py-2.5 text-white/70">
                  {t.openingFloatLabel}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {fmtUsd(currentShift.opening_cash_usd)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {fmtKhr(currentShift.opening_cash_khr)}
                </td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="px-4 py-2.5 text-white/70">
                  {t.shiftColExpected}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {fmtUsd(currentShift.expected_cash_usd)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {fmtKhr(currentShift.expected_cash_khr)}
                </td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="px-4 py-2.5 text-white/70">
                  {t.shiftColCounted}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {fmtUsd(currentShift.counted_cash_usd)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {fmtKhr(currentShift.counted_cash_khr)}
                </td>
              </tr>
              <tr className="border-t border-white/10 font-bold">
                <td className="px-4 py-2.5">{t.shiftColVariance}</td>
                <td
                  className="px-4 py-2.5 text-right"
                  style={{
                    color:
                      Math.abs(Number(currentShift.variance_usd)) < 0.01
                        ? "#2ecc71"
                        : "#e67e22",
                  }}
                >
                  {Number(currentShift.variance_usd) >= 0 ? "+" : ""}
                  {fmtUsd(currentShift.variance_usd)}
                </td>
                <td
                  className="px-4 py-2.5 text-right"
                  style={{
                    color:
                      Math.abs(Number(currentShift.variance_khr)) < 1
                        ? "#2ecc71"
                        : "#e67e22",
                  }}
                >
                  {Number(currentShift.variance_khr) >= 0 ? "+" : ""}
                  {fmtKhr(currentShift.variance_khr)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {currentShift.cashMovements && currentShift.cashMovements.length > 0 && (
          <div className="mb-4">
            <div className="text-white/50 text-xs uppercase tracking-wide mb-1.5">
              {t.cashMovementsLabel}
            </div>
            <div className="rounded-[12px] bg-white/[0.06] border border-white/10 overflow-hidden">
              {currentShift.cashMovements.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 border-b border-white/5 last:border-b-0 text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <span
                      className="font-semibold"
                      style={{
                        color: m.type === "cash_in" ? "#2ecc71" : "#e74c3c",
                      }}
                    >
                      {m.type === "cash_in" ? t.cashIn : t.cashOut}
                    </span>
                    <div className="text-white/50 text-xs truncate">
                      {m.reason}
                    </div>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <div className="text-white">{fmtUsd(m.amount_usd)}</div>
                    {Number(m.amount_khr) > 0 && (
                      <div className="text-white/40 text-xs">
                        {fmtKhr(m.amount_khr)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentShift.note && (
          <div className="mb-4">
            <div className="text-white/50 text-xs uppercase tracking-wide mb-1">
              {t.cashierNoteLabel}
            </div>
            <div className="rounded-[10px] bg-white/[0.06] border border-white/10 px-3 py-2.5 text-sm text-white/80">
              {currentShift.note}
            </div>
          </div>
        )}

        <div className="mb-5">
          <label className="text-white/65 text-[0.8rem] block mb-1.5">
            {t.reviewNoteOptionalLabel}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.reviewNotePlaceholder}
            className="w-full rounded-[12px] border border-white/[0.18] bg-white/[0.07] text-white text-sm p-3 outline-none"
            style={{ minHeight: "70px", resize: "vertical" }}
          />
        </div>

        <button
          onClick={() => onSubmit(note)}
          disabled={submitting}
          className="btn-shine-blue w-full py-3.5 rounded-[12px] font-semibold text-sm disabled:opacity-70"
        >
          {submitting ? t.savingAction : t.markReviewedAction}
        </button>
      </div>
      <style>
        {`
          @keyframes confirm-fade-in {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
          @keyframes confirm-pop {
            from { opacity: 0; transform: scale(0.95) translateY(20px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}
      </style>
    </div>,
    document.body,
  );
}

function ShiftReview() {
  const { t } = useTranslations();
  const STATUS_TABS = [
    { value: "pending_review", label: t.statusTabPendingReview },
    { value: "reviewed", label: t.statusTabReviewed },
    { value: "open", label: t.statusTabOpen },
    { value: "all", label: t.allChipLabel },
  ];
  const {
    shifts,
    loading,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    lastPage,
    total,
    reviewingShift,
    openReview,
    closeReview,
    submitting,
    submitReview,
  } = useShiftReview();

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-6">
        <Wallet2
          size="35"
          color="#fff"
          variant="Outline"
          style={{ animation: "float 3s ease-in-out infinite" }}
        />
        <h2 className="text-white font-bold text-2xl m-0">{t.shifts}</h2>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-4 py-2 rounded-[10px] text-sm font-semibold transition-colors ${
              statusFilter === tab.value
                ? "bg-white text-[#1a1a2e]"
                : "bg-white/10 text-white/70 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        style={{ ...glassCard, borderRadius: "20px", overflow: "hidden" }}
        className="mb-4"
      >
        <div className="w-full overflow-x-auto table-scroll-x">
          <table className="w-full text-sm" style={{ minWidth: "900px" }}>
            <thead>
              <tr className="border-b border-white/10 text-left">
                {[
                  t.shiftColCashier,
                  t.shiftColOpened,
                  t.shiftColClosed,
                  t.shiftColFloat,
                  t.shiftColExpected,
                  t.shiftColCounted,
                  t.shiftColVariance,
                  t.productColStatus,
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    style={{ color: colors.whiteFull }}
                    className="font-semibold px-4 py-3.5 text-[0.82rem] whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonShiftTable rows={8} />
              ) : shifts.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-10 text-center text-white/50"
                  >
                    {t.noShiftsFoundMsg}
                  </td>
                </tr>
              ) : (
                shifts.map((shift) => (
                  <tr
                    key={shift.id}
                    className="border-b border-white/5 text-white/85"
                  >
                    <td className="px-4 py-3.5 font-medium text-white whitespace-nowrap">
                      {shift.user?.name || "—"}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {fmtDate(shift.opened_at)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {fmtDate(shift.closed_at)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {fmtUsd(shift.opening_cash_usd)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {shift.expected_cash_usd === null
                        ? "—"
                        : fmtUsd(shift.expected_cash_usd)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {shift.counted_cash_usd === null
                        ? "—"
                        : fmtUsd(shift.counted_cash_usd)}
                    </td>
                    <td className="px-4 py-3.5">
                      <VarianceBadge
                        usd={shift.variance_usd}
                        khr={shift.variance_khr}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
                        style={{
                          background:
                            shift.status === "open"
                              ? "rgba(52,152,219,0.15)"
                              : shift.status === "pending_review"
                                ? "rgba(241,196,15,0.15)"
                                : "rgba(46,204,113,0.15)",
                          color:
                            shift.status === "open"
                              ? "#3498db"
                              : shift.status === "pending_review"
                                ? "#f1c40f"
                                : "#2ecc71",
                        }}
                      >
                        {shift.status === "open"
                          ? t.shiftStatusOpen
                          : shift.status === "pending_review"
                            ? t.shiftStatusPending
                            : t.statusTabReviewed}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {shift.status === "pending_review" && (
                        <button
                          onClick={() => openReview(shift)}
                          className="btn-shine-blue px-3 py-1.5 rounded-[8px] text-xs font-semibold"
                        >
                          {t.reviewAction}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-3">
        <span className="text-white/50 text-sm">
          {t.totalShiftsCountMsg.replace("{n}", total)}
        </span>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-[10px] text-sm font-semibold disabled:opacity-30 bg-white/10 text-white"
          >
            {t.paginationBackAction}
          </button>
          <span className="text-white text-sm font-semibold px-2">
            {page} / {lastPage}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page === lastPage}
            className="px-4 py-2 rounded-[10px] text-sm font-semibold disabled:opacity-30 bg-white/10 text-white"
          >
            {t.paginationNextAction}
          </button>
        </div>
      </div>

      <ReviewModal
        shift={reviewingShift}
        show={!!reviewingShift}
        submitting={submitting}
        onSubmit={submitReview}
        onClose={closeReview}
        t={t}
      />
    </Layout>
  );
}

export default ShiftReview;
