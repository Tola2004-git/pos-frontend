import { useEffect, useState } from "react";
import {
  AddCircle,
  Box,
  BoxAdd,
  BoxTick,
  Calendar,
  DollarCircle,
  PercentageCircle,
  Tag,
  TickCircle,
  TicketDiscount,
} from "iconsax-react";
import { glass, glassCard } from "../../utils/styles";
import {
  defaultPromotionForm,
  PROMOTION_TYPES,
} from "../../constants/promotionConstants";
import ProductPickerModal from "./ProductPickerModal";

export default function PromotionModal({
  show,
  onClose,
  editPromotion,
  submitting,
  onSubmit,
}) {
  const [isMounted, setIsMounted] = useState(show);
  const [isVisible, setIsVisible] = useState(show);
  const [form, setForm] = useState(() => {
    if (!editPromotion) return { ...defaultPromotionForm };
    return {
      name: editPromotion.name ?? "",
      type: editPromotion.type ?? "percentage",
      value: editPromotion.value ?? "",
      apply_to: editPromotion.apply_to ?? "all",
      product_ids: editPromotion.products?.map((p) => p.id) ?? [],
      min_purchase: editPromotion.min_purchase ?? "",
      start_date: editPromotion.start_date?.slice(0, 10) ?? "",
      end_date: editPromotion.end_date?.slice(0, 10) ?? "",
      status: editPromotion.status ?? true,
    };
  });
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState("");

  useEffect(() => {
    let timeout;

    if (show) {
      setIsMounted(true);
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
      timeout = setTimeout(() => setIsMounted(false), 300);
    }

    return () => clearTimeout(timeout);
  }, [show]);

  useEffect(() => {
    if (!show) return;

    if (!editPromotion) {
      setForm({ ...defaultPromotionForm });
      return;
    }

    setForm({
      name: editPromotion.name ?? "",
      type: editPromotion.type ?? "percentage",
      value: editPromotion.value ?? "",
      apply_to: editPromotion.apply_to ?? "all",
      product_ids: editPromotion.products?.map((p) => p.id) ?? [],
      min_purchase: editPromotion.min_purchase ?? "",
      start_date: editPromotion.start_date?.slice(0, 10) ?? "",
      end_date: editPromotion.end_date?.slice(0, 10) ?? "",
      status: editPromotion.status ?? true,
    });
  }, [show, editPromotion]);

  if (!isMounted) return null;

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleProductConfirm = (ids) => {
    set("product_ids", ids);
    set("apply_to", ids.length > 0 ? "product" : "all");
    setShowPicker(false);
  };

  const applyToLabel =
    form.product_ids.length > 0
      ? `${form.product_ids.length} product(s) selected`
      : "All products (tap to select specific)";

  const handleSubmit = () => {
    setError("");

    if (!form.name.trim()) return setError("Promotion name is required");
    if (!form.value || Number(form.value) < 0)
      return setError("Discount value is required");
    if (form.type === "percentage" && Number(form.value) > 100)
      return setError("Percentage cannot exceed 100%");

    onSubmit({
      name: form.name.trim(),
      type: form.type,
      value: Number(form.value),
      apply_to: form.product_ids.length > 0 ? "product" : "all",
      product_ids: form.product_ids,
      min_purchase: form.min_purchase ? Number(form.min_purchase) : null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      status: form.status,
    });
  };

  const iconStyle = (field) => ({
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "18px",
    height: "18px",
    filter: "brightness(0) invert(1)",
    opacity: focusedField === field ? 1 : 0.4,
    transition: "opacity 0.2s",
    pointerEvents: "none",
  });

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(255,255,255,0.1)",
    color: "white",
    fontSize: "0.9rem",
    outline: "none",
  };

  const labelStyle = {
    color: "rgba(255,255,255,0.8)",
    fontSize: "0.85rem",
    display: "block",
    marginBottom: "6px",
  };

  const SelectedIcon = PROMOTION_TYPES.find((t) => t.value === form.type)?.icon;

  return (
    <div
      style={{
        ...glassCard,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        opacity: isVisible ? 1 : 0,
        animation: isVisible ? "confirm-fade-in 0.2s ease forwards" : "none",
        transition: "opacity 220ms ease",
        pointerEvents: show ? "auto" : "none",
      }}
    >
      <div
        className="hide-scrollbar"
        style={{
          ...glass,
          borderRadius: 24,
          width: "100%",
          maxWidth: 580,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 24,
          transform: isVisible ? "translateY(0)" : "translateY(24px)",
          opacity: isVisible ? 1 : 0,
          animation: isVisible
            ? "confirm-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
            : "none",
          transition: "transform 220ms ease, opacity 220ms ease",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <TicketDiscount
              size={28}
              color="white"
              variant="Linear"
              style={{
                width: 28,
                height: 28,
                animation: "float 2s ease-in-out infinite",
              }}
            />
            <div>
              <h2
                style={{
                  color: "white",
                  margin: 0,
                  fontSize: "1.5rem",
                  fontWeight: 600,
                }}
              >
                {editPromotion ? "Edit Promotion" : "New Promotion"}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "white",
              width: 36,
              height: 36,
              borderRadius: 18,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(231,76,60,0.2)",
              border: "1px solid rgba(231,76,60,0.4)",
              color: "#ff6b6b",
              padding: "10px 14px",
              borderRadius: 10,
              marginBottom: 16,
              fontSize: "0.85rem",
            }}
          >
            {error}
          </div>
        )}

        <div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Promotion Name</label>
            <div style={{ position: "relative" }}>
              <Tag
                size={20}
                color="white"
                variant="Linear"
                style={iconStyle("Promotion Name")}
              />
              <input
                style={{
                  ...inputStyle,
                  paddingLeft: "40px",
                  border:
                    focusedField === "Promotion Name"
                      ? "1px solid rgba(255,255,255,0.8)"
                      : "1px solid rgba(255,255,255,0.2)",
                  transition: "border 0.2s",
                }}
                placeholder="e.g. Summer Sale"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                onFocus={() => setFocusedField("Promotion Name")}
                onBlur={() => setFocusedField("")}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Promotion Type</label>
            <div style={{ position: "relative" }}>
              {SelectedIcon && (
                <SelectedIcon
                  size={20}
                  color="white"
                  variant="Linear"
                  style={iconStyle("Promotion Type")}
                />
              )}
              <select
                style={{
                  ...inputStyle,
                  paddingLeft: "40px",
                  border:
                    focusedField === "Promotion Type"
                      ? "1px solid rgba(255,255,255,0.8)"
                      : "1px solid rgba(255,255,255,0.2)",
                  transition: "border 0.2s",
                  cursor: "pointer",
                }}
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                onFocus={() => setFocusedField("Promotion Type")}
                onBlur={() => setFocusedField("")}
              >
                {PROMOTION_TYPES.map((t) => (
                  <option
                    key={t.value}
                    value={t.value}
                    style={{ background: "#2c3e50" }}
                  >
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>
              Discount Value {form.type === "percentage" ? "(%)" : "($)"}
            </label>
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              >
                {form.type === "percentage" ? (
                  <PercentageCircle
                    size={20}
                    color="white"
                    variant="Linear"
                    style={iconStyle("Discount Value")}
                  />
                ) : (
                  <DollarCircle
                    size={20}
                    color="white"
                    variant="Linear"
                    style={iconStyle("Discount Value")}
                  />
                )}
              </div>
              <input
                style={{
                  ...inputStyle,
                  paddingLeft: "40px",
                  border:
                    focusedField === "Discount Value"
                      ? "1px solid rgba(255,255,255,0.8)"
                      : "1px solid rgba(255,255,255,0.2)",
                  transition: "border 0.2s",
                }}
                type="number"
                min="0"
                max={form.type === "percentage" ? 100 : undefined}
                step="0.01"
                placeholder={form.type === "percentage" ? "10" : "5.00"}
                value={form.value}
                onChange={(e) => set("value", e.target.value)}
                onFocus={() => setFocusedField("Discount Value")}
                onBlur={() => setFocusedField("")}
              />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Apply To</label>
            <div style={{ position: "relative" }}>
              <Box
                size={20}
                color="white"
                variant="Linear"
                style={iconStyle("Apply To")}
              />
              <button
                type="button"
                onClick={() => setShowPicker(true)}
                style={{
                  ...inputStyle,
                  paddingLeft: "40px",
                  display: "flex",
                  border:
                    focusedField === "Apply To"
                      ? "1px solid rgba(255,255,255,0.8)"
                      : "1px solid rgba(255,255,255,0.2)",
                  transition: "border 0.2s",
                }}
                onFocus={() => setFocusedField("Apply To")}
                onBlur={() => setFocusedField("")}
              >
                <span style={{ color: "rgba(255,255,255,0.85)" }}>
                  {applyToLabel}
                </span>
              </button>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div>
              <label style={labelStyle}>Start Date</label>
              <div style={{ position: "relative" }}>
                <Calendar
                  size={20}
                  color="white"
                  variant="Linear"
                  style={iconStyle("Start Date")}
                />
                <input
                  type="date"
                  style={{
                    ...inputStyle,
                    paddingLeft: "40px",
                    border:
                      focusedField === "Start Date"
                        ? "1px solid rgba(255,255,255,0.8)"
                        : "1px solid rgba(255,255,255,0.2)",
                    transition: "border 0.2s",
                    colorScheme: "dark",
                  }}
                  value={form.start_date}
                  onChange={(e) => set("start_date", e.target.value)}
                  onFocus={() => setFocusedField("Start Date")}
                  onBlur={() => setFocusedField("")}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>End Date</label>
              <div style={{ position: "relative" }}>
                <Calendar
                  size={20}
                  color="white"
                  variant="Linear"
                  style={iconStyle("End Date")}
                />
                <input
                  type="date"
                  style={{
                    ...inputStyle,
                    paddingLeft: "40px",
                    border:
                      focusedField === "End Date"
                        ? "1px solid rgba(255,255,255,0.8)"
                        : "1px solid rgba(255,255,255,0.2)",
                    transition: "border 0.2s",
                    colorScheme: "dark",
                  }}
                  value={form.end_date}
                  onChange={(e) => set("end_date", e.target.value)}
                  onFocus={() => setFocusedField("End Date")}
                  onBlur={() => setFocusedField("")}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={labelStyle}>Minimum Purchase ($)</label>
            <div style={{ position: "relative" }}>
              <DollarCircle
                size={20}
                color="white"
                variant="Linear"
                style={iconStyle("Minimum Purchase")}
              />
              <input
                type="number"
                min="0"
                step="0.01"
                style={{
                  ...inputStyle,
                  paddingLeft: "40px",
                  border:
                    focusedField === "Minimum Purchase"
                      ? "1px solid rgba(255,255,255,0.8)"
                      : "1px solid rgba(255,255,255,0.2)",
                  transition: "border 0.2s",
                }}
                placeholder="0.00 (optional)"
                value={form.min_purchase}
                onChange={(e) => set("min_purchase", e.target.value)}
                onFocus={() => setFocusedField("Minimum Purchase")}
                onBlur={() => setFocusedField("")}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => !submitting && onClose()}
              className="btn-cancel-glass"
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                color: "white",
                cursor: submitting ? "not-allowed" : "pointer",
                fontWeight: 500,
                fontSize: "0.9rem",
                opacity: submitting ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => !submitting && handleSubmit()}
              className="btn-shine-blue"
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "12px",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "0.9rem",
                opacity: submitting ? 0.8 : 1,
                cursor: submitting ? "not-allowed" : "pointer",
                border: "none",
              }}
            >
              {submitting ? (
                <>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  >
                    <circle
                      cx="9"
                      cy="9"
                      r="7"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                    />
                    <path
                      d="M9 2 A7 7 0 0 1 16 9"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  {editPromotion ? "Saving..." : "Creating..."}
                </>
              ) : (
                <>
                  {editPromotion ? (
                    <TickCircle size="22" color="#fff" variant="outline" />
                  ) : (
                    <AddCircle size="22" color="#fff" variant="outline" />
                  )}
                  {editPromotion ? "Save" : "Create"}
                </>
              )}
            </button>
            <style>
              {`
                @keyframes spin {
                  from { transform: rotate(0deg);}
                  to { transform: rotate(360deg);}
                }
                @keyframes confirm-fade-in {
                  from { opacity: 0; }
                  to   { opacity: 1; }
                }
                @keyframes confirm-pop {
                  from { opacity: 0; transform: scale(0.95) translateY(20px); }
                  to   { opacity: 1; transform: scale(1) translateY(0); }
                }
              `}
            </style>
          </div>
        </div>
      </div>

      <ProductPickerModal
        open={showPicker}
        selectedIds={form.product_ids}
        onClose={() => setShowPicker(false)}
        onConfirm={handleProductConfirm}
      />
    </div>
  );
}
