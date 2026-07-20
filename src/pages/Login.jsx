import { useState } from "react";
import apiClient from "../api/apiClient";
import { useNavigate } from "react-router-dom";
import { getGradientBg, glassCard } from "../utils/styles";
import logo from "../assets/logo.png";
import emailIcon from "../assets/icons/email.png";
import passwordIcon from "../assets/icons/password.png";
import loginIcon from "../assets/icons/login.png";
import { Sms, Lock, Eye, EyeSlash, Login as LoginIcon } from "iconsax-react";
import { useTranslations } from "../hooks/useTranslations";

const styles = `
@keyframes dot-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40%            { transform: scale(1);   opacity: 1;   }
}
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0);    }
}
@keyframes staggerIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0);    }
}
@keyframes shake {
  0%, 100% { transform: translateX(0);    }
  15%       { transform: translateX(-8px); }
  30%       { transform: translateX(8px);  }
  45%       { transform: translateX(-6px); }
  60%       { transform: translateX(6px);  }
  75%       { transform: translateX(-3px); }
  90%       { transform: translateX(3px);  }
}

@keyframes float {
  0%, 100% { transform: translateY(0px);   }
  50%       { transform: translateY(-10px); }
}

.logo-float {
  animation: float 3.5s ease-in-out infinite;
}

.login-card { animation: fadeSlideUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
.field-1    { animation: staggerIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both; }
.field-2    { animation: staggerIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.28s both; }
.field-3    { animation: staggerIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.40s both; }
.shake      { animation: shake 0.5s ease forwards; }

.dot {
  width: 7px; height: 7px;
  background: #ffffff;
  border-radius: 50%;
  animation: dot-bounce 1.2s infinite ease-in-out;
}
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

.input-wrap {
  display: flex;
  align-items: center;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.08);
  padding-right: 12px;
  overflow: hidden;
  transition: border 0.25s, background 0.25s;
}
.input-wrap:focus-within {
  border-color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.12);
}

.toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 4px;
  display: flex;
  align-items: center;
  color: rgba(255,255,255,0.5);
  transition: color 0.2s;
}
.toggle-btn:hover { color: rgba(255,255,255,0.9); }

.btn-login {
  transition: opacity 0.2s, transform 0.15s, box-shadow 0.2s;
}
.btn-login:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 24px rgba(0,0,0,0.35);
}
.btn-login:active:not(:disabled) {
  transform: translateY(0px);
}

.icon-white {
  filter: brightness(0) invert(1);
}
`;

function DotsLoader({ t }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{ display: "flex", gap: "5px" }}>
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </span>
      <span>{t.signingInMsg}</span>
    </span>
  );
}

function EyeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function Login() {
  const { t } = useTranslations();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [focusedField, setFocusedField] = useState("");

  const triggerShake = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 500);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.post("/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);

      // Role isn't embedded in the JWT, so fetch it once here and cache it
      // for PrivateRoute's synchronous role checks. Default to the
      // least-privileged role if the lookup fails.
      let role = "cashier";
      try {
        const me = await apiClient.get("/me");
        role = me.data?.role || "cashier";
      } catch (err) {
        console.error("Failed to fetch user role:", err);
      }
      localStorage.setItem("role", role);

      navigate(role === "admin" ? "/dashboard" : "/cashier");
    } catch {
      setError(t.loginErrorMsg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div
      style={{
        ...getGradientBg(),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
      }}
    >
      <style>{styles}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        className="login-card"
        style={{
          ...glassCard,
          borderRadius: "24px",
          padding: "48px 40px",
          width: "100%",
          maxWidth: "420px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "32px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img
            src={logo}
            alt="Logo"
            className="logo-float"
            style={{
              height: "72px",
              objectFit: "contain",
              marginBottom: "12px",
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))",
            }}
          />
          <p
            style={{
              color: "rgba(255,255,255,0.55)",
              marginTop: "4px",
              fontSize: "0.88rem",
            }}
          >
            {t.signInToAccountMsg}
          </p>
        </div>
        {error && (
          <div
            className={shaking ? "shake" : ""}
            style={{
              background: "rgba(192,57,43,0.25)",
              border: "1px solid rgba(192,57,43,0.5)",
              color: "#ff6b6b",
              padding: "12px 16px",
              borderRadius: "12px",
              marginBottom: "20px",
              fontSize: "0.88rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "8px" }}>
            <label style={labelStyle}>
              {t.emailLabel}
            </label>
            <div style={{ position: "relative" }}>
              <Sms
                size={20}
                color="white"
                variant="Linear"
                style={iconStyle("email")}
              />
              <input
                style={{
                  ...inputStyle,
                  paddingLeft: "40px",
                  border: focusedField === "email" ? "1px solid rgba(255,255,255,0.8)" : "1px solid rgba(255,255,255,0.2)",
                  transition: "border 0.25s",
                }}
                type="email"
                placeholder={t.loginEmailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField("")}
              />
            </div>
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label style={labelStyle}>
              {t.passwordLabel}
            </label>
            <div style={{ position: "relative" }}>
              <Lock
                size={20}
                color="white"
                variant="Linear"
                style={iconStyle("password")}
              />
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  ...inputStyle,
                  paddingLeft: "40px",
                  border:
                    focusedField === "password"
                      ? "1px solid rgba(255,255,255,0.8)"
                      : "1px solid rgba(255,255,255,0.2)",
                  transition: "border 0.2s",
                }}
                onFocus={() => setFocusedField("password")}
                onBlur={() => setFocusedField("")}
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowPass(!showPass)}
                tabIndex={-1}
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
                {showPass ? <Eye size={20} color="white" variant="Linear" /> : <EyeSlash size={20} color="white" variant="Linear" />}
              </button>
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <button
              type="submit"
              disabled={loading}
              className="btn-shine-blue"
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                fontSize: "1rem",
                fontWeight: 600,
                letterSpacing: "0.5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.9 : 1,
              }}
            >
              {loading ? (
                <DotsLoader t={t} />
              ) : (
                <>
                  <LoginIcon
                    size={20}
                    color="white"
                    variant="Linear"
                  />
                  {t.loginAction}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
