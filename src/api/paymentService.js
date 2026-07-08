import apiClient from "./apiClient";

export const paymentService = {
  fetchMethods: async () => {
    const res = await apiClient.get("/payment-methods");
    return res.data;
  },

  createMethod: async (data) => {
    const res = await apiClient.post("/payment-methods", data);
    return res.data;
  },

  updateMethod: async (id, data) => {
    const res = await apiClient.put(`/payment-methods/${id}`, data);
    return res.data;
  },

  // Delete payment method
  deleteMethod: async (id) => {
    const res = await apiClient.delete(`/payment-methods/${id}`);
    return res.data;
  },

  toggleStatus: async (id, currentData) => {
    const res = await apiClient.put(`/payment-methods/${id}`, {
      ...currentData,
      status: !currentData.status,
    });
    return res.data;
  },
};
