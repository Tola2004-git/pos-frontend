import apiClient from "./apiClient";

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
