import { ArrowRight2, Bag2, Call, NoteText, User } from "iconsax-react";
import { CartItem } from "./CartItem";

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.1)",
  color: "white",
  fontSize: "0.9rem",
  outline: "none",
};

export function CartSidebar({
  cart,
  onUpdateQty,
  onRemove,
  onProceedToPayment,
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
}) {
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

  return (
    <div className="w-[300px] p-4 flex flex-col overflow-y-auto h-[500px]">
      {/* Cart Header */}
      <h4 className="text-white mb-3 font-bold flex items-center gap-[10px]">
        <Bag2 size={20} color="white" variant="Linear" />
        Cart ({cart.length})
      </h4>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto mb-3 hide-scrollbar">
        {cart.length === 0 ? (
          <p className="text-white/30 text-center p-5">Add products...</p>
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
            />
          ))
        )}
      </div>

      {/* Customer Name */}
      <div className="relative mb-[5px]">
        <User
          size={18}
          variant="Linear"
          color="white"
          style={iconStyle("name")}
        />
        <input
          style={{
            ...inputStyle,
            paddingLeft: "40px",
            border:
              focusedField === "name"
                ? "1px solid rgba(255,255,255,0.8)"
                : "1px solid rgba(255,255,255,0.2)",
            transition: "border 0.2s",
          }}
          placeholder="Customer name (optional)"
          value={customerName}
          onChange={(e) => onCustomerNameChange(e.target.value)}
          onFocus={() => setFocusedField("name")}
          onBlur={() => setFocusedField("")}
        />
      </div>

      {/* Customer Phone */}
      <div className="relative mb-[5px]">
        <Call
          size={18}
          color="white"
          variant="Linear"
          style={iconStyle("phone")}
        />
        <input
          style={{
            ...inputStyle,
            paddingLeft: "40px",
            border:
              focusedField === "phone"
                ? "1px solid rgba(255,255,255,0.8)"
                : "1px solid rgba(255,255,255,0.2)",
            transition: "border 0.2s",
          }}
          placeholder="Phone number"
          value={customerPhone}
          onChange={(e) => onCustomerPhoneChange(e.target.value)}
          onFocus={() => setFocusedField("phone")}
          onBlur={() => setFocusedField("")}
        />
      </div>

      {/* Pricing Summary */}
      <div className="p-3 rounded-[10px] bg-white/5 mb-[10px]">
        <div className="flex justify-between mb-1">
          <span className="text-white/60 text-[0.85rem]">Subtotal</span>
          <span className="text-white text-[0.85rem]">
            ${subtotalBeforeDiscount.toFixed(2)}
          </span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-[#ff9f43] mb-1">
            <span className="text-white/60 text-[0.85rem]">Discount</span>
            <span className="text-white text-[0.85rem]">-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-white/10 pt-2 mt-1">
          <span className="text-white font-bold">TOTAL</span>
          <span className="text-white font-extrabold text-[1.1rem]">
            ${totalAmountWithDiscount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Proceed to Payment Button */}
      <button
        onClick={onProceedToPayment}
        disabled={!canProceed}
        className={`btn-shine-blue w-full p-3 rounded-[12px] font-bold text-sm flex items-center justify-center gap-2 transition-opacity duration-200 ${
          !canProceed ? "opacity-50 cursor-not-allowed" : "opacity-100"
        }`}
      >
        Next: Payment
        <ArrowRight2 size={20} color="white" variant="Linear" />
      </button>
    </div>
  );
}
