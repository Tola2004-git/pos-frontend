import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { useTranslations } from "../../hooks/useTranslations";
import { useCashierShift } from "../../hooks/useCashierShift";
import { getGradientBg, glass, glassCard, colors } from "../../utils/styles";
import LangDropdown from "./LangDropdown";
import UserProfile from "./UserProfile";
import {
  Logout,
  Grid3,
  ReceiptText,
  MoneyRecive,
  TickCircle,
  Warning2,
  DollarCircle,
  Note,
} from "iconsax-react";
import { HiLockClosed, HiLockOpen } from "react-icons/hi2";
import logo from "../../assets/logo.png";

const NAV_TABS = [
  { path: "/cashier", label: "Tables", icon: Grid3 },
  { path: "/cashier/orders", label: "My Sales", icon: ReceiptText },
];

// CashierHome and CashierOrders each mount their own CashierLayout instance,
// so switching between "Tables" and "My Sales" remounts this component and
// re-runs the shift check every time - without this module-level flag, the
// "checking shift" spinner (meant only for the moment right after login)
// would replace the destination page's own skeleton loader on every tab
// click too. Resets on a full page reload (fresh session) and is also reset
// explicitly by handleLogout() below, since the SPA never fully reloads on
// a logout -> login round trip within the same tab.
let hasCheckedShiftThisSession = false;

const fieldStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.07)",
  color: "white",
  fontSize: "0.95rem",
  outline: "none",
};

const labelStyle = {
  color: "rgba(255,255,255,0.65)",
  fontSize: "0.8rem",
  display: "block",
  marginBottom: "6px",
};

const badgeFloatStyles = `
@keyframes badge-float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-5px); }
}
.badge-float { animation: badge-float 2.2s ease-in-out infinite; }

@keyframes spin-loader {
  to { transform: rotate(360deg); }
}
.spin-loader {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin-loader 0.7s linear infinite;
}
`;

function fmtUsd(v) {
  return `$${(Number(v) || 0).toFixed(2)}`;
}
function fmtKhr(v) {
  return `${Math.round(Number(v) || 0).toLocaleString()} ៛`;
}

function OpenShiftModal({ opening, onOpen, onLogout }) {
  const [usd, setUsd] = useState("");
  const [khr, setKhr] = useState("");
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (usd === "" && khr === "") {
      setError("Enter your starting cash in USD or KHR.");
      return;
    }
    try {
      await onOpen({
        opening_cash_usd: Number(usd) || 0,
        opening_cash_khr: Number(khr) || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to open your shift.");
    }
  };

  const currencyFieldStyle = (field) => ({
    ...fieldStyle,
    paddingLeft: "40px",
    border:
      focusedField === field
        ? "1px solid rgba(255,255,255,0.8)"
        : "1px solid rgba(255,255,255,0.18)",
    transition: "border 0.2s",
  });

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center p-6"
      style={glassCard}
    >
      <form
        onSubmit={handleSubmit}
        style={glassCard}
        className="w-full max-w-[420px] rounded-[24px] p-7 text-white border border-white/15"
      >
        <style>{badgeFloatStyles}</style>
        <div className="flex items-center gap-3 mb-2">
          <div className="badge-float w-11 h-11 rounded-[12px] flex items-center justify-center flex-none">
            <HiLockClosed size={32} color="#fff" />
          </div>
          <div>
            <h3 className="text-lg font-bold m-0">Open Your Shift</h3>
            <p className="text-white/55 text-[0.8rem] m-0">
              Required before you can start selling
            </p>
          </div>
        </div>
        <p className="text-white/70 text-sm leading-relaxed my-4">
          Count the cash currently in your drawer and enter it below as your
          starting float.
        </p>

        {error && (
          <div className="mb-4 rounded-[10px] bg-[#c0392b]/25 border border-[#c0392b]/50 text-[#ff8a80] text-sm px-3 py-2.5">
            {error}
          </div>
        )}

        <div className="mb-3">
          <label style={labelStyle}>Starting Cash (USD)</label>
          <div className="relative">
            <DollarCircle
              size={18}
              color="white"
              variant="Outline"
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                opacity: focusedField === "usd" ? 1 : 0.4,
                transition: "opacity 0.2s",
                pointerEvents: "none",
              }}
            />
            <input
              style={currencyFieldStyle("usd")}
              type="number"
              step="0.01"
              min="0"
              value={usd}
              onChange={(e) => setUsd(e.target.value)}
              onFocus={() => setFocusedField("usd")}
              onBlur={() => setFocusedField("")}
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="mb-5">
          <label style={labelStyle}>Starting Cash (KHR)</label>
          <div className="relative">
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "white",
                opacity: focusedField === "khr" ? 1 : 0.4,
                transition: "opacity 0.2s",
                pointerEvents: "none",
              }}
            >
              ៛
            </span>
            <input
              style={currencyFieldStyle("khr")}
              type="number"
              step="1"
              min="0"
              value={khr}
              onChange={(e) => setKhr(e.target.value)}
              onFocus={() => setFocusedField("khr")}
              onBlur={() => setFocusedField("")}
              placeholder="0"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={opening}
          className="btn-shine-blue w-full py-3.5 rounded-[12px] font-semibold text-sm disabled:opacity-70 flex items-center justify-center gap-2"
        >
          {opening ? (
            <>
              <span className="spin-loader" />
              Opening...
            </>
          ) : (
            <>
              <HiLockOpen size={18} color="white" />
              Open Shift & Start Selling
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onLogout}
          disabled={opening}
          className="w-full mt-3 py-2 text-white/50 hover:text-white/80 text-sm font-medium transition-colors bg-transparent border-none cursor-pointer"
        >
          Log Out
        </button>
      </form>
    </div>
  );
}

