import { useState, useEffect } from "react";
import { AddCircle, Gallery, SearchNormal1, TickCircle } from "iconsax-react";
import { glass, glassCard } from "../../utils/styles";
import api from "../../api/productApi";
import { createPortal } from "react-dom";
import { useCategories } from "../../hooks/useCategories";
import {
  SkeletonProductPickerList,
  SkeletonCategoryChips,
} from "../ui/SkeletonPromotion";

export default function ProductPickerModal({
  open,
  selectedIds = [],
  onClose,
  onConfirm,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState(new Set(selectedIds));
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { categories, catLoading } = useCategories();
  const [isMounted, setIsMounted] = useState(open);
  const [isVisible, setIsVisible] = useState(open);

  const fetchProducts = async (category = categoryFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: 200 });
      if (category !== "all") params.set("category_id", category);
      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.data ?? res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setPicked(new Set(selectedIds));
    setSearch("");
    setCategoryFilter("all");
    fetchProducts("all");
  }, [open, selectedIds]);

  useEffect(() => {
    if (!open) return;
    fetchProducts(categoryFilter);
  }, [categoryFilter, open]);

  useEffect(() => {
    let timeout;
    if (open) {
      setIsMounted(true);
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
      timeout = setTimeout(() => setIsMounted(false), 300);
    }
    return () => clearTimeout(timeout);
  }, [open]);

  if (!isMounted) return null;

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (id) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return createPortal(
    <div
      style={{
        ...glassCard,
        position: "fixed",
        inset: 0,
        zIndex: 20000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        opacity: isVisible ? 1 : 0,
        animation: isVisible ? "confirm-fade-in 0.2s ease forwards" : "none",
        transition: "opacity 220ms ease",
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <div
        style={{
          ...glass,
          borderRadius: 24,
          width: "100%",
          maxWidth: 480,
          maxHeight: "95vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transform: isVisible ? "translateY(0)" : "translateY(24px)",
          opacity: isVisible ? 1 : 0,
          animation: isVisible
            ? "confirm-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
            : "none",
          transition: "transform 220ms ease, opacity 220ms ease",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <AddCircle
                size={28}
                color="white"
                variant="Linear"
                style={{
                  width: 28,
                  height: 28,
                  animation: "float 2s ease-in-out infinite",
                }}
              />
              <h2
                style={{ color: "white", fontSize: "1.5rem", fontWeight: 600 }}
              >
                Select Products
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "white",
                width: 36,
                height: 36,
                borderRadius: 18,
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(255,255,255,0.05)",
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <SearchNormal1 size={18} color="white" variant="Linear" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                marginLeft: 10,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "white",
                fontSize: "0.9rem",
              }}
            />
          </div>

          <div
            className="table-scroll-x"
            style={{
              display: "flex",
              overflowX: "auto",
              gap: 10,
              padding: "8px",
              marginTop: 6,
              WebkitOverflowScrolling: "touch",
            }}
          >
            {catLoading ? (
              <SkeletonCategoryChips count={5} />
            ) : (
              [{ id: "all", name: "All" }, ...categories].map((category) => {
                const active = categoryFilter === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setCategoryFilter(category.id)}
                    style={{
                      flexShrink: 0,
                      padding: "8px 14px",
                      borderRadius: 50,
                      border: active
                        ? "1px solid rgba(255,255,255,0.9)"
                        : "1px solid rgba(255,255,255,0.15)",
                      background: active
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(255,255,255,0.05)",
                      color: active ? "white" : "rgba(255,255,255,0.8)",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {category.name}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div
          className="thin-light-scrollbar"
          style={{
            flex: "none",
            overflowY: "auto",
            padding: "12px 16px",
            height: "380px",
          }}
        >
          {loading ? (
            <SkeletonProductPickerList rows={6} />
          ) : filtered.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
              No products found
            </p>
          ) : (
            filtered.map((product) => {
              const checked = picked.has(product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => toggle(product.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 12px",
                    marginBottom: 8,
                    borderRadius: 12,
                    cursor: "pointer",
                    border: checked
                      ? "1px solid rgba(14, 233, 36, 0.4)"
                      : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    readOnly
                    style={{ width: 16, height: 16, cursor: "pointer" }}
                  />
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 8,
                      overflow: "hidden",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <Gallery size={24} color="white" variant="Linear" />
                    )}
                  </div>
                  <span
                    style={{
                      color: "white",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                    }}
                  >
                    {product.name}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="btn-cancel-glass"
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              color: "white",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.9rem",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm([...picked])}
            className="btn-shine-blue"
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: "0.9rem",
            }}
          >
            <TickCircle size={18} color="white" variant="Linear" />
            Confirm ({picked.size})
          </button>
          <style>
            {`
              @keyframes confirm-fade-in {
                from { opacity: 0; }
                to   { opacity: 1; }
              }
              @keyframes confirm-pop {
                from { opacity: 0; transform: scale(0.95) translateY(20px); }
                to   { opacity: 1; transform: scale(1) translateY(0); }
              }
            `}
          </style>
        </div>
      </div>
    </div>,
    document.body,
  );
}
