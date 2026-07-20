import { useState, useEffect } from "react";
import { alertSuccess, alertError, alertConfirmDelete } from "../utils/alert.jsx";
import { useTranslations } from "./useTranslations";
import api from "../api/productApi.js";

export function useCategories(type = "product") {
  const { t } = useTranslations();
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [catForm, setCatForm] = useState({ name: "", status: true });
  const [catError, setCatError] = useState("");
  const [catSubmitting, setCatSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [type]);

  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const res = await api.get(`/categories?type=${type}`);
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
      setCatError(t.categoryNameRequiredMsg);
      return;
    }
    setCatSubmitting(true);
    try {
      if (editCat) {
        await api.put(`/categories/${editCat.id}`, { ...catForm, type });
        alertSuccess(t.productUpdatedTitle, t.categoryUpdatedMsg);
      } else {
        await api.post("/categories", { ...catForm, type });
        alertSuccess(t.productCreatedTitle, t.categoryCreatedMsg);
      }
      setEditCat(null);
      setCatForm({ name: "", status: true });
      fetchCategories();
    } catch (err) {
      alertError(t.genericErrorTitle, err.response?.data?.message || t.tryAgainMsg);
    } finally {
      setCatSubmitting(false);
    }
  };

  const handleCatDelete = async (id) => {
    const result = await alertConfirmDelete(
      t.categoryDeleteConfirmTitle,
      t.categoryDeleteConfirmMsg,
      t.cancel,
      t.deleteAction,
    );
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/categories/${id}`);
      alertSuccess(t.tableDeletedTitle, t.categoryDeletedMsg);
      fetchCategories();
    } catch (err) {
      alertError(t.categoryDeleteFailedTitle, err.response?.data?.message || t.tryAgainMsg);
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