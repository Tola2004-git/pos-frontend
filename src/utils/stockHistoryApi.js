import axios from "axios";

export const api = axios.create({ baseURL: "http://127.0.0.1:8000/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function fetchStockHistory({ search, action, page }, signal) {
  const res = await api.get("/inventory/history", {
    params: { search, action, page, per_page: 15 },
    signal,
  });
  return res.data;
}
