import apiClient from "./apiClient";

export const fetchDailyExportsApi = ({ page = 1 } = {}) =>
  apiClient.get(`/daily-exports?page=${page}&per_page=15`);

export const generateDailyExportApi = (date) =>
  apiClient.post("/daily-exports/generate", date ? { date } : {});

export const downloadDailyExportApi = (date) =>
  apiClient.get(`/daily-exports/${date}/download`, { responseType: "blob" });
