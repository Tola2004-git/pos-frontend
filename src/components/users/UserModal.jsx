import { useEffect, useState } from "react";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { glass, colors, glassCard } from "../../utils/styles";
import { SkeletonModal } from "../ui/SkeletonUser";
import { isValidEmail } from "../../utils/userHelpers";
import {
  AddCircle,
  Camera,
  Eye,
  EyeSlash,
  InfoCircle,
  Key,
  LampCharge,
  Sms,
  TickCircle,
  User,
  UserAdd,
  UserEdit,
} from "iconsax-react";

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

function UserModal({
  showModal,
  modalLoading,
  editUser,
  submitting,
  form,
  setForm,
  error,
  showPassword,
  setShowPassword,
  passwordStrength,
  focusedField,
  setFocusedField,
  handlePasswordChange,
  handleImageUpload,
  handleSubmit,
  closeModal,
}) {
  const [isMounted, setIsMounted] = useState(showModal);
  const [isVisible, setIsVisible] = useState(showModal);

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
        opacity: isVisible ? 1 : 0,
        animation: isVisible ? "confirm-fade-in 0.2s ease forwards" : "none",
        transition: "opacity 220ms ease",
        pointerEvents: showModal ? "auto" : "none",
      }}
    >
      <div
        style={{
          ...glass,
          borderRadius: "24px",
          padding: "32px",
          width: "100%",
          maxWidth: "500px",
          maxHeight: "90vh",
          overflowY: "auto",
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
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {editUser ? (
              <UserEdit
                size={30}
                color="#fff"
                variant="bold"
                style={{ animation: "float 2s ease-in-out infinite" }}
              />
            ) : (
              <UserAdd
                size={30}
                color="#fff"
                variant="bold"
                style={{ animation: "float 2s ease-in-out infinite" }}
              />
            )}
            <h2
              style={{
                color: colors.white,
                fontWeight: 600,
                margin: 0,
                fontSize: "1.5rem",
              }}
            >
              {editUser ? "Edit User" : "Add User"}
            </h2>
          </div>
          <button
            onClick={closeModal}
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

        <style>
          {`
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

        {modalLoading ? (
          <SkeletonModal />
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
              <label
                style={{
                  cursor: "pointer",
                  display: "inline-flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "fit-content",
                  margin: "0 auto",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: "none" }}
                />
                {form.profile_image ? (
                  <img
                    src={form.profile_image}
                    alt="profile"
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      objectPosition: "center top",
                      border: `1px solid ${colors.white}`,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.1)",
                      border: "2px dashed rgba(255,255,255,0.3)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "rgba(255,255,255,0.5)",
                      fontSize: "0.7rem",
                      gap: "4px",
                      margin: "0 auto",
                    }}
                  >
                    <Camera size={30} color="#fff" variant="outline" />
                    <span>Upload</span>
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

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Full Name</label>
              <div style={{ position: "relative" }}>
                <User
                  size={18}
                  color="#fff"
                  variant="bulk"
                  style={iconStyle("name")}
                />
                <input
                  style={{
                    ...inputStyle,
                    paddingLeft: "40px",
                    border:
                      focusedField === "name"
                        ? "1px solid rgba(255,255,255,0.8)"
                        : "1px solid rgba(255,255,255,0.2)",
                    transition: "border 0.2s",
                  }}
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField("")}
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Email</label>
              <div style={{ position: "relative" }}>
                <Sms
                  size={18}
                  color="#fff"
                  variant="bulk"
                  style={iconStyle("email")}
                />
                <input
                  style={{
                    ...inputStyle,
                    paddingLeft: "40px",
                    borderColor: form.email
                      ? isValidEmail(form.email)
                        ? "rgba(46,204,113,0.8)"
                        : "rgba(231,76,60,0.8)"
                      : focusedField === "email"
                        ? "rgba(255,255,255,0.8)"
                        : "rgba(255,255,255,0.2)",
                    transition: "border-color 0.2s",
                  }}
                  type="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField("")}
                />
              </div>
              {form.email && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginTop: "6px",
                    color: isValidEmail(form.email) ? "#2ecc71" : "#e74c3c",
                    fontSize: "0.75rem",
                    fontWeight: "500",
                    paddingLeft: "14px",
                  }}
                >
                  {isValidEmail(form.email) ? (
                    <>
                      <TickCircle size="16" color="#2ecc71" variant="bold" />
                      <span>Valid email</span>
                    </>
                  ) : (
                    <>
                      <InfoCircle size="16" color="#e74c3c" variant="bold" />
                      <span>Invalid email format</span>
                    </>
                  )}
                </div>
              )}
            </div>

            <div style={{ marginBottom: "8px" }}>
              <label style={labelStyle}>
                {editUser ? "New Password (leave blank to keep)" : "Password"}
              </label>
              <div style={{ position: "relative" }}>
                <Key
                  size={18}
                  color="#fff"
                  variant="Outline"
                  style={iconStyle("password")}
                />
                <input
                  style={{
                    ...inputStyle,
                    paddingLeft: "40px",
                    border:
                      focusedField === "password"
                        ? "1px solid rgba(255,255,255,0.8)"
                        : "1px solid rgba(255,255,255,0.2)",
                    transition: "border 0.2s",
                  }}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField("")}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    display: "flex",
                    color:
                      focusedField === "password"
                        ? "rgba(255,255,255,0.9)"
                        : "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    transition: "color 0.2s",
                  }}
                >
                  {showPassword ? (
                    <Eye size={18} color="#fff" variant="bold" />
                  ) : (
                    <EyeSlash size={18} color="#fff" variant="bold" />
                  )}
                </button>
              </div>
            </div>

            {form.password && (
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    Password Strength
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: passwordStrength.color,
                    }}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "4px" }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: "4px",
                        borderRadius: "2px",
                        background:
                          i <= passwordStrength.score
                            ? passwordStrength.color
                            : "rgba(255,255,255,0.1)",
                        transition: "background 0.3s",
                      }}
                    />
                  ))}
                </div>
                {passwordStrength.score < 3 && (
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "0.75rem",
                      color: "rgba(255,255,255,0.4)",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <LampCharge
                      size={16}
                      color="rgba(255,255,255,0.4)"
                      variant="bold"
                    />
                    <span>
                      Use uppercase, numbers & symbols to make it stronger
                    </span>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Role</label>
              {editUser?.role === "admin" ? (
                <div
                  style={{
                    ...inputStyle,
                    display: "flex",
                    alignItems: "center",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  Admin (protected role)
                </div>
              ) : (
                <select
                  style={{ ...inputStyle, cursor: "pointer" }}
                  value="cashier"
                  disabled
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="cashier" style={{ background: "#2c3e50" }}>
                    Cashier
                  </option>
                </select>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => !submitting && closeModal()}
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
                    {editUser ? "Saving..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {editUser ? (
                      <TickCircle size={22} color="#fff" variant="bold"/>
                    ):(
                      <AddCircle size={22} color="#fff" variant="bold"/>
                    )}
                    {editUser ? "Save" : "Create"}
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

export default UserModal;
