import { glass, glassCard } from "../../utils/styles";
import { SearchNormal1 } from "iconsax-react";

const ROLE_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "admin", label: "Admin" },
  { value: "cashier", label: "Cashier" },
];

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.1)",
  color: "white",
  fontSize: "0.9rem",
  outline: "none",
};

function UserSearch({
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
  showRoleDropdown,
  setShowRoleDropdown,
  dropdownRef,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "20px",
      }}
    >
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
        <SearchNormal1 size="20" color="#fff" variant="linear" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            ...inputStyle,
            border: "none",
            background: "transparent",
            padding: "0",
            flex: 1,
          }}
        />
      </div>

      <div ref={dropdownRef} style={{ position: "relative" }}>
        <button
          onClick={() => setShowRoleDropdown(!showRoleDropdown)}
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
          {ROLE_OPTIONS.find((r) => r.value === roleFilter)?.label ||
            "All Roles"}

          <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>
            {showRoleDropdown ? "▲" : "▼"}
          </span>
        </button>

        <style>{`
          @keyframes dropdownFade {
            from { opacity: 0; transform: scale(0.95) translateY(-5px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {showRoleDropdown && (
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
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => {
                  setRoleFilter(r.value);
                  setShowRoleDropdown(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "11px 16px",
                  background:
                    roleFilter === r.value
                      ? "rgba(255,255,255,0.15)"
                      : "transparent",
                  border: "none",
                  cursor: "pointer",
                  color:
                    roleFilter === r.value ? "#fff" : "rgba(255,255,255,0.85)",
                  fontSize: "0.88rem",
                  fontWeight: roleFilter === r.value ? 700 : 400,
                  borderLeft:
                    roleFilter === r.value
                      ? `3px solid #fff`
                      : "3px solid transparent",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    roleFilter === r.value
                      ? "rgba(255,255,255,0.15)"
                      : "transparent";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <span>{r.label}</span>
                {roleFilter === r.value && (
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

export default UserSearch;
