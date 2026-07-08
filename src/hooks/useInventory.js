import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { alertSuccess, alertError } from "../utils/alert.jsx";

const api = axios.create({ baseURL: "http://127.0.0.1:8000/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function useInventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [threshold, setThreshold] = useState(
    Number(localStorage.getItem("low_stock_threshold")) || 10
  );
  const [showThreshold, setShowThreshold] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(threshold);

  const [showRestock, setShowRestock] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [restockForm, setRestockForm] = useState({
    product_id: "",
    action: "add",
    quantity: "",
    supplier: "",
    note: "",
  });
  const [restockError, setRestockError] = useState("");
  const [restockSearch, setRestockSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingRestock, setLoadingRestock] = useState(false);
  const [focusedField, setFocusedField] = useState("");
  const stockDropdownRef = useRef();
  const thresholdRef = useRef();
  const restockDropdownRef = useRef();

  useEffect(() => {
    fetchInventory();
  }, [search, stockFilter, page, threshold]);

  useEffect(() => {
    fetchAllProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (stockDropdownRef.current && !stockDropdownRef.current.contains(e.target))
        setShowFilterDropdown(false);
      if (thresholdRef.current && !thresholdRef.current.contains(e.target))
        setShowThreshold(false);
      if (restockDropdownRef.current && !restockDropdownRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/inventory?search=${search}&stock_status=${stockFilter}&page=${page}&per_page=10&threshold=${threshold}`
      );
      setProducts(res.data.data);
      setLastPage(res.data.last_page);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const res = await api.get("/products?per_page=1000");
      setAllProducts(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const openRestock = async (product = null) => {
    setLoadingRestock(true);
    await new Promise((r) => setTimeout(r, 300));
    setLoadingRestock(false);
    setRestockError("");
    setSubmitting(false);
    if (product) {
      setSelectedProduct(product);
      setRestockSearch(product.name);
      setRestockForm({ product_id: product.id, action: "add", quantity: "", supplier: "", note: "" });
    } else {
      setSelectedProduct(null);
      setRestockSearch("");
      setRestockForm({ product_id: "", action: "add", quantity: "", supplier: "", note: "" });
    }
    setShowDropdown(false);
    setShowRestock(true);
  };

  const handleSelectProduct = (p) => {
    setSelectedProduct(p);
    setRestockSearch(p.name);
    setRestockForm((prev) => ({ ...prev, product_id: p.id }));
    setShowDropdown(false);
  };

  const handleRestock = async () => {
    setRestockError("");
    if (!restockForm.product_id) { setRestockError("Please select a product!"); return; }
    if (!restockForm.quantity || restockForm.quantity <= 0) { setRestockError("Quantity must be greater than 0!"); return; }
    setSubmitting(true);
    try {
      await api.post("/inventory/restock", restockForm);
      setShowRestock(false);
      setSelectedProduct(null);
      setRestockForm({ product_id: "", action: "add", quantity: "", supplier: "", note: "" });
      setRestockSearch("");
      setLoading(true);
      await fetchInventory();
      await fetchAllProducts();
      alertSuccess(
        "Restocked!",
        restockForm.action === "add" ? "Stock has been added successfully." : "Stock has been removed successfully."
      );
    } catch (err) {
      alertError("Something went wrong!", err.response?.data?.message || "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const saveThreshold = () => {
    setThreshold(Number(tempThreshold));
    localStorage.setItem("low_stock_threshold", tempThreshold);
    setShowThreshold(false);
    alertSuccess("Saved!", `Low stock threshold set to ${tempThreshold}.`);
  };

  const closeRestock = () => {
    if (submitting) return;
    setShowRestock(false);
    setSelectedProduct(null);
    setRestockError("");
    setRestockSearch("");
  };

  return {
    // state
    products, loading, search, setSearch,
    stockFilter, setStockFilter,
    page, setPage, lastPage, total,
    threshold, tempThreshold, setTempThreshold,
    showThreshold, setShowThreshold,
    showRestock, allProducts,
    selectedProduct, restockForm, setRestockForm,
    restockError, restockSearch, setRestockSearch,
    showDropdown, setShowDropdown,
    showFilterDropdown, setShowFilterDropdown,
    submitting, loadingRestock,
    stockDropdownRef, thresholdRef, restockDropdownRef,
    focusedField, setFocusedField,

    openRestock, handleSelectProduct, handleRestock, saveThreshold, closeRestock,
  };
}