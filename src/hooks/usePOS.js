import { useCallback, useRef, useState } from "react";
import { createOrderApi, updateOrderApi } from "../api/ordersApi";
import { alertWarning, alertError } from "../utils/alert.jsx";
import { isCashLike, findRealCashMethod } from "../utils/cashPaymentMethod";
import { useTranslations } from "./useTranslations";

export function usePOS({
  onOrderCreated,
  addToast,
  promotions = [],
  paymentMethods = [],
  refetchProducts,
}) {
  const { t } = useTranslations();
  const [showPOS, setShowPOS] = useState(false);
  const [cart, setCart] = useState([]);
  const [posSearch, setPosSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [amountPaid, setAmountPaid] = useState("");
  const [orderType, setOrderType] = useState("dine-in");
  const [note, setPosNote] = useState("");
  const [posStep, setPosStep] = useState(1);
  // Set when the cart was loaded from an existing held (pending) order via
  // loadOrderIntoCart - confirming then updates that order instead of
  // creating a new one.
  const [resumingOrderId, setResumingOrderId] = useState(null);
  // Stable per-checkout-attempt key so a network retry or a double-click that
  // slips past the confirm-button guard resolves to the same order server-side
  // instead of charging twice. Cleared once the order is created or the
  // checkout session is abandoned/reset.
  const idempotencyKeyRef = useRef(null);

  // Stock checks below read `cart` directly and call setCart with a plain
  // value (never the functional updater form). The alertWarning side effect
  // must run exactly once per click - React 18 StrictMode double-invokes
  // functional setState updaters in dev, which was firing the toast twice.
  const addToCart = useCallback((product) => {
    const availableStock = Number(product.qty) || 0;

    if (availableStock <= 0) {
      alertWarning(t.outOfStockTitle, t.outOfStockMsg.replace("{name}", product.name));
      return;
    }

    const existing = cart.find((i) => i.product_id === product.id);

    if (existing) {
      if (existing.quantity >= availableStock) {
        alertWarning(
          t.stockLimitTitle,
          t.stockLimitMsg.replace("{n}", availableStock).replace("{name}", product.name),
        );
        return;
      }
      setCart(
        cart.map((i) =>
          i.product_id === product.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                subtotal: (i.quantity + 1) * i.price,
                stock: availableStock,
              }
            : i,
        ),
      );
      return;
    }

    setCart([
      ...cart,
      {
        product_id: product.id,
        product_name: product.name,
        price: Number(product.price),
        quantity: 1,
        subtotal: Number(product.price),
        image: product.image,
        category_id: product.category_id ?? null,
        stock: availableStock,
      },
    ]);
  }, [cart, t.outOfStockMsg, t.outOfStockTitle, t.stockLimitMsg, t.stockLimitTitle]);

  const updateQty = (product_id, qty) => {
    if (qty <= 0) {
      removeFromCart(product_id);
      return;
    }

    const item = cart.find((i) => i.product_id === product_id);
    if (!item) return;

    const maxStock = item.stock ?? Infinity;

    if (qty > maxStock) {
      alertWarning(
        t.stockLimitTitle,
        t.stockLimitMsg.replace("{n}", maxStock).replace("{name}", item.product_name),
      );
      if (item.quantity === maxStock) return;
      setCart(
        cart.map((i) =>
          i.product_id === product_id
            ? { ...i, quantity: maxStock, subtotal: maxStock * i.price }
            : i,
        ),
      );
      return;
    }

    setCart(
      cart.map((i) =>
        i.product_id === product_id
          ? { ...i, quantity: qty, subtotal: qty * i.price }
          : i,
      ),
    );
  };

  const removeFromCart = (product_id) => {
    setCart((prev) => prev.filter((i) => i.product_id !== product_id));
  };

  // Cart quantities are validated against whatever stock number was on the
  // product when it was added - possibly minutes ago, and possibly stale if
  // another terminal sold the same item meanwhile. The backend re-validates
  // for real inside the checkout transaction (so nothing ever oversells),
  // but that error only surfaces after the cashier has already filled out
  // the whole payment step. Refetching here and clamping/warning before
  // moving to step 2 catches it earlier, while it's still cheap to fix.
  const proceedToPayment = useCallback(async () => {
    if (cart.length === 0) return;

    if (typeof refetchProducts !== "function") {
      setPosStep(2);
      return;
    }

    const freshProducts = await refetchProducts();
    if (!Array.isArray(freshProducts)) {
      // Refetch failed (e.g. network hiccup) - don't block the cashier over
      // it, the backend still re-validates stock for real at checkout.
      setPosStep(2);
      return;
    }

    const shortages = [];
    const adjustedCart = cart
      .map((item) => {
        const fresh = freshProducts.find((p) => p.id === item.product_id);
        const freshStock = Number(fresh?.qty) || 0;

        if (freshStock < item.quantity) {
          shortages.push({ name: item.product_name, available: freshStock });
          if (freshStock <= 0) return null;
          return {
            ...item,
            quantity: freshStock,
            subtotal: freshStock * item.price,
            stock: freshStock,
          };
        }

        return { ...item, stock: freshStock };
      })
      .filter(Boolean);

    if (shortages.length > 0) {
      setCart(adjustedCart);
      alertWarning(
        t.stockChangedTitle,
        shortages
          .map((s) =>
            s.available > 0
              ? t.stockLimitMsg.replace("{n}", s.available).replace("{name}", s.name)
              : t.outOfStockMsg.replace("{name}", s.name),
          )
          .join("\n"),
      );
      return;
    }

    setPosStep(2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, refetchProducts]);

  const isPromotionValid = (promotion) => {
    if (!promotion || !promotion.status) return false;
    
    // Use Date object for accurate day-level comparison
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

  const matchesPromotion = (item, promotion) => {
    if (promotion.apply_to === "all") return true;
    if (promotion.apply_to === "product") {
      return promotion.products?.some((p) => p.id === item.product_id);
    }
    if (promotion.apply_to === "category") {
      return (
        item.category_id &&
        promotion.categories?.some((c) => c.id === item.category_id)
      );
    }
    return false;
  };

  const getPromotionDiscount = (cart, promotion) => {
    if (!isPromotionValid(promotion)) return 0;
    const subtotalLocal = cart.reduce((s, i) => s + i.subtotal, 0);
    if (
      promotion.min_purchase &&
      subtotalLocal < Number(promotion.min_purchase)
    ) {
      return 0;
    }

    let discount = 0;
    if (promotion.apply_to === "all") {
      if (promotion.type === "percentage") {
        discount = (subtotalLocal * Number(promotion.value)) / 100;
      } else {
        discount = Number(promotion.value);
      }
      return discount;
    }

    cart.forEach((item) => {
      if (!matchesPromotion(item, promotion)) return;
      if (promotion.type === "percentage") {
        discount += (item.subtotal * Number(promotion.value)) / 100;
      } else {
        discount += Number(promotion.value) * item.quantity;
      }
    });

    return discount;
  };

  const computeDiscount = (cart) =>
    promotions.reduce(
      (sum, promotion) => sum + getPromotionDiscount(cart, promotion),
      0,
    );

  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const discount = computeDiscount(cart);
  const totalAmount = subtotal - discount;

  const getSelectedPromotionForOrder = () => {
    const applicablePromotions = promotions.filter((promotion) => {
      if (!isPromotionValid(promotion)) return false;
      return cart.some((item) => matchesPromotion(item, promotion));
    });

    return applicablePromotions[0] || null;
  };

  const closePOS = () => {
    setShowPOS(false);
    setCart([]);
    setPosSearch("");
    setCustomerName("");
    setCustomerPhone("");
    setSelectedPayment(null);
    setAmountPaid("");
    setOrderType("takeaway");
    setPosNote("");
    setPosStep(1);
    setResumingOrderId(null);
    idempotencyKeyRef.current = null;
  };

  // Loads an existing held (pending) order's items into the cart so a
  // cashier can add more items or go straight to checkout instead of
  // starting a duplicate order on the same table. `products` is the live
  // catalog, used to recover image/category and to figure out how much more
  // of each item can still be added (the order's own quantity is already
  // reserved out of the product's current stock).
  const loadOrderIntoCart = useCallback((order, products = []) => {
    const items = (order.items || []).map((item) => {
      const product = products.find(
        (p) => String(p.id) === String(item.product_id),
      );
      const remainingStock = Number(product?.qty) || 0;
      const quantity = Number(item.quantity) || 0;

      return {
        product_id: item.product_id,
        product_name: item.product_name || product?.name || "Item",
        price: Number(item.price ?? product?.price ?? 0),
        quantity,
        subtotal: Number(item.subtotal ?? (item.price ?? product?.price ?? 0) * quantity),
        image: product?.image ?? null,
        category_id: product?.category_id ?? null,
        // Units already on this order were deducted from stock at hold time,
        // so the real ceiling while editing is what's left plus what's
        // already reserved here.
        stock: remainingStock + quantity,
      };
    });

    setCart(items);
    setCustomerName(order.customer_name || "");
    setCustomerPhone(order.customer_phone || "");
    setPosNote(order.note || "");
    setOrderType(order.order_type || "dine-in");
    setPosStep(1);
    setResumingOrderId(order.id);
  }, []);

  const resolvePaymentMethodId = (paymentMethod) => {
    if (!paymentMethod) return null;

    if (isCashLike(paymentMethod)) {
      // Cash's real database id varies per environment (seeded via
      // updateOrInsert, so it isn't guaranteed to be 1) - look it up from
      // the actual fetched list instead of assuming an id.
      return findRealCashMethod(paymentMethods)?.id ?? null;
    }

    const rawId = paymentMethod?.payment_method_id ?? paymentMethod?.id;
    if (rawId == null || rawId === "") return null;

    const numericId = Number(rawId);
    return Number.isFinite(numericId) && numericId > 0 ? numericId : null;
  };

  const handleCreateOrder = async ({
    status = "completed",
    table_id = null,
    paidAmount = amountPaid,
    selectedCurrency = "USD",
    exchangeRateUsed = 4100,
  } = {}) => {
    if (cart.length === 0) {
      alertWarning(t.cartEmptyTitle, t.cartEmptyMsg);
      return;
    }

    if (status === "completed" && !selectedPayment) {
      alertWarning(t.paymentMethodRequiredTitle, t.paymentMethodRequiredMsg);
      return;
    }

    if (orderType === "dine-in" && !table_id) {
      alertWarning(t.tableRequiredTitle, t.tableRequiredMsg);
      return;
    }

    const normalizedStatus = status === "hold" ? "pending" : status;
    const selectedPaymentMethodId = resolvePaymentMethodId(selectedPayment);

    if (status === "completed" && selectedPayment && selectedPaymentMethodId === null) {
      alertWarning(t.paymentMethodRequiredTitle, t.paymentMethodUnavailableMsg);
      return;
    }

    const selectedPromotion = getSelectedPromotionForOrder();

    // amountPaid is always normalized to USD internally (see useCurrencyConversion).
    // Split it into the USD/KHR breakdown based on which currency the cashier used to enter it.
    const rate = Number(exchangeRateUsed) || 4100;
    const paidTotalUsd = Number(paidAmount) || 0;
    const paidUsd = selectedCurrency === "KHR" ? 0 : paidTotalUsd;
    const paidKhr = selectedCurrency === "KHR" ? Math.round(paidTotalUsd * rate) : 0;

    const payload = {
      items: cart.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
      })),
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      order_type: orderType,
      tax: 0,
      payment_method_id: selectedPaymentMethodId,
      amount_paid: normalizedStatus === "completed" ? paidTotalUsd : 0,
      amount_paid_usd: normalizedStatus === "completed" ? paidUsd : 0,
      amount_paid_khr: normalizedStatus === "completed" ? paidKhr : 0,
      exchange_rate_used: rate,
      promotion_id: selectedPromotion?.id || null,
      promotion_name: selectedPromotion?.name || null,
      promotion_type: selectedPromotion?.type || null,
      promotion_value: selectedPromotion?.value ?? null,
      discount_amount: Number(discount) || 0,
      note,
      status: normalizedStatus,
      table_id,
    };

    if (!resumingOrderId) {
      // Reuse the same key across retries of this same checkout attempt;
      // only a brand new order (after closePOS/loadOrderIntoCart resets it)
      // gets a fresh one.
      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      }
      payload.idempotency_key = idempotencyKeyRef.current;
    }

    try {
      const res = resumingOrderId
        ? await updateOrderApi(resumingOrderId, payload)
        : await createOrderApi(payload);
      addToast(res.data.order, status === "hold" ? "hold" : "payment");
      closePOS();
      onOrderCreated();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("tables:refresh"));
      }
    } catch (err) {
      alertError(t.orderFailedTitle, err.response?.data?.message || t.orderFailedMsg);
    }
  };

  return {
    showPOS,
    setShowPOS,
    cart,
    posSearch,
    setPosSearch,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    selectedPayment,
    setSelectedPayment,
    amountPaid,
    setAmountPaid,
    orderType,
    setOrderType,
    note,
    setPosNote,
    posStep,
    setPosStep,
    subtotal,
    discount,
    totalAmount,
    addToCart,
    updateQty,
    removeFromCart,
    proceedToPayment,
    closePOS,
    handleCreateOrder,
    resumingOrderId,
    loadOrderIntoCart,
  };
}
