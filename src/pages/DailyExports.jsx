import { DocumentDownload, ExportCircle, Trash } from "iconsax-react";
import Layout from "../components/layout/Layout";
import { glassCard, accentBorder } from "../utils/styles";
import { useDailyExports } from "../hooks/useDailyExports";
import { useTranslations } from "../hooks/useTranslations";
import { SkeletonDailyExportTable } from "../components/ui/SkeletonDailyExport";
import { Tooltip } from "../components/ui/Tooltip";
import DateRangePicker from "../components/common/DateRangePicker";

function fmtRange(from, to) {
  if (!from) return "—";
  const formatDate = (value) => {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString();
  };
  const start = formatDate(from);
  return from === to ? start : `${start} - ${formatDate(to)}`;
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
    dateFrom,
    dateTo,
    rangeMode,
    chooseRangeMode,
    changeDateFrom,
    changeDateTo,
    generating,
    downloadingDate,
    deletingDate,
    handleGenerate,
    handleDownload,
    handleDelete,
  } = useDailyExports();

  return (
    <Layout>
      <div className="flex items-center gap-3 mb-6">
        <DocumentDownload
          size="35"
          color="currentColor"
          variant="Outline"
          className="text-white"
          style={{ animation: "float 3s ease-in-out infinite" }}
        />
        <h2 className="text-white font-bold text-2xl m-0">{t.dailyExports}</h2>
      </div>

      <div style={glassCard} className="rounded-[20px] p-5 mb-5 w-fit">
        <h3 className="text-white font-bold text-base m-0 mb-3">
          {t.dailyExportGenerateTitle}
        </h3>
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className="flex items-center gap-1 p-1 rounded-full relative"
            style={glassCard}
            role="group"
            aria-label={t.dailyExportPeriodLabel}
          >
            {[
              ["day", t.periodDayLabel],
              ["month", t.periodMonthLabel],
              ["year", t.periodYearLabel],
              ["custom", t.periodCustomLabel],
            ].map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => chooseRangeMode(mode)}
                aria-pressed={rangeMode === mode}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  rangeMode === mode ? "text-white" : "text-white/50"
                }`}
                style={{
                  background: rangeMode === mode ? "var(--surface-tint-15)" : "transparent",
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {rangeMode === "custom" && (
            <DateRangePicker
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={changeDateFrom}
              onDateToChange={changeDateTo}
              maxDate={new Date()}
              placeholder={t.selectDateRange}
            />
          )}
          <button
            onClick={handleGenerate}
            disabled={generating || !dateFrom || !dateTo || dateTo < dateFrom}
            className="btn-shine-blue px-4 py-2.5 rounded-[10px] text-sm font-semibold flex items-center gap-2 disabled:opacity-60"
          >
            {generating ? (
              <svg
                className="animate-spin"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <circle
                  cx="9"
                  cy="9"
                  r="7"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="2"
                />
                <path
                  d="M9 2 A7 7 0 0 1 16 9"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <ExportCircle size={18} color="#fff" variant="Linear" />
            )}
            {generating
              ? t.dashboardGeneratingExportAction
              : t.dailyExportGenerateAction}
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
                  t.productColActions,
                ].map((h, i) => (
                  <th
                    key={h || `col-${i}`}
                    style={{ color: accentBorder.full }}
                    className="font-semibold px-4 py-3.5 text-[0.82rem] whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonDailyExportTable rows={6} />
              ) : exports.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-white/50"
                  >
                    {t.dailyExportNoneFoundMsg}
                  </td>
                </tr>
              ) : (
                exports.map((exp) => (
                  <tr
                    key={exp.id}
                    className="border-b border-white/5 text-white/85"
                  >
                    <td className="px-4 py-3.5 font-medium text-white whitespace-nowrap">
                      {fmtRange(exp.date_from, exp.date_to)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {exp.orders_count}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {fmtUsd(exp.total_amount)}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {fmtDateTime(exp.generated_at)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 justify-start">
                        <button
                          onClick={() => handleDownload(exp.id, exp.date_from, exp.date_to)}
                          disabled={downloadingDate === exp.id}
                          className="btn-shine-blue px-3 py-1.5 rounded-[8px] text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60"
                        >
                          <DocumentDownload
                            size={14}
                            color="#fff"
                            variant="Linear"
                          />
                          {downloadingDate === exp.id
                            ? t.dailyExportDownloadingAction
                            : t.dailyExportDownloadAction}
                        </button>
                        <Tooltip label={t.deleteAction}>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            disabled={deletingDate === exp.id}
                            aria-label={t.deleteAction}
                            className="p-1.5 rounded-[8px] hover:scale-110 transition-all duration-200 disabled:opacity-60 disabled:hover:scale-100"
                          >
                            {deletingDate === exp.id ? (
                              <svg
                                className="animate-spin"
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                              >
                                <circle
                                  cx="9"
                                  cy="9"
                                  r="7"
                                  stroke="var(--surface-border)"
                                  strokeWidth="2"
                                />
                                <path
                                  d="M9 2 A7 7 0 0 1 16 9"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                            ) : (
                              <Trash size={18} color="currentColor" variant="Linear" />
                            )}
                          </button>
                        </Tooltip>
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
          {t.dailyExportTotalCountMsg.replace("{n}", total)}
        </span>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={page === 1 ? { background: "var(--surface-tint-08)" } : undefined}
            className={`px-4 py-2 rounded-[10px] border text-sm font-semibold transition-colors ${
              page === 1
                ? "text-white/30 border-white/10 cursor-not-allowed"
                : "bg-white/10 text-white border-white/15"
            }`}
          >
            {t.paginationBackAction}
          </button>
          <span className="text-white text-sm font-semibold px-2">
            {page} / {lastPage}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page === lastPage}
            style={page === lastPage ? { background: "var(--surface-tint-08)" } : undefined}
            className={`px-4 py-2 rounded-[10px] border text-sm font-semibold transition-colors ${
              page === lastPage
                ? "text-white/30 border-white/10 cursor-not-allowed"
                : "bg-white/10 text-white border-white/15"
            }`}
          >
            {t.paginationNextAction}
          </button>
        </div>
      </div>
    </Layout>
  );
}

export default DailyExports;
