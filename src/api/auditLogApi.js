import apiClient from "./apiClient";

export const fetchAuditLogsApi = ({ page = 1, action = "all" } = {}) =>
  apiClient.get("/audit-logs", {
    params: { page, per_page: 20, action },
  });
