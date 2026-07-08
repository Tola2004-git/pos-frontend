import apiClient from "./apiClient";

export const fetchProducts = (params = "") => apiClient.get(`/products${params}`);

export const fetchProduct = (id) => apiClient.get(`/products/${id}`);

export default apiClient;