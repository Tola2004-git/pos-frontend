import { useState, useEffect, useCallback } from "react";
import { fetchAuditLogsApi } from "../api/auditLogApi";

export function useAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchAuditLogsApi({
        page,
        action: actionFilter,
        date_from: dateFrom,
        date_to: dateTo,
      });
      setLogs(res.data.data || []);
      setLastPage(res.data.last_page || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleActionFilterChange = (value) => {
    setActionFilter(value);
    setPage(1);
  };

  const handleDateFromChange = (value) => {
    setDateFrom(value);
    setPage(1);
  };

  const handleDateToChange = (value) => {
    setDateTo(value);
    setPage(1);
  };

  return {
    logs,
    loading,
    page,
    setPage,
    lastPage,
    total,
    actionFilter,
    setActionFilter: handleActionFilterChange,
    dateFrom,
    setDateFrom: handleDateFromChange,
    dateTo,
    setDateTo: handleDateToChange,
  };
}

export default useAuditLogs;
