import { useState } from "react";
import imageCompression from "browser-image-compression";
import { alertSuccess, alertError } from "../../utils/alert.jsx";
import { glass, glassCard, colors } from "../../utils/styles.js";
import { SkeletonProductModal } from "../ui/SkeletonProduct.jsx";
import api from "../../api/productApi.js";

import {
  BoxAdd,
  Camera,
  Tag,
  Category,
  ScanBarcode,
  Barcode,
  MoneySend,
  BoxTick,
  Edit,
} from "iconsax-react";

function ProductModal({
  editProduct,
  categories,
  onClose,
  onSuccess,
  modalLoading,
}) {
  const [form, setForm] = useState({
    name: editProduct?.name || "",
    category_id: editProduct?.category_id || "",
    price: editProduct?.price || "",
    sku: editProduct?.sku || "",
    barcode: editProduct?.barcode || "",
    image: editProduct?.image || "",
    status: editProduct?.status ?? true,
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState("");

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
    filter: "brightness(0) invert(1)",
    opacity: focusedField === field ? 1 : 0.4,
    transition: "opacity 0.2s",
    pointerEvents: "none",
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 500,
        useWebWorker: true,
      });
      const reader = new FileReader();
      reader.onloadend = () =>
        setForm((prev) => ({ ...prev, image: reader.result }));
      reader.readAsDataURL(compressed);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.name) {
      setError("Product name is required!");
      return;
    }
    if (!form.price) {
      setError("Price is required!");
      return;
    }

    setSubmitting(true);
    try {
      if (editProduct) {
        await api.put(`/products/${editProduct.id}`, form);
        alertSuccess("Updated!", "Product has been updated successfully.");
      } else {
        await api.post("/products", form);
        alertSuccess("Created!", "New product has been created.");
      }
      onSuccess();
      onClose();
    } catch (err) {
      alertError(
        "Something went wrong!",
        err.response?.data?.message || "Please try again.",
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
        zIndex: 9999,
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
            {editProduct ? (
              <Edit
                size="30"
                color="#fff"
                variant="Outline"
                style={{
                  width: "40px",
                  height: "40px",
                  animation: "float 2s ease-in-out infinite",
                }}
              />
            ) : (
              <BoxAdd
                size="30px"
                color="#fff"
                variant="Outline"
                style={{
                  width: "40px",
                  height: "40px",
                  animation: "float 2s ease-in-out infinite",
                }}
              />
            )}

            <h2
              style={{
                color: colors.whiteFull,
                fontWeight: 600,
                margin: 0,
                fontSize: "30px",
              }}
            >
              {editProduct ? "Edit Product" : "Add New Product"}
            </h2>
          </div>
          <button
            onClick={onClose}
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
          <SkeletonProductModal />
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

            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <label style={{ cursor: "pointer", display: "inline-block" }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                {form.image ? (
                  <div
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "16px",
                      overflow: "hidden",
                      border: `1px solid ${colors.gold}`,
                      margin: "0 auto",
                    }}
                  >
                    <img
                      src={form.image}
                      alt="product"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        objectPosition: "top",
                      }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "16px",
                      background: "rgba(255,255,255,0.1)",
                      border: "2px dashed rgba(255,255,255,0.3)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "rgba(255,255,255,0.5)",
                      gap: "4px",
                      margin: "0 auto",
                    }}
                  >
                    <Camera size="30" color="#fff" variant="outline" />
                    <span style={{ fontSize: "0.7rem" }}>Upload</span>
                  </div>
                )}
                <p
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "0.75rem",
                    marginTop: "6px",
                  }}
                >
                  Click to upload photo
                </p>
              </label>
            </div>

            {/* Form Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              {/* Product Name */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Product Name *</label>
                <div style={{ position: "relative" }}>
                  <Tag
                    size="18"
                    color="#fff"
                    variant="outline"
                    style={iconStyle("Product Name")}
                  />
                  <input
                    style={{
                      ...inputStyle,
                      paddingLeft: "40px",
                      border:
                        focusedField === "Product Name"
                          ? "1px solid rgba(255,255,255,0.8)"
                          : "1px solid rgba(255,255,255,0.2)",
                      transition: "border 0.2s",
                    }}
                    placeholder="Enter product name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    onFocus={() => setFocusedField("Product Name")}
                    onBlur={() => setFocusedField("")}
                  />
                </div>
              </div>
              {/* Category */}
              <div>
                <label style={labelStyle}>Category</label>
                <div style={{ position: "relative" }}>
                  <Category
                    size="18"
                    color="#fff"
                    variant="outline"
                    style={iconStyle("Category")}
                  />
                  <select
                    style={{
                      ...inputStyle,
                      cursor: "pointer",
                      paddingLeft: "40px",
                      border:
                        focusedField === "Category"
                          ? "1px solid rgba(255,255,255,0.8)"
                          : "1px solid rgba(255,255,255,0.2)",
                      transition: "border 0.2s",
                    }}
                    value={form.category_id}
                    onChange={(e) =>
                      setForm({ ...form, category_id: e.target.value })
                    }
                    onFocus={() => setFocusedField("Category")}
                    onBlur={() => setFocusedField("")}
                  >
                    <option value="" style={{ background: "#2c3e50" }}>
                      Select Category
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
              <div>
                <label style={labelStyle}>Price ($) *</label>
                <div style={{ position: "relative" }}>
                  <MoneySend
                    size="18"
                    color="#fff"
                    variant="outline"
                    style={iconStyle("Price")}
                  />
                  <input
                    style={{
                      ...inputStyle,
                      paddingLeft: "40px",
                      border:
                        focusedField === "Price"
                          ? "1px solid rgba(255,255,255,0.8)"
                          : "1px solid rgba(255,255,255,0.2)",
                      transition: "border 0.2s",
                    }}
                    type="number"
                    placeholder="0.00"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                    onFocus={() => setFocusedField("Price")}
                    onBlur={() => setFocusedField("")}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>SKU</label>
                <div style={{ position: "relative" }}>
                  <ScanBarcode
                    size="18"
                    color="#fff"
                    variant="outline"
                    style={iconStyle("SKU")}
                  />
                  <input
                    style={{
                      ...inputStyle,
                      paddingLeft: "40px",
                      border:
                        focusedField === "SKU"
                          ? "1px solid rgba(255,255,255,0.8)"
                          : "1px solid rgba(255,255,255,0.2)",
                      transition: "border 0.2s",
                    }}
                    placeholder="SKU-001"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    onFocus={() => setFocusedField("SKU")}
                    onBlur={() => setFocusedField("")}
                  />
                </div>
              </div>
              {/* Barcode */}
              <div>
                <label style={labelStyle}>Barcode</label>
                <div style={{ position: "relative" }}>
                  <Barcode
                    size="18"
                    color="#fff"
                    variant="outline"
                    style={iconStyle("Barcode")}
                  />
                  <input
                    style={{
                      ...inputStyle,
                      paddingLeft: "40px",
                      border:
                        focusedField === "Barcode"
                          ? "1px solid rgba(255,255,255,0.8)"
                          : "1px solid rgba(255,255,255,0.2)",
                      transition: "border 0.2s",
                    }}
                    placeholder="123456789"
                    value={form.barcode}
                    onChange={(e) =>
                      setForm({ ...form, barcode: e.target.value })
                    }
                    onFocus={() => setFocusedField("Barcode")}
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
                <label style={{ ...labelStyle, marginBottom: 0 }}>Status</label>
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
                  {form.status ? "Active" : "Inactive"}
                </span>
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
                    {editProduct ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {editProduct ? (
                      <BoxTick size="22" color="#fff" variant="outline" />
                    ) : (
                      <BoxAdd size="22" color="#fff" variant="outline" />
                    )}
                    {editProduct ? "Save" : "Create"}
                  </>
                )}
              </button>
              <style>
                {`
                @keyframes spin {
                  from { transform: rotate(0deg);}
                  to { transform: rotate(360deg);}
                }
                `}
              </style>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProductModal;
