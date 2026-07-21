import { DocumentDownload, Calendar, ExportCircle } from "iconsax-react";
import Layout from "../components/layout/Layout";
import { glassCard, colors } from "../utils/styles";
import { useDailyExports } from "../hooks/useDailyExports";
import { useTranslations } from "../hooks/useTranslations";

function fmtDate(v) {
  return v ? new Date(v).toLocaleDateString() : "—";
}
function fmtDateTime(v) {
  return v ? new Date(v).toLocaleString() : "—";
}
function fmtUsd(v) {
  return `$${(Number(v) || 0).toFixed(2)}`;
}

function DailyExports() {
  const { t } = useTranslations();
  const {
    exports,
    loading,
    page,
    setPage,
    lastPage,
    total,
    generateDate,
    setGenerateDate,
    generating,
    downloadingDate,
    handleGenerate,
    handleDownload,
  } = useDailyExports();

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-6">
        <DocumentDownload
          size="35"
          color="#fff"
          variant="Outline"
          style={{ animation: "float 3s ease-in-out infinite" }}
        />
        <h2 className="text-white font-bold text-2xl m-0">{t.dailyExports}</h2>
      </div>

      <div style={glassCard} className="rounded-[20px] p-5 mb-5">
        <h3 className="text-white font-bold text-base m-0 mb-3">
          {t.dailyExportGenerateTitle}
        </h3>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Calendar
              size={18}
              color="rgba(255,255,255,0.5)"
              variant="Linear"
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="date"
              value={generateDate}
              onChange={(e) => setGenerateDate(e.target.value)}
              className="rounded-[10px] border border-white/20 bg-white/10 text-white text-sm py-2.5 pl-10 pr-3 outline-none"
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || !generateDate}
            className="btn-shine-blue px-4 py-2.5 rounded-[10px] text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
          >
            <ExportCircle size={18} color="#fff" variant="Linear" />
            {generating ? t.dashboardGeneratingExportAction : t.dailyExportGenerateAction}
          </button>
        </div>
      </div>

      <div
        style={{ ...glassCard, borderRadius: "20px", overflow: "hidden" }}
        className="mb-4"
      >
        <div className="w-full overflow-x-auto table-scroll-x">
          <table className="w-full text-sm" style={{ minWidth: "700px" }}>
            <thead>
              <tr className="border-b border-white/10 text-left">
                {[
                  t.dailyExportColDate,
                  t.dailyExportColOrders,
                  t.dailyExportColTotal,
                  t.dailyExportColGeneratedAt,
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
                  <td colSpan={5} className="px-4 py-10 text-center text-white/50">
                    {t.loadingMsg}
                  </td>
                </tr>
              ) : exports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-white/50">
                    {t.dailyExportNoneFoundMsg}
                  </td>
                </tr>
              ) : (
                exports.map((exp) => (
                  <tr key={exp.id} className="border-b border-white/5 text-white/85">
                    <td className="px-4 py-3.5 font-medium text-white whitespace-nowrap">
                      {fmtDate(exp.export_date)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">{exp.orders_count}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {fmtUsd(exp.total_amount)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {fmtDateTime(exp.generated_at)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => handleDownload(exp.export_date)}
                        disabled={downloadingDate === exp.export_date}
                        className="btn-shine-blue px-3 py-1.5 rounded-[8px] text-xs font-semibold flex items-center gap-1.5 ml-auto disabled:opacity-60"
                      >
                        <DocumentDownload size={14} color="#fff" variant="Linear" />
                        {downloadingDate === exp.export_date
                          ? t.dailyExportDownloadingAction
                          : t.dailyExportDownloadAction}
                      </button>
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
          {t.dailyExportTotalCountMsg.replace("{n}", total)}
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

export default DailyExports;
