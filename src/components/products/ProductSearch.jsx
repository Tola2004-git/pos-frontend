import { useRef, useState, useEffect } from "react";
import { glass, glassCard, colors } from "../../utils/styles";
import { SearchNormal1 } from "iconsax-react";

function ProductSearch({ search, setSearch, categoryFilter, setCategoryFilter, categories, setPage }) {
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCategoryFilter(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
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
        <SearchNormal1 size="20" color="#fff" variant="Linear" />
        <input
          type="text"
          placeholder="Search by name, SKU, barcode..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
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
          onClick={() => setShowCategoryFilter(!showCategoryFilter)}
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
          {categoryFilter === "all"
            ? "All Categories"
            : categories.find((c) => c.id == categoryFilter)?.name || "Category"}
          <span style={{ fontSize: "0.7rem", opacity: 0.7 }}>
            {showCategoryFilter ? "▲" : "▼"}
          </span>
        </button>

        <style>{`
          @keyframes dropdownFade {
            from { opacity: 0; transform: scale(0.95) translateY(-5px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {showCategoryFilter && (
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
            {[{ id: "all", name: "All Categories" }, ...categories].map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setCategoryFilter(c.id);
                  setShowCategoryFilter(false);
                  setPage(1);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "11px 16px",
                  background: categoryFilter == c.id ? "rgba(255,255,255,0.15)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: categoryFilter == c.id ? colors.white : "rgba(255,255,255,0.85)",
                  fontSize: "0.88rem",
                  fontWeight: categoryFilter == c.id ? 700 : 400,
                  borderLeft: categoryFilter == c.id ? `3px solid ${colors.white}` : "3px solid transparent",
                  transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    categoryFilter == c.id ? "rgba(255,255,255,0.15)" : "transparent";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                {c.name}
                {categoryFilter == c.id && <span style={{ marginLeft: "auto" }}>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductSearch;