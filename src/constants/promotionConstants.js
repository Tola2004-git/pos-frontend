import { DollarCircle, PercentageCircle } from "iconsax-react";

export const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(25px)",
  WebkitBackdropFilter: "blur(25px)",
  color: "white",
  fontSize: "0.9rem",
  outline: "none",
};

export const labelStyle = {
  color: "rgba(255,255,255,0.8)",
  fontSize: "0.85rem",
  display: "block",
  marginBottom: "6px",
};

export const getPromotionTypes = (t) => [
  { value: "percentage", label: t.percentageLabel, icon: PercentageCircle },
  { value: "fixed", label: t.fixedAmountLabel, icon: DollarCircle },
];

export const getStatusFilterOptions = (t) => [
  { value: "all", label: t.statusAll },
  { value: "1", label: t.activeLabel },
  { value: "0", label: t.inactiveLabel },
];

export const defaultPromotionForm = {
  name: "",
  type: "percentage",
  value: "",
  apply_to: "all",
  product_ids: [],
  min_purchase: "",
  start_date: "",
  end_date: "",
  status: true,
};

export function formatDiscount(type, value) {
  if (type === "percentage") return `${value}%`;
  return `$${Number(value).toFixed(2)}`;
}

export function formatApplyTo(promo, t) {
  if (promo.apply_to === "all") return t.allProductsLabel;
  if (promo.apply_to === "product") {
    const count = promo.products?.length ?? 0;
    return count > 0
      ? t.productsCountLabel.replace("{n}", count)
      : t.selectedProductsLabel;
  }
  if (promo.apply_to === "category") return t.categoriesLabel;
  return promo.apply_to;
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString();
}
