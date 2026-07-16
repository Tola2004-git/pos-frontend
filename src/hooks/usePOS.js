import { useCallback, useState } from "react";
import { createOrderApi, updateOrderApi } from "../api/ordersApi";
import { alertWarning, alertError } from "../utils/alert.jsx";

export function usePOS({
  onOrderCreated,
  addToast,
  lastOrderId,
  promotions = [],
  paymentMethods = [],
}) {
  const [showPOS, setShowPOS] = useState(false);
  const [cart, setCart] = useState([]);
  const [posSearch, setPosSearch] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [amountPaid, setAmountPaid] = useState("");
  const [pagerNumber, setPagerNumber] = useState("");
  const [orderType, setOrderType] = useState("dine-in");
  const [note, setPosNote] = useState("");
  const [posStep, setPosStep] = useState(1);
  // Set when the cart was loaded from an existing held (pending) order via
  // loadOrderIntoCart - confirming then updates that order instead of
  // creating a new one.
  const [resumingOrderId, setResumingOrderId] = useState(null);

  // Stock checks below read `cart` directly and call setCart with a plain
  // value (never the functional updater form). The alertWarning side effect
  // must run exactly once per click - React 18 StrictMode double-invokes
  // functional setState updaters in dev, which was firing the toast twice.
  const addToCart = useCallback((product) => {
    const availableStock = Number(product.qty) || 0;

    if (availableStock <= 0) {
      alertWarning("Out of Stock", `${product.name} is currently out of stock.`);
      return;
    }

    const existing = cart.find((i) => i.product_id === product.id);

    if (existing) {
      if (existing.quantity >= availableStock) {
        alertWarning(
          "Stock Limit Reached",
          `Only ${availableStock} unit(s) of ${product.name} available.`,
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
  }, [cart]);

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
        "Stock Limit Reached",
        `Only ${maxStock} unit(s) of ${item.product_name} available.`,
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

  const getItemPromotions = (item) =>
    promotions.filter((promotion) => matchesPromotion(item, promotion) && isPromotionValid(promotion));

  const getItemDiscount = (item) =>
    getItemPromotions(item).reduce((sum, promotion) => {
      if (promotion.type === "percentage") {
        return sum + (item.subtotal * Number(promotion.value)) / 100;
      }
      return sum + Number(promotion.value) * item.quantity;
    }, 0);

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
    setPagerNumber("");
    setOrderType("takeaway");
    setPosNote("");
    setPosStep(1);
    setResumingOrderId(null);
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
    setPagerNumber(order.pager_number || "");
    setPosNote(order.note || "");
    setOrderType(order.order_type || "dine-in");
    setPosStep(1);
    setResumingOrderId(order.id);
  }, []);

  const resolvePaymentMethodId = (paymentMethod) => {
    if (!paymentMethod) return null;

    const isCashMethod =
      paymentMethod?.name?.toLowerCase() === "cash" ||
      paymentMethod?.type === "cash" ||
      paymentMethod?.id === "cash";

    if (isCashMethod) {
      // Cash's real database id varies per environment (seeded via
      // updateOrInsert, so it isn't guaranteed to be 1) - look it up from
      // the actual fetched list instead of assuming an id.
      const realCashMethod = paymentMethods.find(
        (m) => m.name?.toLowerCase() === "cash" || m.type === "cash",
      );
      return realCashMethod?.id ?? null;
    }

    const rawId = paymentMethod?.payment_method_id ?? paymentMethod?.id;
    if (rawId == null || rawId === "") return null;

    const numericId = Number(rawId);
    return Number.isFinite(numericId) && numericId > 0 ? numericId : null;
  };

  const handleCreateOrder = async ({
    status = "completed",
    table_id = null,
    totalDue = totalAmount,
    paidAmount = amountPaid,
    selectedCurrency = "USD",
    exchangeRateUsed = 4100,
  } = {}) => {
    if (cart.length === 0) {
      alertWarning("Cart is empty", "Please add products to cart!");
      return;
    }

    if (status === "completed" && !selectedPayment) {
      alertWarning("Payment method required", "Please select a payment method!");
      return;
    }

    if (orderType === "dine-in" && !table_id) {
      alertWarning("Table required", "Please select a table before saving this order.");
      return;
    }

    const normalizedStatus = status === "hold" ? "pending" : status;
    const selectedPaymentMethodId = resolvePaymentMethodId(selectedPayment);
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
      pager_number: pagerNumber || null,
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

    try {
      const res = resumingOrderId
        ? await updateOrderApi(resumingOrderId, payload)
        : await createOrderApi(payload);
      addToast(res.data.order, status === "hold" ? "hold" : "payment");
      lastOrderId.current = res.data.order.id;
      closePOS();
      onOrderCreated();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("tables:refresh"));
      }
    } catch (err) {
      alertError("Order failed", err.response?.data?.message || "Something went wrong!");
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
    closePOS,
    handleCreateOrder,
    pagerNumber,
    setPagerNumber,
    resumingOrderId,
    loadOrderIntoCart,
  };
}
