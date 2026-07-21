import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { glassSidebar, colors } from "../../utils/styles";
import { MENU_ITEMS } from "../../constants/menuConfig.jsx";
import { HambergerMenu, Logout } from "iconsax-react";
import logo from "../../assets/logo.png";

// Every page wraps itself in its own <Layout>, so Sidebar remounts on every
// navigation (see currentUserCache.js for the same issue with user data).
// A remounted <nav> is a brand-new DOM node with scrollTop reset to 0, which
// reads as "the sidebar jumped back to the top" right after clicking an item
// near the bottom. Remembering the last scroll offset at module scope
// survives the remount so it can be restored before the next paint.
let lastSidebarScrollTop = 0;

function Tooltip({ label, targetRect }) {
  if (!label || !targetRect) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: targetRect.right + 8,
        top: targetRect.top + targetRect.height / 2,
        transform: "translateY(-50%)",
        background: "rgba(20,28,35,0.95)",
        color: "white",
        padding: "6px 12px",
        borderRadius: "6px",
        fontSize: "0.8rem",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        border: "1px solid rgba(255,255,255,0.1)",
        zIndex: 9999,
        animation: "tooltipFadeIn 0.15s ease",
      }}
    >
      {label}
    </div>,
    document.body
  );
}

function Sidebar({ open, onToggle, onLogout, t }) {
  const location = useLocation();
  const [tooltip, setTooltip] = useState(null);
  const role = localStorage.getItem("role");
  const visibleMenuItems = MENU_ITEMS.filter(
    (menu) => !menu.roles || menu.roles.includes(role),
  );
  const navRef = useRef(null);

  // Runs before the browser paints, so the restored offset never flashes at
  // the top first.
  useLayoutEffect(() => {
    if (navRef.current) navRef.current.scrollTop = lastSidebarScrollTop;
  }, []);
  const handleMouseEnter = (e, label) => {
    if (open) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ label, rect });
  };
  const handleMouseLeave = () => {
    setTooltip(null);
  };

  return (
    <>
      <style>{`
        @keyframes tooltipFadeIn {
          from { opacity: 0; transform: translateY(-50%) translateX(-4px); }
          to   { opacity: 1; transform: translateY(-50%) translateX(0); }
        }

        .menu-item-link {
          transition: 
            background 300ms ease,
            box-shadow 300ms ease,
            transform 300ms ease,
            border-radius 300ms ease;
        }
        
        .menu-item-link .icon-wrapper {
          transition: transform 250ms ease;
        }

        .menu-item-link:hover .icon-wrapper {
          transform: scale(1.1);
        }

        .sidebar-open .menu-item-link:not([data-active="true"]):hover {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.12) 0%,
            rgba(255, 255, 255, 0.04) 100%
          );
          box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.1);
        }

        .sidebar-closed .menu-item-link:not([data-active="true"]):hover {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.12) 0%,
            rgba(255, 255, 255, 0.04) 100%
          );
          box-shadow: inset 0 0 12px rgba(255, 255, 255, 0.1);
        }
      `}</style>
      <Tooltip label={tooltip?.label} targetRect={tooltip?.rect} />
      <div
        style={{
          ...glassSidebar,
          width: open ? "230px" : "60px",
        }}
        className="fixed top-0 left-0 h-screen z-[1050] overflow-hidden flex flex-col transition-[width] duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
      >
        <div
          className={`relative flex items-center border-b border-white/15 h-[85px] group transition-all duration-300 ${open ? "px-5 justify-between" : "justify-center px-0"
            }`}
        >
          <div className={`flex items-center gap-3 ${open ? "min-w-0 flex-1" : ""}`}>
            <img
              src={logo}
              alt="Logo"
              className={`w-[35px] h-[35px] object-contain flex-shrink-0 transition-all duration-300 ${!open ? "group-hover:opacity-0 group-hover:scale-75" : ""
                }`}
            />
            {open && (
              <h1
                style={{ color: colors.whiteFull }}
                title="The Temple Sourdough"
                className="font-bold text-sm m-0 truncate"
              >
                The Temple Sourdough
              </h1>
            )}
          </div>
          <button
            onClick={onToggle}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltip({
                label: open ? t.closeSidebarTooltip : t.openSidebarTooltip,
                rect,
              });
            }}
            onMouseLeave={handleMouseLeave}
            className={`bg-transparent border-none text-white cursor-pointer flex items-center flex-shrink-0 hover:opacity-80 transition-all duration-300 ${open
              ? "relative opacity-100 visible"
              : "absolute opacity-0 invisible scale-75 group-hover:opacity-100 group-hover:visible group-hover:scale-100"
              }`}
          >
            <HambergerMenu size={24} color="white" variant="Linear" />
          </button>
        </div>
        <nav
          ref={navRef}
          onScroll={(e) => { lastSidebarScrollTop = e.currentTarget.scrollTop; }}
          className={`flex-1 py-[15px] overflow-y-auto overflow-x-hidden thin-light-scrollbar ${open ? "sidebar-open" : "sidebar-closed"}`}
        >
          {visibleMenuItems.map((menu) => {
            const active = location.pathname === menu.path;
            const Icon = menu.icon;

            return (
              <div
                key={menu.path}
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={(e) => handleMouseEnter(e, t[menu.key])}
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  to={menu.path}
                  data-active={active}
                  style={{
                    borderLeftColor: active ? "#FFFFFF" : "transparent",
                    boxShadow: active
                      ? "inset 10px 0px 15px -10px rgba(255, 255, 255, 0.2)"
                      : "none",
                  }}
                  className={`menu-item-link flex items-center gap-3 py-3.5 no-underline whitespace-nowrap border-l-4 ${open ? "px-[25px] justify-start" : "px-0 justify-center"
                    } ${active ? "opacity-100" : "opacity-80 hover:opacity-100"}`}
                >
                  <span
                    className={`icon-wrapper flex items-center transition-all duration-500 ${active
                      ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse"
                      : ""
                      }`}
                  >
                    <Icon
                      size={22}
                      variant={active ? "TwoTone" : "Linear"}
                      color={active ? "#FFFFFF" : "rgba(255,255,255,0.6)"}
                    />
                  </span>

                  {open && (
                    <span
                      style={{
                        color: active ? "#FFFFFF" : "rgba(255,255,255,0.6)",
                        textShadow: active
                          ? "0 0 10px rgba(255,255,255,0.5)"
                          : "none",
                      }}
                      className={`font-medium transition-all duration-300 ${active ? "tracking-wide" : ""
                        }`}
                    >
                      {t[menu.key]}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>
        <div className="border-t border-white/15 py-[15px]">
          <button
            onClick={onLogout}
            onMouseEnter={(e) => handleMouseEnter(e, t.logout)}
            onMouseLeave={handleMouseLeave}
            className={`flex items-center gap-3 w-full py-3.5 bg-transparent border-none text-[#e74c3c] cursor-pointer text-base whitespace-nowrap hover:bg-white/5 duration-300 transition-colors ${open ? "px-[25px] justify-start" : "px-0 justify-center"
              }`}
          >
            <span className="icon-wrapper flex items-center">
              <Logout size={22} color="#e74c3c" variant="Linear" />
            </span>
            {open && <span className="font-medium">{t.logout}</span>}
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;