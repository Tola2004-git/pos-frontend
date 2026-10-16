import { useCallback } from "react";
import {
  bestPromotionForProduct,
  calculatePromotions,
  isPromotionActive,
  matchesPromotion,
} from "../utils/promotionCalc";

/**
 * Custom hook for promotion discount calculations and matching logic
 * This separates business logic from UI components. The actual rules
 * (best single promotion per item, no stacking) live in
 * utils/promotionCalc.js, which mirrors the backend's
 * OrderController::calculatePromotionDiscount().
 */
export function usePromotionLogic(promotions = [], cart = []) {
  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const { itemDiscounts, discount, primaryPromotion } = calculatePromotions(
    promotions,
    cart,
  );

  const appliedFor = (item) => itemDiscounts.get(item.product_id ?? item.id);

  // Only the promotion actually applied to this cart line - never every
  // promotion that happens to match it.
  const findItemPromotions = (item) => {
    const applied = appliedFor(item);
    return applied ? [applied.promotion] : [];
  };

  // The one promotion a product card advertises: the best for that product.
  const findProductPromotions = (product) => {
    const best = bestPromotionForProduct(promotions, product, cartSubtotal);
    return best ? [best] : [];
  };

  const getItemDiscount = (item) => appliedFor(item)?.amount ?? 0;

  const getItemTotal = (item) => item.subtotal - getItemDiscount(item);

  const formatPromotionLabel = useCallback((promotion) => {
    if (!promotion) return "";
    if (promotion.type === "percentage") {
      return `${promotion.value}% off`;
    }
    return `$${Number(promotion.value).toFixed(2)} off`;
  }, []);

  const truncatePromoName = useCallback(
    (name) =>
      typeof name === "string" && name.length > 5
        ? `${name.slice(0, 5)}...`
        : name,
    []
  );

  const totalDiscountAmount = discount;

  const subtotalBeforeDiscount = cartSubtotal;

  const totalAfterDiscount = subtotalBeforeDiscount - totalDiscountAmount;

  return {
    isPromotionValid: isPromotionActive,
    matchesPromotion,
    findItemPromotions,
    findProductPromotions,
    getItemDiscount,
    getItemTotal,
    formatPromotionLabel,
    truncatePromoName,
    totalDiscountAmount,
    subtotalBeforeDiscount,
    totalAfterDiscount,
    primaryPromotion,
  };
}
