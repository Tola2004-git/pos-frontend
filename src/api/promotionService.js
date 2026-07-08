import apiClient from "./apiClient";

export const promotionService = {
  fetchPromotions: async () => {
    const res = await apiClient.get("/promotions");
    return res.data;
  },

  createPromotion: async (data) => {
    const res = await apiClient.post("/promotions", data);
    return res.data;
  },

  updatePromotion: async (id, data) => {
    const res = await apiClient.put(`/promotions/${id}`, data);
    return res.data;
  },

  deletePromotion: async (id) => {
    const res = await apiClient.delete(`/promotions/${id}`);
    return res.data;
  },
};

export default apiClient;
