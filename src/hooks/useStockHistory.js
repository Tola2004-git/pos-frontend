import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { fetchStockHistory } from "../utils/stockHistoryApi";
import { User } from "iconsax-react";

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

  const loadHistory = useCallback(async () => {
    setLoading(true);
    const controller = new AbortController();
    try {
      const data = await fetchStockHistory(
        {
          search: debouncedSearch,
          action: actionFilter,
          page,
        },
        controller.signal,
      );
      setLogs(data.data);
      setLastPage(data.last_page);
      setTotal(data.total);
    } catch (err) {
      if (err.name !== "CanceledError") console.error(err);
    } finally {
      setLoading(false);
    }
    return () => controller.abort();
  }, [debouncedSearch, actionFilter, page]);

  useEffect(() => {
    const cleanup = loadHistory();
    return () => {
      if (cleanup instanceof Function) cleanup();
    };
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
