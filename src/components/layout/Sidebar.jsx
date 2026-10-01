import { Link, useLocation } from "react-router-dom";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { glassSidebar, colors } from "../../utils/styles";
import { MENU_GROUPS, MENU_ITEMS } from "../../constants/menuConfig.jsx";
import {
  LuChevronDown,
  LuLogOut,
  LuPanelLeftClose,
  LuPanelLeftOpen,
} from "react-icons/lu";
import logo from "../../assets/logo.png";

let lastSidebarScrollTop = 0;

function Tooltip({ tooltip, open }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [displayed, setDisplayed] = useState(null);

  useEffect(() => {
    let timeout;
    if (tooltip) {
      setDisplayed(tooltip);
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      timeout = setTimeout(() => setMounted(false), 150);
    }
    return () => clearTimeout(timeout);
  }, [tooltip]);

  if (!mounted || !displayed) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: displayed.left ?? Math.max(displayed.rect.right + 8, open ? 230 : 60),
        top: displayed.rect.top + displayed.rect.height / 2,
        transform: visible
          ? "translateY(-50%) translateX(0)"
          : "translateY(-50%) translateX(-4px)",
        background: "var(--tooltip-bg)",
        color: "var(--tooltip-text)",
        padding: "4px 10px",
        borderRadius: "6px",
        fontSize: "0.75rem",
        whiteSpace: "nowrap",
        pointerEvents: "none",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.2s ease, transform 0.2s ease",
        zIndex: 9999,
      }}
    >
      {displayed.label}
    </div>,
    document.body
  );
}

