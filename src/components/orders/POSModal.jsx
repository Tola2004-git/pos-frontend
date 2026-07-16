import { useState, useEffect } from "react";
import {
  ArrowLeft2,
  ArrowRight2,
  Edit2,
  ShoppingBag,
  TickCircle,
} from "iconsax-react";
import { glassCard } from "../../utils/styles";
import apiClient from "../../api/apiClient";
import { changeTableApi } from "../../api/ordersApi";
import { alertConfirmWarning } from "../../utils/alert.jsx";

// Import custom hooks
import { usePromotionLogic } from "../../hooks/usePromotionLogic";
import { useCurrencyConversion } from "../../hooks/useCurrencyConversion";
import { useTableSelection } from "../../hooks/useTableSelection";
import { usePaymentMethodValidation } from "../../hooks/usePaymentMethodValidation";

// Import atomic components
import { ProductGrid } from "./ProductGrid";
import { CartSidebar } from "./CartSidebar";
import { PaymentMethodList } from "../payment/PaymentMethodList";
import { PaymentDetailsForm } from "../payment/PaymentDetailsForm";
import { HoldOrderAction } from "../payment/HoldOrderAction";
import { CheckoutSummary } from "../payment/CheckoutSummary";

export default function POSModal({
  showPOS,
  mode = "new",
  editingOrder = null,
  onSaveEdit,
  products,
  categories,
  paymentMethods,
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
  pagerNumber,
  setPagerNumber,
  orderType,
  setOrderType,
  note,
  setPosNote,
  posStep,
  setPosStep,
  subtotal,
  totalAmount,
  addToCart,
  updateQty,
  removeFromCart,
  closePOS,
  handleCreateOrder,
  promotions = [],
  initialTableId = null,
  resumingOrderId = null,
}) {
  const isEditMode = mode === "edit";
  // Cash's real database id varies per environment (seeded via
  // updateOrInsert, so it isn't guaranteed to be 1) - resolve it from the
  // actual fetched list, falling back to the "cash" placeholder id.
  const cashPaymentMethodId =
    paymentMethods.find(
      (m) => m.name?.toLowerCase() === "cash" || m.type === "cash",
    )?.id ?? "cash";

  // Local UI state
  const [focusedField, setFocusedField] = useState("");
  const [isHolding, setIsHolding] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(4100);
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [amountPaidInput, setAmountPaidInput] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isChangingTable, setIsChangingTable] = useState(false);
  const [tableActionMessage, setTableActionMessage] = useState("");
  const [activeEditingOrder, setActiveEditingOrder] = useState(editingOrder);
  const [showTablePicker, setShowTablePicker] = useState(false);

  useEffect(() => {
    setActiveEditingOrder(editingOrder);
    setShowTablePicker(false);
  }, [editingOrder]);

  const getTableLabel = (table) =>
    table?.name ||
    table?.table_name ||
    table?.tableNumber ||
    `Table ${table?.id}`;

  // Custom hooks for business logic
  const promotionLogic = usePromotionLogic(promotions, cart);
  const currency = useCurrencyConversion(exchangeRate);
  const tableSelection = useTableSelection(
    isEditMode ? (activeEditingOrder?.table_id ?? null) : initialTableId,
    { allowOccupiedTables: isEditMode || Boolean(initialTableId) },
  );
  const paymentMethodsValidation = usePaymentMethodValidation(paymentMethods);

  // Computed values
  const totalAmountWithDiscount = promotionLogic.totalAfterDiscount;
  const subtotalBeforeDiscount = promotionLogic.subtotalBeforeDiscount;
  const discountAmount = promotionLogic.totalDiscountAmount;
  const totalDue = Number(totalAmountWithDiscount || 0);
  const safeAmountPaid = Number(amountPaid) || 0;
  const changeAmount = safeAmountPaid
    ? safeAmountPaid - totalAmountWithDiscount
    : 0;
  const isAmountValid = isEditMode || safeAmountPaid >= totalDue;
  const requiresTableSelection = orderType === "dine-in";
  const hasValidTableSelection =
    !requiresTableSelection || Boolean(tableSelection.selectedTableId);
  const confirmDisabled =
    isHolding ||
    isConfirming ||
    (requiresTableSelection &&
      (!tableSelection.selectedTableId || tableSelection.tableLoading)) ||
    (!isEditMode && !selectedPayment) ||
    (!isEditMode && !isAmountValid) ||
    !hasValidTableSelection;

  // Mirrors amountPaid as a raw string the cashier can freely type into -
  // deriving the display value straight from formatInputAmount() on every
  // render would round-trip through toFixed()/parseFloat() on each
  // keystroke, snapping "10." back to "10" before a trailing digit like
  // ".50" could ever be typed. Only re-sync from the numeric amount while
  // the field isn't focused, so programmatic changes (payment method
  // selection, currency switch, resets) still update it.
  useEffect(() => {
    if (focusedField !== "amount") {
      setAmountPaidInput(currency.formatInputAmount(safeAmountPaid, selectedCurrency));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeAmountPaid, selectedCurrency, focusedField]);
  const amountPaidDisplay = amountPaidInput;
  const amountPaidActive =
    selectedCurrency === "KHR" ? safeAmountPaid * exchangeRate : safeAmountPaid;

  const paymentValidationMessage = isEditMode
    ? ""
    : !selectedPayment
      ? "Please select a payment method before confirming."
      : requiresTableSelection && !tableSelection.selectedTableId
        ? "Please select a table before confirming this dine-in order."
        : !isAmountValid && totalDue > 0
          ? `Enter ${currency.displayAmount(totalDue, selectedCurrency)} or more to confirm this order.`
          : "";

  const availableTables = tableSelection.getAvailableTables();
  const blockedTables = tableSelection.getBlockedTables();
  // Switching tables is only meaningful for an order that's already seated
  // and still unpaid - true whether we got here via the Orders page's Edit
  // flow (isEditMode) or by resuming a held order from the Cashier table
  // grid (resumingOrderId).
  const canChangeTable = isEditMode
    ? activeEditingOrder?.status === "pending"
    : Boolean(resumingOrderId);
  const currentSessionTable =
    canChangeTable &&
    tableSelection.getSelectedTable() &&
    tableSelection.getSelectedTable().status !== "available"
      ? tableSelection.getSelectedTable()
      : null;

  // Fetch exchange rate on mount
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await apiClient.get("/exchange-rates");
        setExchangeRate(Number(response.data.usd_to_khr) || 4100);
      } catch (error) {
        console.error("Failed to fetch exchange rate", error);
        setExchangeRate(4100);
      }
    };
    fetchExchangeRate();
  }, []);

  // Handle modal show/hide animation
  useEffect(() => {
    let timeout;
    if (showPOS) {
      setIsMounted(true);
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
      timeout = setTimeout(() => setIsMounted(false), 300);
    }
    return () => clearTimeout(timeout);
  }, [showPOS]);

  // Lock background page scroll while the modal is open
  useEffect(() => {
    if (!showPOS) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [showPOS]);

  // Set default payment method
  // Clear table selection when order type changes
  useEffect(() => {
    if (orderType !== "dine-in") {
      tableSelection.clearSelection();
    }
  }, [orderType, tableSelection]);

  // Handle payment method selection with auto-fill and toggle/deselect support
  const resolvePaymentMethod = (method) => {
    if (!method) return null;

    const isCashMethod =
      method?.name?.toLowerCase() === "cash" || method?.type === "cash";

    if (!isCashMethod) return method;

    return {
      ...(method || {}),
      id: cashPaymentMethodId,
      name: "Cash",
      type: "cash",
    };
  };

  const handlePaymentMethodSelect = (method) => {
    const normalizedMethod = resolvePaymentMethod(method);

    if (selectedPayment?.id === normalizedMethod?.id) {
      setSelectedPayment(null);
      setAmountPaid(0);
      return;
    }

    setSelectedPayment(normalizedMethod);
    if (
      normalizedMethod?.name?.toLowerCase() !== "cash" &&
      normalizedMethod?.type !== "cash"
    ) {
      setAmountPaid(totalAmountWithDiscount);
    } else {
      setAmountPaid(0);
    }
  };

  const handleChangeTable = async (nextTableId) => {
    const orderId = isEditMode ? activeEditingOrder?.id : resumingOrderId;

    if (!canChangeTable || !orderId || !nextTableId) {
      return;
    }

    setIsChangingTable(true);
    setTableActionMessage("");

    try {
      const response = await changeTableApi(orderId, nextTableId);
      const freshOrder = response?.data?.order;

      if (freshOrder && isEditMode) {
        setActiveEditingOrder(freshOrder);
      }

      tableSelection.setSelectedTableId(nextTableId);
      await tableSelection.refreshTables();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("orders:refresh"));
        window.dispatchEvent(new CustomEvent("tables:refresh"));
      }
      setTableActionMessage("Table updated successfully.");
      setShowTablePicker(false);
    } catch (error) {
      setTableActionMessage(
        error.response?.data?.message ||
          "Unable to change the table right now.",
      );
    } finally {
      setIsChangingTable(false);
    }
  };

  // Handle confirm order
  const handleConfirmOrder = async ({
    status = isEditMode ? "pending" : "completed",
    tableId = null,
  } = {}) => {
    if (status === "hold") {
      setIsHolding(true);
    } else {
      setIsConfirming(true);
    }

    try {
      if (isEditMode && onSaveEdit) {
        await onSaveEdit({
          status,
          table_id: tableId ?? tableSelection.selectedTableId ?? null,
          totalDue,
          paidAmount: safeAmountPaid,
          selectedCurrency,
          exchangeRateUsed: exchangeRate,
          payment_method_id: selectedPayment?.id ?? null,
        });
        await tableSelection.refreshTables();
        return;
      }

      await handleCreateOrder({
        status,
        table_id: tableId,
        totalDue,
        paidAmount: safeAmountPaid,
        selectedCurrency,
        exchangeRateUsed: exchangeRate,
      });
      await tableSelection.refreshTables();
    } finally {
      if (status === "hold") {
        setIsHolding(false);
      } else {
        setIsConfirming(false);
      }
    }
  };

  const handleHoldOrder = async () => {
    setSelectedPayment(null);
    setAmountPaid(0);
    await handleConfirmOrder({
      status: "hold",
      tableId: orderType === "dine-in" ? tableSelection.selectedTableId : null,
    });
  };

  const handleUpdateOrder = async () => {
    await handleConfirmOrder({
      status: "pending",
      tableId: orderType === "dine-in" ? tableSelection.selectedTableId : null,
    });
  };

  const handleCompletePayment = async () => {
    await handleConfirmOrder({
      status: "completed",
      tableId: orderType === "dine-in" ? tableSelection.selectedTableId : null,
    });
  };

  // Handle amount paid input
  const handleAmountPaidChange = (inputValue) => {
    setAmountPaidInput(inputValue);
    if (inputValue === "") {
      setAmountPaid(0);
      return;
    }
    const usdValue = currency.parseInputAmount(inputValue, selectedCurrency);
    setAmountPaid(usdValue);
  };

  if (!isMounted) return null;

  return (
    <div
      style={{
        ...glassCard,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: isVisible ? 1 : 0,
        animation: isVisible ? "confirm-fade-in 0.2s ease forwards" : "none",
        transition: "opacity 220ms ease",
        pointerEvents: showPOS ? "auto" : "none",
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-[20px]"
    >
      <style>{`
        @keyframes confirm-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes confirm-pop {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>

      <div
        style={{
          ...glassCard,
          transform: isVisible ? "translateY(0)" : "translateY(24px)",
          opacity: isVisible ? 1 : 0,
          animation: isVisible
            ? "confirm-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
            : "none",
          transition: "transform 220ms ease, opacity 220ms ease",
        }}
        className="rounded-[24px] w-full max-w-[900px] max-h-[90vh] flex flex-col overflow-hidden p-[20px]"
      >
        <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center">
          <h3 className="text-white font-bold m-0 flex items-center gap-[10px]">
            <div className="animate-bounce">
              <ShoppingBag size={25} color="#fff" variant="Linear" />
            </div>
            {isEditMode ? "Edit Order" : resumingOrderId ? "Resume Held Order" : "New Order"}
          </h3>
          <div className="flex items-center gap-[10px]">
            {[
              { step: 1, label: "1. Cart" },
              { step: 2, label: "2. Payment" },
            ].map(({ step, label }) => (
              <button
                className={`px-[14px] py-[6px] rounded-[20px] border-none cursor-pointer font-semibold text-[0.85rem] transition-colors ${
                  posStep === step
                    ? "bg-white text-[#1a1a2e]"
                    : "bg-white/10 text-white"
                }`}
                key={step}
                onClick={() =>
                  step === 1 ? setPosStep(1) : cart.length > 0 && setPosStep(2)
                }
              >
                {label}
              </button>
            ))}
            <button
              onClick={closePOS}
              className="bg-white/10 border-none text-white w-8 h-8 rounded-full cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
        {posStep === 1 ? (
          <div className="flex flex-1 overflow-hidden">
            {/* Product Grid */}
            <ProductGrid
              products={products}
              categories={categories}
              search={posSearch}
              onSearchChange={setPosSearch}
              onAddToCart={addToCart}
              findProductPromotions={promotionLogic.findProductPromotions}
              formatPromotionLabel={promotionLogic.formatPromotionLabel}
              truncatePromoName={promotionLogic.truncatePromoName}
            />

            {/* Cart Sidebar */}
            <div className="flex flex-col min-w-[320px] border-l border-white/10 bg-white/5">
              <div className="px-4 py-3 border-b border-white/10">
                <div className="text-[0.8rem] text-white/70 mb-2">
                  Order Type
                </div>
                <div className="flex gap-2">
                  {[
                    { value: "dine-in", label: "Dine-in" },
                    { value: "takeaway", label: "Takeaway" },
                  ].map((option) => {
                    const selected = orderType === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setOrderType(option.value)}
                        className={`flex-1 rounded-[10px] px-3 py-2 text-sm font-semibold transition-all ${
                          selected
                            ? "bg-white text-[#1a1a2e]"
                            : "bg-white/10 text-white hover:bg-white/20"
                        }`}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <CartSidebar
                cart={cart}
                onUpdateQty={updateQty}
                onRemove={removeFromCart}
                onProceedToPayment={() => cart.length > 0 && setPosStep(2)}
                customerName={customerName}
                onCustomerNameChange={setCustomerName}
                customerPhone={customerPhone}
                onCustomerPhoneChange={setCustomerPhone}
                note={note}
                onNoteChange={setPosNote}
                totalAmountWithDiscount={totalAmountWithDiscount}
                subtotalBeforeDiscount={subtotalBeforeDiscount}
                discountAmount={discountAmount}
                canProceed={cart.length > 0}
                findItemPromotions={promotionLogic.findItemPromotions}
                formatPromotionLabel={promotionLogic.formatPromotionLabel}
                truncatePromoName={promotionLogic.truncatePromoName}
                getItemTotal={promotionLogic.getItemTotal}
                getItemDiscount={promotionLogic.getItemDiscount}
                focusedField={focusedField}
                setFocusedField={setFocusedField}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="p-6 flex-1 flex flex-col overflow-hidden min-h-0">
              <div
                style={{
                  overflowY: "auto",
                  margin: 0,
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  listStyle: "none",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(255, 255, 255, 0.2) transparent",
                }}
                className="overflow-y-auto flex-1 pr-1 pb-8 space-y-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
              >
                <div className="grid grid-cols-12 gap-2 lg:gap-3">
                  {/* Payment Method Selection */}
                  <div className="col-span-12 lg:col-span-4 xl:col-span-4 lg:pr-1">
                    <h4 className="flex items-center gap-2 text-white mb-[8px] text-lg font-medium">
                      Select Payment Method
                    </h4>
                    <PaymentMethodList
                      paymentMethods={
                        paymentMethodsValidation.paymentMethodsToRender
                      }
                      paymentMethodsSource={paymentMethods}
                      selectedPaymentId={selectedPayment?.id}
                      onSelectPayment={handlePaymentMethodSelect}
                    />
                  </div>

                  {/* Payment Details + Summary + Footer */}
                  <div className="col-span-12 lg:col-span-8 xl:col-span-8 flex flex-col lg:pl-1">
                    {requiresTableSelection && (
                      <div className="mb-4 rounded-[14px] border border-white/10 bg-white/5 p-3">
                        {currentSessionTable && !showTablePicker ? (
                          // Compact view: current table badge + a small icon to open the switcher.
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="text-[0.72rem] uppercase tracking-[0.2em] text-white/45">
                                Table
                              </span>
                              <span className="truncate rounded-[10px] border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-medium text-white">
                                {getTableLabel(currentSessionTable)}
                              </span>
                            </div>
                            {canChangeTable && (
                              <button
                                type="button"
                                onClick={() => setShowTablePicker(true)}
                                title="Switch table"
                                aria-label="Switch table"
                                className="flex-shrink-0 rounded-full border border-white/10 bg-white/10 p-2 text-white transition-all hover:bg-white/20"
                              >
                                <Edit2
                                  size={16}
                                  color="white"
                                  variant="Outline"
                                />
                              </button>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="mb-2 flex items-center justify-between">
                              <h5 className="text-white font-medium">
                                Select Table
                              </h5>
                              {currentSessionTable ? (
                                <button
                                  type="button"
                                  onClick={() => setShowTablePicker(false)}
                                  className="text-[0.8rem] text-white/60 transition-all hover:text-white"
                                >
                                  Cancel
                                </button>
                              ) : (
                                <span className="text-[0.8rem] text-white/60">
                                  {tableSelection.selectedTableId
                                    ? "Selected"
                                    : "Required"}
                                </span>
                              )}
                            </div>

                            {tableSelection.tableLoading ? (
                              <div className="text-sm text-white/60">
                                Loading tables...
                              </div>
                            ) : currentSessionTable ? (
                              // Switching an already-seated order: a compact dropdown beats a
                              // full grid + separate confirm button for this quick action.
                              <div className="space-y-2">
                                <select
                                  value={
                                    tableSelection.selectedTableId ??
                                    currentSessionTable.id
                                  }
                                  disabled={isChangingTable}
                                  onChange={(e) => {
                                    const nextTableId = Number(e.target.value);
                                    if (nextTableId === currentSessionTable.id)
                                      return;
                                    handleChangeTable(nextTableId);
                                  }}
                                  className="w-full rounded-[10px] border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-white transition-all focus:border-white/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <option
                                    value={currentSessionTable.id}
                                    className="bg-[#1a1a2e]"
                                  >
                                    {getTableLabel(currentSessionTable)}{" "}
                                    (current)
                                  </option>
                                  {availableTables.map((table) => (
                                    <option
                                      key={table.id}
                                      value={table.id}
                                      className="bg-[#1a1a2e]"
                                    >
                                      {getTableLabel(table)}
                                    </option>
                                  ))}
                                </select>
                                {isChangingTable && (
                                  <div className="text-sm text-white/60">
                                    Switching table...
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {availableTables.length > 0 ? (
                                    availableTables.map((table) => {
                                      const isSelected =
                                        tableSelection.selectedTableId ===
                                        table.id;

                                      return (
                                        <button
                                          key={table.id}
                                          type="button"
                                          onClick={() =>
                                            tableSelection.setSelectedTableId(
                                              table.id,
                                            )
                                          }
                                          className={`rounded-[10px] border px-3 py-2 text-sm font-medium transition-all ${
                                            isSelected
                                              ? "border-white bg-white text-[#1a1a2e]"
                                              : "border-white/10 bg-white/10 text-white hover:bg-white/20"
                                          }`}
                                        >
                                          {getTableLabel(table)}
                                        </button>
                                      );
                                    })
                                  ) : (
                                    <div className="col-span-full text-sm text-white/60">
                                      No available tables.
                                    </div>
                                  )}
                                </div>

                                {!isEditMode && (
                                  <div className="rounded-[10px] border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                                    Only available tables are shown for new
                                    dine-in orders to prevent table overlap.
                                  </div>
                                )}

                                {blockedTables.length > 0 && (
                                  <div className="space-y-2">
                                    <div className="text-[0.72rem] uppercase tracking-[0.2em] text-white/45">
                                      In-use tables
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                      {blockedTables.map((table) => {
                                        const statusLabel =
                                          table.status === "reserved"
                                            ? "Reserved"
                                            : "Occupied";

                                        if (isEditMode) {
                                          return (
                                            <button
                                              key={table.id}
                                              type="button"
                                              disabled
                                              className="cursor-not-allowed rounded-[10px] border border-white/10 bg-white/5 px-3 py-2 text-left text-sm font-medium text-white/60"
                                            >
                                              <div>{getTableLabel(table)}</div>
                                              <div className="text-[0.7rem] uppercase tracking-[0.2em] text-white/45">
                                                {statusLabel}
                                              </div>
                                            </button>
                                          );
                                        }

                                        const isSelected =
                                          tableSelection.selectedTableId ===
                                          table.id;

                                        const handleOccupiedTableClick =
                                          async () => {
                                            const result =
                                              await alertConfirmWarning(
                                                "Table already occupied?",
                                                "This table is currently occupied. Are you sure you want to add a new concurrent order to this table (e.g., for a friend joining later)?",
                                                "Yes, Add Order",
                                              );
                                            if (!result.isConfirmed) return;
                                            tableSelection.setSelectedTableId(
                                              table.id,
                                              true,
                                            );
                                          };

                                        return (
                                          <button
                                            key={table.id}
                                            type="button"
                                            onClick={handleOccupiedTableClick}
                                            className={`rounded-[10px] border px-3 py-2 text-left text-sm font-medium transition-all ${
                                              isSelected
                                                ? "border-white bg-white text-[#1a1a2e]"
                                                : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                                            }`}
                                          >
                                            <div>{getTableLabel(table)}</div>
                                            <div
                                              className={`text-[0.7rem] uppercase tracking-[0.2em] ${
                                                isSelected
                                                  ? "text-[#1a1a2e]/60"
                                                  : "text-white/45"
                                              }`}
                                            >
                                              {statusLabel}
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {tableActionMessage && (
                              <div className="mt-2 rounded-[10px] border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
                                {tableActionMessage}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    <PaymentDetailsForm
                      selectedCurrency={selectedCurrency}
                      onCurrencyChange={setSelectedCurrency}
                      amountPaidDisplay={amountPaidDisplay}
                      amountPaidActive={amountPaidActive}
                      onAmountPaidChange={handleAmountPaidChange}
                      subtotalUSD={subtotalBeforeDiscount}
                      totalDueUSD={totalAmountWithDiscount}
                      tableOptions={tableSelection.tableOptions}
                      selectedTableId={tableSelection.selectedTableId}
                      onTableSelect={tableSelection.setSelectedTableId}
                      tableLoading={tableSelection.tableLoading}
                      pagerNumber={pagerNumber}
                      onPagerNumberChange={setPagerNumber}
                      note={note}
                      onNoteChange={setPosNote}
                      focusedField={focusedField}
                      onFocusFocus={setFocusedField}
                      onFocusBlur={() => setFocusedField("")}
                    />

                    <div className="mt-4">
                      <CheckoutSummary
                        subtotalBeforeDiscount={subtotalBeforeDiscount}
                        discountAmount={discountAmount}
                        totalAmountWithDiscount={totalAmountWithDiscount}
                        amountPaid={safeAmountPaid}
                        selectedCurrency={selectedCurrency}
                        exchangeRate={exchangeRate}
                      />
                    </div>

                    {paymentValidationMessage && (
                      <div className="mt-3 rounded-[10px] border border-[#f39c12]/50 bg-[#f39c12]/15 px-3 py-2 text-[0.85rem] text-[#ffd166]">
                        {paymentValidationMessage}
                      </div>
                    )}

                    <div className="mt-2 grid grid-cols-3 gap-3 pb-2">
                      <button
                        onClick={() => setPosStep(1)}
                        className="btn-cancel-glass flex-1 flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-all active:scale-95"
                        style={{
                          borderRadius: "12px",
                          color: "white",
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                      >
                        <ArrowLeft2 size={18} color="white" variant="Linear" />
                        Back
                      </button>

                      {!isEditMode && (
                        <HoldOrderAction
                          onHold={handleHoldOrder}
                          loading={isHolding}
                          disabled={
                            isConfirming ||
                            (orderType === "dine-in" &&
                              (!tableSelection.selectedTableId ||
                                tableSelection.tableLoading))
                          }
                        />
                      )}

                      {isEditMode ? (
                        <>
                          <button
                            onClick={handleUpdateOrder}
                            disabled={
                              isConfirming ||
                              (orderType === "dine-in" &&
                                (!tableSelection.selectedTableId ||
                                  tableSelection.tableLoading))
                            }
                            className="btn-shine-blue p-3 flex-1 flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-transform active:scale-95"
                            style={{
                              borderRadius: "12px",
                              fontWeight: 500,
                              opacity:
                                isConfirming ||
                                (orderType === "dine-in" &&
                                  (!tableSelection.selectedTableId ||
                                    tableSelection.tableLoading))
                                  ? 0.5
                                  : 1,
                              cursor:
                                isConfirming ||
                                (orderType === "dine-in" &&
                                  (!tableSelection.selectedTableId ||
                                    tableSelection.tableLoading))
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            {isConfirming ? (
                              <>
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 18 18"
                                  style={{
                                    animation: "spin 0.8s linear infinite",
                                  }}
                                >
                                  <circle
                                    cx="9"
                                    cy="9"
                                    r="7"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.3)"
                                    strokeWidth="2"
                                  />
                                  <path
                                    d="M9 2 A7 7 0 0 1 16 9"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                </svg>
                                Updating...
                              </>
                            ) : (
                              <>
                                <Edit2
                                  size={18}
                                  color="white"
                                  variant="Outline"
                                />
                                Update
                              </>
                            )}
                          </button>

                          <button
                            onClick={handleCompletePayment}
                            disabled={
                              isConfirming ||
                              (orderType === "dine-in" &&
                                (!tableSelection.selectedTableId ||
                                  tableSelection.tableLoading)) ||
                              !selectedPayment ||
                              safeAmountPaid < totalAmountWithDiscount
                            }
                            className="btn-shine-blue p-3 flex-1 flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-transform active:scale-95"
                            style={{
                              borderRadius: "12px",
                              fontWeight: 500,
                              opacity:
                                isConfirming ||
                                (orderType === "dine-in" &&
                                  (!tableSelection.selectedTableId ||
                                    tableSelection.tableLoading)) ||
                                !selectedPayment ||
                                safeAmountPaid < totalAmountWithDiscount
                                  ? 0.5
                                  : 1,
                              cursor:
                                isConfirming ||
                                (orderType === "dine-in" &&
                                  (!tableSelection.selectedTableId ||
                                    tableSelection.tableLoading)) ||
                                !selectedPayment ||
                                safeAmountPaid < totalAmountWithDiscount
                                  ? "not-allowed"
                                  : "pointer",
                            }}
                          >
                            {isConfirming ? (
                              <>
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 18 18"
                                  style={{
                                    animation: "spin 0.8s linear infinite",
                                  }}
                                >
                                  <circle
                                    cx="9"
                                    cy="9"
                                    r="7"
                                    fill="none"
                                    stroke="rgba(255,255,255,0.3)"
                                    strokeWidth="2"
                                  />
                                  <path
                                    d="M9 2 A7 7 0 0 1 16 9"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                  />
                                </svg>
                                Completing...
                              </>
                            ) : (
                              <>
                                <TickCircle
                                  size={18}
                                  color="white"
                                  variant="Outline"
                                />
                                Pay Now
                              </>
                            )}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() =>
                            handleConfirmOrder({
                              status:
                                orderType === "dine-in"
                                  ? "completed"
                                  : "completed",
                              tableId:
                                orderType === "dine-in"
                                  ? tableSelection.selectedTableId
                                  : null,
                            })
                          }
                          disabled={confirmDisabled}
                          className="btn-shine-blue p-3 flex-1 flex items-center justify-center gap-2 whitespace-nowrap text-sm transition-transform active:scale-95"
                          style={{
                            borderRadius: "12px",
                            fontWeight: 500,
                            opacity: confirmDisabled ? 0.5 : 1,
                            cursor: confirmDisabled ? "not-allowed" : "pointer",
                          }}
                        >
                          {isConfirming ? (
                            <>
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                style={{
                                  animation: "spin 0.8s linear infinite",
                                }}
                              >
                                <circle
                                  cx="9"
                                  cy="9"
                                  r="7"
                                  fill="none"
                                  stroke="rgba(255,255,255,0.3)"
                                  strokeWidth="2"
                                />
                                <path
                                  d="M9 2 A7 7 0 0 1 16 9"
                                  fill="none"
                                  stroke="white"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                />
                              </svg>
                              Confirming...
                            </>
                          ) : (
                            <>
                              <TickCircle
                                size={18}
                                color="white"
                                variant="Outline"
                              />
                              Confirm
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <style>{`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
