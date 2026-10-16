/**
 * Promotion rules shared by every screen that shows a discount (product
 * cards, cart, checkout, order edit). Mirrors the backend's
 * OrderController::calculatePromotionDiscount() exactly, so what the cashier
 * sees is what the server charges:
 *
 * - Each line item gets at most ONE promotion: the one that saves the most.
 *   Matching promotions never stack (15% + 10% + 5% is 15%, not 30%).
 * - Candidates for an item: product- and category-scoped promotions, plus
 *   "all"-scoped percentage promotions.
 * - An "all"-scoped fixed-amount promotion discounts the whole order; it
 *   competes against the per-item total instead of adding to it.
 * - A discount never exceeds the price it applies to.
 *
 * The server recalculates on its own; this file only predicts the result
 * for display.
 */

const localToday = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

export function isPromotionActive(promotion) {
  if (!promotion || !promotion.status || promotion.is_expired) return false;
  const today = localToday();
  if (promotion.start_date && String(promotion.start_date).slice(0, 10) > today) return false;
  if (promotion.end_date && String(promotion.end_date).slice(0, 10) < today) return false;
  return true;
}

export function matchesPromotion(item, promotion) {
  const productId = item.product_id ?? item.id;
  if (promotion.apply_to === "all") return true;
  if (promotion.apply_to === "product") {
    return Boolean(promotion.products?.some((p) => p.id === productId));
  }
  if (promotion.apply_to === "category") {
    return Boolean(
      item.category_id &&
        promotion.categories?.some((c) => c.id === item.category_id),
    );
  }
  return false;
}

const isOrderLevel = (promotion) =>
  promotion.apply_to === "all" && promotion.type !== "percentage";

const eligiblePromotions = (promotions, cartSubtotal) =>
  [...promotions]
    .filter(isPromotionActive)
    .filter(
      (p) => !p.min_purchase || cartSubtotal >= Number(p.min_purchase),
    )
    // Same tie-break as the server: lowest id wins an exact tie.
    .sort((a, b) => a.id - b.id);

const lineDiscount = (promotion, subtotal, quantity) => {
  const amount =
    promotion.type === "percentage"
      ? (subtotal * Number(promotion.value)) / 100
      : Number(promotion.value) * quantity;
  return Math.min(amount, subtotal);
};

const bestForLine = (candidates, item, subtotal, quantity) => {
  let best = null;
  for (const promotion of candidates) {
    if (isOrderLevel(promotion) || !matchesPromotion(item, promotion)) continue;
    const amount = lineDiscount(promotion, subtotal, quantity);
    if (amount > 0 && (!best || amount > best.amount)) {
      best = { promotion, amount };
    }
  }
  return best;
};

/**
 * @returns {{
 *   itemDiscounts: Map<number, {promotion: object, amount: number}>,
 *   orderPromotion: object|null,
 *   discount: number,
 *   primaryPromotion: object|null,
 * }}
 */
export function calculatePromotions(promotions = [], cart = []) {
  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const candidates = eligiblePromotions(promotions, cartSubtotal);

  const itemDiscounts = new Map();
  const savings = new Map();
  let itemTotal = 0;

  for (const item of cart) {
    const best = bestForLine(candidates, item, item.subtotal, item.quantity);
    if (!best) continue;
    itemDiscounts.set(item.product_id ?? item.id, best);
    itemTotal += best.amount;
    savings.set(best.promotion, (savings.get(best.promotion) || 0) + best.amount);
  }

  const orderPromotion = candidates
    .filter(isOrderLevel)
    .reduce(
      (best, p) => (!best || Number(p.value) > Number(best.value) ? p : best),
      null,
    );
  const orderAmount = orderPromotion
    ? Math.min(Number(orderPromotion.value), cartSubtotal)
    : 0;

  if (orderAmount > itemTotal) {
    return {
      itemDiscounts: new Map(),
      orderPromotion,
      discount: orderAmount,
      primaryPromotion: orderPromotion,
    };
  }

  let primaryPromotion = null;
  let primarySaving = 0;
  for (const [promotion, saving] of savings) {
    if (saving > primarySaving) {
      primaryPromotion = promotion;
      primarySaving = saving;
    }
  }

  return {
    itemDiscounts,
    orderPromotion: null,
    discount: itemTotal,
    primaryPromotion,
  };
}

/** The single promotion a product card should advertise (for 1 unit). */
export function bestPromotionForProduct(promotions = [], product, cartSubtotal = 0) {
  const price = Number(product.price) || 0;
  const candidates = eligiblePromotions(promotions, cartSubtotal);
  return bestForLine(candidates, product, price, 1)?.promotion ?? null;
}
