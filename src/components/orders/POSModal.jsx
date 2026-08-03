import { useState, useEffect } from "react";
import { ShoppingBag } from "iconsax-react";
import { glassCard } from "../../utils/styles";
import apiClient from "../../api/apiClient";
import { changeTableApi } from "../../api/ordersApi";
import { isCashLike, findRealCashMethod } from "../../utils/cashPaymentMethod";
import { useTranslations } from "../../hooks/useTranslations";

import { usePromotionLogic } from "../../hooks/usePromotionLogic";
import { useCurrencyConversion } from "../../hooks/useCurrencyConversion";
import { useTableSelection } from "../../hooks/useTableSelection";
import { usePaymentMethodValidation } from "../../hooks/usePaymentMethodValidation";

import { ProductGrid } from "./ProductGrid";
import { CartSidebar } from "./CartSidebar";
import { PaymentMethodList } from "../payment/PaymentMethodList";
import { PaymentDetailsForm } from "../payment/PaymentDetailsForm";
import { CheckoutSummary } from "../payment/CheckoutSummary";
import { TableSelectionPanel } from "./pos/TableSelectionPanel";
import { PaymentStepFooter } from "./pos/PaymentStepFooter";

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
  orderType,
  setOrderType,
  note,
  setPosNote,
  posStep,
  setPosStep,
  addToCart,
  updateQty,
  removeFromCart,
  proceedToPayment,
  closePOS,
  handleCreateOrder,
  promotions = [],
  initialTableId = null,
  resumingOrderId = null,
}) {
  const { t } = useTranslations();
  const isEditMode = mode === "edit";
  // Cash's real database id varies per environment (seeded via
  // updateOrInsert, so it isn't guaranteed to be 1) - resolve it from the
  // actual fetched list, falling back to the "cash" placeholder id.
  const cashPaymentMethodId = findRealCashMethod(paymentMethods)?.id ?? "cash";

  const [focusedField, setFocusedField] = useState("");
  const [isHolding, setIsHolding] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isProceeding, setIsProceeding] = useState(false);
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

  // Custom hooks for business logic - promo/discount totals are derived
  // here from usePromotionLogic (not from usePOS's own subtotal/discount/
  // totalAmount), since this is the one place that also needs per-item
  // and per-product promo breakdowns for the cart/product-grid UI.
  const promotionLogic = usePromotionLogic(promotions, cart);
  const currency = useCurrencyConversion(exchangeRate);
  const tableSelection = useTableSelection(
    isEditMode ? (activeEditingOrder?.table_id ?? null) : initialTableId,
    { allowOccupiedTables: isEditMode || Boolean(initialTableId) },
  );
  const paymentMethodsValidation = usePaymentMethodValidation(paymentMethods);

  const totalAmountWithDiscount = promotionLogic.totalAfterDiscount;
  const subtotalBeforeDiscount = promotionLogic.subtotalBeforeDiscount;
  const discountAmount = promotionLogic.totalDiscountAmount;
  const totalDue = Number(totalAmountWithDiscount || 0);
  const safeAmountPaid = Number(amountPaid) || 0;
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
      ? t.selectPaymentMethodValidation
      : requiresTableSelection && !tableSelection.selectedTableId
        ? t.selectTableValidation
        : !isAmountValid && totalDue > 0
          ? t.enterAmountOrMoreValidation.replace(
              "{amount}",
              currency.displayAmount(totalDue, selectedCurrency),
            )
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

  useEffect(() => {
    if (!showPOS) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [showPOS]);

  useEffect(() => {
    if (orderType !== "dine-in") {
      tableSelection.clearSelection();
    }
  }, [orderType, tableSelection]);

  const resolvePaymentMethod = (method) => {
    if (!method) return null;

    if (!isCashLike(method)) return method;

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
    if (!isCashLike(normalizedMethod)) {
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
      setTableActionMessage(t.tableUpdatedSuccess);
      setShowTablePicker(false);
    } catch (error) {
      setTableActionMessage(
        error.response?.data?.message || t.tableChangeError,
      );
    } finally {
      setIsChangingTable(false);
    }
  };

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

  const handleAmountPaidChange = (inputValue) => {
    setAmountPaidInput(inputValue);
    if (inputValue === "") {
      setAmountPaid(0);
      return;
    }
    const usdValue = currency.parseInputAmount(inputValue, selectedCurrency);
    setAmountPaid(usdValue);
  };

  const handleProceedToPayment = async () => {
    if (cart.length === 0 || isProceeding) return;

    // The admin "Edit Order" flow (Orders.jsx) manages its own cart state
    // instead of going through usePOS(), so it doesn't have a
    // proceedToPayment to call - fall back to the plain step change it used
    // before this existed.
    if (typeof proceedToPayment !== "function") {
      setPosStep(2);
      return;
    }

    setIsProceeding(true);
    try {
      await proceedToPayment();
    } finally {
      setIsProceeding(false);
    }
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
              <ShoppingBag size={25} color="currentColor" variant="Linear" />
            </div>
            {isEditMode ? t.editOrderTitle : resumingOrderId ? t.resumeHeldOrderTitle : t.newOrderTitle}
          </h3>
          <div className="flex items-center gap-[10px]">
            {[
              { step: 1, label: t.stepCart },
              { step: 2, label: t.stepPayment },
            ].map(({ step, label }) => (
              <button
                className={`px-[14px] py-[6px] rounded-[20px] border cursor-pointer font-semibold text-[0.85rem] transition-colors ${
                  posStep === step
                    ? "bg-white text-[#1a1a2e] border-white"
                    : "bg-white/10 text-white border-white/15"
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
              aria-label={t.cancel}
              className="bg-white/10 border-none text-white w-8 h-8 rounded-full cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
        {posStep === 1 ? (
          <div className="flex flex-1 overflow-hidden">
            <ProductGrid
              products={products}
              categories={categories}
              search={posSearch}
              onSearchChange={setPosSearch}
              onAddToCart={addToCart}
              findProductPromotions={promotionLogic.findProductPromotions}
              formatPromotionLabel={promotionLogic.formatPromotionLabel}
              truncatePromoName={promotionLogic.truncatePromoName}
              t={t}
            />

            <div className="flex flex-col min-w-[320px] border-l border-white/10 bg-white/5">
              <div className="px-4 py-3 border-b border-white/10">
                <div className="text-[0.8rem] text-white/70 mb-2">
                  {t.orderTypeLabel}
                </div>
                <div className="flex gap-2">
                  {[
                    { value: "dine-in", label: t.dineIn },
                    { value: "takeaway", label: t.takeaway },
                  ].map((option) => {
                    const selected = orderType === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setOrderType(option.value)}
                        className={`flex-1 rounded-[10px] px-3 py-2 text-sm font-semibold transition-all ${
                          selected
                            ? "bg-white text-[#1a1a2e] border border-white"
                            : "bg-white/10 text-white border border-white/15 hover:bg-white/20"
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
                onProceedToPayment={handleProceedToPayment}
                proceedLoading={isProceeding}
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
                t={t}
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
                }}
                className="thin-light-scrollbar overflow-y-auto flex-1 pr-1 pb-8 space-y-3"
              >
                <div className="grid grid-cols-12 gap-2 lg:gap-3">
                  {/* Payment Method Selection - sticks in place on desktop
                      (lg:) while the table/amount/summary column beside it
                      scrolls, since that side is usually much taller once a
                      dine-in table grid or validation message is showing.
                      self-start stops the grid row from stretching this
                      column to match the taller sibling's height, which
                      would otherwise leave nothing for it to stick past. */}
                  <div className="col-span-12 lg:col-span-4 xl:col-span-4 lg:pr-1 lg:sticky lg:top-0 lg:self-start">
                    <h4 className="flex items-center gap-2 text-white mb-[8px] text-lg font-medium">
                      {t.selectPaymentMethod}
                    </h4>
                    <PaymentMethodList
                      paymentMethods={
                        paymentMethodsValidation.paymentMethodsToRender
                      }
                      paymentMethodsSource={paymentMethods}
                      selectedPaymentId={selectedPayment?.id}
                      onSelectPayment={handlePaymentMethodSelect}
                      t={t}
                    />
                  </div>

                  <div className="col-span-12 lg:col-span-8 xl:col-span-8 flex flex-col lg:pl-1">
                    {requiresTableSelection && (
                      <TableSelectionPanel
                        t={t}
                        currentSessionTable={currentSessionTable}
                        showTablePicker={showTablePicker}
                        setShowTablePicker={setShowTablePicker}
                        canChangeTable={canChangeTable}
                        getTableLabel={getTableLabel}
                        tableSelection={tableSelection}
                        availableTables={availableTables}
                        blockedTables={blockedTables}
                        isEditMode={isEditMode}
                        isChangingTable={isChangingTable}
                        handleChangeTable={handleChangeTable}
                        tableActionMessage={tableActionMessage}
                      />
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
                      note={note}
                      onNoteChange={setPosNote}
                      focusedField={focusedField}
                      onFocusFocus={setFocusedField}
                      onFocusBlur={() => setFocusedField("")}
                      t={t}
                    />

                    <div className="mt-4">
                      <CheckoutSummary
                        subtotalBeforeDiscount={subtotalBeforeDiscount}
                        discountAmount={discountAmount}
                        totalAmountWithDiscount={totalAmountWithDiscount}
                        amountPaid={safeAmountPaid}
                        selectedCurrency={selectedCurrency}
                        exchangeRate={exchangeRate}
                        t={t}
                      />
                    </div>

                    {paymentValidationMessage && (
                      <div className="mt-3 rounded-[10px] border border-[#f39c12]/50 bg-[#f39c12]/15 px-3 py-2 text-[0.85rem] text-[#ffd166]">
                        {paymentValidationMessage}
                      </div>
                    )}

                    <PaymentStepFooter
                      t={t}
                      setPosStep={setPosStep}
                      isEditMode={isEditMode}
                      isConfirming={isConfirming}
                      isHolding={isHolding}
                      orderType={orderType}
                      tableSelection={tableSelection}
                      handleHoldOrder={handleHoldOrder}
                      handleUpdateOrder={handleUpdateOrder}
                      handleCompletePayment={handleCompletePayment}
                      handleConfirmOrder={handleConfirmOrder}
                      confirmDisabled={confirmDisabled}
                      selectedPayment={selectedPayment}
                      safeAmountPaid={safeAmountPaid}
                      totalAmountWithDiscount={totalAmountWithDiscount}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
