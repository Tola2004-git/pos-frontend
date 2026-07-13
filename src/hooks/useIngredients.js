import { useState, useEffect, useRef } from "react";
import { alertSuccess, alertError, alertConfirmDelete } from "../utils/alert.jsx";
import api from "../api/apiClient";

export function useIngredients() {
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
      "Delete this ingredient?",
      "This cannot be undone."
    );
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/ingredients/${id}`);
      alertSuccess("Deleted!", "Ingredient has been removed.");
      fetchIngredients();
      fetchAllIngredients();
    } catch (err) {
      alertError("Failed to delete", err.response?.data?.message || "Please try again.");
    }
  };

  const openRestock = (ingredient) => {
    setSelectedIngredient(ingredient);
    setRestockError("");
    setSubmitting(false);
    setRestockForm({ ingredient_id: ingredient.id, action: "add", quantity: "", supplier: "", note: "" });
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
      setRestockError("Quantity must be greater than 0!");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/ingredients/restock", restockForm);
      setShowRestock(false);
      setSelectedIngredient(null);
      alertSuccess(
        "Stock updated!",
        restockForm.action === "add" ? "Stock has been added successfully." : "Stock has been removed successfully."
      );
      await fetchIngredients();
      await fetchAllIngredients();
    } catch (err) {
      alertError("Something went wrong!", err.response?.data?.message || "Please try again.");
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
