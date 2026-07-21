import apiClient from "./apiClient";

export const fetchProductIngredientsApi = (productId) =>
  apiClient.get(`/products/${productId}/ingredients`);

export const syncProductIngredientsApi = (productId, ingredients) =>
  apiClient.put(`/products/${productId}/ingredients`, { ingredients });
