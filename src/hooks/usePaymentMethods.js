import { useState, useEffect } from "react";
import { paymentService } from "../api/paymentService";

export const usePaymentMethods = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const res = await paymentService.fetchMethods();
      setMethods(res);
      return true;
    } catch (err) {
      console.error("Failed to fetch payment methods:", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createMethod = async (data) => {
    try {
      await paymentService.createMethod(data);
      await fetchMethods();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to create payment method";
      return { success: false, error: message };
    }
  };

  const updateMethod = async (id, data) => {
    try {
      await paymentService.updateMethod(id, data);
      await fetchMethods();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update payment method";
      return { success: false, error: message };
    }
  };

  const deleteMethod = async (id) => {
    try {
      await paymentService.deleteMethod(id);
      await fetchMethods();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete payment method";
      return { success: false, error: message };
    }
  };

  const toggleStatus = async (method) => {
    try {
      await paymentService.toggleStatus(method.id, method);
      await fetchMethods();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to toggle status";
      return { success: false, error: message };
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  return {
    methods,
    loading,
    fetchMethods,
    createMethod,
    updateMethod,
    deleteMethod,
    toggleStatus,
  };
};
