export function VerifyPaymentButton({
  isPaymentVerified,
  isVerificationLoading,
  isNonCashPayment,
  onVerifyPayment,
}) {
  if (!isNonCashPayment) {
    return null;
  }

  return (
    <div className="mb-4">
      <button
        type="button"
        onClick={onVerifyPayment}
        disabled={isPaymentVerified || isVerificationLoading}
        className={`w-full rounded-[12px] px-4 py-3 font-semibold transition-all ${
          isPaymentVerified
            ? "bg-white/10 text-white cursor-not-allowed"
            : "bg-[#4a90e2] text-white hover:bg-[#3b7bc7]"
        }`}
      >
        {isVerificationLoading ? "Verifying Payment..." : "Verify Payment"}
      </button>
    </div>
  );
}
