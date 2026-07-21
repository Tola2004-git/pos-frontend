import apiClient from "./apiClient";

export const fetchExpensesApi = ({
  page = 1,
  search = "",
  category = "all",
  dateFrom = "",
  dateTo = "",
} = {}) =>
  apiClient.get("/expenses", {
    params: {
      page,
      per_page: 15,
      search: search || undefined,
      category,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    },
  });

export const fetchExpenseSummaryApi = (period = "day") =>
  apiClient.get(`/expenses/summary?period=${period}`);

export const createExpenseApi = (payload) => apiClient.post("/expenses", payload);

export const updateExpenseApi = (id, payload) =>
  apiClient.put(`/expenses/${id}`, payload);

export const deleteExpenseApi = (id) => apiClient.delete(`/expenses/${id}`);
