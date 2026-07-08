import { glassCard, colors } from "../../utils/styles";

const FILTERS = [
  { key: "all", label: "All Stock" },
  { key: "in_stock", label: "In Stock" },
  { key: "low_stock", label: "Low Stock" },
  { key: "out_of_stock", label: "Out of Stock" },
];

export default function StockFilterDropdown({
  stockDropdownRef,
  stockFilter,
  setStockFilter,
  setPage,
  showFilterDropdown,
  setShowFilterDropdown,
}) {
  return (
    <div ref={stockDropdownRef} style={{ position: "relative" }}>
      <button
        onClick={() => setShowFilterDropdown(!showFilterDropdown)}
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
        {FILTERS.find((f) => f.key === stockFilter)?.label || "All Stock"}
        <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>
          {showFilterDropdown ? "▲" : "▼"}
        </span>
      </button>

      <style>{`
          @keyframes dropdownFade {
            from { opacity: 0; transform: scale(0.95) translateY(-5px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

      {showFilterDropdown && (
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
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setStockFilter(f.key);
                setShowFilterDropdown(false);
                setPage(1);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                padding: "11px 16px",
                background:
                  stockFilter === f.key
                    ? "rgba(255,255,255,0.15)"
                    : "transparent",
                border: "none",
                cursor: "pointer",
                color:
                  stockFilter === f.key
                    ? colors.whiteFull
                    : "rgba(255,255,255,0.85)",
                fontSize: "0.88rem",
                fontWeight: stockFilter === f.key ? 700 : 400,
                borderLeft:
                  stockFilter === f.key
                    ? `3px solid ${colors.whiteFull}`
                    : "3px solid transparent",
                transition: "all 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  stockFilter === f.key
                    ? "rgba(255,255,255,0.15)"
                    : "transparent";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {f.label}
              {stockFilter === f.key && (
                <span style={{ marginLeft: "auto" }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
