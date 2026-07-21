import { useState, useEffect, useCallback } from "react";
import { alertSuccess, alertError, alertPromptDanger } from "../utils/alert.jsx";
import { useTranslations } from "./useTranslations";
import {
  fetchBackupsApi,
  generateBackupApi,
  downloadBackupApi,
  restoreBackupApi,
} from "../api/backupApi";

export function useBackups() {
  const { t } = useTranslations();
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [restoringId, setRestoringId] = useState(null);

  const fetchBackups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchBackupsApi({ page });
      setBackups(res.data.data || []);
      setLastPage(res.data.last_page || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to load backups:", err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateBackupApi();
      alertSuccess(t.backupGeneratedTitle, t.backupGeneratedMsg);
      setPage(1);
      await fetchBackups();
    } catch (err) {
      alertError(t.genericErrorTitle, err.response?.data?.message || t.tryAgainMsg);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (backup) => {
    setDownloadingId(backup.id);
    try {
      const res = await downloadBackupApi(backup.id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", backup.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alertError(t.genericErrorTitle, err.response?.data?.message || t.tryAgainMsg);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleRestore = async (backup) => {
    const result = await alertPromptDanger(
      t.backupRestoreConfirmTitle,
      t.backupRestoreConfirmMsg.replace("{filename}", backup.filename),
      t.backupRestoreConfirmPlaceholder,
      t.backupRestoreConfirmAction,
      t.cancel,
    );
    if (!result.isConfirmed) return;
    if (result.value !== "RESTORE") {
      alertError(t.genericErrorTitle, t.backupRestoreWrongConfirmMsg);
      return;
    }

    setRestoringId(backup.id);
    try {
      await restoreBackupApi(backup.id, "RESTORE");
      alertSuccess(t.backupRestoredTitle, t.backupRestoredMsg);
    } catch (err) {
      alertError(t.genericErrorTitle, err.response?.data?.message || t.tryAgainMsg);
    } finally {
      setRestoringId(null);
    }
  };

  return {
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
  };
}

export default useBackups;
