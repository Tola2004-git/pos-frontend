import apiClient from "./apiClient";

export const paymentService = {
  fetchMethods: async () => {
    const res = await api.get("/payment-methods");
    return res.data;
  },

  createMethod: async (data) => {
    const res = await api.post("/payment-methods", data);
    return res.data;
  },

  updateMethod: async (id, data) => {
    const res = await api.put(`/payment-methods/${id}`, data);
    return res.data;
  },

  // Delete payment method
  deleteMethod: async (id) => {
    const res = await api.delete(`/payment-methods/${id}`);
    return res.data;
  },

  toggleStatus: async (id, currentData) => {
    const res = await api.put(`/payment-methods/${id}`, {
      ...currentData,
      status: !currentData.status,
    });
    return res.data;
  },
};
