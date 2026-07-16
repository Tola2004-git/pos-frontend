import { useState } from "react";
import { Wallet2, TickCircle, Warning2, CloseSquare } from "iconsax-react";
import Layout from "../components/layout/Layout";
import { glassCard, colors } from "../utils/styles";
import { useShiftReview } from "../hooks/useShiftReview";

const STATUS_TABS = [
  { value: "pending_review", label: "Pending Review" },
  { value: "reviewed", label: "Reviewed" },
  { value: "open", label: "Currently Open" },
  { value: "all", label: "All" },
];

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

function ReviewModal({ shift, submitting, onSubmit, onClose }) {
  const [note, setNote] = useState("");

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/60">
      <div
        style={glassCard}
        className="w-full max-w-[480px] rounded-[24px] p-7 text-white border border-white/15"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[#8b5cf6] text-[0.72rem] font-bold uppercase tracking-[1.6px] mb-1">
              Shift Review
            </div>
            <h3 className="text-lg font-bold m-0">
              {shift.user?.name || "Cashier"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full border border-white/15 bg-white/10 text-white"
          >
            <CloseSquare size={18} color="white" variant="Linear" />
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
                <td className="px-4 py-2.5 text-white/70">Opening Float</td>
                <td className="px-4 py-2.5 text-right">
                  {fmtUsd(shift.opening_cash_usd)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {fmtKhr(shift.opening_cash_khr)}
                </td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="px-4 py-2.5 text-white/70">Expected</td>
                <td className="px-4 py-2.5 text-right">
                  {fmtUsd(shift.expected_cash_usd)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {fmtKhr(shift.expected_cash_khr)}
                </td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="px-4 py-2.5 text-white/70">Counted</td>
                <td className="px-4 py-2.5 text-right">
                  {fmtUsd(shift.counted_cash_usd)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {fmtKhr(shift.counted_cash_khr)}
                </td>
              </tr>
              <tr className="border-t border-white/10 font-bold">
                <td className="px-4 py-2.5">Variance</td>
                <td
                  className="px-4 py-2.5 text-right"
                  style={{
                    color:
                      Math.abs(Number(shift.variance_usd)) < 0.01
                        ? "#2ecc71"
                        : "#e67e22",
                  }}
                >
                  {Number(shift.variance_usd) >= 0 ? "+" : ""}
                  {fmtUsd(shift.variance_usd)}
                </td>
                <td
                  className="px-4 py-2.5 text-right"
                  style={{
                    color:
                      Math.abs(Number(shift.variance_khr)) < 1
                        ? "#2ecc71"
                        : "#e67e22",
                  }}
                >
                  {Number(shift.variance_khr) >= 0 ? "+" : ""}
                  {fmtKhr(shift.variance_khr)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {shift.note && (
          <div className="mb-4">
            <div className="text-white/50 text-xs uppercase tracking-wide mb-1">
              Cashier's note
            </div>
            <div className="rounded-[10px] bg-white/[0.06] border border-white/10 px-3 py-2.5 text-sm text-white/80">
              {shift.note}
            </div>
          </div>
        )}

        <div className="mb-5">
          <label className="text-white/65 text-[0.8rem] block mb-1.5">
            Review note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. discussed shortage with cashier, resolved"
            className="w-full rounded-[12px] border border-white/[0.18] bg-white/[0.07] text-white text-sm p-3 outline-none"
            style={{ minHeight: "70px", resize: "vertical" }}
          />
        </div>

        <button
          onClick={() => onSubmit(note)}
          disabled={submitting}
          className="btn-shine-blue w-full py-3.5 rounded-[12px] font-semibold text-sm disabled:opacity-70"
        >
          {submitting ? "Saving..." : "Mark as Reviewed"}
        </button>
      </div>
    </div>
  );
}

function ShiftReview() {
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
        <h2 className="text-white font-bold text-2xl m-0">Cashier Shifts</h2>
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

      <div style={glassCard} className="rounded-[20px] overflow-x-auto mb-4">
        <table className="w-full text-sm" style={{ minWidth: "900px" }}>
          <thead>
            <tr className="border-b border-white/10 text-left">
              {[
                "Cashier",
                "Opened",
                "Closed",
                "Float",
                "Expected",
                "Counted",
                "Variance",
                "Status",
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
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-10 text-center text-white/50"
                >
                  Loading...
                </td>
              </tr>
            ) : shifts.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-10 text-center text-white/50"
                >
                  No shifts found.
                </td>
              </tr>
            ) : (
              shifts.map((shift) => (
                <tr
                  key={shift.id}
                  className="border-b border-white/5 text-white/85"
                >
                  <td className="px-4 py-3.5 font-medium text-white">
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
                      className="px-2.5 py-1 rounded-full text-xs font-semibold"
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
                        ? "Open"
                        : shift.status === "pending_review"
                          ? "Pending"
                          : "Reviewed"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {shift.status === "pending_review" && (
                      <button
                        onClick={() => openReview(shift)}
                        className="btn-shine-blue px-3 py-1.5 rounded-[8px] text-xs font-semibold"
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-white/50 text-sm">Total: {total} shifts</span>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-[10px] text-sm font-semibold disabled:opacity-30 bg-white/10 text-white"
          >
            Back
          </button>
          <span className="text-white text-sm font-semibold px-2">
            {page} / {lastPage}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page === lastPage}
            className="px-4 py-2 rounded-[10px] text-sm font-semibold disabled:opacity-30 bg-white/10 text-white"
          >
            Next
          </button>
        </div>
      </div>

      {reviewingShift && (
        <ReviewModal
          shift={reviewingShift}
          submitting={submitting}
          onSubmit={submitReview}
          onClose={closeReview}
        />
      )}
    </Layout>
  );
}

export default ShiftReview;
