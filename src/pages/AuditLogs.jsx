import { ShieldSecurity } from "iconsax-react";
import Layout from "../components/layout/Layout";
import { glassCard, colors } from "../utils/styles";
import { useAuditLogs } from "../hooks/useAuditLogs";
import { useTranslations } from "../hooks/useTranslations";

function fmtDateTime(v) {
  return v ? new Date(v).toLocaleString() : "—";
}

const ACTION_COLORS = {
  user_deleted: "#e74c3c",
  product_deleted: "#e74c3c",
  promotion_deleted: "#e74c3c",
  expense_deleted: "#e74c3c",
  backup_restored: "#e74c3c",
  backup_restore_failed: "#e74c3c",
  user_created: "#2ecc71",
  user_updated: "#3498db",
  setting_updated: "#3498db",
};

function AuditLogs() {
  const { t } = useTranslations();
  const { logs, loading, page, setPage, lastPage, total } = useAuditLogs();

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
                      style={{ color: colors.whiteFull }}
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
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-white/50">
                    {t.loadingMsg}
                  </td>
                </tr>
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
                          color: ACTION_COLORS[log.action] || "rgba(255,255,255,0.7)",
                          border: `1px solid ${ACTION_COLORS[log.action] || "rgba(255,255,255,0.3)"}`,
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
