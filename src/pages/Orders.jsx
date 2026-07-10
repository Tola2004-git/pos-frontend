import { useState, useMemo, useEffect } from "react";
import { RiAddLine } from "react-icons/ri";
import { ClipboardText, ReceiptAdd, ReceiptItem, ShoppingCart } from "iconsax-react";
import { glassCard, colors } from "../utils/styles";
import { useOrders, useProducts, usePaymentMethods } from "../hooks/useOrders";
import { useCategories } from "../hooks/useCategories";
import { usePOS } from "../hooks/usePOS";
import { usePromotions } from "../hooks/usePromotions";
import { usePromotionLogic } from "../hooks/usePromotionLogic";
import ToastNotification from "../components/orders/ToastNotification";
import OrdersFilter from "../components/orders/OrdersFilter";
import OrdersTable from "../components/orders/OrdersTable";
import POSModal from "../components/orders/POSModal";
import OrderDetailModal from "../components/orders/OrderDetailModal";
import Layout from "../components/layout/Layout";
import { updateOrderApi, fetchOrderApi, changeTableApi } from "../api/ordersApi";
import { alertWarning, alertError } from "../utils/alert.jsx";


const handlePrint = (order) => {
  const win = window.open("", "_blank");
  win.document.write(`
    <html><head><title>Receipt - ${order.order_number}</title>
    <style>
      body { font-family: monospace; width: 300px; margin: 0 auto; padding: 20px; }
      h2 { text-align: center; } hr { border: 1px dashed #000; }
      table { width: 100%; } td { padding: 2px 0; }
      .right { text-align: right; } .center { text-align: center; }
      .bold { font-weight: bold; } .total { font-size: 1.2em; }
    </style></head><body>
    <h2>🛍️ POS System</h2>
    <p class="center">${new Date(order.created_at).toLocaleString()}</p>
    <p class="center">Order: ${order.order_number}</p>
    <hr/>
    ${order.customer_name ? `<p>Customer: ${order.customer_name}</p>` : ""}
    <hr/>
    <table>
      ${order.items.map((i) => `<tr><td>${i.product_name} x${i.quantity}</td><td class="right">$${Number(i.subtotal).toFixed(2)}</td></tr>`).join("")}
    </table>
    <hr/>
    <table>
      <tr><td>Subtotal</td><td class="right">$${Number(order.subtotal).toFixed(2)}</td></tr>
      <tr class="bold total"><td>TOTAL</td><td class="right">$${Number(order.total).toFixed(2)}</td></tr>
      <tr><td>Paid (${order.payment_method?.name || ""})</td><td class="right">$${Number(order.amount_paid).toFixed(2)}</td></tr>
      <tr><td>Change</td><td class="right">$${Number(order.change_amount).toFixed(2)}</td></tr>
    </table>
    <hr/>
    <p class="center">Thank you! Come again 😊</p>
    </body></html>
  `);
  win.document.close();
  win.print();
};

