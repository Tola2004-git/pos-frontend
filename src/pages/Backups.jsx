import { CloudChange, DocumentDownload, Refresh } from "iconsax-react";
import Layout from "../components/layout/Layout";
import { glassCard, colors } from "../utils/styles";
import { useBackups } from "../hooks/useBackups";
import { useTranslations } from "../hooks/useTranslations";

function fmtDateTime(v) {
  return v ? new Date(v).toLocaleString() : "—";
}
function fmtSize(bytes) {
  if (!bytes) return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

function StatusBadge({ status, t }) {
  const styles = {
    success: { color: "#2ecc71", label: t.backupStatusSuccess },
    running: { color: "#f39c12", label: t.backupStatusRunning },
    failed: { color: "#e74c3c", label: t.backupStatusFailed },
  };
  const s = styles[status] || styles.running;
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "0.78rem",
        fontWeight: 600,
        color: s.color,
        border: `1px solid ${s.color}`,
      }}
    >
      {s.label}
    </span>
  );
}

function Backups() {
  const { t } = useTranslations();
  const {
    backups,
    loading,
    page,
    setPage,
    lastPage,
    total,
    generating,
    downloadingId,
    restoringId,
    handleGenerate,
    handleDownload,
    handleRestore,
  } = useBackups();

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-6">
        <CloudChange
          size="35"
          color="#fff"
          variant="Outline"
          style={{ animation: "float 3s ease-in-out infinite" }}
        />
        <h2 className="text-white font-bold text-2xl m-0">{t.backups}</h2>
      </div>

      <div style={glassCard} className="rounded-[20px] p-5 mb-5">
        <h3 className="text-white font-bold text-base m-0 mb-2">
          {t.backupGenerateTitle}
        </h3>
        <p className="text-white/50 text-sm m-0 mb-3">{t.backupGenerateSubtitle}</p>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="btn-shine-blue px-4 py-2.5 rounded-[10px] text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
        >
          <Refresh
            size={18}
            color="#fff"
            variant="Linear"
            style={generating ? { animation: "spin 0.8s linear infinite" } : {}}
          />
          {generating ? t.backupGeneratingAction : t.backupGenerateAction}
        </button>
      </div>

      <div
        style={{ ...glassCard, borderRadius: "20px", overflow: "hidden" }}
        className="mb-4"
      >
        <div className="w-full overflow-x-auto table-scroll-x">
          <table className="w-full text-sm" style={{ minWidth: "800px" }}>
            <thead>
              <tr className="border-b border-white/10 text-left">
                {[
                  t.backupColFilename,
                  t.backupColStatus,
                  t.backupColSize,
                  t.backupColDisks,
                  t.backupColCreatedAt,
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
                  <td colSpan={6} className="px-4 py-10 text-center text-white/50">
                    {t.loadingMsg}
                  </td>
                </tr>
              ) : backups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-white/50">
                    {t.backupNoneFoundMsg}
                  </td>
                </tr>
              ) : (
                backups.map((b) => (
                  <tr key={b.id} className="border-b border-white/5 text-white/85">
                    <td className="px-4 py-3.5 font-medium text-white whitespace-nowrap">
                      {b.filename}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={b.status} t={t} />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {fmtSize(b.size_bytes)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {(b.disks || []).join(", ") || "—"}
                      {b.error_message && (
                        <span
                          title={b.error_message}
                          className="ml-1.5 cursor-help"
                          style={{ color: "#f39c12" }}
                        >
                          ⚠
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {fmtDateTime(b.created_at)}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleDownload(b)}
                          disabled={b.status !== "success" || downloadingId === b.id}
                          className="btn-shine-blue px-3 py-1.5 rounded-[8px] text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40"
                        >
                          <DocumentDownload size={14} color="#fff" variant="Linear" />
                          {downloadingId === b.id
                            ? t.dailyExportDownloadingAction
                            : t.dailyExportDownloadAction}
                        </button>
                        <button
                          onClick={() => handleRestore(b)}
                          disabled={b.status !== "success" || restoringId === b.id}
                          className="px-3 py-1.5 rounded-[8px] text-xs font-semibold flex items-center gap-1.5 disabled:opacity-40"
                          style={{
                            background: "rgba(231,76,60,0.2)",
                            border: "1px solid rgba(231,76,60,0.4)",
                            color: "#ff6b6b",
                          }}
                        >
                          {restoringId === b.id
                            ? t.backupRestoringAction
                            : t.backupRestoreAction}
                        </button>
                      </div>
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
          {t.backupTotalCountMsg.replace("{n}", total)}
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

export default Backups;
