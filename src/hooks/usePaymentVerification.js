import { useState, useEffect } from "react";

/**
 * Custom hook for payment verification flow
 * Manages payment verification state and logic
 * Ensures manual verification (not auto-triggered)
 */
export function usePaymentVerification(selectedPaymentId) {
  const [isPaymentVerified, setIsPaymentVerified] = useState(true); // Start as verified for cash
  const [verificationLoading, setVerificationLoading] = useState(false);

  /**
   * Reset verification state when payment method changes
   */
  useEffect(() => {
    if (selectedPaymentId && selectedPaymentId !== "cash") {
      // Non-cash methods need verification
      setIsPaymentVerified(false);
      setVerificationLoading(false);
    } else {
      // Cash is always verified
      setIsPaymentVerified(true);
      setVerificationLoading(false);
    }
  }, [selectedPaymentId]);

  /**
   * Manually verify payment (called only by button click, not auto-triggered)
   */
  const verifyPayment = async (onVerificationComplete) => {
    if (!selectedPaymentId || selectedPaymentId === "cash") return;

    setVerificationLoading(true);
    try {
      // Simulate verification process or call API if needed
      // In real implementation, this could call a backend verification endpoint
      await new Promise((resolve) => setTimeout(resolve, 500));

      setIsPaymentVerified(true);
      if (onVerificationComplete) {
        onVerificationComplete(true);
      }
    } catch (error) {
      console.error("Payment verification failed:", error);
      if (onVerificationComplete) {
        onVerificationComplete(false, error.message);
      }
    } finally {
      setVerificationLoading(false);
    }
  };

  /**
   * Check if payment is ready to proceed
   */
  const isPaymentReady = (isCash = false) => {
    if (isCash) return true;
    return isPaymentVerified;
  };

  return {
    isPaymentVerified,
    setIsPaymentVerified,
    verificationLoading,
    setVerificationLoading,
    verifyPayment,
    isPaymentReady,
  };
}
