export function PaymentMethodList({
  paymentMethods,
  paymentMethodsSource = paymentMethods,
  selectedPaymentId,
  onSelectPayment,
}) {
  if (paymentMethods.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-white/40 text-center italic">
        No payment methods found. Please add them in settings.
      </div>
    );
  }

  const cashMethod =
    paymentMethodsSource.find(
      (m) => m.name?.toLowerCase() === "cash" || m.type === "cash",
    ) ||
    paymentMethods.find(
      (m) => m.name?.toLowerCase() === "cash" || m.type === "cash",
    );
  const bankMethods = paymentMethods.filter(
    (m) => m.name?.toLowerCase() !== "cash" && m.type !== "cash",
  );
  const isCashSelected = cashMethod && selectedPaymentId === cashMethod.id;

  return (
    <div className="flex flex-col gap-3">
      {/* Cash Card */}
      {cashMethod && (
        <div
          onClick={() => {
            const normalizedCashMethod = {
              ...cashMethod,
              id: paymentMethodsSource?.find(
                (method) =>
                  (method.name?.toLowerCase() === "cash" || method.type === "cash") &&
                  method.id &&
                  method.id !== "cash",
              )?.id || cashMethod.id,
            };
            onSelectPayment?.(normalizedCashMethod);
          }}
          className={`p-4 rounded-xl border flex items-center cursor-pointer transition-all min-h-[74px] ${
            isCashSelected
              ? "border-white bg-white/10 text-white"
              : "border-white/10 bg-white-800/40 text-white-300 hover:bg-white-800/70"
          }`}
        >
          <div className="flex-1 flex items-center justify-between">
            <span className="font-bold text-base text-white">
              {cashMethod.name}
            </span>
            {isCashSelected && (
              <span className="text-white font-bold text-lg">✓</span>
            )}
          </div>
        </div>
      )}

      {/* Bank Cards */}
      {bankMethods.map((method) => {
        const bankName = method.name || "Bank";
        const accountNumber =
          method.account_number || method.accountNumber || "";
        const imageSrc = method.logo || null;
        const isSelected = selectedPaymentId === method.id;

        return (
          <div
            key={method.id}
            onClick={() => {
              onSelectPayment?.(method);
            }}
            className={`p-4 rounded-xl border flex items-center gap-4 cursor-pointer transition-all min-h-[74px] ${
              isSelected
                ? "border-white bg-white/10 text-white"
                : "border-white/10 bg-white-800/40 text-white-300 hover:bg-white-800/70"
            }`}
          >
            <div className="w-12 h-12 bg-white-700 rounded-full flex items-center justify-center overflow-hidden shrink-0">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={bankName}
                  className="w-full h-full rounded-full object-contain"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white">
                  {bankName.substring(0, 3).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-white">
                  {bankName}
                </span>
                {isSelected && (
                  <span className="text-white font-bold text-lg">✓</span>
                )}
              </div>
              {accountNumber && (
                <span className="text-xs text-slate-400 mt-0.5">
                  {accountNumber}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
