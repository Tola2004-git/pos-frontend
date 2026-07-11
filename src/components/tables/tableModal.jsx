import { glass, colors, glassCard } from "../../utils/styles";
import { TABLE_STATUS_OPTIONS } from "../../constants/tableStatus";
import { useState, useEffect } from "react";
import {
  AddCircle,
  BoxAdd,
  Edit,
  Grid3,
  Grid4,
  NoteText,
  Profile2User,
  Status,
  TableLamp,
  Tag,
  TickCircle,
} from "iconsax-react";

function TableModal({
  showModal,
  editTable,
  form,
  setForm,
  onClose,
  onSave,
  modalLoading,
}) {
  const [focusedField, setFocusedField] = useState("");
  const [isMounted, setIsMounted] = useState(showModal);
  const [isVisible, setIsVisible] = useState(showModal);
  const selectedStatus = form?.status || "available";

  useEffect(() => {
    let timeout;

    if (showModal) {
      setIsMounted(true);
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
      timeout = setTimeout(() => setIsMounted(false), 300);
    }

    return () => clearTimeout(timeout);
  }, [showModal]);

  if (!isMounted) return null;

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
    opacity: isVisible ? 1 : 0,
    animation: isVisible ? "confirm-fade-in 0.2s ease forwards" : "none",
    transition: "opacity 220ms ease",
    pointerEvents: showModal ? "auto" : "none",
  };

  const modalStyle = {
    ...glass,
    borderRadius: "24px",
    padding: "32px",
    width: "100%",
    maxWidth: "520px",
    maxHeight: "90vh",
    overflowY: "auto",
    transform: isVisible ? "translateY(0)" : "translateY(24px)",
    opacity: isVisible ? 1 : 0,
    animation: isVisible
      ? "confirm-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
      : "none",
    transition: "transform 220ms ease, opacity 220ms ease",
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {editTable ? (
              <Grid3
                size="28"
                color="#fff"
                variant="Outline"
                style={{
                  width: "28px",
                  height: "28px",
                  animation: "float 2s ease-in-out infinite",
                }}
              />
            ) : (
              <Grid3
                size="28"
                color="#fff"
                variant="Outline"
                style={{
                  width: "28px",
                  height: "28px",
                  animation: "float 2s ease-in-out infinite",
                }}
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
              {editTable ? "Edit Table" : "Add Table"}
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
              fontSize: "1rem",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Table Name *</label>
            <div style={{ position: "relative" }}>
              <Grid4
                size="20"
                color="white"
                variant="Outline"
                style={iconStyle("Table Name")}
              />

              <input
                style={{
                  ...inputStyle,
                  paddingLeft: "40px",
                  border:
                    focusedField === "Table Name"
                      ? "1px solid rgba(255,255,255,0.8)"
                      : "1px solid rgba(255,255,255,0.2)",
                  transition: "border 0.2s",
                }}
                placeholder="e.g. Table 1, VIP Room..."
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                onFocus={() => setFocusedField("Table Name")}
                onBlur={() => setFocusedField("")}
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Capacity (seats) *</label>
            <div style={{ position: "relative" }}>
              <Profile2User
                size={20}
                color="white"
                variant="Outline"
                style={iconStyle("Capacity")}
              />
              <input
                style={{
                  ...inputStyle,
                  paddingLeft: "40px",
                  border:
                    focusedField === "Capacity"
                      ? "1px solid rgba(255,255,255,0.8)"
                      : "1px solid rgba(255,255,255,0.2)",
                  transition: "border 0.2s",
                }}
                type="number"
                max="50"
                placeholder="e.g. 4, 6, 10..."
                value={form.capacity || ""}
                onChange={(e) =>
                  setForm({ ...form, capacity: Number(e.target.value) })
                }
                onFocus={() => setFocusedField("Capacity")}
                onBlur={() => setFocusedField("")}
              />
            </div>
          </div>

          {editTable && (
            <div>
              <label style={labelStyle}>Status</label>
              <div style={{ position: "relative" }}>
                <Status
                  size={20}
                  color="white"
                  variant="Outline"
                  style={iconStyle("Status")}
                />
                <select
                  style={{
                    ...inputStyle,
                    cursor: "pointer",
                    paddingLeft: "40px",
                    border:
                      focusedField === "Status"
                        ? "1px solid rgba(255,255,255,0.8)"
                        : "1px solid rgba(255,255,255,0.2)",
                    transition: "border 0.2s",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                    backgroundSize: "18px",
                    paddingRight: "40px",
                  }}
                  value={selectedStatus}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  onFocus={() => setFocusedField("Status")}
                  onBlur={() => setFocusedField("")}
                >
                  {TABLE_STATUS_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      style={{
                        background: "#1a1a2e",
                        color: "white",
                        padding: "8px",
                      }}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label style={labelStyle}>Note (optional)</label>
            <div style={{ position: "relative" }}>
              <NoteText
                size={20}
                color="white"
                variant="Outline"
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
                      ? "1px solid rgba(255,255,255,0.8)"
                      : "1px solid rgba(255,255,255,0.2)",
                  transition: "border 0.2s",
                }}
                placeholder="e.g. Window seat, Near kitchen..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                onFocus={() => setFocusedField("Note")}
                onBlur={() => setFocusedField("")}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          <button
            onClick={onClose}
            className="btn-cancel-glass"
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              color: "white",
              cursor: modalLoading ? "not-allowed" : "pointer",
              fontWeight: 500,
              fontSize: "0.9rem",
              opacity: modalLoading ? 0.6 : 1,
            }}
            disabled={modalLoading}
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="btn-shine-blue"
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "12px",
              border: "none",
              cursor: modalLoading ? "not-allowed" : "pointer",
              fontWeight: 600,
              fontSize: "0.9rem",
              opacity: modalLoading ? 0.8 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
            disabled={modalLoading}
          >
            {modalLoading ? (
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
                {editTable ? "Saving..." : "Creating..."}
              </>
            ) : (
              <>
                {editTable ? (
                  <TickCircle size="22" color="#fff" variant="Outline" />
                ) : (
                  <AddCircle size="22" color="#fff" variant="Outline" />
                )}
                {editTable ? "Save" : "Create"}
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
  );
}

export default TableModal;
