import { useRef, useEffect, useState } from "react";
import { SearchNormal1 } from "iconsax-react";
import { glass, glassCard } from "../../utils/styles";

const ACTION_OPTIONS = [
  { value: "all", label: "All Actions" },
  { value: "add", label: "Add Stock" },
  { value: "remove", label: "Remove Stock" },
];

const inputStyle = {
  border: "none",
  background: "transparent",
  padding: "0",
  flex: 1,
  width: "100%",
  color: "white",
  fontSize: "0.9rem",
  outline: "none",
};

export function StockHistoryFilters({
  search,
  onSearch,
  actionFilter,
  onActionFilter,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "20px",
      }}
    >
      {/* Search */}
      <div
        style={{
          ...glass,
          borderRadius: "16px",
          padding: "14px 16px",
          flex: 1,
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <SearchNormal1 size={18} color="#fff" variant="outline" />
        <input
          type="text"
          placeholder="Search by product name..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          style={inputStyle}
        />
      </div>

      <div ref={dropdownRef} style={{ position: "relative" }}>
        <button
          onClick={() => setShowDropdown((v) => !v)}
          style={{
            ...glassCard,
            padding: "14px 18px",
            borderRadius: "16px",
            cursor: "pointer",
            color: "white",
            fontWeight: 600,
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            whiteSpace: "nowrap",
          }}
        >
          {ACTION_OPTIONS.find((a) => a.value === actionFilter)?.label}
          <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>
            {showDropdown ? "▲" : "▼"}
          </span>
        </button>

        <style>{`
          @keyframes dropdownFade {
            from { opacity: 0; transform: scale(0.95) translateY(-5px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {showDropdown && (
          <div
            style={{
              ...glassCard,
              position: "absolute",
              top: "110%",
              right: 0,
              borderRadius: "14px",
              zIndex: 99999,
              minWidth: "180px",
              boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
              overflow: "hidden",
              animation: "dropdownFade 0.2s ease",
              transformOrigin: "top right",
            }}
          >
            {ACTION_OPTIONS.map((a) => (
              <button
                key={a.value}
                onClick={() => {
                  onActionFilter(a.value);
                  setShowDropdown(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "11px 16px",
                  background:
                    actionFilter === a.value
                      ? "rgba(255,255,255,0.15)"
                      : "transparent",
                  border: "none",
                  cursor: "pointer",
                  color:
                    actionFilter === a.value
                      ? "#ffffff"
                      : "rgba(255,255,255,0.85)",
                  fontSize: "0.88rem",
                  fontWeight: actionFilter === a.value ? 700 : 400,
                  borderLeft:
                    actionFilter === a.value
                      ? "3px solid #ffffff"
                      : "3px solid transparent",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    actionFilter === a.value
                      ? "rgba(255,255,255,0.15)"
                      : "transparent";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {a.label}
                {actionFilter === a.value && (
                  <span style={{ marginLeft: "auto" }}>✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
