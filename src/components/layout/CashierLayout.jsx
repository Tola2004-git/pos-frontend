import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import apiClient from "../../api/apiClient";
import { useTranslations } from "../../hooks/useTranslations";
import { useCashierShift, resetCashierShiftCache } from "../../hooks/useCashierShift";
import { useBackgroundChanger } from "../../hooks/useBackgroundChanger";
import { alertSuccess, alertConfirmWarning } from "../../utils/alert.jsx";
import { glass, glassCard } from "../../utils/styles";
import LangDropdown from "./LangDropdown";
import UserProfile from "./UserProfile";
import BackgroundChanger from "../BackgroundChanger";
import { getCachedUser, setCachedUser, clearCachedUser } from "../../utils/currentUserCache";
import { OpenShiftModal } from "../cashier/OpenShiftModal";
import { CloseShiftModal } from "../cashier/CloseShiftModal";
import { CashMovementModal } from "../cashier/CashMovementModal";
import { CloseSummaryModal } from "../cashier/CloseSummaryModal";
import { badgeFloatStyles } from "../cashier/cashierModalShared";
import {
  Logout,
  Grid3,
  ReceiptText,
  MoneyRecive,
  MoneySend,
  Warning2,
  Brush,
} from "iconsax-react";
import logo from "../../assets/logo.png";

const NAV_TABS = [
  { path: "/cashier", labelKey: "navTables", icon: Grid3 },
  { path: "/cashier/orders", labelKey: "navMySales", icon: ReceiptText },
];

let hasCheckedShiftThisSession = false;

function CashierLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, lang, setLang } = useTranslations();
  const [user, setUser] = useState(getCachedUser());
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [isCloseModalMounted, setIsCloseModalMounted] = useState(false);
  const [isCloseModalVisible, setIsCloseModalVisible] = useState(false);
  const [showCashMovementModal, setShowCashMovementModal] = useState(false);
  const [isCashMovementMounted, setIsCashMovementMounted] = useState(false);
  const [isCashMovementVisible, setIsCashMovementVisible] = useState(false);

  useEffect(() => {
    let timeout;
    if (showCloseModal) {
      setIsCloseModalMounted(true);
      requestAnimationFrame(() => setIsCloseModalVisible(true));
    } else {
      setIsCloseModalVisible(false);
      timeout = setTimeout(() => setIsCloseModalMounted(false), 300);
    }
    return () => clearTimeout(timeout);
  }, [showCloseModal]);

  useEffect(() => {
    let timeout;
    if (showCashMovementModal) {
      setIsCashMovementMounted(true);
      requestAnimationFrame(() => setIsCashMovementVisible(true));
    } else {
      setIsCashMovementVisible(false);
      timeout = setTimeout(() => setIsCashMovementMounted(false), 300);
    }
    return () => clearTimeout(timeout);
  }, [showCashMovementModal]);

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
    addCashMovement,
    recordingMovement,
  } = useCashierShift();

  const {
    bgStyle,
    isBgChangerMounted,
    isBgChangerVisible,
    openBgChanger,
    closeBgChanger,
    applyBg,
    selected,
    customUrl,
    previewUpload,
    bgPresets,
    handleSelectPreset,
    handleImageUpload,
    handleCustomUrlChange,
    handleOverlayOpacityChange,
    overlayOpacity,
    compressing,
    uploadError,
  } = useBackgroundChanger(
    () => {},
    () => {},
  );

  useEffect(() => {
    let active = true;
    apiClient
      .get("/me")
      .then((res) => {
        setCachedUser(res.data);
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
    hasCheckedShiftThisSession = false;
    clearCachedUser();
    resetCashierShiftCache();
    navigate("/login");
  };

  const confirmLogout = async () => {
    const result = await alertConfirmWarning(
      t.logoutConfirmTitle,
      t.logoutConfirmMsg,
      t.logoutConfirmBtn,
      t.cancel,
    );
    if (result.isConfirmed) handleLogout();
  };

  const handleCloseSummaryDismiss = () => {
    dismissCloseSummary();
    handleLogout();
  };

  const isCashier = localStorage.getItem("role") === "cashier";
  const showShiftChecking =
    isCashier && shiftLoading && !hasCheckedShiftThisSession;

  useEffect(() => {
    if (!shiftLoading) hasCheckedShiftThisSession = true;
  }, [shiftLoading]);
  const showStatusError =
    isCashier && !shiftLoading && shiftFetchError && !closeSummary;
  const showOpenGate =
    isCashier && !shiftLoading && !shiftFetchError && !shift && !closeSummary;

  const [isOpenGateMounted, setIsOpenGateMounted] = useState(false);
  const [isOpenGateVisible, setIsOpenGateVisible] = useState(false);
  useEffect(() => {
    let timeout;
    if (showOpenGate) {
      setIsOpenGateMounted(true);
      requestAnimationFrame(() => setIsOpenGateVisible(true));
    } else {
      setIsOpenGateVisible(false);
      timeout = setTimeout(() => setIsOpenGateMounted(false), 300);
    }
    return () => clearTimeout(timeout);
  }, [showOpenGate]);

  const [isCloseSummaryMounted, setIsCloseSummaryMounted] = useState(false);
  const [isCloseSummaryVisible, setIsCloseSummaryVisible] = useState(false);
  const [localCloseSummary, setLocalCloseSummary] = useState(null);
  useEffect(() => {
    let timeout;
    if (closeSummary) {
      setLocalCloseSummary(closeSummary);
      setIsCloseSummaryMounted(true);
      requestAnimationFrame(() => setIsCloseSummaryVisible(true));
    } else {
      setIsCloseSummaryVisible(false);
      timeout = setTimeout(() => setIsCloseSummaryMounted(false), 300);
    }
    return () => clearTimeout(timeout);
  }, [closeSummary]);

  return (
    <div
      style={bgStyle}
      className="min-h-screen bg-cover bg-center bg-no-repeat transition-all duration-500"
    >
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: `rgba(0,0,0,${overlayOpacity})` }}
      />
      {isBgChangerMounted && (
        <BackgroundChanger
          visible={isBgChangerVisible}
          onClose={closeBgChanger}
          onApply={applyBg}
          selected={selected}
          customUrl={customUrl}
          previewUpload={previewUpload}
          bgPresets={bgPresets}
          handleSelectPreset={handleSelectPreset}
          handleImageUpload={handleImageUpload}
          handleCustomUrlChange={handleCustomUrlChange}
          compressing={compressing}
          uploadError={uploadError}
          overlayOpacity={overlayOpacity}
          onOverlayOpacityChange={handleOverlayOpacityChange}
          t={t}
        />
      )}
      <div className="relative z-10 flex flex-col min-h-screen">
        <header
          style={glass}
          className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-2 md:gap-3 mx-2 sm:mx-4 mt-2 sm:mt-4 px-3 sm:px-4 md:px-6 py-2.5 md:py-3 rounded-[20px]"
        >
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src={logo} alt="Logo" className="w-9 h-9 object-contain shrink-0" />
              <h1 className="text-white font-bold text-lg m-0 whitespace-nowrap hidden sm:block">
                The Temple Sourdough
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
                    className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-[9px] text-sm font-semibold no-underline whitespace-nowrap transition-colors ${
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
                    <span className="hidden lg:inline">{t[tab.labelKey]}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 md:gap-3">
            {isCashier && shift && (
              <button
                onClick={() => setShowCashMovementModal(true)}
                className="flex items-center gap-2 px-2.5 md:px-3.5 py-2 rounded-[10px] border border-[#8b5cf6]/40 bg-[#8b5cf6]/15 hover:bg-[#8b5cf6]/25 text-[#8b5cf6] font-semibold text-[0.8rem] whitespace-nowrap transition-colors cursor-pointer"
              >
                <MoneySend size={16} color="#8b5cf6" variant="Bold" />
                <span className="hidden xl:inline">{t.cashInOutBtn}</span>
              </button>
            )}
            {isCashier && shift && (
              <button
                onClick={() => setShowCloseModal(true)}
                className="flex items-center gap-2 px-2.5 md:px-3.5 py-2 rounded-[10px] border border-[#f39c12]/40 bg-[#f39c12]/15 hover:bg-[#f39c12]/25 text-[#f39c12] font-semibold text-[0.8rem] whitespace-nowrap transition-colors cursor-pointer"
              >
                <MoneyRecive size={16} color="#f39c12" variant="Bold" />
                <span className="hidden xl:inline">
                  {t.shiftOpenSince}{" "}
                  {new Date(shift.opened_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span className="xl:hidden">{t.closeShiftBtn}</span>
              </button>
            )}
            <button
              onClick={openBgChanger}
              className="btn-shine-blue flex items-center gap-[6px] px-2.5 md:px-3.5 py-2 rounded-[10px] text-[0.8rem] font-semibold whitespace-nowrap transition-transform active:scale-95"
            >
              <Brush size={16} color="white" variant="Linear" />
              <span className="hidden xl:inline">{t.backgroundBtn}</span>
            </button>
            <LangDropdown lang={lang} setLang={setLang} />
            <div className="hidden sm:block w-[1px] h-[30px] bg-white/20" />
            <UserProfile user={user} t={t} />
            <button
              onClick={confirmLogout}
              className="theme-dark-surface flex items-center gap-2 px-3 md:px-4 py-2 rounded-[10px] bg-[#c0392b]/80 hover:bg-[#c0392b] text-white font-semibold text-sm whitespace-nowrap transition-colors cursor-pointer"
            >
              <Logout size={18} color="white" variant="Linear" />
              <span className="hidden sm:inline">{t.logoutBtn}</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-y-auto thin-light-scrollbar">
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
              {t.shiftCheckErrorTitle}
            </h3>
            <p className="text-white/65 text-sm mb-5">
              {t.shiftCheckErrorMsg}
            </p>
            <button
              onClick={refreshShift}
              className="btn-shine-blue w-full py-3 rounded-[12px] font-semibold text-sm"
            >
              {t.retry}
            </button>
          </div>
        </div>
      )}

      {isOpenGateMounted && (
        <OpenShiftModal
          visible={isOpenGateVisible}
          opening={opening}
          onOpen={openShift}
          onLogout={handleLogout}
          t={t}
        />
      )}

      {isCashMovementMounted && (
        <CashMovementModal
          visible={isCashMovementVisible}
          recording={recordingMovement}
          onCancel={() => setShowCashMovementModal(false)}
          onSubmit={async (payload) => {
            await addCashMovement(payload);
            setShowCashMovementModal(false);
            alertSuccess(
              payload.type === "cash_in" ? t.cashInRecorded : t.cashOutRecorded,
              t.cashMovementRecordedDesc,
            );
          }}
          t={t}
        />
      )}

      {isCloseModalMounted && (
        <CloseShiftModal
          visible={isCloseModalVisible}
          closing={closing}
          onCancel={() => setShowCloseModal(false)}
          onClose={async (payload) => {
            await closeShift(payload);
            setShowCloseModal(false);
          }}
          t={t}
        />
      )}

      {isCloseSummaryMounted && (
        <CloseSummaryModal
          visible={isCloseSummaryVisible}
          summary={localCloseSummary}
          onDismiss={handleCloseSummaryDismiss}
          t={t}
        />
      )}
    </div>
  );
}

export default CashierLayout;
