export const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid var(--surface-border)",
  background: "var(--surface-tint-10)",
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

export const iconStyle = (field, focusedField) => ({
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
