import { useEffect, useState, useRef } from "react";
import { glass, glassCard, colors } from "../../utils/styles";
import { SkeletonRestockModal } from "../ui/SkeletonInventory";
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
  Gallery,
  MinusCirlce,
  NoteText,
  RefreshCircle,
  SearchNormal1,
  Shop,
  TickCircle,
} from "iconsax-react";

function ActionDropdown({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedOption, setFocusedOption] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setFocusedOption(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    {
      value: "add",
      label: "Add Stock",
      icon: <AddCircle size={18} color="#fff" variant="Bold" />,
    },
    {
      value: "remove",
      label: "Remove Stock",
      icon: <MinusCirlce size={18} color="#fff" variant="Bold" />,
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
            ? "1px solid rgba(255, 255, 255, 0.8)"
            : "1px solid rgba(255, 255, 255, 0.2)",
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
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            background: "#2c3e50",
            border: "1px solid #3d5166",
            borderRadius: "8px",
            overflow: "hidden",
            zIndex: 999,
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
          }}
        >
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
                setFocusedOption(null);
              }}
              onMouseEnter={() => setFocusedOption(option.value)}
              onMouseLeave={() => setFocusedOption(null)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                cursor: "pointer",
                background:
                  value === option.value
                    ? "rgba(255, 255, 255, 0.15)"
                    : focusedOption === option.value
                      ? "rgba(255, 255, 255, 0.08)"
                      : "transparent",
                transition: "background 0.15s",
                borderLeft:
                  value === option.value
                    ? "3px solid rgba(255, 255, 255, 0.8)"
                    : focusedOption === option.value
                      ? "3px solid rgba(255, 255, 255, 0.4)"
                      : "3px solid transparent",
              }}
            >
              {option.icon}
              <span style={{ color: "#fff" }}>{option.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RestockModal({
  loadingRestock,
  showRestock,
  restockDropdownRef,
  restockSearch,
  setRestockSearch,
  setRestockForm,
  setSelectedProduct,
  showDropdown,
  setShowDropdown,
  filteredProducts,
  handleSelectProduct,
  selectedProduct,
  threshold,
  restockForm,
  restockError,
  submitting,
  handleRestock,
  closeRestock,
}) {
  const [focusedField, setFocusedField] = useState("");

  // Lock background page scroll while the modal (or its loading skeleton) is
  // visible. Unlike the other modals in the app, this component stays
  // mounted at all times and toggles visibility via `showRestock`/
  // `loadingRestock` instead of being conditionally rendered by its parent,
  // so the lock has to track those flags rather than running once on mount.
  useEffect(() => {
    if (!showRestock && !loadingRestock) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showRestock, loadingRestock]);

  const overlayStyle = {
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
  };

  if (loadingRestock) {
    return (
      <div style={overlayStyle}>
        <div
          style={{
            ...glass,
            borderRadius: "24px",
            padding: "32px",
            width: "100%",
            maxWidth: "540px",
          }}
        >
          <SkeletonRestockModal />
        </div>
      </div>
    );
  }

  if (!showRestock) return null;

  return (
    <div
      style={overlayStyle}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setShowDropdown(false);
      }}
    >
      <div
        className="thin-light-scrollbar"
        style={{
          ...glass,
          borderRadius: "24px",
          padding: "32px",
          width: "100%",
          maxWidth: "540px",
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
              size={28}
              color="#fff"
              variant="bulk"
              style={{
                width: 28,
                height: 28,
                animation: "float 2s ease-in-out infinite",
              }}
            />
            <h3
              style={{
                color: colors.whiteFull,
                fontWeight: 600,
                margin: 0,
                fontSize: "1.5rem",
              }}
            >
              Restock Item
            </h3>
          </div>
          <button
            onClick={closeRestock}
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
          ref={restockDropdownRef}
          style={{ marginBottom: "16px", position: "relative" }}
        >
          <label style={labelStyle}>Select Product *</label>
          <div style={{ position: "relative" }}>
            <SearchNormal1
              size="20"
              color="#fff"
              variant="Linear"
              style={iconStyle("Search", focusedField)}
            />
            <input
              style={{
                ...inputStyle,
                paddingLeft: "40px",
                border:
                  focusedField === "Search"
                    ? "1px solid rgba(255,255,255,0.8)"
                    : "1px solid rgba(255,255,255,0.2)",
                transition: "border 0.2s",
              }}
              placeholder="Search product by name or SKU..."
              value={restockSearch}
              onChange={(e) => {
                setRestockSearch(e.target.value);
                setShowDropdown(true);
                setSelectedProduct(null);
                setRestockForm((prev) => ({ ...prev, product_id: "" }));
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setShowDropdown(true);
              }}
              onFocus={() => {
                setFocusedField("Search");
                setShowDropdown(true);
              }}
              onBlur={() => setFocusedField("")}
            />
          </div>

          {showDropdown && (
            <div
              className="thin-light-scrollbar"
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                background: "rgba(20,28,35,0.98)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "12px",
                marginTop: "4px",
                maxHeight: "200px",
                overflowY: "auto",
                zIndex: 999,
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {filteredProducts.length === 0 ? (
                <p
                  style={{
                    padding: "12px 16px",
                    color: "rgba(255,255,255,0.4)",
                    margin: 0,
                    fontSize: "0.85rem",
                  }}
                >
                  No products found
                </p>
              ) : (
                filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProduct(p)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      width: "100%",
                      padding: "10px 14px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      color: "white",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.08)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.name}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          objectFit: "contain",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Gallery size="25" color="#fff" variant="bulk" />
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>
                        {p.name}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "rgba(255,255,255,0.5)",
                        }}
                      >
                        SKU: {p.sku || "N/A"} | QTY: {p.qty}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {selectedProduct && (
          <div
            style={{
              marginBottom: "20px",
              padding: "16px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            {selectedProduct.image ? (
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "12px",
                  objectFit: "contain",
                  border: `2px solid ${colors.whiteFull}`,
                }}
              />
            ) : (
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.8rem",
                  flexShrink: 0,
                  border: `2px solid ${colors.whiteFull}`,
                }}
              >
                <Gallery size="50" color="#fff" variant="bulk" />
              </div>
            )}
            <div>
              <div
                style={{
                  color: "white",
                  fontWeight: 700,
                  fontSize: "1rem",
                  marginBottom: "4px",
                }}
              >
                {selectedProduct.name}
              </div>
              <div
                style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem" }}
              >
                SKU: {selectedProduct.sku || "N/A"}
              </div>
              <div style={{ marginTop: "4px" }}>
                <span
                  style={{
                    color: colors.whiteFull,
                    fontWeight: 700,
                    fontSize: "0.9rem",
                  }}
                >
                  Current QTY:{" "}
                </span>
                <span
                  style={{
                    color: getStockStatus(selectedProduct.qty, threshold).color,
                    fontWeight: 700,
                    fontSize: "1rem",
                  }}
                >
                  {selectedProduct.qty}
                </span>
              </div>
            </div>
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
          <div>
            <label style={labelStyle}>Action *</label>
            <ActionDropdown
              value={restockForm.action}
              onChange={(val) =>
                setRestockForm({ ...restockForm, action: val })
              }
            />
          </div>
          <div>
            <label style={labelStyle}>Quantity *</label>
            <div style={{ position: "relative" }}>
              <Box1
                size="18"
                color="#fff"
                variant="bulk"
                style={iconStyle("Quantity", focusedField)}
              />
              <input
                style={{
                  ...inputStyle,
                  paddingLeft: "40px",
                  border:
                    focusedField === "Quantity"
                      ? "1px solid rgba(255, 255, 255, 0.8)"
                      : "1px solid rgba(255, 255, 255, 0.2)",
                  transition: "border 0.2s",
                }}
                type="number"
                placeholder="0"
                min="1"
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

        <div style={{ marginBottom: "16px" }}>
          <label style={labelStyle}>Supplier / Source</label>
          <div style={{ position: "relative" }}>
            <Shop
              size="18"
              color="#fff"
              variant="bulk"
              style={iconStyle("Supplier", focusedField)}
            />
            <input
              style={{
                ...inputStyle,
                paddingLeft: "40px",
                border:
                  focusedField === "Supplier"
                    ? "1px solid rgba(255, 255, 255, 0.8)"
                    : "1px solid rgba(255, 255, 255, 0.2)",
                transition: "border 0.2s",
              }}
              placeholder="Supplier name..."
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
          <label style={labelStyle}>Note</label>
          <div style={{ position: "relative" }}>
            <NoteText
              size="18"
              color="#fff"
              variant="Linear"
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
                minHeight: "80px",
                border:
                  focusedField === "Note"
                    ? "1px solid rgba(255, 255, 255, 0.8)"
                    : "1px solid rgba(255, 255, 255, 0.2)",
                transition: "border 0.2s",
              }}
              placeholder="Additional notes..."
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
                  style={{
                    animation: "spin 0.8s linear infinite",
                    flexShrink: 0,
                  }}
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
                Confirming...
              </>
            ) : (
              <>
              <TickCircle size="22" color="#fff" variant="bulk" />
              <span>Confirm</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
