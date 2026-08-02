import { Card, ReceiptItem } from "iconsax-react";
import { accentBorder } from "../../utils/styles";

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
  t,
}) {
  const tr = (key, fallback) => t?.[key] || fallback;
  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid var(--surface-border)",
    background: "rgba(255,255,255,0.0)",
    backdropFilter: "blur(25px)",
    WebkitBackdropFilter: "blur(25px)",
    color: "var(--accent-border-full)",
    fontSize: "0.9rem",
    outline: "none",
  };

  const labelStyle = {
    color: accentBorder.soft,
    fontSize: "0.85rem",
    display: "block",
    marginBottom: "6px",
  };

  return (
    <div className="">
      <h4 className="flex items-center gap-2 text-white mb-[14px] text-lg font-semibold">
        <ReceiptItem size={24} color="currentColor" variant="Outline" />
        {tr("paymentDetails", "Payment Details")}
      </h4>

      <div className="flex items-center justify-between mb-4">
        <h4 className="flex items-center gap-2 text-white text-lg font-medium">
          <Card size={24} color="currentColor" variant="Outline" />
          {tr("paymentSettings", "Payment Settings")}
        </h4>
        <div className="flex gap-2">
          {["USD", "KHR"].map((curr) => (
            <button
              key={curr}
              onClick={() => onCurrencyChange(curr)}
              className={`px-3 py-1 rounded-lg border font-semibold text-sm transition-all ${
                selectedCurrency === curr
                  ? "bg-white text-[#1a1a2e] border-white"
                  : "bg-white/10 text-white border-white/15"
              }`}
            >
              {curr === "USD" ? "$ USD" : "៛ KHR"}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label style={labelStyle}>{tr("amountPaidRequired", "Amount Paid *")}</label>
        <div className="relative">
          <input
            style={{
              ...inputStyle,
              border:
                focusedField === "amount"
                  ? `1px solid ${accentBorder.soft}`
                  : "1px solid var(--surface-border)",
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
          {tr("enterAmountInCurrency", "Enter amount in {currency}.").replace(
            "{currency}",
            selectedCurrency === "USD" ? "$ USD" : "៛ KHR",
          )}
        </p>
      </div>
    </div>
  );
}
