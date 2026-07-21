import { useState, useEffect, useCallback } from "react";
import { alertSuccess, alertError, alertConfirmDelete } from "../utils/alert.jsx";
import { useTranslations } from "./useTranslations";
import {
  fetchExpensesApi,
  createExpenseApi,
  updateExpenseApi,
  deleteExpenseApi,
} from "../api/expenseApi";

export function useExpenses() {
  const { t } = useTranslations();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchExpensesApi({ page, search, category: categoryFilter });
      setExpenses(res.data.data || []);
      setLastPage(res.data.last_page || 1);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to load expenses:", err);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const createExpense = async (payload) => {
    try {
      await createExpenseApi(payload);
      alertSuccess(t.successTitle, t.expenseCreatedMsg);
      setPage(1);
      await fetchExpenses();
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

    try {
      await deleteExpenseApi(id);
      alertSuccess(t.successTitle, t.expenseDeletedMsg);
      await fetchExpenses();
    } catch (err) {
      alertError(t.genericErrorTitleShort, err.response?.data?.message || t.tryAgainMsg);
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
    createExpense,
    updateExpense,
    deleteExpense,
    fetchExpenses,
  };
}

export default useExpenses;
