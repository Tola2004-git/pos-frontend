/**
 * Custom hook for currency conversion logic
 * Isolates all exchange rate and currency display calculations
 */
export function useCurrencyConversion(exchangeRate = 4100) {
  /**
   * Convert amount from one currency to another
   */
  const convertAmount = (amount, fromCurrency, toCurrency) => {
    if (fromCurrency === toCurrency) return amount;
    if (fromCurrency === "USD" && toCurrency === "KHR") {
      return amount * exchangeRate;
    }
    if (fromCurrency === "KHR" && toCurrency === "USD") {
      return amount / exchangeRate;
    }
    return amount;
  };

  /**
   * Format amount for display with currency symbol
   */
  const displayAmount = (amount, selectedCurrency = "USD") => {
    const converted = convertAmount(amount, "USD", selectedCurrency);
    return selectedCurrency === "USD"
      ? `$${converted.toFixed(2)}`
      : `${Math.round(converted).toLocaleString()}៛`;
  };

  /**
   * Parse input value based on selected currency
   */
  const parseInputAmount = (inputValue, selectedCurrency) => {
    if (inputValue === "") return 0;
    const numValue = Number(inputValue);
    if (isNaN(numValue)) return 0;
    // Convert from selected currency to USD for storage
    return convertAmount(numValue, selectedCurrency, "USD");
  };

  /**
   * Format amount for input field based on selected currency
   */
  const formatInputAmount = (usdAmount, selectedCurrency) => {
    if (!usdAmount) return "";
    const converted = convertAmount(usdAmount, "USD", selectedCurrency);
    return selectedCurrency === "USD"
      ? parseFloat(converted.toFixed(2)).toString()
      : Math.round(converted).toString();
  };

  return {
    convertAmount,
    displayAmount,
    parseInputAmount,
    formatInputAmount,
  };
}
