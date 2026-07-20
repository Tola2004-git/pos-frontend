import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslations } from "../../hooks/useTranslations";
import { useBackgroundChanger } from "../../hooks/useBackgroundChanger";
import apiClient from "../../api/apiClient";
import { SidebarContext } from "../../App";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import BackgroundChanger from "../BackgroundChanger";

function Layout({ children }) {
  const navigate = useNavigate();
  const { t, lang, setLang } = useTranslations();
  const { sidebarOpen, toggleSidebar: handleToggle } = useContext(SidebarContext);
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
    compressing,
    uploadError,
  } = useBackgroundChanger(
    () => { },
    () => { },
  );

  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await apiClient.get("/me");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchMe();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <div
      style={bgStyle}
      className="min-h-screen bg-cover bg-center bg-no-repeat transition-all duration-500"
    >
      <div className="fixed inset-0 bg-black/50 pointer-events-none z-0" />
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
          t={t}
        />
      )}
      <div className="relative z-10 flex min-h-screen">
        <Sidebar
          open={sidebarOpen}
          onToggle={handleToggle}
          onLogout={handleLogout}
          t={t}
        />
        <div
          className={`flex-1 min-w-0 overflow-x-hidden p-[30px] min-h-screen transition-all duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1)] ${sidebarOpen ? "ml-[230px]" : "ml-[60px]"
            }`}
        >
          <Navbar
            t={t}
            lang={lang}
            setLang={setLang}
            user={user}
            onOpenBgChanger={openBgChanger}
          />
          <main className="mt-4">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default Layout;
