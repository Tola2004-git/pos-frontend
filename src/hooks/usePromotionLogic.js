import { useMemo } from "react";

/**
 * Custom hook for promotion discount calculations and matching logic
 * This separates business logic from UI components
 */
export function usePromotionLogic(promotions = [], cart = []) {
  /**
   * Check if a promotion is currently active based on dates and status
   */
  const isPromotionValid = (promotion) => {
    if (!promotion || !promotion.status) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (promotion.start_date) {
      const startDate = new Date(promotion.start_date);
      startDate.setHours(0, 0, 0, 0);
      if (today < startDate) return false;
    }

    if (promotion.end_date) {
      const endDate = new Date(promotion.end_date);
      endDate.setHours(0, 0, 0, 0);
      if (today > endDate) return false;
    }

    return true;
  };

  /**
   * Check if an item/product matches a promotion's target
   */
  const matchesPromotion = (item, promotion) => {
    const productId = item.product_id ?? item.id;
    if (promotion.apply_to === "all") return true;
    if (promotion.apply_to === "product") {
      return promotion.products?.some((p) => p.id === productId);
    }
    if (promotion.apply_to === "category") {
      return (
        item.category_id &&
        promotion.categories?.some((c) => c.id === item.category_id)
      );
    }
    return false;
  };

  /**
   * Find all applicable promotions for a cart item
   */
  const findItemPromotions = (item) =>
    promotions.filter(
      (promotion) =>
        matchesPromotion(item, promotion) && isPromotionValid(promotion)
    );

  /**
   * Find all applicable promotions for a product
   */
  const findProductPromotions = (product) =>
    promotions.filter(
      (promotion) =>
        matchesPromotion(product, promotion) && isPromotionValid(promotion)
    );

  /**
   * Calculate discount amount for a cart item
   */
  const getItemDiscount = (item) =>
    findItemPromotions(item).reduce((sum, promotion) => {
      if (promotion.type === "percentage") {
        return sum + (item.subtotal * Number(promotion.value)) / 100;
      }
      return sum + Number(promotion.value) * item.quantity;
    }, 0);

  /**
   * Calculate final total for item after discount
   */
  const getItemTotal = (item) => item.subtotal - getItemDiscount(item);

  /**
   * Format promotion label for display
   */
  const formatPromotionLabel = (promotion) => {
    if (!promotion) return "";
    if (promotion.type === "percentage") {
      return `${promotion.value}% off`;
    }
    return `$${Number(promotion.value).toFixed(2)} off`;
  };

  /**
   * Truncate promotion name for display
   */
  const truncatePromoName = (name) =>
    typeof name === "string" && name.length > 5
      ? `${name.slice(0, 5)}...`
      : name;

  /**
   * Calculate total discount across all cart items
   */
  const totalDiscountAmount = useMemo(
    () =>
      cart.reduce((sum, item) => sum + getItemDiscount(item), 0),
    [cart, promotions]
  );

  /**
   * Calculate subtotal before any discounts
   */
  const subtotalBeforeDiscount = useMemo(
    () => cart.reduce((sum, item) => sum + item.subtotal, 0),
    [cart]
  );

  /**
   * Calculate total after all discounts
   */
  const totalAfterDiscount = useMemo(
    () => subtotalBeforeDiscount - totalDiscountAmount,
    [subtotalBeforeDiscount, totalDiscountAmount]
  );

  return {
    isPromotionValid,
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
  };
}
