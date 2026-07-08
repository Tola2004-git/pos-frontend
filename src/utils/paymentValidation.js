export const validatePaymentForm = (form) => {
  const errors = {};

  if (!form.name || form.name.trim() === "") {
    errors.name = "Payment method name is required!";
  }

  if (
    form.name === "Bank Transfer" ||
    form.bank_name
  ) {
    if (form.account_number && form.account_number.trim() === "") {
      errors.account_number = "Account number is required for bank transfer!";
    }
    if (form.account_name && form.account_name.trim() === "") {
      errors.account_name = "Account name is required for bank transfer!";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const getFirstError = (errors) => {
  const errorValues = Object.values(errors);
  return errorValues.length > 0 ? errorValues[0] : null;
};
