import { useState } from "react";
import { Lock, Eye, EyeSlash } from "iconsax-react";
import { HiLockClosed } from "react-icons/hi2";
import apiClient from "../api/apiClient";
import { glassCard } from "../utils/styles";
import { getCachedUser } from "../utils/currentUserCache";
import { markActivity } from "../utils/sessionActivity";
import { useTranslations } from "../hooks/useTranslations";

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  fontSize: "0.95rem",
  outline: "none",
};

function LockScreen({ onUnlock, onFullLogout }) {
  const { t } = useTranslations();
  const user = getCachedUser();
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.email) {
      // No cached identity to re-authenticate against - the lock screen
      // can't safely resume, so fall back to a real logout instead.
      onFullLogout();
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await apiClient.post("/login", { email: user.email, password });
      localStorage.setItem("token", res.data.token);
      markActivity();
      setPassword("");
      onUnlock();
    } catch (err) {
      const status = err.response?.status;
      if (status === 429) {
        setError(t.loginErrorTooManyMsg);
      } else if (status === 401) {
        setError(t.loginErrorMsg);
      } else if (!err.response) {
        setError(t.loginErrorNetworkMsg);
      } else {
        setError(t.loginErrorServerMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[20000] flex items-center justify-center p-6"
      style={{ ...glassCard, background: "rgba(10, 10, 20, 0.85)" }}
    >
      <form
        onSubmit={handleSubmit}
        style={glassCard}
        className="w-full max-w-[400px] rounded-[24px] p-7 text-white border border-white/15"
      >
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center mb-3">
            <HiLockClosed size={28} color="#fff" />
          </div>
          <h3 className="text-lg font-bold m-0">{t.lockScreenTitle}</h3>
          <p className="text-white/55 text-[0.85rem] mt-1 mb-0">{t.lockScreenSubtitle}</p>
          {user && (
            <p className="text-white/75 text-sm font-medium mt-3 mb-0">
              {user.name} · {user.email}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-[10px] bg-[#c0392b]/25 border border-[#c0392b]/50 text-[#ff8a80] text-sm px-3 py-2.5">
            {error}
          </div>
        )}

        <label className="block text-white/65 text-[0.8rem] mb-1.5">{t.passwordLabel}</label>
        <div className="relative mb-5">
          <Lock
            size={18}
            color="white"
            variant="Outline"
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0.4,
              pointerEvents: "none",
            }}
          />
          <input
            type={showPass ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...inputStyle, paddingLeft: "40px", paddingRight: "40px" }}
            placeholder="••••••••"
            autoFocus
            required
          />
          <button
            type="button"
            onClick={() => setShowPass((v) => !v)}
            tabIndex={-1}
            className="bg-transparent border-none cursor-pointer"
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(255,255,255,0.5)",
            }}
          >
            {showPass ? (
              <Eye size={18} color="white" variant="Linear" />
            ) : (
              <EyeSlash size={18} color="white" variant="Linear" />
            )}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-shine-blue w-full py-3.5 rounded-[12px] font-semibold text-sm disabled:opacity-70"
        >
          {loading ? t.unlockingMsg : t.unlockAction}
        </button>

        <button
          type="button"
          onClick={onFullLogout}
          disabled={loading}
          className="w-full mt-3 py-2 text-white/50 hover:text-white/80 text-sm font-medium transition-colors bg-transparent border-none cursor-pointer"
        >
          {t.notYouLogoutAction}
        </button>
      </form>
    </div>
  );
}

export default LockScreen;
