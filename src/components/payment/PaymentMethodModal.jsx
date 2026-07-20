import {
  BANKS,
  inputStyle,
  labelStyle,
} from "../../constants/paymentConstants";
import { glass, glassCard, colors } from "../../utils/styles";
import {
  Add,
  AddCircle,
  Bank,
  BoxAdd,
  BoxTick,
  Building,
  Card,
  Edit,
  Global,
  Hashtag,
  NoteText,
  Personalcard,
  TickCircle,
  Wallet,
} from "iconsax-react";
import { useState, useEffect, useContext } from "react";
import { SidebarContext } from "../../App";

function PaymentMethodModal({
  showModal,
  editMethod,
  viewMode,
  form,
  error,
  onClose,
  onSubmit,
  onFormChange,
  submitting,
  t,
}) {
  const [focusedField, setFocusedField] = useState("");
  const [isMounted, setIsMounted] = useState(showModal);
  const [isVisible, setIsVisible] = useState(showModal);
  const { sidebarOpen } = useContext(SidebarContext);
  const SkeletonCount = sidebarOpen ? 6 : 8;

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

  const handleBankSelect = (bank) => {
    if (viewMode) return;
    // Sync bank selection across form fields so validation passes
    // Update icon (used for preview), logo (sent to backend), bank_name and name
    onFormChange("icon", bank.logo);
    onFormChange("logo", bank.logo);
    onFormChange("bank_name", bank.name);
    onFormChange("name", bank.name);
  };

  const handleStatusToggle = () => {
    onFormChange("status", !form.status);
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
    maxWidth: "580px",
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {editMethod ? (
              <>
                <Card
                  size="28"
                  color="white"
                  variant="Linear"
                  style={{
                    width: "28px",
                    height: "28px",
                    animation: "float 2s ease-in-out infinite",
                  }}
                />
              </>
            ) : (
              <>
                <Card
                  size="28"
                  color="white"
                  variant="Linear"
                  style={{
                    width: "28px",
                    height: "28px",
                    animation: "float 2s ease-in-out infinite",
                  }}
                />
              </>
            )}
            <h2
              style={{
                color: colors.whiteFull,
                fontWeight: 600,
                margin: 0,
                fontSize: "1.5rem",
              }}
            >
              {viewMode
                ? t.viewPaymentMethodTitle
                : editMethod
                  ? t.editPaymentMethodTitle
                  : t.addPaymentMethodTitle}
            </h2>
          </div>
          <button
            onClick={() => !submitting && onClose()}
            disabled={submitting}
            aria-label={t.cancel}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "white",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            ✕
          </button>
        </div>

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

        {viewMode ? (
          <div
            style={{
              ...glassCard,
              padding: "32px 24px",
              borderRadius: "24px",
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                width: "128px",
                height: "128px",
                margin: "0 auto 10px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {form.icon ? (
                <img
                  src={form.icon}
                  alt={form.bank_name || form.name || "Bank logo"}
                  style={{ objectFit: "contain" }}
                />
              ) : (
                <Bank size={56} color="white" variant="Outline" />
              )}
            </div>
            <h3
              style={{
                color: "white",
                fontSize: "1.2rem",
                margin: "0 0 8px",
              }}
            >
              {form.bank_name || form.name || t.paymentMethodFallback}
            </h3>
            <div
              style={{ textAlign: "left", maxWidth: "420px", margin: "0 auto" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 16px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.05)",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}
                >
                  {t.accountNameLabel}
                </span>
                <span
                  style={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  {form.account_name || t.naLabel}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 16px",
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.05)",
                }}
              >
                <span
                  style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.9rem" }}
                >
                  {t.accountNumberLabel}
                </span>
                <span
                  style={{
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  {form.account_number || t.naLabel}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>{t.bankLabel}</label>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                {BANKS.map((bank) => (
                  <button
                    key={bank.key}
                    onClick={() => handleBankSelect(bank)}
                    disabled={viewMode}
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      border: `2px solid ${form.icon === bank.logo ? colors.whiteFull : "rgba(255,255,255,0.2)"}`,
                      background:
                        form.icon === bank.logo
                          ? "rgba(255,255,255,0.06)"
                          : "rgba(255,255,255,0.06)",
                      cursor: viewMode ? "not-allowed" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={bank.logo}
                      alt={bank.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                ...glassCard,
                marginBottom: "16px",
                padding: "16px",
                borderRadius: "12px",
              }}
            >
              <p
                style={{
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <Bank size={20} color="white" variant="Outline" />
                <span>{t.bankInfoOptionalMsg}</span>
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div>
                  <label style={labelStyle}>{t.bankNameLabel}</label>
                  <div style={{ position: "relative" }}>
                    <Building
                      size={18}
                      color="white"
                      variant="Outline"
                      style={iconStyle("Bank Name")}
                    />
                    <input
                      style={{
                        ...inputStyle,
                        paddingLeft: "40px",
                        border:
                          focusedField === "Bank Name"
                            ? "1px solid rgba(255,255,255,0.8)"
                            : "1px solid rgba(255,255,255,0.2)",
                        transition: "border 0.2s",
                        background: viewMode
                          ? "rgba(255,255,255,0.06)"
                          : undefined,
                      }}
                      placeholder={t.bankNamePlaceholder}
                      value={form.bank_name}
                      readOnly={viewMode}
                      onChange={(e) =>
                        onFormChange("bank_name", e.target.value)
                      }
                      onFocus={() => setFocusedField("Bank Name")}
                      onBlur={() => setFocusedField("")}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>{t.accountNameLabel}</label>
                  <div style={{ position: "relative" }}>
                    <Personalcard
                      size={18}
                      color="white"
                      variant="Outline"
                      style={iconStyle("Account Name")}
                    />
                    <input
                      style={{
                        ...inputStyle,
                        paddingLeft: "40px",
                        border:
                          focusedField === "Account Name"
                            ? "1px solid rgba(255,255,255,0.8)"
                            : "1px solid rgba(255,255,255,0.2)",
                        transition: "border 0.2s",
                        background: viewMode
                          ? "rgba(255,255,255,0.06)"
                          : undefined,
                      }}
                      placeholder={t.accountNamePlaceholder}
                      value={form.account_name}
                      readOnly={viewMode}
                      onChange={(e) =>
                        onFormChange("account_name", e.target.value)
                      }
                      onFocus={() => setFocusedField("Account Name")}
                      onBlur={() => setFocusedField("")}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>{t.accountNumberLabel}</label>
                  <div style={{ position: "relative" }}>
                    <Hashtag
                      size={18}
                      color="white"
                      variant="Outline"
                      style={iconStyle("Account Number")}
                    />
                    <input
                      style={{
                        ...inputStyle,
                        paddingLeft: "40px",
                        border:
                          focusedField === "Account Number"
                            ? "1px solid rgba(255,255,255,0.8)"
                            : "1px solid rgba(255,255,255,0.2)",
                        transition: "border 0.2s",
                        background: viewMode
                          ? "rgba(255,255,255,0.06)"
                          : undefined,
                      }}
                      placeholder={t.accountNumberPlaceholder}
                      value={form.account_number}
                      readOnly={viewMode}
                      onChange={(e) =>
                        onFormChange("account_number", e.target.value)
                      }
                      onFocus={() => setFocusedField("Account Number")}
                      onBlur={() => setFocusedField("")}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "24px",
              }}
            >
              <label style={{ ...labelStyle, marginBottom: 0 }}>{t.tableStatusLabel}</label>
              <div
                onClick={!viewMode ? handleStatusToggle : undefined}
                style={{
                  width: "46px",
                  height: "24px",
                  borderRadius: "12px",
                  background: form.status ? "#2ecc71" : "rgba(255,255,255,0.2)",
                  cursor: viewMode ? "not-allowed" : "pointer",
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
          </>
        )}

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            className="btn-cancel-glass"
            onClick={!submitting ? onClose : undefined}
            disabled={submitting}
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
            {viewMode ? t.closeAction : t.cancel}
          </button>
          {!viewMode && (
            <button
              onClick={!submitting ? onSubmit : undefined}
              disabled={submitting}
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
                  {editMethod ? t.savingAction : t.creatingAction}
                </>
              ) : (
                <>
                  {editMethod ? (
                    <TickCircle size={22} color="white" variant="Outline" />
                  ) : (
                    <AddCircle size={22} color="white" variant="Outline" />
                  )}
                  {editMethod ? t.saveAction : t.createAction}
                </>
              )}
            </button>
          )}
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

export default PaymentMethodModal;
