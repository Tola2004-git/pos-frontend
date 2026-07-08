import axios from "axios";

const api = axios.create({ baseURL: "http://127.0.0.1:8000/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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
