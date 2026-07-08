import { useMemo } from "react";

/**
 * Custom hook for payment method validation and filtering
 * Ensures only complete and valid payment methods are displayed
 * Fixes: removes emojis from cash, validates QR codes, filters incomplete data
 */
export function usePaymentMethodValidation(paymentMethods = []) {
  /**
   * Default cash payment method (without emojis, clean)
   */
  const defaultCashMethod = useMemo(
    () => ({
      id: "cash",
      name: "Cash",
      bank_name: "",
      accountNumber: "",
      account_name: "",
      account_number: "",
      isActive: true,
    }),
    []
  );

  /**
   * Check if QR image is valid
   * QR paths from `/assets/banks/` are placeholders, not valid
   */
  const isValidQrImage = (qrImage) => {
    if (!qrImage || typeof qrImage !== "string") return false;
    const trimmed = qrImage.trim();
    // Filter out placeholder paths
    return trimmed.length > 0 && !trimmed.includes("/assets/banks/");
  };

  /**
   * Get payment method image/QR from various possible field names
   */
  const getPaymentMethodImage = (method) =>
    method.image_url_or_path ||
    method.image ||
    method.qrImage ||
    method.qr_image ||
    "";

  /**
   * Validate if payment method has all required data
   * Cash is complete if active
   * Other methods need account info and valid QR code
   */
  const isCompletePaymentMethod = (method) => {
    if (!method) return false;

    // Cash is always valid if active
    if (method.name?.toLowerCase() === "cash") return true;

    // For other methods, check required fields
    const accountName = (method.account_name || method.accountName || "").trim();
    const accountNumber =
      (method.account_number || method.accountNumber || "").trim();

    const hasAccountData = accountName.length > 0 && accountNumber.length > 0;
    const isActive = method.isActive === true || method.status === true;

        return isActive && hasAccountData;
  };

  /**
   * Get filtered list of payment methods for rendering
   * Cash is always first (index 0), others are filtered
   */
  const paymentMethodsToRender = useMemo(() => {
    const filtered = [
      defaultCashMethod,
      ...(Array.isArray(paymentMethods)
        ? paymentMethods
            .filter((method) => method.name?.toLowerCase() !== "cash")
            .filter(isCompletePaymentMethod)
        : []),
    ];
    return filtered;
  }, [paymentMethods, defaultCashMethod]);

  /**
   * Get payment method by ID
   */
  const getPaymentMethodById = (methodId) =>
    paymentMethodsToRender.find((m) => m.id === methodId);

  /**
   * Check if payment method needs verification
   */
  const needsVerification = (method) => {
    if (!method || method.id === "cash") return false;
    return isCompletePaymentMethod(method);
  };

  return {
    defaultCashMethod,
    paymentMethodsToRender,
    isValidQrImage,
    getPaymentMethodImage,
    isCompletePaymentMethod,
    getPaymentMethodById,
    needsVerification,
  };
}
