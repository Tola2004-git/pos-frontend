import { useLocation } from "react-router-dom";
import { glass } from "../../utils/styles";
import { MENU_ITEMS } from "../../constants/menuConfig.jsx";
import { RiPaintBrushLine } from "react-icons/ri";
import LangDropdown from "./LangDropdown";
import UserProfile from "./UserProfile";
import { Brush } from "iconsax-react";

function Navbar({ t, lang, setLang, user, onOpenBgChanger }) {
  const location = useLocation();

  const currentMenu = MENU_ITEMS.find((m) => m.path === location.pathname);
  const pageTitle = currentMenu ? t[currentMenu.key] : t.dashboard;

  return (
    <header
      style={glass}
      className="sticky top-0 z-10 flex items-center justify-between px-[25px] py-[12px] rounded-[20px] mb-[30px]"
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
        <UserProfile user={user} />
      </div>
    </header>
  );
}

export default Navbar;
