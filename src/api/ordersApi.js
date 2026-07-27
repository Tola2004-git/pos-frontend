import apiClient from "./apiClient";

export const fetchOrdersApi = ({
  search,
  statusFilter,
  dateFrom,
  dateTo,
  page,
  cashierId = "",
  currentShiftOnly = false,
  perPage = 15,
  signal,
}) =>
  apiClient.get("/orders", {
    params: {
      search,
      status: statusFilter,
      date_from: dateFrom,
      date_to: dateTo,
      page,
      per_page: perPage,
      cashier_id: cashierId,
      current_shift: currentShiftOnly,
    },
    signal,
  });

export const fetchSalesByCashierApi = ({
  dateFrom = "",
  dateTo = "",
  currentShiftOnly = false,
  signal,
} = {}) =>
  apiClient.get("/orders/sales-by-cashier", {
    params: { date_from: dateFrom, date_to: dateTo, current_shift: currentShiftOnly },
    signal,
  });

export const fetchSalesSummaryApi = ({ period = "day", dateFrom = "", dateTo = "", signal } = {}) =>
  apiClient.get("/orders/sales-summary", {
    params: { period, date_from: dateFrom, date_to: dateTo },
    signal,
  });

export const fetchTopProductsApi = ({ period = "day", dateFrom = "", dateTo = "", signal } = {}) =>
  apiClient.get("/orders/top-products", {
    params: { period, date_from: dateFrom, date_to: dateTo },
    signal,
  });

export const fetchCategorySalesApi = ({ period = "day", dateFrom = "", dateTo = "", signal } = {}) =>
  apiClient.get("/orders/category-sales", {
    params: { period, date_from: dateFrom, date_to: dateTo },
    signal,
  });

export const fetchProfitSummaryApi = ({ period = "day", dateFrom = "", dateTo = "", signal } = {}) =>
  apiClient.get("/orders/profit-summary", {
    params: { period, date_from: dateFrom, date_to: dateTo },
    signal,
  });

export const fetchProductsApi = () =>
  apiClient.get("/products?per_page=1000&status=1");

export const fetchOrderApi = (id) => apiClient.get(`/orders/${id}`);

export const fetchPaymentMethodsApi = () => apiClient.get("/payment-methods");

export const createOrderApi = (payload) => apiClient.post("/orders", payload);

export const updateOrderApi = (id, payload) =>
  apiClient.put(`/orders/${id}`, payload);

export const changeTableApi = (id, tableId) =>
  apiClient.post(`/orders/${id}/change-table`, { table_id: tableId });

export const cancelOrderApi = (id) => apiClient.put(`/orders/${id}/cancel`);

export const refundOrderApi = (id, reason) =>
  apiClient.put(`/orders/${id}/refund`, { reason });

export const recordReceiptPrintApi = (id) =>
  apiClient.post(`/orders/${id}/record-receipt-print`);

export const fetchLatestOrderApi = () => apiClient.get("/orders/latest");

export default apiClient;
