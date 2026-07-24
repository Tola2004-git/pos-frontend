import apiClient from "./apiClient";

export const fetchProducts = (params = "", signal) =>
  apiClient.get(`/products${params}`, { signal });

export const fetchProduct = (id) => apiClient.get(`/products/${id}`);

export default apiClient;