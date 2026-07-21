import { useState, useEffect, useRef } from "react";
import { alertSuccess, alertError, alertConfirmDelete } from "../utils/alert.jsx";
import { useTranslations } from "./useTranslations";
import api from "../api/apiClient";

export function useIngredients() {
  const { t } = useTranslations();
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [allIngredients, setAllIngredients] = useState([]);

  const [showRestock, setShowRestock] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [restockForm, setRestockForm] = useState({
    ingredient_id: "",
    action: "add",
    quantity: "",
    expiry_date: "",
    supplier: "",
    note: "",
  });
  const [restockError, setRestockError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const stockDropdownRef = useRef();

  useEffect(() => {
    fetchIngredients();
  }, [search, categoryFilter, stockFilter, page]);

  useEffect(() => {
    fetchAllIngredients();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (stockDropdownRef.current && !stockDropdownRef.current.contains(e.target))
        setShowFilterDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchIngredients = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/ingredients?search=${search}&category_id=${categoryFilter}&stock_status=${stockFilter}&page=${page}&per_page=10`
      );
      setIngredients(res.data.data);
      setLastPage(res.data.last_page);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllIngredients = async () => {
    try {
      const res = await api.get("/ingredients?per_page=1000");
      setAllIngredients(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    const result = await alertConfirmDelete(
      t.ingredientDeleteConfirmTitle,
      t.ingredientDeleteConfirmMsg,
      t.cancel,
      t.deleteAction,
    );
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/ingredients/${id}`);
      alertSuccess(t.tableDeletedTitle, t.ingredientDeletedMsg);
      fetchIngredients();
      fetchAllIngredients();
    } catch (err) {
      alertError(t.ingredientDeleteFailedTitle, err.response?.data?.message || t.tryAgainMsg);
    }
  };

  const openRestock = (ingredient) => {
    setSelectedIngredient(ingredient);
    setRestockError("");
    setSubmitting(false);
    setRestockForm({ ingredient_id: ingredient.id, action: "add", quantity: "", expiry_date: "", supplier: "", note: "" });
    setShowRestock(true);
  };

  const closeRestock = () => {
    if (submitting) return;
    setShowRestock(false);
    setSelectedIngredient(null);
    setRestockError("");
  };

  const handleRestock = async () => {
    setRestockError("");
    if (!restockForm.quantity || restockForm.quantity <= 0) {
      setRestockError(t.quantityRequiredMsg);
      return;
    }
    setSubmitting(true);
    try {
      // Empty string fails Laravel's `nullable|date` rule (only a real
      // null is treated as "absent") - normalize before sending.
      await api.post("/ingredients/restock", {
        ...restockForm,
        expiry_date: restockForm.expiry_date || null,
      });
      setShowRestock(false);
      setSelectedIngredient(null);
      alertSuccess(
        t.ingredientStockUpdatedTitle,
        restockForm.action === "add" ? t.stockAddedMsg : t.stockRemovedMsg
      );
      await fetchIngredients();
      await fetchAllIngredients();
    } catch (err) {
      alertError(t.genericErrorTitle, err.response?.data?.message || t.tryAgainMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    ingredients, loading, search, setSearch,
    categoryFilter, setCategoryFilter,
    stockFilter, setStockFilter,
    page, setPage, lastPage, total,
    allIngredients, fetchIngredients, fetchAllIngredients,
    handleDelete,

    showRestock, selectedIngredient, restockForm, setRestockForm,
    restockError, submitting,
    showFilterDropdown, setShowFilterDropdown, stockDropdownRef,
    openRestock, closeRestock, handleRestock,
  };
}