function Orders() {
  const {
    orders,
    loading,
    total,
    page,
    lastPage,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    setPage,
    toasts,
    addToast,
    removeToast,
    lastOrderId,
    fetchOrders,
    handleCancel,
  } = useOrders();

  const { products, refetchProducts } = useProducts();
  const { categories } = useCategories();
  const { paymentMethods } = usePaymentMethods();
  const { promotions } = usePromotions();

  const pos = usePOS({
    onOrderCreated: () => {
      fetchOrders();
      refetchProducts();
    },
    addToast,
    lastOrderId,
    promotions,
  });

  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [editCart, setEditCart] = useState([]);
  const [editLoadingId, setEditLoadingId] = useState(null);
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editCustomerPhone, setEditCustomerPhone] = useState("");
  const [editOrderType, setEditOrderType] = useState("takeaway");
  const [editNote, setEditNote] = useState("");
  const [editPosSearch, setEditPosSearch] = useState("");
  const [editPosStep, setEditPosStep] = useState(1);
  const [editSelectedPayment, setEditSelectedPayment] = useState(null);
  const [editAmountPaid, setEditAmountPaid] = useState("");
  const [editPagerNumber, setEditPagerNumber] = useState("");

  useEffect(() => {
    const handleRefreshOrders = () => {
      fetchOrders();
      refetchProducts();
    };

    window.addEventListener("orders:refresh", handleRefreshOrders);
    return () => window.removeEventListener("orders:refresh", handleRefreshOrders);
  }, [fetchOrders, refetchProducts]);

  const editCartItems = useMemo(() => {
    return editCart.map((item) => {
      const product = products.find((p) => String(p.id) === String(item.product_id));
      const price = Number(product?.price || 0);
      const quantity = Number(item.quantity || 0);

      return {
        product_id: Number(item.product_id),
        quantity,
        price,
        subtotal: price * quantity,
        category_id: product?.category_id ?? null,
      };
    });
  }, [editCart, products]);

  const { subtotalBeforeDiscount, totalDiscountAmount, totalAfterDiscount } = usePromotionLogic(promotions, editCartItems);

  const selectedEditPromotion = useMemo(() => {
    return (
      promotions.find((promotion) => {
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

        if (promotion.apply_to === "all") return true;
        if (promotion.apply_to === "product") {
          return promotion.products?.some((p) => editCartItems.some((item) => item.product_id === p.id));
        }
        if (promotion.apply_to === "category") {
          return editCartItems.some((item) => item.category_id && promotion.categories?.some((c) => c.id === item.category_id));
        }
        return false;
      }) ||
      promotions.find((promotion) => String(promotion.id) === String(editOrder?.promotion_id)) ||
      null
    );
  }, [editCartItems, editOrder?.promotion_id, promotions]);

  const addToEditCart = (product) => {
    setEditCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price,
              }
            : item
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

  const updateEditQty = (product_id, qty) => {
    if (qty <= 0) {
      setEditCart((prev) => prev.filter((item) => item.product_id !== product_id));
      return;
    }

    setEditCart((prev) =>
      prev.map((item) =>
        item.product_id === product_id
          ? { ...item, quantity: qty, subtotal: qty * item.price }
          : item
      )
    );
  };

  const removeEditFromCart = (product_id) => {
    setEditCart((prev) => prev.filter((item) => item.product_id !== product_id));
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditOrder(null);
    setEditCart([]);
    setEditCustomerName("");
    setEditCustomerPhone("");
    setEditOrderType("takeaway");
    setEditNote("");
    setEditPosSearch("");
    setEditPosStep(1);
    setEditSelectedPayment(null);
    setEditAmountPaid("");
    setEditPagerNumber("");
  };

  const openEditModal = async (order) => {
    try {
      // Fetch full order details (includes items.product) to ensure product image is available
      const res = await fetchOrderApi(order.id);
      const fresh = res.data;
      setEditOrder(fresh);
      setEditCart(
        (fresh.items || []).map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name || item.product?.name || "Item",
          price: Number(item.price ?? item.product?.price ?? 0),
          quantity: item.quantity,
          subtotal: Number(item.subtotal ?? (item.price ?? item.product?.price ?? 0) * item.quantity),
          // map possible image fields into both `product` and flat `image`/`image_url`
          product: item.product || null,
          image: item.image || item.product?.image || item.product?.image_url || item.image_url || null,
          image_url: item.image_url || item.product?.image_url || item.product?.image || null,
          category_id: item.product?.category_id ?? null,
        }))
      );
    } catch (err) {
      // fallback to original order object if fetch fails
      setEditOrder(order);
      setEditCart(
        (order.items || []).map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name || item.product?.name || "Item",
          price: Number(item.price ?? item.product?.price ?? 0),
          quantity: item.quantity,
          subtotal: Number(item.subtotal ?? (item.price ?? item.product?.price ?? 0) * item.quantity),
          image: item.image || item.product?.image || null,
          category_id: item.product?.category_id ?? null,
        }))
      );
    }
    setEditCustomerName(order.customer_name || "");
    setEditCustomerPhone(order.customer_phone || "");
    setEditOrderType(order.order_type || "takeaway");
    setEditNote(order.note || "");
    setEditPosSearch("");
    setEditPosStep(1);
    setEditSelectedPayment(null);
    setEditAmountPaid(order.amount_paid || "");
    setEditPagerNumber(order.pager_number || "");
    setShowEditModal(true);
  };

  const handleEditClick = async (order) => {
    if (editLoadingId) return;
    setEditLoadingId(order.id);
    try {
      await openEditModal(order);
    } finally {
      setEditLoadingId(null);
    }
  };

  const handleSaveEdit = async ({ status = "pending", table_id = null, payment_method_id = null } = {}) => {
    if (!editOrder) return;
    if (editCart.length === 0) {
      alertWarning("Cart is empty", "Please add products to cart.");
      return;
    }

    try {
      const currentTableId = editOrder?.table_id ?? null;
      const nextTableId = editOrderType === "dine-in" ? table_id || null : null;

      if (editOrder?.status === "pending" && editOrderType === "dine-in" && nextTableId && String(nextTableId) !== String(currentTableId)) {
        await changeTableApi(editOrder.id, nextTableId);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("orders:refresh"));
          window.dispatchEvent(new CustomEvent("tables:refresh"));
        }
      }

      const payload = {
        customer_name: editCustomerName,
        customer_phone: editCustomerPhone,
        order_type: editOrderType,
        table_id: nextTableId,
        items: editCart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
        })),
        subtotal: subtotalBeforeDiscount,
        tax: 0,
        total: Math.max(totalAfterDiscount, 0),
        promotion_id: selectedEditPromotion?.id || editOrder?.promotion_id || null,
        promotion_name: selectedEditPromotion?.name || editOrder?.promotion_name || null,
        promotion_type: selectedEditPromotion?.type || editOrder?.promotion_type || null,
        promotion_value: selectedEditPromotion?.value ?? editOrder?.promotion_value ?? null,
        discount_amount: totalDiscountAmount,
        amount_paid: Number(editAmountPaid || 0),
        payment_method_id,
        note: editNote,
        status,
      };

      const res = await updateOrderApi(editOrder.id, payload);
      closeEditModal();
      fetchOrders();
      refetchProducts();
      addToast(res.data.order, status === "completed" ? "payment" : "update");
    } catch (err) {
      alertError("Update failed", err.response?.data?.message || "Unable to update the order.");
    }
  };

  return (
    <Layout>
      <ToastNotification toasts={toasts} onClose={removeToast} />
      <style>{`
        @keyframes float {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            color: "white",
            fontWeight: 700,
            fontSize: "1.5rem",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            <ShoppingCart size={40} color="#fff" variant="Outline" />
          </div>
          Orders Management
        </h2>
        <button
          onClick={() => pos.setShowPOS(true)}
          className="btn-shine-blue"
          style={{
            padding: "10px 20px",
            borderRadius: "12px",
            fontWeight: 600,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <ReceiptAdd size={25} color="#fff" variant="bulk"/>
          New Order
        </button>
      </div>

      <OrdersFilter
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onStatusChange={(v) => {
          setStatusFilter(v);
          setPage(1);
        }}
        dateFrom={dateFrom}
        onDateFromChange={(v) => {
          setDateFrom(v);
          setPage(1);
        }}
        dateTo={dateTo}
        onDateToChange={(v) => {
          setDateTo(v);
          setPage(1);
        }}
      />

      <OrdersTable
        orders={orders}
        loading={loading}
        page={page}
        lastPage={lastPage}
        total={total}
        onView={(order) => {
          setSelectedOrder(order);
          setShowDetail(true);
        }}
        onEdit={handleEditClick}
        editLoadingId={editLoadingId}
        onPrint={handlePrint}
        onCancel={handleCancel}
        onPagePrev={() => setPage((p) => Math.max(1, p - 1))}
        onPageNext={() => setPage((p) => Math.min(lastPage, p + 1))}
      />

      {pos.showPOS && (
        <POSModal
          products={products}
          categories={categories}
          paymentMethods={paymentMethods}
          promotions={promotions}
          {...pos}
        />
      )}

      {showEditModal && editOrder && (
        <POSModal
          showPOS={showEditModal}
          mode="edit"
          editingOrder={editOrder}
          onSaveEdit={handleSaveEdit}
          products={products}
          categories={categories}
          paymentMethods={paymentMethods}
          promotions={promotions}
          cart={editCart}
          posSearch={editPosSearch}
          setPosSearch={setEditPosSearch}
          customerName={editCustomerName}
          setCustomerName={setEditCustomerName}
          customerPhone={editCustomerPhone}
          setCustomerPhone={setEditCustomerPhone}
          selectedPayment={editSelectedPayment}
          setSelectedPayment={setEditSelectedPayment}
          amountPaid={editAmountPaid}
          setAmountPaid={setEditAmountPaid}
          pagerNumber={editPagerNumber}
          setPagerNumber={setEditPagerNumber}
          orderType={editOrderType}
          setOrderType={setEditOrderType}
          note={editNote}
          setPosNote={setEditNote}
          posStep={editPosStep}
          setPosStep={setEditPosStep}
          subtotal={subtotalBeforeDiscount}
          totalAmount={totalAfterDiscount}
          change={0}
          addToCart={addToEditCart}
          updateQty={updateEditQty}
          removeFromCart={removeEditFromCart}
          closePOS={closeEditModal}
          handleCreateOrder={handleSaveEdit}
        />
      )}

      {showDetail && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setShowDetail(false)}
          onPrint={handlePrint}
        />
      )}
    </Layout>
  );
}

export default Orders;
