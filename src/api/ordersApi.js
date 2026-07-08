import axios from "axios";

const api = axios.create({ baseURL: "http://127.0.0.1:8000/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchOrdersApi = ({ search, statusFilter, dateFrom, dateTo, page }) =>
  api.get(`/orders?search=${search}&status=${statusFilter}&date_from=${dateFrom}&date_to=${dateTo}&page=${page}&per_page=15`);

export const fetchProductsApi = () =>
  api.get("/products?per_page=1000&status=1");

export const fetchOrderApi = (id) => api.get(`/orders/${id}`);

export const fetchPaymentMethodsApi = () =>
  api.get("/payment-methods");

export const createOrderApi = (payload) =>
  api.post("/orders", payload);

export const updateOrderApi = (id, payload) =>
  api.put(`/orders/${id}`, payload);

export const cancelOrderApi = (id) =>
  api.put(`/orders/${id}/cancel`);

export const fetchLatestOrderApi = () =>
  api.get("/orders/latest");

export default api;