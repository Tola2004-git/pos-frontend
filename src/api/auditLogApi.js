import apiClient from "./apiClient";

export const fetchAuditLogsApi = ({
  page = 1,
  action = "all",
  date_from = "",
  date_to = "",
} = {}) =>
  apiClient.get("/audit-logs", {
    params: {
      page,
      per_page: 20,
      action,
      date_from: date_from || undefined,
      date_to: date_to || undefined,
    },
  });

export const fetchSecuritySummaryApi = () =>
  apiClient.get("/audit-logs/security-summary");
