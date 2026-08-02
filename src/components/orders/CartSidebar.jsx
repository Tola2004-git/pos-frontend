import { useState } from "react";
import { ArrowRight2, Bag2, Call, NoteText, User } from "iconsax-react";
import { CartItem } from "./CartItem";
import { accentBorder } from "../../utils/styles";

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid var(--surface-border)",
  color: "var(--accent-border-full)",
  fontSize: "0.9rem",
  outline: "none",
};

export function CartSidebar({
  cart,
  onUpdateQty,
  onRemove,
  onProceedToPayment,
  proceedLoading = false,
  customerName,
  onCustomerNameChange,
  customerPhone,
  onCustomerPhoneChange,
  note,
  onNoteChange,
  totalAmountWithDiscount,
  subtotalBeforeDiscount,
  discountAmount,
  canProceed,
  findItemPromotions,
  formatPromotionLabel,
  truncatePromoName,
  getItemTotal,
  getItemDiscount,
  focusedField,
  setFocusedField,
  t,
}) {
  const tr = (key, fallback) => t?.[key] || fallback;
  // Starts open if a held/edited order already carries a name, phone, or
  // note (so existing data is never hidden behind a collapsed toggle) -
  // otherwise closed by default, since most orders are anonymous walk-ins
  // and this space is worth more to the cashier as extra cart-item room.
  const [showCustomerDetails, setShowCustomerDetails] = useState(
    () => Boolean(customerName || customerPhone || note),
  );
  const hasCustomerDetails = Boolean(customerName || customerPhone || note);
  const iconStyle = (field) => ({
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "18px",
    height: "18px",
    opacity: focusedField === field ? 1 : 0.4,
    transition: "opacity 0.2s",
    pointerEvents: "none",
  });

  return (
    <div className="w-[300px] p-4 flex flex-col overflow-y-auto h-[500px]">
      <h4 className="text-white mb-3 font-bold flex items-center gap-[10px]">
        <Bag2 size={20} color="currentColor" variant="Linear" />
        {tr("cartCount", "Cart ({n})").replace("{n}", cart.length)}
      </h4>

      <div className="flex-1 overflow-y-auto mb-3 hide-scrollbar">
        {cart.length === 0 ? (
          <p className="text-white/30 text-center p-5">{tr("addProductsPlaceholder", "Add products...")}</p>
        ) : (
          cart.map((item) => (
            <CartItem
              key={item.product_id}
              item={item}
              onUpdateQty={onUpdateQty}
              onRemove={onRemove}
              findItemPromotions={findItemPromotions}
              formatPromotionLabel={formatPromotionLabel}
              truncatePromoName={truncatePromoName}
              getItemTotal={getItemTotal}
              getItemDiscount={getItemDiscount}
              focusedField={focusedField}
              setFocusedField={setFocusedField}
              t={t}
            />
          ))
        )}
      </div>

      <button
        type="button"
        onClick={() => setShowCustomerDetails((v) => !v)}
        className="mb-[8px] flex w-full items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-left transition-colors hover:bg-white/10"
      >
        <span className="flex items-center gap-2 text-[0.8rem] text-white/70">
          <User size={16} color="currentColor" variant="Linear" />
          {tr("customerDetailsOptional", "Customer details (optional)")}
          {hasCustomerDetails && (
            <span className="h-1.5 w-1.5 rounded-full bg-[#2ecc71]" />
          )}
        </span>
        <span className="text-[0.7rem] text-white/50">
          {showCustomerDetails ? "▲" : "▼"}
        </span>
      </button>

      {showCustomerDetails && (
        <>
          <div className="relative mb-[5px]">
            <User
              size={18}
              variant="Linear"
              color="currentColor"
              className="text-white"
              style={iconStyle("name")}
            />
            <input
              style={{
                ...inputStyle,
                paddingLeft: "40px",
                border:
                  focusedField === "name"
                    ? `1px solid ${accentBorder.soft}`
                    : "1px solid var(--surface-border)",
                transition: "border 0.2s",
              }}
              placeholder={tr("customerNamePlaceholder", "Customer name (optional)")}
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              onFocus={() => setFocusedField("name")}
              onBlur={() => setFocusedField("")}
            />
          </div>

          <div className="relative mb-[5px]">
            <Call
              size={18}
              color="currentColor"
              variant="Linear"
              className="text-white"
              style={iconStyle("phone")}
            />
            <input
              style={{
                ...inputStyle,
                paddingLeft: "40px",
                border:
                  focusedField === "phone"
                    ? `1px solid ${accentBorder.soft}`
                    : "1px solid var(--surface-border)",
                transition: "border 0.2s",
              }}
              placeholder={tr("phoneNumberPlaceholder", "Phone number")}
              value={customerPhone}
              onChange={(e) => onCustomerPhoneChange(e.target.value)}
              onFocus={() => setFocusedField("phone")}
              onBlur={() => setFocusedField("")}
            />
          </div>

          <div className="relative mb-[10px]">
            <NoteText
              size={18}
              color="currentColor"
              variant="Linear"
              className="text-white"
              style={{ ...iconStyle("note"), top: "16px", transform: "none" }}
            />
            <textarea
              style={{
                ...inputStyle,
                paddingLeft: "40px",
                minHeight: "52px",
                resize: "vertical",
                border:
                  focusedField === "note"
                    ? `1px solid ${accentBorder.soft}`
                    : "1px solid var(--surface-border)",
                transition: "border 0.2s",
              }}
              placeholder={tr("noteOptional", "Note (optional)")}
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              onFocus={() => setFocusedField("note")}
              onBlur={() => setFocusedField("")}
            />
          </div>
        </>
      )}

      <div className="p-3 rounded-[10px] bg-white/5 mb-[10px]">
        <div className="flex justify-between mb-1">
          <span className="text-white/60 text-[0.85rem]">{tr("subtotal", "Subtotal")}</span>
          <span className="text-white text-[0.85rem]">
            ${subtotalBeforeDiscount.toFixed(2)}
          </span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-[#ff9f43] mb-1">
            <span className="text-white/60 text-[0.85rem]">{tr("discountLabel", "Discount")}</span>
            <span className="text-white text-[0.85rem]">-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-white/10 pt-2 mt-1">
          <span className="text-white font-bold">{tr("total", "TOTAL")}</span>
          <span className="text-white font-extrabold text-[1.1rem]">
            ${totalAmountWithDiscount.toFixed(2)}
          </span>
        </div>
      </div>

      <button
        onClick={onProceedToPayment}
        disabled={!canProceed || proceedLoading}
        className={`btn-shine-blue w-full p-3 rounded-[12px] font-bold text-sm flex items-center justify-center gap-2 transition-opacity duration-200 ${
          !canProceed || proceedLoading ? "opacity-50 cursor-not-allowed" : "opacity-100"
        }`}
      >
        {proceedLoading ? (
          <svg className="animate-spin" width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
            <path d="M9 2 A7 7 0 0 1 16 9" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <>
            {tr("nextPayment", "Next: Payment")}
            <ArrowRight2 size={20} color="white" variant="Linear" />
          </>
        )}
      </button>
    </div>
  );
}
