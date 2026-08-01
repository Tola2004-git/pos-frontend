import { useEffect, useRef, useState } from "react";
import { ShieldSecurity } from "iconsax-react";
import Layout from "../components/layout/Layout";
import { glassCard, accentBorder } from "../utils/styles";
import { useAuditLogs } from "../hooks/useAuditLogs";
import { useTranslations } from "../hooks/useTranslations";
import DateRangePicker from "../components/common/DateRangePicker";
import { SkeletonAuditLogTable } from "../components/ui/SkeletonAuditLog";

function fmtDateTime(v) {
  return v ? new Date(v).toLocaleString() : "—";
}

// Colors follow the verb suffix on the action name (see AuditLog::record()
// call sites across the controllers) so any new "<noun>_created/updated/
// deleted" action picks up the right color automatically without another
// edit here - only genuine exceptions need a line in OVERRIDES.
const ACTION_COLOR_OVERRIDES = {
  order_refunded: "#e74c3c",
  backup_restored: "#e74c3c",
  backup_restore_failed: "#e74c3c",
  backup_downloaded: "rgba(255,255,255,0.7)",
  login_failed: "#e74c3c",
};

function getActionColor(action) {
  if (ACTION_COLOR_OVERRIDES[action]) return ACTION_COLOR_OVERRIDES[action];
  if (action.endsWith("_deleted")) return "#e74c3c";
  if (action.endsWith("_created") || action.endsWith("_generated")) return "#2ecc71";
  if (action.endsWith("_updated") || action.endsWith("_reviewed")) return "#3498db";
  if (action.endsWith("_restocked")) return "#f39c12";
  return "rgba(255,255,255,0.7)";
}

// Grouped for the filter dropdown's <optgroup> labels; the action values
// themselves match AuditLog::record() calls verbatim across the backend.
const ACTION_GROUPS = [
  { label: "Users", actions: ["user_created", "user_updated", "user_deleted"] },
  {
    label: "Products",
    actions: ["product_created", "product_updated", "product_deleted", "product_restocked"],
  },
  { label: "Categories", actions: ["category_created", "category_updated", "category_deleted"] },
  {
    label: "Ingredients",
    actions: ["ingredient_created", "ingredient_updated", "ingredient_deleted", "ingredient_restocked"],
  },
  { label: "Promotions", actions: ["promotion_created", "promotion_updated", "promotion_deleted"] },
  {
    label: "Payment Methods",
    actions: ["payment_method_created", "payment_method_updated", "payment_method_deleted"],
  },
  { label: "Tables", actions: ["table_created", "table_updated", "table_deleted"] },
  { label: "Expenses", actions: ["expense_created", "expense_updated", "expense_deleted"] },
  { label: "Orders", actions: ["order_refunded"] },
  { label: "Cashier Shifts", actions: ["shift_reviewed"] },
  { label: "Settings", actions: ["setting_updated"] },
  {
    label: "Backups",
    actions: [
      "backup_generated",
      "backup_downloaded",
      "backup_restored",
      "backup_restore_failed",
      "backup_deleted",
    ],
  },
  { label: "Daily Exports", actions: ["daily_export_generated", "daily_export_deleted"] },
  { label: "Authentication", actions: ["user_logged_in", "user_logged_out", "login_failed"] },
];

