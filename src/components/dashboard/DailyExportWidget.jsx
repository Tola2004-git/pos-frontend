import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DocumentDownload } from "iconsax-react";
import { glassCard } from "../../utils/styles";
import { generateDailyExportApi, downloadDailyExportApi } from "../../api/dailyExportApi";

export function DailyExportWidget({ t }) {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);

  const handleGenerateAndDownloadExport = async () => {
    setExporting(true);
    setExportError(false);
    const today = new Date().toISOString().slice(0, 10);
    try {
      await generateDailyExportApi(today);
      const res = await downloadDailyExportApi(today);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `daily-export-${today}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate/download daily export:", err);
      setExportError(true);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={glassCard} className="no-print rounded-[20px] p-5 mt-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <DocumentDownload
            size={20}
            color="#fff"
            variant="Linear"
            style={{ animation: "float 3s ease-in-out infinite" }}
          />
          <div>
            <h3 className="text-white font-bold text-base m-0">{t.dashboardDailyExportTitle}</h3>
            <p className="text-white/50 text-xs m-0 mt-0.5">{t.dashboardDailyExportDesc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => navigate("/daily-exports")}
            className="no-print text-xs font-semibold text-white/60 hover:text-white transition-colors"
          >
            {t.dashboardViewAllAction}
          </button>
          <button
            onClick={handleGenerateAndDownloadExport}
            disabled={exporting}
            className="text-xs font-semibold px-4 py-2 rounded-full transition-colors"
            style={{
              color: "#1abc9c",
              background: "rgba(26,188,156,0.15)",
              opacity: exporting ? 0.6 : 1,
              cursor: exporting ? "not-allowed" : "pointer",
            }}
          >
            {exporting ? t.dashboardGeneratingExportAction : t.dashboardGenerateExportAction}
          </button>
        </div>
      </div>
      {exportError && (
        <p className="text-[#e74c3c] text-xs mt-3 mb-0">{t.dashboardExportFailedMsg}</p>
      )}
    </div>
  );
}

export default DailyExportWidget;
