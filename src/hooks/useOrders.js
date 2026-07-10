import { useState, useEffect, useRef, useCallback } from "react";
import {
  fetchOrdersApi,
  fetchProductsApi,
  fetchPaymentMethodsApi,
  fetchLatestOrderApi,
  cancelOrderApi,
} from "../api/ordersApi";

const TOAST_DURATION = 3000;

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [toasts, setToasts] = useState([]);
  const lastOrderId = useRef(null);
  const [focusedField, setFocusedField] = useState("");


  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchOrdersApi({ search, statusFilter, dateFrom, dateTo, page });
      setOrders(res.data.data);
      setLastPage(res.data.last_page);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, dateFrom, dateTo, page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((order, type = "payment") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, order, type }]);
    setTimeout(() => removeToast(id), TOAST_DURATION);
  }, [removeToast]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetchLatestOrderApi();
        if (res.data && res.data.id !== lastOrderId.current) {
          lastOrderId.current = res.data.id;
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [addToast]);

  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this order?")) return;
    await cancelOrderApi(id);
    fetchOrders();
  };

  return {
    orders, loading, total, page, lastPage,
    search, setSearch,
    statusFilter, setStatusFilter,
    dateFrom, setDateFrom,
    dateTo, setDateTo,
    setPage,
    toasts,
    addToast,
    removeToast,
    lastOrderId,
    fetchOrders,
    handleCancel,
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