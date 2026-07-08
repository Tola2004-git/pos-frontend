import { useState, useEffect } from "react";
import { alertSuccess, alertError, alertConfirmDelete } from "../utils/alert.jsx";
import api from "../api/productApi.js";

export function useProducts() {
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
      "Delete this product?",
      "This cannot be undone."
    );
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/products/${id}`);
      alertSuccess("Deleted!", "Product has been removed.");
      fetchProducts();
    } catch (err) {
      alertError("Failed to delete", err.response?.data?.message || "Please try again.");
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