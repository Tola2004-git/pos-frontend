import { useState, useRef, useEffect } from "react";
import { RiSearchLine } from "react-icons/ri";
import { glass, glassCard, colors } from "../../utils/styles";
import { SearchNormal1 } from "iconsax-react";

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.0)",
  backdropFilter: "blur(25px)",
  WebkitBackdropFilter: "blur(25px)",
  color: "white",
  fontSize: "0.9rem",
  outline: "none",
};

const STATUS_OPTIONS = ["all", "completed", "pending", "cancelled", "refunded"];
const STATUS_LABELS = {
  all: "All Status",
  completed: "Completed",
  pending: "Pending",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default function OrdersFilter({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        marginBottom: "20px",
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          ...glass,
          borderRadius: "16px",
          padding: "12px 16px",
          flex: 1,
          minWidth: "200px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <SearchNormal1 size={20} color="#fff" variant="bulk" />
        <input
          type="text"
          placeholder="Search by order#, customer..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            ...inputStyle,
            border: "none",
            background: "transparent",
            padding: "0",
            flex: 1,
          }}
        />
      </div>

      <input
        type="date"
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
        style={{
          ...inputStyle,
          width: "auto",
          padding: "12px 14px",
          borderRadius: "16px",
          colorScheme: "dark",

        }}
      />

      <input
        type="date"
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
        style={{
          ...inputStyle,
          width: "auto",
          padding: "12px 14px",
          borderRadius: "16px",
          colorScheme: "dark",
        }}
      />

      <div ref={dropdownRef} style={{ position: "relative" }}>
        <button
          onClick={() => setShowDropdown((v) => !v)}
          style={{
            ...glassCard,
            padding: "12px 18px",
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
          {statusFilter === "all" ? "All Status" : STATUS_LABELS[statusFilter]}
          <span style={{ fontSize: "0.7rem" }}>{showDropdown ? "▲" : "▼"}</span>
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
              minWidth: "160px",
              boxShadow: "0 15px 40px rgba(0,0,0,0.5)",
              overflow: "hidden",
              animation: "dropdownFade 0.2s ease",
              transformOrigin: "top right",
            }}
          >
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  onStatusChange(s);
                  setShowDropdown(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "11px 16px",
                  background:
                    statusFilter === s
                      ? "rgba(255,255,255,0.15)"
                      : "transparent",
                  border: "none",
                  cursor: "pointer",
                  color:
                    statusFilter === s
                      ? colors.white
                      : "rgba(255,255,255,0.85)",
                  fontSize: "0.88rem",
                  fontWeight: statusFilter === s ? 700 : 400,
                  textAlign: "left",
                  borderLeft:
                    statusFilter === s
                      ? `3px solid ${colors.white}`
                      : "3px solid transparent",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    statusFilter === s
                      ? "rgba(255,255,255,0.15)"
                      : "transparent";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
