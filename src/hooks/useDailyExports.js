import { useState, useEffect, useCallback } from "react";
import { alertSuccess, alertError, alertConfirmDelete } from "../utils/alert.jsx";
import { useTranslations } from "./useTranslations";
import {
  fetchDailyExportsApi,
  generateDailyExportApi,
  downloadDailyExportApi,
  deleteDailyExportApi,
} from "../api/dailyExportApi";

function dateKey(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function periodRange(mode) {
  const today = new Date();
  const from = new Date(today);
  const to = new Date(today);

  if (mode === "month") {
    from.setDate(1);
  } else if (mode === "year") {
    from.setMonth(0, 1);
  }

  return { from: dateKey(from), to: dateKey(to) };
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
  const [dateFrom, setDateFrom] = useState(() => periodRange("day").from);
  const [dateTo, setDateTo] = useState(() => periodRange("day").to);
  const [rangeMode, setRangeMode] = useState("day");
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
      await generateDailyExportApi({ date_from: dateFrom, date_to: dateTo });
      alertSuccess(t.dailyExportGeneratedTitle, t.dailyExportGeneratedMsg);
      setPage(1);
      await fetchExports();
    } catch (err) {
      alertError(t.genericErrorTitle, err.response?.data?.message || t.tryAgainMsg);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (exportId, dateFrom, dateTo) => {
    setDownloadingDate(exportId);
    try {
      const res = await downloadDailyExportApi(exportId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      const dateLabel = dateFrom === dateTo ? dateFrom : `${dateFrom}-to-${dateTo}`;
      link.setAttribute("download", `daily-export-${dateLabel}.xlsx`);
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

  const handleDelete = async (exportId) => {
    const result = await alertConfirmDelete(
      t.dailyExportDeleteConfirmTitle,
      t.dailyExportDeleteConfirmMsg,
      t.cancel,
      t.deleteAction,
    );
    if (!result.isConfirmed) return;

    setDeletingDate(exportId);
    try {
      await deleteDailyExportApi(exportId);
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

  const chooseRangeMode = (mode) => {
    setRangeMode(mode);
    if (mode === "custom") return;
    const range = periodRange(mode);
    setDateFrom(range.from);
    setDateTo(range.to);
  };

  const changeDateFrom = (value) => setDateFrom(value);
  const changeDateTo = (value) => setDateTo(value);

  return {
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
  };
}

export default useDailyExports;
