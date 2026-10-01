import { useState, useEffect, useCallback } from "react";
import { alertSuccess, alertError, alertConfirmDelete } from "../utils/alert.jsx";
import { useTranslations } from "./useTranslations";
import {
  fetchExpensesApi,
  fetchExpenseSummaryApi,
  createExpenseApi,
  updateExpenseApi,
  deleteExpenseApi,
} from "../api/expenseApi";

function dateKey(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function periodRange(mode) {
  const today = new Date();
  const from = new Date(today);
  if (mode === "month") from.setDate(1);
  if (mode === "year") from.setMonth(0, 1);
  return { from: dateKey(from), to: dateKey(today) };
}

export function useExpenses() {
  const { t } = useTranslations();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const [rangeMode, setRangeMode] = useState("day");
  const [dateRange, setDateRange] = useState(() => periodRange("day"));
  const [summary, setSummary] = useState({
    total_usd: 0,
    total_khr: 0,
    expenses_count: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(true);
  const { from: dateFrom, to: dateTo } = dateRange;

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchExpensesApi({
        page,
        search,
        category: categoryFilter,
        dateFrom,
        dateTo,
      });
      setExpenses(res.data.data || []);
      setLastPage(res.data.last_page || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to load expenses:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const fetchSummary = useCallback(async (signal) => {
    try {
      const res = await fetchExpenseSummaryApi(
        rangeMode === "custom" ? "day" : rangeMode,
        dateFrom,
        dateTo,
        signal,
      );
      setSummary(res.data);
    } catch (err) {
      if (!signal?.aborted) {
        console.error("Failed to load expense summary:", err);
      }
    } finally {
      if (!signal?.aborted) setSummaryLoading(false);
    }
  }, [rangeMode, dateFrom, dateTo]);

  useEffect(() => {
    const controller = new AbortController();
    fetchSummary(controller.signal);
    return () => controller.abort();
  }, [fetchSummary]);

  const chooseRangeMode = (mode) => {
    setRangeMode(mode);
    setSummaryLoading(true);
    setPage(1);
    if (mode === "custom") return;
    const range = periodRange(mode);
    setDateRange({ from: range.from, to: range.to });
  };

  const changeDateFrom = (from) => {
    setSummaryLoading(true);
    setPage(1);
    setDateRange((current) => ({ ...current, from }));
  };

  const changeDateTo = (to) => {
    setSummaryLoading(true);
    setPage(1);
    setDateRange((current) => ({ ...current, to }));
  };

  const createExpense = async (payload) => {
    try {
      await createExpenseApi(payload);
      alertSuccess(t.successTitle, t.expenseCreatedMsg);
      setPage(1);
      await fetchExpenses();
      await fetchSummary();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || t.tryAgainMsg;
      alertError(t.genericErrorTitleShort, message);
      return { success: false, error: message };
    }
  };

  const updateExpense = async (id, payload) => {
    try {
      await updateExpenseApi(id, payload);
      alertSuccess(t.successTitle, t.expenseUpdatedMsg);
      await fetchExpenses();
      await fetchSummary();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || t.tryAgainMsg;
      alertError(t.genericErrorTitleShort, message);
      return { success: false, error: message };
    }
  };

  const deleteExpense = async (id) => {
    const result = await alertConfirmDelete(
      t.expenseDeleteConfirmTitle,
      t.expenseDeleteConfirmMsg,
      t.cancel,
      t.deleteAction,
    );
    if (!result.isConfirmed) return;

    setDeletingId(id);
    try {
      await deleteExpenseApi(id);
      alertSuccess(t.successTitle, t.expenseDeletedMsg);
      await fetchExpenses();
      await fetchSummary();
    } catch (err) {
      alertError(t.genericErrorTitleShort, err.response?.data?.message || t.tryAgainMsg);
    } finally {
      setDeletingId(null);
    }
  };

  return {
    expenses,
    loading,
    page,
    setPage,
    lastPage,
    total,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    rangeMode,
    chooseRangeMode,
    dateFrom,
    dateTo,
    changeDateFrom,
    changeDateTo,
    summary,
    summaryLoading,
    deletingId,
    createExpense,
    updateExpense,
    deleteExpense,
    fetchExpenses,
  };
}

export default useExpenses;
