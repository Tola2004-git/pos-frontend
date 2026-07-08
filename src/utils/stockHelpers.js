export const getStockStatus = (qty, threshold) => {
  if (qty <= 0)
    return { label: "Out of Stock", color: "#e74c3c", border: "#e74c3c" };
  if (qty <= threshold)
    return { label: "Low Stock", color: "#f1c40f", border: "#f1c40f" };
  return { label: "In Stock", color: "#2ecc71", border: "#2ecc71" };
};
