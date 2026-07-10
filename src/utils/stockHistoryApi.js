import api from "../api/apiClient";

export async function fetchStockHistory({ search, action, page }, signal) {
  const res = await api.get("/inventory/history", {
    params: { search, action, page, per_page: 15 },
    signal,
  });
  return res.data;
}
