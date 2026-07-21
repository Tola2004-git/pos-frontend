import { useEffect, useState } from "react";
import { alertSuccess, alertError } from "../../utils/alert.jsx";
import { glass, glassCard, colors } from "../../utils/styles.js";
import { SkeletonIngredientModal } from "../ui/SkeletonIngredients.jsx";
import api from "../../api/apiClient";

import {
  BoxAdd,
  Tag,
  Category,
  Weight,
  MoneySend,
  Shop,
  NoteText,
  BoxTick,
  Edit,
  Calendar,
} from "iconsax-react";

function IngredientModal({
  editIngredient,
  categories,
  onClose,
  onSuccess,
  modalLoading,
  t,
}) {
  const [form, setForm] = useState({
    name: editIngredient?.name || "",
    category_id: editIngredient?.category_id || "",
    unit: editIngredient?.unit || "",
    low_stock_threshold: editIngredient?.low_stock_threshold ?? "",
    cost_per_unit: editIngredient?.cost_per_unit ?? "",
    expiry_date: editIngredient?.expiry_date?.slice(0, 10) || "",
    supplier: editIngredient?.supplier || "",
    note: editIngredient?.note || "",
    status: editIngredient?.status ?? true,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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

  const iconStyle = (field) => ({
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    width: "18px",
    height: "18px",
    opacity: focusedField === field ? 1 : 0.4,
    transition: "opacity 0.2s",
    pointerEvents: "none",
  });

  const borderFor = (field) => ({
    border:
      focusedField === field
        ? "1px solid rgba(255,255,255,0.8)"
        : "1px solid rgba(255,255,255,0.2)",
    transition: "border 0.2s",
  });

  const handleSubmit = async () => {
    setError("");
    if (!form.name) {
      setError(t.ingredientNameRequiredMsg);
      return;
    }
    if (!form.unit) {
      setError(t.unitRequiredMsg);
      return;
    }

    setSubmitting(true);
    try {
      // Empty string fails Laravel's `nullable|date` rule (only a real
      // null is treated as "absent") - normalize before sending.
      const payload = { ...form, expiry_date: form.expiry_date || null };
      if (editIngredient) {
        await api.put(`/ingredients/${editIngredient.id}`, payload);
        alertSuccess(t.productUpdatedTitle, t.ingredientUpdatedMsg);
      } else {
        await api.post("/ingredients", payload);
        alertSuccess(t.productCreatedTitle, t.ingredientCreatedMsg);
      }
      onSuccess();
      onClose();
    } catch (err) {
      alertError(
        t.genericErrorTitle,
        err.response?.data?.message || t.tryAgainMsg,
      );
    } finally {
      setSubmitting(false);
    }
  };

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
        padding: "20px",
      }}
    >
      <div
        style={{
          ...glass,
          borderRadius: "24px",
          padding: "32px",
          width: "100%",
          maxWidth: "580px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {editIngredient ? (
              <Edit
                size={28}
                color="white"
                variant="Linear"
                style={{ animation: "float 2s ease-in-out infinite" }}
              />
            ) : (
              <BoxAdd
                size={28}
                color="white"
                variant="Linear"
                style={{ animation: "float 2s ease-in-out infinite" }}
              />
            )}
            <h2
              style={{
                color: colors.whiteFull,
                fontWeight: 600,
                margin: 0,
                fontSize: "1.5rem",
              }}
            >
              {editIngredient ? t.editIngredientTitle : t.addIngredientTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label={t.cancel}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "white",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {modalLoading ? (
          <SkeletonIngredientModal />
        ) : (
          <>
            {error && (
              <div
                style={{
                  background: "rgba(192,57,43,0.3)",
                  border: "1px solid rgba(192,57,43,0.5)",
                  color: "#ff6b6b",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  marginBottom: "16px",
                  fontSize: "0.85rem",
                }}
              >
                {error}
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              {/* Name */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>{t.ingredientNameLabel}</label>
                <div style={{ position: "relative" }}>
                  <Tag
                    size={20}
                    color="white"
                    variant="Linear"
                    style={iconStyle("name")}
                  />
                  <input
                    style={{
                      ...inputStyle,
                      paddingLeft: "40px",
                      ...borderFor("name"),
                    }}
                    placeholder={t.ingredientNamePlaceholder}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField("")}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label style={labelStyle}>{t.categoryLabel}</label>
                <div style={{ position: "relative" }}>
                  <Category
                    size={20}
                    color="white"
                    variant="Linear"
                    style={iconStyle("category")}
                  />
                  <select
                    style={{
                      ...inputStyle,
                      cursor: "pointer",
                      paddingLeft: "40px",
                      ...borderFor("category"),
                    }}
                    value={form.category_id}
                    onChange={(e) =>
                      setForm({ ...form, category_id: e.target.value })
                    }
                    onFocus={() => setFocusedField("category")}
                    onBlur={() => setFocusedField("")}
                  >
                    <option value="" style={{ background: "#2c3e50" }}>
                      {t.selectCategoryOption}
                    </option>
                    {categories
                      .filter((c) => c.status)
                      .map((c) => (
                        <option
                          key={c.id}
                          value={c.id}
                          style={{ background: "#2c3e50" }}
                        >
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Unit */}
              <div>
                <label style={labelStyle}>{t.unitLabel}</label>
                <div style={{ position: "relative" }}>
                  <Weight
                    size={20}
                    color="white"
                    variant="Linear"
                    style={iconStyle("unit")}
                  />
                  <input
                    style={{
                      ...inputStyle,
                      paddingLeft: "40px",
                      ...borderFor("unit"),
                    }}
                    placeholder={t.unitPlaceholder}
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    onFocus={() => setFocusedField("unit")}
                    onBlur={() => setFocusedField("")}
                  />
                </div>
              </div>

              {/* Low Stock Threshold */}
              <div>
                <label style={labelStyle}>{t.lowStockThresholdLabel}</label>
                <input
                  style={{ ...inputStyle, ...borderFor("threshold") }}
                  type="number"
                  placeholder="0.00"
                  value={form.low_stock_threshold}
                  onChange={(e) =>
                    setForm({ ...form, low_stock_threshold: e.target.value })
                  }
                  onFocus={() => setFocusedField("threshold")}
                  onBlur={() => setFocusedField("")}
                />
              </div>

              {/* Cost Per Unit */}
              <div>
                <label style={labelStyle}>{t.costPerUnitLabel}</label>
                <div style={{ position: "relative" }}>
                  <MoneySend
                    size={20}
                    color="white"
                    variant="Linear"
                    style={iconStyle("cost")}
                  />
                  <input
                    style={{
                      ...inputStyle,
                      paddingLeft: "40px",
                      ...borderFor("cost"),
                    }}
                    type="number"
                    placeholder="0.00"
                    value={form.cost_per_unit}
                    onChange={(e) =>
                      setForm({ ...form, cost_per_unit: e.target.value })
                    }
                    onFocus={() => setFocusedField("cost")}
                    onBlur={() => setFocusedField("")}
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label style={labelStyle}>{t.expiryDateLabel}</label>
                <div style={{ position: "relative" }}>
                  <Calendar
                    size={20}
                    color="white"
                    variant="Linear"
                    style={iconStyle("expiry")}
                  />
                  <input
                    style={{
                      ...inputStyle,
                      paddingLeft: "40px",
                      colorScheme: "dark",
                      ...borderFor("expiry"),
                    }}
                    type="date"
                    value={form.expiry_date}
                    onChange={(e) =>
                      setForm({ ...form, expiry_date: e.target.value })
                    }
                    onFocus={() => setFocusedField("expiry")}
                    onBlur={() => setFocusedField("")}
                  />
                </div>
              </div>

              {/* Supplier */}
              <div>
                <label style={labelStyle}>{t.ingColSupplier}</label>
                <div style={{ position: "relative" }}>
                  <Shop
                    size={20}
                    color="white"
                    variant="Linear"
                    style={iconStyle("supplier")}
                  />
                  <input
                    style={{
                      ...inputStyle,
                      paddingLeft: "40px",
                      ...borderFor("supplier"),
                    }}
                    placeholder={t.ingredientSupplierPlaceholder}
                    value={form.supplier}
                    onChange={(e) =>
                      setForm({ ...form, supplier: e.target.value })
                    }
                    onFocus={() => setFocusedField("supplier")}
                    onBlur={() => setFocusedField("")}
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  paddingTop: "24px",
                }}
              >
                <label style={{ ...labelStyle, marginBottom: 0 }}>
                  {t.tableStatusLabel}
                </label>
                <div
                  onClick={() => setForm({ ...form, status: !form.status })}
                  style={{
                    width: "46px",
                    height: "24px",
                    borderRadius: "12px",
                    background: form.status
                      ? "#2ecc71"
                      : "rgba(255,255,255,0.2)",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.3s",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "3px",
                      left: form.status ? "24px" : "3px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "white",
                      transition: "left 0.3s",
                    }}
                  />
                </div>
                <span
                  style={{
                    color: form.status ? "#2ecc71" : "rgba(255,255,255,0.5)",
                    fontSize: "0.85rem",
                  }}
                >
                  {form.status ? t.activeLabel : t.inactiveLabel}
                </span>
              </div>

              {/* Note */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>{t.restockNoteLabel}</label>
                <div style={{ position: "relative" }}>
                  <NoteText
                    size={18}
                    color="white"
                    variant="Linear"
                    style={{
                      ...iconStyle("note"),
                      top: "14px",
                      transform: "none",
                    }}
                  />
                  <textarea
                    style={{
                      ...inputStyle,
                      paddingLeft: "40px",
                      resize: "vertical",
                      minHeight: "70px",
                      ...borderFor("note"),
                    }}
                    placeholder={t.restockNotePlaceholder}
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    onFocus={() => setFocusedField("note")}
                    onBlur={() => setFocusedField("")}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
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
                {t.cancel}
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
                    {editIngredient ? t.savingAction : t.creatingAction}
                  </>
                ) : (
                  <>
                    {editIngredient ? (
                      <BoxTick size="22" color="#fff" variant="outline" />
                    ) : (
                      <BoxAdd size="22" color="#fff" variant="outline" />
                    )}
                    {editIngredient ? t.saveAction : t.createAction}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default IngredientModal;
