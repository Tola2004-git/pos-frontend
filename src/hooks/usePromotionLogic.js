import { useCallback } from "react";

/**
 * Custom hook for promotion discount calculations and matching logic
 * This separates business logic from UI components
 */
export function usePromotionLogic(promotions = [], cart = []) {
  // Needed up front so matching can gate on it below - mirrors the backend's
  // OrderController::store()/update() and usePOS.js's getPromotionDiscount(),
  // which both check min_purchase against the whole cart, not per item.
  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const isPromotionValid = (promotion) => {
    if (!promotion || !promotion.status) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (promotion.start_date) {
      const startDate = new Date(promotion.start_date);
      startDate.setHours(0, 0, 0, 0);
      if (today < startDate) return false;
    }

    if (promotion.is_expired) return false;

    return true;
  };

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

  const meetsMinPurchase = (promotion) =>
    !promotion.min_purchase || cartSubtotal >= Number(promotion.min_purchase);

  const findItemPromotions = (item) =>
    promotions.filter(
      (promotion) =>
        matchesPromotion(item, promotion) &&
        isPromotionValid(promotion) &&
        meetsMinPurchase(promotion)
    );

  const findProductPromotions = (product) =>
    promotions.filter(
      (promotion) =>
        matchesPromotion(product, promotion) &&
        isPromotionValid(promotion) &&
        meetsMinPurchase(promotion)
    );

  /**
   * The order backend applies exactly one promotion (see
   * OrderController::store()/update() and usePOS.js's
   * getSelectedPromotionForOrder - same "first applicable" pick), not every
   * promotion that happens to match. Summing every matching promotion here
   * would show the cashier a bigger discount than what the order is
   * actually charged for once only one of them is applied server-side.
   */
  const getSelectedPromotion = () => {
    const applicable = promotions.filter(
      (promotion) =>
        isPromotionValid(promotion) &&
        cart.some((item) => matchesPromotion(item, promotion)),
    );
    return applicable[0] || null;
  };

  /**
   * Calculate discount amount for a cart item, from the single promotion
   * that will actually be applied to the order (see getSelectedPromotion).
   * An "all"-scoped promotion discounts the whole order once, not per line
   * item, so it's excluded here and folded into totalDiscountAmount instead
   * - attributing it to individual items would both double-count it and
   * multiply it by quantity.
   */
  const getItemDiscount = (item) => {
    const promotion = getSelectedPromotion();
    if (!promotion || !meetsMinPurchase(promotion)) return 0;
    if (promotion.apply_to === "all") return 0;
    if (!matchesPromotion(item, promotion)) return 0;

    if (promotion.type === "percentage") {
      return (item.subtotal * Number(promotion.value)) / 100;
    }
    return Number(promotion.value) * item.quantity;
  };

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

  /**
   * Calculate total discount for the order - the per-item sum for
   * product/category-scoped promotions, or the single flat/percentage-of-
   * subtotal amount for an "all"-scoped one (see getItemDiscount).
   */
  const totalDiscountAmount = (() => {
    const promotion = getSelectedPromotion();
    if (!promotion || !meetsMinPurchase(promotion)) return 0;

    if (promotion.apply_to === "all") {
      if (promotion.type === "percentage") {
        return (cartSubtotal * Number(promotion.value)) / 100;
      }
      return Number(promotion.value);
    }

    return cart.reduce((sum, item) => sum + getItemDiscount(item), 0);
  })();

  const subtotalBeforeDiscount = cartSubtotal;

  const totalAfterDiscount = subtotalBeforeDiscount - totalDiscountAmount;

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
