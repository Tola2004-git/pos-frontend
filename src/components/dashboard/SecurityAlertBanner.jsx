import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Warning2 } from "iconsax-react";
import { fetchSecuritySummaryApi } from "../../api/auditLogApi";

export function SecurityAlertBanner({ t }) {
  const navigate = useNavigate();
  const [failedLoginCount, setFailedLoginCount] = useState(0);

  useEffect(() => {
    let active = true;
    fetchSecuritySummaryApi()
      .then((res) => {
        if (active) setFailedLoginCount(res.data.failed_login_count || 0);
      })
      .catch((err) => console.error("Failed to fetch security summary:", err));
    return () => {
      active = false;
    };
  }, []);

  if (failedLoginCount === 0) return null;

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
      <button
        onClick={() => navigate("/audit-logs")}
        className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
        style={{ color: "#e74c3c", background: "rgba(231,76,60,0.18)" }}
      >
        {t.securityAlertViewAction}
      </button>
    </div>
  );
}

export default SecurityAlertBanner;
