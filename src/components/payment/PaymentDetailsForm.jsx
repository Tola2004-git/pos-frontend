import { Card, NoteText, ReceiptItem } from "iconsax-react";

export function PaymentDetailsForm({
  selectedCurrency,
  onCurrencyChange,
  amountPaidDisplay,
  amountPaidActive,
  onAmountPaidChange,
  subtotalUSD,
  totalDueUSD,
  tableOptions,
  selectedTableId,
  onTableSelect,
  tableLoading,
  note,
  onNoteChange,
  focusedField,
  onFocusFocus,
  onFocusBlur,
}) {
  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.0)",
    backdropFilter: "blur(25px)",
    WebkitBackdropFilter: "blur(25px)",
    color: "white",
    fontSize: "0.9rem",
    outline: "none",
  };

  const labelStyle = {
    color: "rgba(255,255,255,0.8)",
    fontSize: "0.85rem",
    display: "block",
    marginBottom: "6px",
  };

  const iconStyle = (field) => ({
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "18px",
    height: "18px",
    filter: "brightness(0) invert(1)",
    opacity: focusedField === field ? 1 : 0.4,
    transition: "opacity 0.2s",
    pointerEvents: "none",
  });

  const EXCHANGE_RATE = 4100;

  const formatUsd = (value) => `$${Number(value || 0).toFixed(2)}`;
  const formatKhr = (value) =>
    `${Math.round(Number(value || 0)).toLocaleString()} ៛`;

  const formatMainAmount = (usdValue) =>
    selectedCurrency === "USD"
      ? formatUsd(usdValue)
      : formatKhr(usdValue * EXCHANGE_RATE);

  // Map incoming prop names to the local variables used in the currency logic
  const activeCurrency = selectedCurrency;
  const subtotal = subtotalUSD || 0;
  const totalAmount = totalDueUSD || 0; // passed as totalAmountWithDiscount from parent
  const totalDue = totalDueUSD || 0;

  // Treat the provided amountPaidActive as the current amount entered in the active currency
  const currentAmountPaid = Number(amountPaidActive) || 0;

  // Compute totals in the active currency (exact formula requested)
  const totalDueInActiveCurrency =
    activeCurrency === "KHR" ? totalDue * EXCHANGE_RATE : totalDue;

  const rawChange = currentAmountPaid - totalDueInActiveCurrency;

  const availableTables = tableOptions.filter(
    (t) => t.status === "available" || t.id === selectedTableId,
  );

  return (
    <div className="">
      {/* Header */}
      <h4 className="flex items-center gap-2 text-white mb-[14px] text-lg font-semibold">
        <ReceiptItem size={24} color="white" variant="Outline" />
        Payment Details
      </h4>

      {/* Currency Selector */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="flex items-center gap-2 text-white text-lg font-medium">
          <Card size={24} color="white" variant="Outline" />
          Payment Settings
        </h4>
        <div className="flex gap-2">
          {["USD", "KHR"].map((curr) => (
            <button
              key={curr}
              onClick={() => onCurrencyChange(curr)}
              className={`px-3 py-1 rounded-lg font-semibold text-sm transition-all ${
                selectedCurrency === curr
                  ? "bg-white text-[#1a1a2e]"
                  : "bg-white/10 text-white"
              }`}
            >
              {curr === "USD" ? "$ USD" : "៛ KHR"}
            </button>
          ))}
        </div>
      </div>

      {/* Amount Paid Input */}
      <div className="mb-4">
        <label style={labelStyle}>Amount Paid *</label>
        <div className="relative">
          <input
            style={{
              ...inputStyle,
              border:
                focusedField === "amount"
                  ? "1px solid rgba(255,255,255,0.8)"
                  : "1px solid rgba(255,255,255,0.2)",
              transition: "border 0.2s",
              fontSize: "1.2rem",
              fontWeight: 700,
            }}
            type="number"
            placeholder={`0.00 ${selectedCurrency === "USD" ? "$" : "៛"}`}
            value={amountPaidDisplay}
            onChange={(e) => onAmountPaidChange(e.target.value)}
            onFocus={() => onFocusFocus("amount")}
            onBlur={() => onFocusBlur()}
          />
        </div>
        <p className="mt-2 text-xs text-white/50">
          Enter amount in {selectedCurrency === "USD" ? "$ USD" : "៛ KHR"}.
        </p>
      </div>
    </div>
  );
}
