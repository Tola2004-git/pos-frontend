import { useState, useEffect } from "react";
import { alertSuccess, alertError, alertConfirmDelete } from "../utils/alert.jsx";
import { useTranslations } from "./useTranslations";
import api from "../api/productApi.js";

export function useProducts() {
  const { t } = useTranslations();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, [search, categoryFilter, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/products?search=${search}&category_id=${categoryFilter}&page=${page}&per_page=10`
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

  const handleDelete = async (id) => {
    const result = await alertConfirmDelete(
      t.productDeleteConfirmTitle,
      t.productDeleteConfirmMsg,
      t.cancel,
      t.deleteAction,
    );
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/products/${id}`);
      alertSuccess(t.tableDeletedTitle, t.productDeletedMsg);
      fetchProducts();
    } catch (err) {
      alertError(t.productDeleteFailedTitle, err.response?.data?.message || t.tryAgainMsg);
    }
  };

  return {
    products,
    loading,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    page,
    setPage,
    lastPage,
    total,
    fetchProducts,
    handleDelete,
  };
}