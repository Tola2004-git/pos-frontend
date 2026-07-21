import apiClient from "./apiClient";

export const fetchBackupsApi = ({ page = 1 } = {}) =>
  apiClient.get(`/backups?page=${page}&per_page=15`);

export const generateBackupApi = () => apiClient.post("/backups/generate");

export const downloadBackupApi = (id) =>
  apiClient.get(`/backups/${id}/download`, { responseType: "blob" });

export const restoreBackupApi = (id, confirm) =>
  apiClient.post(`/backups/${id}/restore`, { confirm });
