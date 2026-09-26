import apiClient from "./apiClient";

export const fetchDailyExportsApi = ({ page = 1 } = {}) =>
  apiClient.get(`/daily-exports?page=${page}&per_page=15`);

export const generateDailyExportApi = (range) =>
  apiClient.post("/daily-exports/generate", range);

export const downloadDailyExportApi = (id) =>
  apiClient.get(`/daily-exports/${id}/download`, { responseType: "blob" });

export const deleteDailyExportApi = (id) =>
  apiClient.delete(`/daily-exports/${id}`);
