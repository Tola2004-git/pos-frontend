export function CheckoutSummary({
  subtotalBeforeDiscount,
  discountAmount,
  totalAmountWithDiscount,
  amountPaid,
  selectedCurrency,
  exchangeRate = 4100,
}) {
  const isKhr = selectedCurrency === "KHR";
  const rate = Number(exchangeRate) || 4100;
  const subtotalFormatted = isKhr 
    ? `${(subtotalBeforeDiscount * rate).toLocaleString()} ៛` 
    : `$${Number(subtotalBeforeDiscount).toFixed(2)}`;

  const discountFormatted = isKhr 
    ? `${(discountAmount * rate).toLocaleString()} ៛` 
    : `-$${Number(discountAmount).toFixed(2)}`;

  const totalFormatted = isKhr 
    ? `${(totalAmountWithDiscount * rate).toLocaleString()} ៛` 
    : `$${Number(totalAmountWithDiscount).toFixed(2)}`;
  // Treat `amountPaid` as the base USD amount coming from parent (safeAmountPaid).
  // Convert both paid amount and total due into the active currency for comparison.
  const paidInActiveCurrency = isKhr
    ? (Number(amountPaid) || 0) * rate
    : Number(amountPaid) || 0;

  const totalDueInActiveCurrency = isKhr
    ? (totalAmountWithDiscount * rate)
    : totalAmountWithDiscount;

  const rawChange = paidInActiveCurrency - totalDueInActiveCurrency;

  return (
    <>
      <div className="p-4 rounded-xl bg-white/5 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-white/60">Total Amount</span>
          <span className="text-white font-extrabold text-[1.3rem]">
            {totalFormatted}
          </span>
        </div>
      </div>

      <div className="p-3 rounded-[10px] bg-white/5 mb-4 space-y-2">
        <div className="flex justify-between text-white/60 text-[0.85rem]">
          <span>Subtotal</span>
          <span>{subtotalFormatted}</span>
        </div>
        
        {discountAmount > 0 && (
          <div className="flex justify-between text-[#ff9f43] text-[0.85rem]">
            <span>Discount</span>
            <span>{discountFormatted}</span>
          </div>
        )}
        
        <div className="flex justify-between border-t border-white/10 pt-2 text-white font-semibold">
          <span>Total Due</span>
          <span>{totalFormatted}</span>
        </div>
      </div>

      {rawChange > 0 && (
        <div className="p-3 rounded-[10px] bg-[#2ecc71]/15 border border-[#2ecc71]/30 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-[#2ecc71] font-semibold">Change</span>
            <span className="text-[#2ecc71] font-extrabold text-[1.2rem]">
              {isKhr
                ? `${Math.round(rawChange).toLocaleString()} ៛ ($ ${(rawChange / rate).toFixed(2)})`
                : `$ ${rawChange.toFixed(2)} (${Math.round(rawChange * rate).toLocaleString()} ៛)`}
            </span>
          </div>
        </div>
      )}
    </>
  );
}