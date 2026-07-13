import { useState, useEffect, useCallback } from "react";
import { fetchStockHistory } from "../utils/stockHistoryApi";

export function useStockHistory() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleActionFilter = (value) => {
    setActionFilter(value);
    setPage(1);
  };

  const loadHistory = useCallback(async (signal) => {
    setLoading(true);
    try {
      const data = await fetchStockHistory(
        { search: debouncedSearch, action: actionFilter, page },
        signal,
      );
      setLogs(data.data);
      setLastPage(data.last_page);
      setTotal(data.total);
    } catch (err) {
      if (err.name !== "CanceledError") console.error(err);
    } finally {
      // Skip the state update if this request was aborted by the cleanup
      // below (e.g. search/filter changed) so a stale response can't
      // flip `loading` back off after a newer request has taken over.
      if (!signal.aborted) setLoading(false);
    }
  }, [debouncedSearch, actionFilter, page]);

  useEffect(() => {
    const controller = new AbortController();
    loadHistory(controller.signal);
    return () => controller.abort();
  }, [loadHistory]);

  return {
    logs,
    loading,
    search,
    setSearch,
    actionFilter,
    handleActionFilter,
    page,
    setPage,
    lastPage,
    total,
  };
}
