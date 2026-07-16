import { useState, useEffect, useRef, useCallback } from "react";
import {
  fetchOrdersApi,
  fetchProductsApi,
  fetchPaymentMethodsApi,
  fetchLatestOrderApi,
  cancelOrderApi,
} from "../api/ordersApi";
import { alertConfirmWarning, alertError } from "../utils/alert.jsx";

const TOAST_DURATION = 3000;
// Payment toasts carry a "Print Receipt" action - give the cashier a
// realistic window to click it instead of the default 3s auto-dismiss.
const TOAST_DURATIONS = {
  payment: 8000,
};

function todayStr() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function useOrders({ defaultToday = false } = {}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState(defaultToday ? todayStr() : "");
  const [dateTo, setDateTo] = useState(defaultToday ? todayStr() : "");
  const [cashierFilter, setCashierFilter] = useState("");
  // Only meaningful for a cashier viewing their own "My Sales" - the backend
  // ignores this param entirely for an admin, so defaulting it true here is
  // harmless for pages (like admin Orders) that never render the toggle.
  const [currentShiftOnly, setCurrentShiftOnly] = useState(defaultToday);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [toasts, setToasts] = useState([]);
  const lastOrderId = useRef(null);
  const [focusedField, setFocusedField] = useState("");
  const [cancelLoadingId, setCancelLoadingId] = useState(null);


  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchOrdersApi({
        search, statusFilter, dateFrom, dateTo, page,
        cashierId: cashierFilter,
        currentShiftOnly,
      });
      setOrders(res.data.data);
      setLastPage(res.data.last_page);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, dateFrom, dateTo, page, cashierFilter, currentShiftOnly]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((order, type = "payment") => {
    const id = Date.now();
    const duration = TOAST_DURATIONS[type] || TOAST_DURATION;
    setToasts((prev) => [...prev, { id, order, type, duration }]);
    setTimeout(() => removeToast(id), duration);
  }, [removeToast]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetchLatestOrderApi();
        if (res.data.order && res.data.order.id !== lastOrderId.current) {
          lastOrderId.current = res.data.order.id;
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [addToast]);

  const handleCancel = async (id) => {
    const result = await alertConfirmWarning(
      "Cancel this order?",
      "This will cancel the order and restore any stock it used. This can't be undone.",
      "Cancel Order",
    );
    if (!result.isConfirmed) return;

    setCancelLoadingId(id);
    try {
      await cancelOrderApi(id);
      fetchOrders();
    } catch (err) {
      alertError("Cancel failed", err.response?.data?.message || "Unable to cancel this order.");
    } finally {
      setCancelLoadingId(null);
    }
  };

  return {
    orders, loading, total, page, lastPage,
    search, setSearch,
    statusFilter, setStatusFilter,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    cashierFilter, setCashierFilter,
    currentShiftOnly, setCurrentShiftOnly,
    setPage,
    toasts,
    addToast,
    removeToast,
    lastOrderId,
    fetchOrders,
    handleCancel,
    cancelLoadingId,
    setFocusedField,
    focusedField,
  };
}

export function useProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProductsApi()
      .then((res) => setProducts(res.data.data))
      .catch(console.error);
  }, []);

  const refetch = () =>
    fetchProductsApi()
      .then((res) => setProducts(res.data.data))
      .catch(console.error);

  return { products, refetchProducts: refetch };
}

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState([]);

  useEffect(() => {
    fetchPaymentMethodsApi()
      .then((res) => setPaymentMethods(res.data.filter((m) => m.status)))
      .catch(console.error);
  }, []);

  return { paymentMethods };
}