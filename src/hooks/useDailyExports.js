import { useState, useEffect, useCallback } from "react";
import { alertSuccess, alertError, alertConfirmDelete } from "../utils/alert.jsx";
import { useTranslations } from "./useTranslations";
import {
  fetchDailyExportsApi,
  generateDailyExportApi,
  downloadDailyExportApi,
  deleteDailyExportApi,
} from "../api/dailyExportApi";

function todayStr() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

async function extractErrorMessage(err) {
  const data = err.response?.data;
  if (data instanceof Blob) {
    try {
      return JSON.parse(await data.text())?.message;
    } catch {
      return null;
    }
  }
  return data?.message;
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
  const [deletingDate, setDeletingDate] = useState(null);

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
      alertError(t.genericErrorTitle, (await extractErrorMessage(err)) || t.tryAgainMsg);
    } finally {
      setDownloadingDate(null);
    }
  };

  const handleDelete = async (exportDate) => {
    const result = await alertConfirmDelete(
      t.dailyExportDeleteConfirmTitle,
      t.dailyExportDeleteConfirmMsg,
      t.cancel,
      t.deleteAction,
    );
    if (!result.isConfirmed) return;

    setDeletingDate(exportDate);
    try {
      await deleteDailyExportApi(exportDate);
      alertSuccess(t.dailyExportDeletedTitle, t.dailyExportDeletedMsg);
      if (exports.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await fetchExports();
      }
    } catch (err) {
      alertError(t.genericErrorTitle, (await extractErrorMessage(err)) || t.tryAgainMsg);
    } finally {
      setDeletingDate(null);
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
    deletingDate,
    handleGenerate,
    handleDownload,
    handleDelete,
  };
}

export default useDailyExports;
