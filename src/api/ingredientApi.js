import apiClient from "./apiClient";

export const fetchIngredients = (params = "") => apiClient.get(`/ingredients${params}`);

export const fetchIngredient = (id) => apiClient.get(`/ingredients/${id}`);

export default apiClient;
