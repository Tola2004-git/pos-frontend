import { useEffect, useState } from "react";
import { promotionService } from "../api/promotionService";

export const usePromotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPromotions = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await promotionService.fetchPromotions();
      setPromotions(data);
      return true;
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.statusText ||
        "Failed to fetch promotions";
      console.error("Failed to fetch promotions: ", err);
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createPromotion = async (payload) => {
    try {
      await promotionService.createPromotion(payload);
      await fetchPromotions();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Failed to create promotion",
      };
    }
  };

  const updatePromotion = async (id, payload) => {
    try {
      await promotionService.updatePromotion(id, payload);
      await fetchPromotions();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Failed to update promotion",
      };
    }
  };

  const deletePromotion = async (id) => {
    try {
      await promotionService.deletePromotion(id);
      await fetchPromotions();
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || "Failed to delete promotion",
      };
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  return {
    promotions,
    loading,
    error,
    fetchPromotions,
    createPromotion,
    updatePromotion,
    deletePromotion,
  };
};
