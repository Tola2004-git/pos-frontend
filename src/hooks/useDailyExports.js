import { useState, useEffect, useCallback } from "react";
import { alertSuccess, alertError } from "../utils/alert.jsx";
import { useTranslations } from "./useTranslations";
import {
  fetchDailyExportsApi,
  generateDailyExportApi,
  downloadDailyExportApi,
} from "../api/dailyExportApi";

function todayStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function useDailyExports() {
  const { t } = useTranslations();
  const [exports, setExports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [generateDate, setGenerateDate] = useState(todayStr());
  const [generating, setGenerating] = useState(false);
  const [downloadingDate, setDownloadingDate] = useState(null);

  const fetchExports = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchDailyExportsApi({ page });
      setExports(res.data.data || []);
      setLastPage(res.data.last_page || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to load daily exports:", err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchExports();
  }, [fetchExports]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateDailyExportApi(generateDate);
      alertSuccess(t.dailyExportGeneratedTitle, t.dailyExportGeneratedMsg);
      setPage(1);
      await fetchExports();
    } catch (err) {
      alertError(t.genericErrorTitle, err.response?.data?.message || t.tryAgainMsg);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (exportDate) => {
    setDownloadingDate(exportDate);
    try {
      const res = await downloadDailyExportApi(exportDate);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `daily-export-${exportDate}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alertError(t.genericErrorTitle, err.response?.data?.message || t.tryAgainMsg);
    } finally {
      setDownloadingDate(null);
    }
  };

  return {
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
  };
}

export default useDailyExports;