function Sidebar({ open, onToggle, onLogout, t }) {
  const location = useLocation();
  const [tooltip, setTooltip] = useState(null);
   const [activeFlyout, setActiveFlyout] = useState(null);
  const role = localStorage.getItem("role");
  const visibleMenuItems = MENU_ITEMS.filter(
    (menu) => !menu.roles || menu.roles.includes(role),
  );
  const activeGroup = visibleMenuItems.find(
    (menu) => menu.path === location.pathname,
  )?.group;
  const [expandedGroups, setExpandedGroups] = useState(() => {
    let savedGroups;
    try {
      savedGroups = JSON.parse(localStorage.getItem("sidebarExpandedGroups"));
    } catch {
      savedGroups = null;
    }

    const initialGroups = new Set(
      Array.isArray(savedGroups) ? savedGroups : ["dailyOperations"],
    );
    if (activeGroup) initialGroups.add(activeGroup);
    return initialGroups;
  });
  const menuGroups = MENU_GROUPS.map((group) => ({
    ...group,
    items: visibleMenuItems.filter((menu) => menu.group === group.key),
  })).filter((group) => group.items.length > 0);
  const navRef = useRef(null);
  const labelRefs = useRef({});
   const flyoutRef = useRef(null);
   const groupTriggerRefs = useRef({});
  useLayoutEffect(() => {
    if (navRef.current) navRef.current.scrollTop = lastSidebarScrollTop;
  }, []);
   useEffect(() => {
     if (!activeFlyout) return undefined;

     const handlePointerDown = (event) => {
       const trigger = groupTriggerRefs.current[activeFlyout.key];
       if (flyoutRef.current?.contains(event.target) || trigger?.contains(event.target)) {
         return;
       }
       setActiveFlyout(null);
     };
     const handleKeyDown = (event) => {
       if (event.key !== "Escape") return;
       setActiveFlyout(null);
       groupTriggerRefs.current[activeFlyout.key]?.focus();
     };

     document.addEventListener("pointerdown", handlePointerDown);
     document.addEventListener("keydown", handleKeyDown);
     return () => {
       document.removeEventListener("pointerdown", handlePointerDown);
       document.removeEventListener("keydown", handleKeyDown);
     };
   }, [activeFlyout]);
  const handleMouseEnter = (e, label) => {
    if (open) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({ label, rect, left: 60 });
  };
  const handleMouseLeave = () => {
    setTooltip(null);
  };
  const handleMenuMouseEnter = (e, menu) => {
    if (!open) {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({ label: t[menu.key], rect, left: 60 });
      return;
    }

    const labelElement = labelRefs.current[menu.path];
    if (!labelElement || labelElement.scrollWidth <= labelElement.clientWidth) {
      setTooltip(null);
      return;
    }

    const rect = labelElement.getBoundingClientRect();
    setTooltip({ label: t[menu.key], rect });
  };
  const toggleMenuGroup = (groupKey) => {
    setExpandedGroups((current) => {
      const next = new Set(current);
      if (next.has(groupKey)) next.delete(groupKey);
      else next.add(groupKey);
      localStorage.setItem("sidebarExpandedGroups", JSON.stringify([...next]));
      return next;
    });
  };
   const toggleGroupFlyout = (event, group) => {
     const rect = event.currentTarget.getBoundingClientRect();
     setTooltip(null);
     setActiveFlyout((current) => current?.key === group.key
       ? null
       : {
           key: group.key,
           top: Math.max(12, Math.min(rect.top, window.innerHeight - 300)),
         });
   };

  return (
    <>
      <style>{`
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
      <Tooltip tooltip={tooltip} open={open} />
       {activeFlyout && !open && (() => {
         const group = menuGroups.find((item) => item.key === activeFlyout.key);
         if (!group) return null;

         return createPortal(
           <div
             ref={flyoutRef}
             role="group"
             aria-label={t[group.labelKey]}
             className="sidebar-open sidebar-flyout"
             style={{
               position: "fixed",
               top: activeFlyout.top,
               left: 68,
               width: 248,
               maxHeight: "calc(100vh - 24px)",
               overflowY: "auto",
               background: "var(--sidebar-bg)",
               backdropFilter: "blur(20px)",
               WebkitBackdropFilter: "blur(20px)",
               border: "1px solid var(--surface-border)",
               borderRadius: 6,
               boxShadow: "0 8px 24px var(--shadow-color)",
               zIndex: 1100,
             }}
           >
             <div
               className="flex items-center gap-3 border-b border-white/15 px-4 py-3 text-sm font-semibold"
               style={{
                 color: "rgba(255,255,255,0.9)",
                 borderBottom: "1px solid rgba(255,255,255,0.7)",
               }}
             >
               <group.icon size={18} color="rgba(255,255,255,0.7)" />
               <span>{t[group.labelKey]}</span>
             </div>
             {group.items.map((menu) => {
               const Icon = menu.icon;
               const active = location.pathname === menu.path;

               return (
                 <Link
                   key={menu.path}
                   to={menu.path}
                  data-active={active}
                   aria-current={active ? "page" : undefined}
                   onClick={() => setActiveFlyout(null)}
                  className={`menu-item-link flex items-center gap-3 border-l-4 px-4 py-3.5 no-underline ${active ? "opacity-100" : "opacity-80 hover:opacity-100"}`}
                   style={{
                     borderLeftColor: active ? "#FFFFFF" : "transparent",
                    boxShadow: active
                      ? "inset 10px 0px 15px -10px rgba(255,255,255,0.2)"
                      : "none",
                    color: active ? "#FFFFFF" : "rgba(255,255,255,0.88)",
                   }}
                 >
                   <span className={`icon-wrapper flex items-center transition-all duration-500 ${active ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" : ""}`}>
                     <Icon
                       size={22}
                       color={active ? "#FFFFFF" : "rgba(255,255,255,0.6)"}
                     />
                   </span>
                   <span
                     className={`min-w-0 truncate font-medium transition-all duration-500 ${active ? "" : ""}`}
                     style={{
                       color: active ? "#FFFFFF" : "rgba(255,255,255,0.6)",
                      //  textShadow: active ? "0 0 10px rgba(255,255,255,0.5)" : "none",
                     }}
                   >
                     {t[menu.key]}
                   </span>
                 </Link>
               );
             })}
           </div>,
           document.body,
         );
       })()}
      <div
        style={{
          ...glassSidebar,
          width: open ? "230px" : "60px",
        }}
        className="theme-dark-surface fixed top-0 left-0 h-screen z-[1050] overflow-hidden flex flex-col transition-[width] duration-400 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]"
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
            onClick={() => {
              setActiveFlyout(null);
              onToggle();
            }}
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
            {open ? <LuPanelLeftClose size={22} /> : <LuPanelLeftOpen size={22} />}
          </button>
        </div>
        <nav
          ref={navRef}
          onScroll={(e) => { lastSidebarScrollTop = e.currentTarget.scrollTop; }}
          className={`flex-1 py-[15px] overflow-y-auto overflow-x-hidden thin-light-scrollbar ${open ? "sidebar-open" : "sidebar-closed"}`}
        >
          {menuGroups.map((group) => (
             <section key={group.key}>
               {!open && group.collapsible && (
                 <button
                   ref={(element) => {
                     groupTriggerRefs.current[group.key] = element;
                   }}
                   type="button"
                   aria-label={t[group.labelKey]}
                   aria-haspopup="true"
                   aria-expanded={activeFlyout?.key === group.key}
                   onClick={(event) => toggleGroupFlyout(event, group)}
                   onMouseEnter={(event) => handleMouseEnter(event, t[group.labelKey])}
                   onMouseLeave={handleMouseLeave}
                   data-active={activeGroup === group.key}
                   className={`menu-item-link flex h-[52px] w-full items-center justify-center border-l-4 bg-transparent cursor-pointer ${activeGroup === group.key ? "border-l-white text-white" : "border-l-transparent text-white/65"}`}
                 >
                   <span className={`icon-wrapper flex items-center transition-all duration-500 ${activeGroup === group.key
                     ? "drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse"
                     : ""
                   }`}>
                     <group.icon
                       size={22}
                       color={activeGroup === group.key ? "#FFFFFF" : "rgba(255,255,255,0.65)"}
                     />
                   </span>
                 </button>
               )}
              {group.collapsible && open && (
                <button
                  type="button"
                  aria-expanded={expandedGroups.has(group.key)}
                  aria-controls={`sidebar-group-${group.key}`}
                  onClick={() => toggleMenuGroup(group.key)}
                  className="flex w-full items-center justify-between border-0 bg-transparent px-[25px] py-2.5 text-left text-xs font-semibold text-white/55 transition-colors hover:text-white/85 cursor-pointer"
                >
                  <span>{t[group.labelKey]}</span>
                  <LuChevronDown
                    size={16}
                    color="currentColor"
                    style={{
                      transform: expandedGroups.has(group.key)
                        ? "rotate(0deg)"
                        : "rotate(-90deg)",
                      transition: "transform 180ms ease",
                    }}
                  />
                </button>
              )}
              <div
                id={`sidebar-group-${group.key}`}
                hidden={group.collapsible && open && !expandedGroups.has(group.key)}
              >
                {group.items.map((menu) => {
                  const active = location.pathname === menu.path;
                  const Icon = menu.icon;
                   if (!open && group.collapsible) return null;

                  return (
                    <div
                      key={menu.path}
                      onClick={(e) => e.stopPropagation()}
                      onMouseEnter={(e) => handleMenuMouseEnter(e, menu)}
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
                        className={`menu-item-link flex min-w-0 items-center gap-3 py-3.5 no-underline whitespace-nowrap border-l-4 ${open ? "px-[25px] justify-start" : "px-0 justify-center"
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
                            color={active ? "#FFFFFF" : "rgba(255,255,255,0.6)"}
                          />
                        </span>

                        {open && (
                          <span
                            ref={(element) => {
                              labelRefs.current[menu.path] = element;
                            }}
                            style={{
                              color: active ? "#FFFFFF" : "rgba(255,255,255,0.6)",
                              // textShadow: active
                              //   ? "0 0 10px rgba(255,255,255,0.5)"
                              //   : "none",
                            }}
                            className={`min-w-0 truncate font-medium transition-all duration-300 ${active ? "tracking-wide" : ""
                              }`}
                          >
                            {t[menu.key]}
                          </span>
                        )}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
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
              <LuLogOut size={22} />
            </span>
            {open && <span className="font-medium">{t.logout}</span>}
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;