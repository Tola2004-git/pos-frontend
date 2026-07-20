import apiClient from "./apiClient";

export const fetchOrdersApi = ({
  search,
  statusFilter,
  dateFrom,
  dateTo,
  page,
  cashierId = "",
  currentShiftOnly = false,
}) =>
  apiClient.get(
    `/orders?search=${search}&status=${statusFilter}&date_from=${dateFrom}&date_to=${dateTo}&page=${page}&per_page=15&cashier_id=${cashierId}&current_shift=${currentShiftOnly}`,
  );

export const fetchSalesByCashierApi = ({
  dateFrom = "",
  dateTo = "",
  currentShiftOnly = false,
} = {}) =>
  apiClient.get(
    `/orders/sales-by-cashier?date_from=${dateFrom}&date_to=${dateTo}&current_shift=${currentShiftOnly}`,
  );

export const fetchSalesTrendApi = ({ dateFrom = "", dateTo = "" } = {}) =>
  apiClient.get(`/orders/sales-trend?date_from=${dateFrom}&date_to=${dateTo}`);

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
