import { useState } from "react";
import { glass, glassCard, accentBorder } from "../../utils/styles";
import { getStockStatus } from "../../utils/stockHelpers";
import {
  inputStyle,
  labelStyle,
  iconStyle,
} from "../../constants/inventoryStyles";
import {
  AddCircle,
  ArrowDown2,
  Box1,
  Calendar,
  MinusCirlce,
  NoteText,
  RefreshCircle,
  Shop,
  TickCircle,
} from "iconsax-react";
import { useEffect, useRef } from "react";
import PackageCalculator from "./PackageCalculator.jsx";

function ActionDropdown({ value, onChange, t }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    {
      value: "add",
      label: t.addStockOption,
      icon: <AddCircle size={18} color="currentColor" variant="Bold" />,
    },
    {
      value: "remove",
      label: t.removeStockOption,
      icon: <MinusCirlce size={18} color="currentColor" variant="Bold" />,
    },
  ];
  const selected = options.find((o) => o.value === value);

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...inputStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          userSelect: "none",
          border: isOpen
            ? "1px solid var(--accent-border-soft)"
            : "1px solid var(--surface-border)",
          transition: "border 0.2s",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {selected?.icon}
          <span>{selected?.label}</span>
        </div>
        <ArrowDown2
          size={16}
          style={{
            transition: "transform 0.2s",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </div>
      {isOpen && (
        <div
          style={{
            background: "var(--popover-solid-bg)",
            border: "1px solid var(--surface-border)",
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            borderRadius: "8px",
            overflow: "hidden",
            zIndex: 999,
            boxShadow: "0 8px 24px var(--popover-shadow-color)",
          }}
        >
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                cursor: "pointer",
                color: "var(--accent-border-full)",
                background:
                  value === option.value
                    ? "var(--surface-tint-15)"
                    : "transparent",
              }}
            >
              {option.icon}
              <span style={{ color: "var(--accent-border-full)" }}>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RestockModal({
  showRestock,
  selectedIngredient,
  restockForm,
  setRestockForm,
  restockError,
  submitting,
  handleRestock,
  closeRestock,
  t,
}) {
  const [focusedField, setFocusedField] = useState("");

  if (!showRestock || !selectedIngredient) return null;

  const status = getStockStatus(
    Number(selectedIngredient.quantity),
    Number(selectedIngredient.low_stock_threshold),
    t,
  );

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
        className="thin-light-scrollbar"
        style={{
          ...glass,
          borderRadius: "24px",
          padding: "32px",
          width: "100%",
          maxWidth: "520px",
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
            <RefreshCircle
              size="34"
              color="currentColor"
              variant="bulk"
              className="text-white"
              style={{ animation: "float 2s ease-in-out infinite" }}
            />
            <h3
              style={{
                color: accentBorder.full,
                fontWeight: 600,
                margin: 0,
                fontSize: "1.4rem",
              }}
            >
              {t.restockIngredientTitle}
            </h3>
          </div>
          <button
            onClick={closeRestock}
            aria-label={t.cancel}
            style={{
              background: "var(--surface-tint-10)",
              border: "none",
              color: "var(--accent-border-full)",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {restockError && (
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
            {restockError}
          </div>
        )}

        <div
          style={{
            marginBottom: "20px",
            padding: "16px",
            borderRadius: "14px",
            border: "1px solid var(--surface-tint-12)",
            boxShadow: glassCard.boxShadow,
          }}
        >
          <div
            style={{
              color: "var(--accent-border-full)",
              fontWeight: 700,
              fontSize: "1rem",
              marginBottom: "4px",
            }}
          >
            {selectedIngredient.name}
          </div>
          <div
            style={{
              color: "var(--accent-border-soft)",
              fontSize: "0.82rem",
              marginBottom: "6px",
            }}
          >
            {t.unitColonMsg.replace("{unit}", selectedIngredient.unit)}
          </div>
          <span style={{ color: "var(--accent-border-soft)", fontSize: "0.9rem" }}>
            {t.currentQuantityLabel}
          </span>
          <span
            style={{ color: status.color, fontWeight: 700, fontSize: "1rem" }}
          >
            {Number(selectedIngredient.quantity)} {selectedIngredient.unit}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <div>
            <label style={labelStyle}>{t.actionLabel}</label>
            <ActionDropdown
              value={restockForm.action}
              onChange={(val) =>
                setRestockForm({ ...restockForm, action: val })
              }
              t={t}
            />
          </div>
          <div>
            <label style={labelStyle}>{t.quantityLabel}</label>
            <div style={{ position: "relative" }}>
              <Box1
                size="18"
                color="currentColor"
                variant="bulk"
                className="text-white"
                style={iconStyle("Quantity", focusedField)}
              />
              <input
                style={{
                  ...inputStyle,
                  paddingLeft: "40px",
                  border:
                    focusedField === "Quantity"
                      ? "1px solid var(--accent-border-soft)"
                      : "1px solid var(--surface-border)",
                  transition: "border 0.2s",
                }}
                type="number"
                placeholder="0"
                min="0.01"
                step="0.01"
                value={restockForm.quantity}
                onChange={(e) =>
                  setRestockForm({ ...restockForm, quantity: e.target.value })
                }
                onFocus={() => setFocusedField("Quantity")}
                onBlur={() => setFocusedField("")}
              />
            </div>
          </div>
        </div>

        {restockForm.action === "add" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <PackageCalculator
              baseUnit={selectedIngredient.unit}
              showQuantity
              onApply={({ quantity, costPerUnit }) =>
                setRestockForm({
                  ...restockForm,
                  quantity,
                  cost_per_unit: costPerUnit,
                })
              }
              t={t}
            />

            <div>
              <label style={labelStyle}>{t.costPerUnitLabel}</label>
              <input
                style={inputStyle}
                type="number"
                min="0"
                step="0.0001"
                placeholder={t.costPerUnitOptionalPlaceholder}
                value={restockForm.cost_per_unit ?? ""}
                onChange={(e) =>
                  setRestockForm({ ...restockForm, cost_per_unit: e.target.value })
                }
              />
            </div>
          </div>
        )}

        {restockForm.action === "add" && (
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>{t.expiryDateLabel}</label>
            <div style={{ position: "relative" }}>
              <Calendar
                size="18"
                color="currentColor"
                variant="bulk"
                className="text-white"
                style={iconStyle("Expiry", focusedField)}
              />
              <input
                style={{
                  ...inputStyle,
                  paddingLeft: "40px",
                  colorScheme: "var(--native-color-scheme)",
                  border:
                    focusedField === "Expiry"
                      ? "1px solid var(--accent-border-soft)"
                      : "1px solid var(--surface-border)",
                  transition: "border 0.2s",
                }}
                type="date"
                value={restockForm.expiry_date}
                onChange={(e) =>
                  setRestockForm({ ...restockForm, expiry_date: e.target.value })
                }
                onFocus={() => setFocusedField("Expiry")}
                onBlur={() => setFocusedField("")}
              />
            </div>
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>{t.supplierLabel}</label>
          <div style={{ position: "relative" }}>
            <Shop
              size="18"
              color="currentColor"
              variant="bulk"
              className="text-white"
              style={iconStyle("Supplier", focusedField)}
            />
            <input
              style={{
                ...inputStyle,
                paddingLeft: "40px",
                border:
                  focusedField === "Supplier"
                    ? "1px solid var(--accent-border-soft)"
                    : "1px solid var(--surface-border)",
                transition: "border 0.2s",
              }}
              placeholder={t.supplierPlaceholder}
              value={restockForm.supplier}
              onChange={(e) =>
                setRestockForm({ ...restockForm, supplier: e.target.value })
              }
              onFocus={() => setFocusedField("Supplier")}
              onBlur={() => setFocusedField("")}
            />
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={labelStyle}>{t.restockNoteLabel}</label>
          <div style={{ position: "relative" }}>
            <NoteText
              size="18"
              color="currentColor"
              variant="Linear"
              className="text-white"
              style={{
                ...iconStyle("Note", focusedField),
                top: "12px",
                left: "12px",
                position: "absolute",
                transform: "none",
              }}
            />
            <textarea
              style={{
                ...inputStyle,
                paddingLeft: "40px",
                resize: "vertical",
                minHeight: "70px",
                border:
                  focusedField === "Note"
                    ? "1px solid var(--accent-border-soft)"
                    : "1px solid var(--surface-border)",
                transition: "border 0.2s",
              }}
              placeholder={t.restockNotePlaceholder}
              value={restockForm.note}
              onChange={(e) =>
                setRestockForm({ ...restockForm, note: e.target.value })
              }
              onFocus={() => setFocusedField("Note")}
              onBlur={() => setFocusedField("")}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={closeRestock}
            className="btn-cancel-glass"
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              cursor: submitting ? "not-allowed" : "pointer",
              fontWeight: 500,
              opacity: submitting ? 0.5 : 1,
            }}
          >
            {t.cancel}
          </button>
          <button
            onClick={() => !submitting && handleRestock()}
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
                {t.confirmingAction}
              </>
            ) : (
              <>
                <TickCircle size="22" color="#fff" variant="bulk" />
                <span>{t.confirmAction}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
