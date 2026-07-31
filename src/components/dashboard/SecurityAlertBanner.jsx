import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Warning2, CloseCircle } from "iconsax-react";
import { fetchSecuritySummaryApi } from "../../api/auditLogApi";

// Persisted so "seen it" survives a refresh/new tab, not just this render -
// otherwise navigating away and back to the Dashboard would just show the
// exact same batch of failed logins again for the rest of the hour.
const ACK_KEY = "securityAlertAckAt";

export function SecurityAlertBanner({ t }) {
  const navigate = useNavigate();
  const [failedLoginCount, setFailedLoginCount] = useState(0);
  const [latestFailedLoginAt, setLatestFailedLoginAt] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let active = true;
    fetchSecuritySummaryApi()
      .then((res) => {
        if (!active) return;
        setFailedLoginCount(res.data.failed_login_count || 0);
        setLatestFailedLoginAt(res.data.recent_failed_logins?.[0]?.created_at ?? null);
      })
      .catch((err) => console.error("Failed to fetch security summary:", err));
    return () => {
      active = false;
    };
  }, []);

  // A newer failed-login timestamp than whatever was last acknowledged means
  // this is a fresh batch, not the same one already dismissed - show it
  // again even if the hour-long window hasn't rolled over yet.
  const ackAt = localStorage.getItem(ACK_KEY);
  const isNewSinceAck =
    !ackAt || (latestFailedLoginAt && new Date(latestFailedLoginAt) > new Date(ackAt));

  if (failedLoginCount === 0 || dismissed || !isNewSinceAck) return null;

  const acknowledge = () => {
    if (latestFailedLoginAt) localStorage.setItem(ACK_KEY, latestFailedLoginAt);
    setDismissed(true);
  };

  return (
    <div
      className="no-print rounded-2xl p-4 mb-5 flex items-center justify-between gap-3 flex-wrap"
      style={{
        background: "rgba(231,76,60,0.12)",
        border: "1px solid rgba(231,76,60,0.3)",
      }}
    >
      <span className="flex items-center gap-2 text-sm text-white/80">
        <Warning2
          size={18}
          color="#e74c3c"
          variant="Bold"
          style={{ animation: "float 3s ease-in-out infinite" }}
        />
        <span>
          <strong className="text-white">{t.securityAlertTitle}</strong>
          {" — "}
          {t.securityAlertMsg.replace("{n}", failedLoginCount)}
        </span>
      </span>
      <span className="flex items-center gap-2">
        <button
          onClick={() => {
            acknowledge();
            navigate("/audit-logs");
          }}
          className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
          style={{ color: "#e74c3c", background: "rgba(231,76,60,0.18)" }}
        >
          {t.securityAlertViewAction}
        </button>
        <button
          onClick={acknowledge}
          aria-label={t.dismiss}
          title={t.dismiss}
          className="w-6 h-6 flex items-center justify-center bg-transparent border-none cursor-pointer text-white/40 hover:text-white/70 transition-colors"
        >
          <CloseCircle size={18} color="currentColor" variant="Linear" />
        </button>
      </span>
    </div>
  );
}

export default SecurityAlertBanner;
