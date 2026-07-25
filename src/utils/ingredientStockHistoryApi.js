import api from "../api/apiClient";

export async function fetchIngredientStockHistory({ search, action, page }, signal) {
  const res = await api.get("/ingredients/history", {
    params: { search, action, page, per_page: 15 },
    signal,
  });
  return res.data;
}
