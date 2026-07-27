import { useContext, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { SidebarContext } from "../../App";
import { glass } from "../../utils/styles";
import { MENU_ITEMS } from "../../constants/menuConfig.jsx";
import { RiPaintBrushLine } from "react-icons/ri";
import LangDropdown from "./LangDropdown";
import UserProfile from "./UserProfile";
import { Brush } from "iconsax-react";

function Navbar({ t, lang, setLang, user, onOpenBgChanger }) {
  const location = useLocation();
  const { sidebarOpen } = useContext(SidebarContext);
  const headerRef = useRef(null);

  const currentMenu = MENU_ITEMS.find((m) => m.path === location.pathname);
  const pageTitle = currentMenu ? t[currentMenu.key] : t.dashboard;

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const updateHeight = () => {
      document.documentElement.style.setProperty(
        "--navbar-height",
        `${el.offsetHeight}px`,
      );
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <header
      ref={headerRef}
      style={glass}
      className={`no-print fixed top-[30px] right-[30px] z-30 flex items-center justify-between px-[25px] py-[12px] rounded-[20px] transition-[left] duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1)] ${
        sidebarOpen ? "left-[260px]" : "left-[90px]"
      }`}
    >
      <h5 className="m-0 text-white font-bold text-lg">{pageTitle}</h5>
      <div className="flex items-center gap-[10px]">
        <button
          onClick={onOpenBgChanger}
          className="btn-shine-blue flex items-center gap-[6px] px-4 py-2 rounded-[10px] text-[0.85rem] font-semibold transition-transform active:scale-95"
        >
          <Brush size={18} color="white" variant="Linear" />
          <span>{t.background}</span>
        </button>
        <LangDropdown lang={lang} setLang={setLang} />
        <div className="w-[1px] h-[30px] bg-white/20" />
        <UserProfile user={user} t={t} />
      </div>
    </header>
  );
}

export default Navbar;
