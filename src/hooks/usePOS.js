import { useState } from "react";
import { createOrderApi } from "../api/ordersApi";

const CASH_PAYMENT_METHOD_ID = 1;

export function usePOS({ onOrderCreated, addToast, lastOrderId, promotions = [] }) {
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
  const [posError, setPosError] = useState("");
  const [posStep, setPosStep] = useState(1);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                subtotal: (i.quantity + 1) * i.price,
              }
            : i,
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          product_name: product.name,
          price: Number(product.price),
          quantity: 1,
          subtotal: Number(product.price),
          image: product.image,
          category_id: product.category_id ?? null,
        },
      ];
    });
  };

  const updateQty = (product_id, qty) => {
    if (qty <= 0) {
      removeFromCart(product_id);
      return;
    }
    setCart((prev) =>
      prev.map((i) =>
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
  const change = amountPaid ? Number(amountPaid) - totalAmount : 0;

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
    setPosError("");
    setPosStep(1);
  };

  const resolvePaymentMethodId = (paymentMethod) => {
    if (!paymentMethod) return null;

    const isCashMethod =
      paymentMethod?.name?.toLowerCase() === "cash" ||
      paymentMethod?.type === "cash" ||
      paymentMethod?.id === "cash" ||
      paymentMethod?.id === CASH_PAYMENT_METHOD_ID ||
      paymentMethod?.payment_method_id === CASH_PAYMENT_METHOD_ID;

    if (isCashMethod) return CASH_PAYMENT_METHOD_ID;

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
  } = {}) => {
    setPosError("");
    if (cart.length === 0) return setPosError("Please add products to cart!");

    if (status === "completed" && !selectedPayment) {
      return setPosError("Please select payment method!");
    }

    if (orderType === "dine-in" && !table_id) {
      return setPosError("Please select a table before saving this order.");
    }

    const normalizedStatus = status === "hold" ? "pending" : status;
    const selectedPaymentMethodId = resolvePaymentMethodId(selectedPayment);
    const selectedPromotion = getSelectedPromotionForOrder();

    try {
      const res = await createOrderApi({
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
        amount_paid: normalizedStatus === "completed" ? Number(paidAmount) || 0 : 0,
        promotion_id: selectedPromotion?.id || null,
        promotion_name: selectedPromotion?.name || null,
        promotion_type: selectedPromotion?.type || null,
        promotion_value: selectedPromotion?.value ?? null,
        discount_amount: Number(discount) || 0,
        note,
        status: normalizedStatus,
        table_id,
      });
      addToast(res.data.order);
      lastOrderId.current = res.data.order.id;
      closePOS();
      onOrderCreated();
    } catch (err) {
      setPosError(err.response?.data?.message || "Something went wrong!");
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
    posError,
    posStep,
    setPosStep,
    subtotal,
    discount,
    totalAmount,
    change,
    addToCart,
    updateQty,
    removeFromCart,
    closePOS,
    handleCreateOrder,
    pagerNumber,
    setPagerNumber,
  };
}
