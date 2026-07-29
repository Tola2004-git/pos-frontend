/**
 * Custom hook for currency conversion logic
 * Isolates all exchange rate and currency display calculations
 */
export function useCurrencyConversion(exchangeRate = 4100) {
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

  const displayAmount = (amount, selectedCurrency = "USD") => {
    const converted = convertAmount(amount, "USD", selectedCurrency);
    return selectedCurrency === "USD"
      ? `$${converted.toFixed(2)}`
      : `${Math.round(converted).toLocaleString()}៛`;
  };

  const parseInputAmount = (inputValue, selectedCurrency) => {
    if (inputValue === "") return 0;
    const numValue = Number(inputValue);
    if (isNaN(numValue)) return 0;
    // Convert from selected currency to USD for storage
    return convertAmount(numValue, selectedCurrency, "USD");
  };

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
