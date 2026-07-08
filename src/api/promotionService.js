import axios from "axios";

const api = axios.create({ baseURL: "http://127.0.0.1:8000/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const promotionService = {
  fetchPromotions: async () => {
    const res = await api.get("/promotions");
    return res.data;
  },

  createPromotion: async (data) => {
    const res = await api.post("/promotions", data);
    return res.data;
  },

  updatePromotion: async (id, data) => {
    const res = await api.put(`/promotions/${id}`, data);
    return res.data;
  },

  deletePromotion: async (id) => {
    const res = await api.delete(`/promotions/${id}`);
    return res.data;
  },
};
