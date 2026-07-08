import { SearchNormal1 } from "iconsax-react";
import { glass, glassCard } from "../../utils/styles";
import { inputStyle, STATUS_FILTER_OPTIONS } from "../../constants/promotionConstants.js";

export default function PromotionFilter({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  showFilter,
  setShowFilter,
  filterRef,
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        marginBottom: 20,
        alignItems: "center",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          ...glass,
          borderRadius: "16px",
          padding: "14px 16px",
          gap: "12px",
        }}
      >
        <SearchNormal1 size={20} color="#fff" variant="Linear" />
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={onSearchChange}
          style={{
            ...inputStyle,
            border: "none",
            background: "transparent",
            padding: "0",
            flex: 1,
          }}
        />
      </div>

      <div ref={filterRef} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setShowFilter((value) => !value)}
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
          {STATUS_FILTER_OPTIONS.find((opt) => opt.value === statusFilter)
            ?.label || "All Status"}
          <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>
            {showFilter ? "▲" : "▼"}
          </span>
        </button>

        <style>{`
          @keyframes dropdownFade {
            from { opacity: 0; transform: scale(0.95) translateY(-5px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {showFilter && (
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
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onStatusChange(opt.value);
                  setShowFilter(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "11px 16px",
                  background:
                    statusFilter === opt.value
                      ? "rgba(255,255,255,0.15)"
                      : "transparent",
                  border: "none",
                  cursor: "pointer",
                  color:
                    statusFilter === opt.value
                      ? "rgba(255,255,255,1)"
                      : "rgba(255,255,255,0.85)",
                  fontSize: "0.88rem",
                  fontWeight: statusFilter === opt.value ? 700 : 400,
                  borderLeft:
                    statusFilter === opt.value
                      ? "3px solid rgba(255,255,255,1)"
                      : "3px solid transparent",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  if (statusFilter !== opt.value) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <span>{opt.label}</span>
                {statusFilter === opt.value && (
                  <span style={{ marginLeft: "auto", fontWeight: "bold" }}>
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
