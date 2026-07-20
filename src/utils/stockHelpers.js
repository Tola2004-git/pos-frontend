export const getStockStatus = (qty, threshold, t) => {
  if (qty <= 0)
    return {
      label: t?.stockFilterOutOfStock || "Out of Stock",
      color: "#e74c3c",
      border: "#e74c3c",
    };
  if (qty <= threshold)
    return {
      label: t?.stockFilterLowStock || "Low Stock",
      color: "#f1c40f",
      border: "#f1c40f",
    };
  return {
    label: t?.stockFilterInStock || "In Stock",
    color: "#2ecc71",
    border: "#2ecc71",
  };
};
