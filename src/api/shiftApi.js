import apiClient from "./apiClient";

export const fetchCurrentShiftApi = () =>
  apiClient.get("/cashier-shifts/current");

export const fetchShiftsApi = ({ status = "all", page = 1 } = {}) =>
  apiClient.get(`/cashier-shifts?status=${status}&page=${page}&per_page=15`);

export const fetchShiftApi = (id) => apiClient.get(`/cashier-shifts/${id}`);

export const openShiftApi = (payload) =>
  apiClient.post("/cashier-shifts/open", payload);

export const closeShiftApi = (id, payload) =>
  apiClient.put(`/cashier-shifts/${id}/close`, payload);

export const reviewShiftApi = (id, payload) =>
  apiClient.put(`/cashier-shifts/${id}/review`, payload);

export const addCashMovementApi = (id, payload) =>
  apiClient.post(`/cashier-shifts/${id}/cash-movements`, payload);

export const fetchCashMovementsSummaryApi = ({ dateFrom = "", dateTo = "" } = {}) =>
  apiClient.get(
    `/cashier-shifts/cash-movements-summary?date_from=${dateFrom}&date_to=${dateTo}`,
  );
