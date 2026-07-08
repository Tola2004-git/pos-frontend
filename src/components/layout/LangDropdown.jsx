import { useState } from "react";
import { glassCard, colors } from "../../utils/styles";

const LANGS = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "kh", label: "ខ្មែរ", flag: "🇰🇭" },
];

function LangDropdown({ lang, setLang }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (code) => {
    setLang(code);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        style={glassCard}
        className="flex items-center gap-[6px] px-[14px] py-[7px] rounded-[10px] cursor-pointer font-bold text-[0.8rem] text-white border-none transition-all duration-300"
      >
        {lang === "en" ? "🇺🇸" : "🇰🇭"} {lang.toUpperCase()} ▾
      </button>
      {open && (
        <div className="absolute top-[110%] right-0 z-[99999] min-w-[140px] overflow-hidden rounded-[12px] border border-white/15 bg-[#1e272e]/95 backdrop-blur-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
          {LANGS.map((l) => {
            const active = lang === l.code;
            return (
              <button
                key={l.code}
                onClick={() => handleSelect(l.code)}
                style={{ color: active ? colors.gold : "white" }}
                className={`
                  flex items-center gap-[10px] w-full px-4 py-[10px] border-none cursor-pointer text-[0.85rem] transition-colors duration-200
                  ${active ? "bg-[#f1c40f]/15 font-semibold" : "bg-transparent font-normal"}
                  hover:bg-white/10
                `}
              >
                <span className="text-[1.2rem]">{l.flag}</span>
                <span>{l.label}</span>
                {active && <span className="ml-auto">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default LangDropdown;
