import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { glassCard, colors } from "../../utils/styles";
import flagUs from "flag-icons/flags/4x3/us.svg";
import flagKh from "flag-icons/flags/4x3/kh.svg";

const LANGS = [
  { code: "en", label: "English", flagSrc: flagUs },
  { code: "kh", label: "ខ្មែរ", flagSrc: flagKh },
];

function Flag({ src, width = 20, height = 15 }) {
  return (
    <img
      src={src}
      alt=""
      width={width}
      height={height}
      className="shrink-0 object-cover"
      style={{
        borderRadius: 3,
        boxShadow: "0 0 0 1px rgba(255,255,255,0.25)",
      }}
    />
  );
}

function LangDropdown({ lang, setLang }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  const updatePosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();

    const handleClickOutside = (e) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        panelRef.current &&
        !panelRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  const handleSelect = (code) => {
    setLang(code);
    setOpen(false);
  };

  const currentFlagSrc = lang === "en" ? flagUs : flagKh;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        style={glassCard}
        className="flex items-center gap-[8px] px-[14px] py-[7px] rounded-[10px] cursor-pointer font-bold text-[0.8rem] text-white border-none transition-all duration-300"
      >
        <Flag src={currentFlagSrc} width={20} height={15} />
        {lang.toUpperCase()} ▾
      </button>
      <style>{`
          @keyframes dropdownFade {
            from { opacity: 0; transform: scale(0.95) translateY(-5px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>
      {open &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              ...glassCard,
              position: "fixed",
              top: pos.top,
              right: pos.right,
              borderRadius: "14px",
              zIndex: 99999,
              minWidth: "160px",
              boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
              overflow: "hidden",
              animation: "dropdownFade 0.2s ease",
              transformOrigin: "top right",
            }}
          >
            {LANGS.map(({ code, label, flagSrc }) => {
              const active = lang === code;
              return (
                <button
                  key={code}
                  onClick={() => handleSelect(code)}
                  style={{ color: active ? colors.white : "white" }}
                  className={`
                    flex items-center gap-[10px] w-full px-4 py-[10px] border-none cursor-pointer text-[0.85rem] transition-colors duration-200
                    ${active ? "bg-white/5 font-semibold" : "bg-transparent font-normal"}
                    hover:bg-white/10
                  `}
                >
                  <Flag src={flagSrc} width={22} height={16} />
                  <span>{label}</span>
                  {active && <span className="ml-auto">✓</span>}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}

export default LangDropdown;