function ActionFilterDropdown({ value, onChange, allLabel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const currentLabel = value === "all" ? allLabel : value;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          ...glassCard,
          padding: "12px 18px",
          borderRadius: "16px",
          cursor: "pointer",
          color: "white",
          fontWeight: 600,
          fontSize: "0.85rem",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          whiteSpace: "nowrap",
        }}
      >
        {currentLabel}
        <span style={{ fontSize: "0.7rem" }}>{open ? "▲" : "▼"}</span>
      </button>

      <style>{`
        @keyframes dropdownFade {
          from { opacity: 0; transform: scale(0.95) translateY(-5px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      {open && (
        <div
          style={{
            ...glassCard,
            position: "absolute",
            top: "110%",
            left: 0,
            borderRadius: "14px",
            zIndex: 99999,
            minWidth: "220px",
            maxHeight: "340px",
            overflowY: "auto",
            boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
            animation: "dropdownFade 0.2s ease",
            transformOrigin: "top left",
          }}
          className="[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
        >
          <button
            onClick={() => {
              onChange("all");
              setOpen(false);
            }}
            style={{
              display: "flex",
              width: "100%",
              padding: "11px 16px",
              background: value === "all" ? "var(--surface-tint-15)" : "transparent",
              border: "none",
              cursor: "pointer",
              color: value === "all" ? accentBorder.full : "rgba(255,255,255,0.85)",
              fontSize: "0.88rem",
              fontWeight: value === "all" ? 700 : 400,
              textAlign: "left",
              borderLeft: value === "all" ? `3px solid ${accentBorder.full}` : "3px solid transparent",
            }}
          >
            {allLabel}
          </button>
          {ACTION_GROUPS.map((group) => (
            <div key={group.label}>
              <div
                style={{
                  padding: "10px 16px 4px",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
                }}
              >
                {group.label}
              </div>
              {group.actions.map((action) => (
                <button
                  key={action}
                  onClick={() => {
                    onChange(action);
                    setOpen(false);
                  }}
                  style={{
                    display: "flex",
                    width: "100%",
                    padding: "9px 16px",
                    background: value === action ? "var(--surface-tint-15)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: value === action ? accentBorder.full : "rgba(255,255,255,0.85)",
                    fontSize: "0.85rem",
                    fontWeight: value === action ? 700 : 400,
                    textAlign: "left",
                    borderLeft: value === action ? `3px solid ${accentBorder.full}` : "3px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--surface-tint-12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      value === action ? "var(--surface-tint-15)" : "transparent";
                  }}
                >
                  {action}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AuditLogs() {
  const { t } = useTranslations();
  const {
    logs,
    loading,
    page,
    setPage,
    lastPage,
    total,
    actionFilter,
    setActionFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
  } = useAuditLogs();

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-6">
        <ShieldSecurity
          size="35"
          color="#fff"
          variant="Outline"
          style={{ animation: "float 3s ease-in-out infinite" }}
        />
        <h2 className="text-white font-bold text-2xl m-0">{t.auditLogs}</h2>
      </div>

      <div className="flex flex-wrap gap-3 mb-5 items-center">
        <ActionFilterDropdown
          value={actionFilter}
          onChange={setActionFilter}
          allLabel={t.auditFilterAllActions}
        />

        <DateRangePicker
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          placeholder={t.selectDateRange}
        />
      </div>

      <div
        style={{ ...glassCard, borderRadius: "20px", overflow: "hidden" }}
        className="mb-4"
      >
        <div className="w-full overflow-x-auto table-scroll-x">
          <table className="w-full text-sm" style={{ minWidth: "800px" }}>
            <thead>
              <tr className="border-b border-white/10 text-left">
                {[t.auditColUser, t.auditColAction, t.auditColDescription, t.auditColDate].map(
                  (h) => (
                    <th
                      key={h}
                      style={{ color: accentBorder.full }}
                      className="font-semibold px-4 py-3.5 text-[0.82rem] whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonAuditLogTable rows={8} />
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-white/50">
                    {t.auditNoneFoundMsg}
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 text-white/85">
                    <td className="px-4 py-3.5 font-medium text-white whitespace-nowrap">
                      {log.user?.name || t.naLabel}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: getActionColor(log.action),
                          border: `1px solid ${getActionColor(log.action)}`,
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-white/70">{log.description || "—"}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {fmtDateTime(log.created_at)}
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
          {t.auditTotalCountMsg.replace("{n}", total)}
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
    </Layout>
  );
}

export default AuditLogs;