function CloseShiftModal({ closing, onClose, onCancel }) {
  const [usd, setUsd] = useState("");
  const [khr, setKhr] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState("");

  const currencyFieldStyle = (field) => ({
    ...fieldStyle,
    paddingLeft: "40px",
    border:
      focusedField === field
        ? "1px solid rgba(255,255,255,0.8)"
        : "1px solid rgba(255,255,255,0.18)",
    transition: "border 0.2s",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (usd === "" && khr === "") {
      setError("Enter your counted cash in USD or KHR.");
      return;
    }
    try {
      await onClose({
        counted_cash_usd: Number(usd) || 0,
        counted_cash_khr: Number(khr) || 0,
        note: note || null,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to close your shift.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center p-6 "
      style={glassCard}
    >
      <form
        onSubmit={handleSubmit}
        style={glassCard}
        className="w-full max-w-[440px] rounded-[24px] p-7 text-white border border-white/15"
      >
        <style>{badgeFloatStyles}</style>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-none">
            <MoneyRecive
              size={32}
              color="#fff"
              variant="Outline"
              style={{ animation: "float 3s ease-in-out infinite" }}
            />
          </div>
          <div>
            <h3 className="text-lg font-bold m-0">Close Your Shift</h3>
            <p className="text-white/55 text-[0.8rem] m-0">
              Count your drawer to finish for the day
            </p>
          </div>
        </div>
        <p className="text-white/70 text-sm leading-relaxed my-4">
          Enter what's actually in the drawer. Your admin will review this
          against the system's expected total.
        </p>

        {error && (
          <div className="mb-4 rounded-[10px] bg-[#c0392b]/25 border border-[#c0392b]/50 text-[#ff8a80] text-sm px-3 py-2.5">
            {error}
          </div>
        )}

        <div className="mb-3">
          <label style={labelStyle}>Counted Cash (USD)</label>
          <div className="relative">
            <DollarCircle
              size={18}
              color="white"
              variant="Outline"
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                opacity: focusedField === "usd" ? 1 : 0.4,
                transition: "opacity 0.2s",
                pointerEvents: "none",
              }}
            />
            <input
              style={currencyFieldStyle("usd")}
              type="number"
              step="0.01"
              min="0"
              value={usd}
              onChange={(e) => setUsd(e.target.value)}
              onFocus={() => setFocusedField("usd")}
              onBlur={() => setFocusedField("")}
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="mb-3">
          <label style={labelStyle}>Counted Cash (KHR)</label>
          <div className="relative">
            <span
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "white",
                opacity: focusedField === "khr" ? 1 : 0.4,
                transition: "opacity 0.2s",
                pointerEvents: "none",
              }}
            >
              ៛
            </span>
            <input
              style={currencyFieldStyle("khr")}
              type="number"
              step="1"
              min="0"
              value={khr}
              onChange={(e) => setKhr(e.target.value)}
              onFocus={() => setFocusedField("khr")}
              onBlur={() => setFocusedField("")}
              placeholder="0"
            />
          </div>
        </div>
        <div className="mb-5">
          <label style={labelStyle}>Note (optional)</label>
          <div className="relative">
            <Note
              size={18}
              color="white"
              variant="Outline"
              style={{
                position: "absolute",
                left: "12px",
                top: "14px",
                opacity: focusedField === "note" ? 1 : 0.4,
                transition: "opacity 0.2s",
                pointerEvents: "none",
              }}
            />
            <textarea
              style={{
                ...fieldStyle,
                paddingLeft: "40px",
                resize: "vertical",
                minHeight: "64px",
                border:
                  focusedField === "note"
                    ? "1px solid rgba(255,255,255,0.8)"
                    : "1px solid rgba(255,255,255,0.18)",
                transition: "border 0.2s",
              }}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onFocus={() => setFocusedField("note")}
              onBlur={() => setFocusedField("")}
              placeholder="e.g. gave wrong change on one order"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={closing}
            className="btn-cancel-glass flex-1 py-3.5 rounded-[12px] font-medium text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={closing}
            className="btn-shine-blue flex-1 py-3.5 rounded-[12px] font-semibold text-sm disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {closing ? (
              <>
                <span className="spin-loader" />
                Closing...
              </>
            ) : (
              <>
                <HiLockClosed size={18} color="white" />
                Close Shift
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function CloseSummaryModal({ summary, onDismiss }) {
  const varianceUsd = Number(summary.variance_usd) || 0;
  const varianceKhr = Number(summary.variance_khr) || 0;
  const balanced = Math.abs(varianceUsd) < 0.01 && Math.abs(varianceKhr) < 1;

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center p-6"
      style={glassCard}
    >
      <div
        style={glassCard}
        className="w-full max-w-[440px] rounded-[24px] p-7 text-white border border-white/15"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-none">
            {balanced ? (
              <TickCircle
                size={32}
                color="#2ecc71"
                variant="Outline"
                style={{ animation: "float 3s ease-in-out infinite" }}
              />
            ) : (
              <Warning2
                size={32}
                color="#e67e22"
                variant="Outline"
                style={{ animation: "float 3s ease-in-out infinite" }}
              />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold m-0">Shift Closed</h3>
            <p className="text-white/55 text-[0.8rem] m-0">
              Submitted for admin review
              {balanced ? " — drawer balanced" : " — variance found"}
            </p>
          </div>
        </div>

        <div className="rounded-[14px] bg-white/[0.06] border border-white/10 overflow-hidden mb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-white/50 text-left">
                <th className="font-medium px-4 py-2.5"> </th>
                <th className="font-medium px-4 py-2.5 text-right">USD</th>
                <th className="font-medium px-4 py-2.5 text-right">KHR</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-white/10">
                <td className="px-4 py-2.5 text-white/70">Expected</td>
                <td className="px-4 py-2.5 text-right">
                  {fmtUsd(summary.expected_cash_usd)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {fmtKhr(summary.expected_cash_khr)}
                </td>
              </tr>
              <tr className="border-t border-white/10">
                <td className="px-4 py-2.5 text-white/70">Counted</td>
                <td className="px-4 py-2.5 text-right">
                  {fmtUsd(summary.counted_cash_usd)}
                </td>
                <td className="px-4 py-2.5 text-right">
                  {fmtKhr(summary.counted_cash_khr)}
                </td>
              </tr>
              <tr className="border-t border-white/10 font-bold">
                <td className="px-4 py-2.5">Variance</td>
                <td
                  className="px-4 py-2.5 text-right"
                  style={{
                    color: Math.abs(varianceUsd) < 0.01 ? "#2ecc71" : "#e67e22",
                  }}
                >
                  {varianceUsd >= 0 ? "+" : ""}
                  {fmtUsd(varianceUsd)}
                </td>
                <td
                  className="px-4 py-2.5 text-right"
                  style={{
                    color: Math.abs(varianceKhr) < 1 ? "#2ecc71" : "#e67e22",
                  }}
                >
                  {varianceKhr >= 0 ? "+" : ""}
                  {fmtKhr(varianceKhr)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <button
          onClick={onDismiss}
          className="btn-shine-blue w-full py-3.5 rounded-[12px] font-semibold text-sm"
        >
          Done & Log Out
        </button>
      </div>
    </div>
  );
}

function CashierLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang } = useTranslations();
  const [user, setUser] = useState(null);
  const [showCloseModal, setShowCloseModal] = useState(false);

  const {
    shift,
    loading: shiftLoading,
    fetchError: shiftFetchError,
    opening,
    closing,
    closeSummary,
    openShift,
    closeShift,
    dismissCloseSummary,
    refreshShift,
  } = useCashierShift();

  useEffect(() => {
    let active = true;
    apiClient
      .get("/me")
      .then((res) => {
        if (active) setUser(res.data);
      })
      .catch((err) => console.error("Failed to fetch user:", err));
    return () => {
      active = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    // Next login is a fresh session as far as the shift-checking spinner
    // cares, even though the SPA never fully reloads (so the module-level
    // flag wouldn't otherwise reset on its own).
    hasCheckedShiftThisSession = false;
    navigate("/login");
  };

  // Closing a shift ends the cashier's working session, not just the
  // shift record - force a real re-login afterward instead of dropping
  // them back on the Open Shift gate, where anyone still at the terminal
  // could open a new shift under the same session without authenticating.
  const handleCloseSummaryDismiss = () => {
    dismissCloseSummary();
    handleLogout();
  };

  // Only cashiers are shift-tracked - an admin previewing /cashier isn't
  // gated by this at all. Read the role from localStorage (cached by Login)
  // rather than the /me fetch above, since /me is async and would let the
  // shift-gate flash the table grid before it resolves.
  const isCashier = localStorage.getItem("role") === "cashier";
  // While the shift check is still in flight on the very first load this
  // session, hide children too - otherwise the table grid (and its own
  // loading skeleton) flashes on screen for a moment before the shift-check
  // resolves and swaps it out for the Open Shift modal, which looks like a
  // glitch right after login. Skipped on later tab navigations (see
  // hasCheckedShiftThisSession above) so each page's own skeleton loader
  // still shows normally when switching between Tables and My Sales.
  const showShiftChecking =
    isCashier && shiftLoading && !hasCheckedShiftThisSession;

  useEffect(() => {
    if (!shiftLoading) hasCheckedShiftThisSession = true;
  }, [shiftLoading]);
  const showStatusError =
    isCashier && !shiftLoading && shiftFetchError && !closeSummary;
  const showOpenGate =
    isCashier && !shiftLoading && !shiftFetchError && !shift && !closeSummary;

  return (
    <div
      style={getGradientBg()}
      className="min-h-screen bg-cover bg-center bg-no-repeat"
    >
      <div className="fixed inset-0 bg-black/50 pointer-events-none z-0" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <header
          style={glass}
          className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 mx-4 mt-4 px-6 py-3 rounded-[20px]"
        >
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Logo" className="w-9 h-9 object-contain" />
              <h1 className="text-white font-bold text-lg m-0 whitespace-nowrap hidden sm:block">
                Cashier POS
              </h1>
            </div>
            <nav className="flex items-center gap-1 bg-white/10 rounded-[12px] p-1">
              {NAV_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = location.pathname === tab.path;
                return (
                  <Link
                    key={tab.path}
                    to={tab.path}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-[9px] text-sm font-semibold no-underline transition-colors ${
                      active
                        ? "bg-white text-[#1a1a2e]"
                        : "text-white/70 hover:text-white"
                    }`}
                  >
                    <Icon
                      size={16}
                      color={active ? "#1a1a2e" : "currentColor"}
                      variant="Linear"
                    />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {isCashier && shift && (
              <button
                onClick={() => setShowCloseModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] border border-[#f39c12]/40 bg-[#f39c12]/15 hover:bg-[#f39c12]/25 text-[#f39c12] font-semibold text-[0.8rem] transition-colors cursor-pointer"
              >
                <MoneyRecive size={16} color="#f39c12" variant="Bold" />
                <span className="hidden md:inline">
                  Shift open since{" "}
                  {new Date(shift.opened_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="md:hidden">Close Shift</span>
              </button>
            )}
            <LangDropdown lang={lang} setLang={setLang} />
            <div className="w-[1px] h-[30px] bg-white/20" />
            <UserProfile user={user} />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#c0392b]/80 hover:bg-[#c0392b] text-white font-semibold text-sm transition-colors cursor-pointer"
            >
              <Logout size={18} color="white" variant="Linear" />
              <span>Logout</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {showShiftChecking ? (
            <>
              <style>{badgeFloatStyles}</style>
              <div className="flex items-center justify-center py-24">
                <span
                  className="spin-loader"
                  style={{ width: "28px", height: "28px" }}
                />
              </div>
            </>
          ) : showOpenGate || showStatusError ? null : (
            children
          )}
        </main>
      </div>

      {showStatusError && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-6 bg-black/60">
          <div
            style={glassCard}
            className="w-full max-w-[400px] rounded-[24px] p-7 text-white border border-white/15 text-center"
          >
            <div className="w-11 h-11 rounded-[12px] bg-[#c0392b]/20 flex items-center justify-center mx-auto mb-3">
              <Warning2 size={22} color="#e74c3c" variant="Bold" />
            </div>
            <h3 className="text-lg font-bold m-0 mb-1.5">
              Couldn't check your shift
            </h3>
            <p className="text-white/65 text-sm mb-5">
              We couldn't confirm whether you already have an open shift. Please
              check your connection and try again before selling.
            </p>
            <button
              onClick={refreshShift}
              className="btn-shine-blue w-full py-3 rounded-[12px] font-semibold text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {showOpenGate && (
        <OpenShiftModal
          opening={opening}
          onOpen={openShift}
          onLogout={handleLogout}
        />
      )}

      {showCloseModal && (
        <CloseShiftModal
          closing={closing}
          onCancel={() => setShowCloseModal(false)}
          onClose={async (payload) => {
            await closeShift(payload);
            setShowCloseModal(false);
          }}
        />
      )}

      {closeSummary && (
        <CloseSummaryModal
          summary={closeSummary}
          onDismiss={handleCloseSummaryDismiss}
        />
      )}
    </div>
  );
}

export default CashierLayout;
