import { useState, useEffect } from "react";
import { alertSuccess, alertError, alertConfirmDelete } from "../utils/alert.jsx";
import api from "../api/productApi.js";

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [catForm, setCatForm] = useState({ name: "", status: true });
  const [catError, setCatError] = useState("");
  const [catSubmitting, setCatSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setCatLoading(false);
    }
  };

  const handleCatSubmit = async () => {
    setCatError("");
    if (!catForm.name) {
      setCatError("Category name is required!");
      return;
    }
    setCatSubmitting(true);
    try {
      if (editCat) {
        await api.put(`/categories/${editCat.id}`, catForm);
        alertSuccess("Updated!", "Category has been updated.");
      } else {
        await api.post("/categories", catForm);
        alertSuccess("Created!", "New category has been created.");
      }
      setEditCat(null);
      setCatForm({ name: "", status: true });
      fetchCategories();
    } catch (err) {
      alertError("Something went wrong!", err.response?.data?.message || "Please try again.");
    } finally {
      setCatSubmitting(false);
    }
  };

  const handleCatDelete = async (id) => {
    const result = await alertConfirmDelete(
      "Delete this category?",
      "This cannot be undone."
    );
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/categories/${id}`);
      alertSuccess("Deleted!", "Category has been removed.");
      fetchCategories();
    } catch (err) {
      alertError("Failed to delete", err.response?.data?.message || "Please try again.");
    }
  };

  const toggleCatStatus = async (cat) => {
    await api.put(`/categories/${cat.id}`, {
      name: cat.name,
      status: !cat.status,
    });
    fetchCategories();
  };

  const resetCatForm = () => {
    setEditCat(null);
    setCatForm({ name: "", status: true });
    setCatError("");
  };

  return {
    categories,
    catLoading,
    editCat,
    setEditCat,
    catForm,
    setCatForm,
    catError,
    catSubmitting,
    fetchCategories,
    handleCatSubmit,
    handleCatDelete,
    toggleCatStatus,
    resetCatForm,
  };
}