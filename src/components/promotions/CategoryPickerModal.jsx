import { useState, useEffect } from "react";
import { AddCircle, SearchNormal1, TickCircle, Category2 } from "iconsax-react";
import { glass, glassCard } from "../../utils/styles";
import { createPortal } from "react-dom";
import { useCategories } from "../../hooks/useCategories";
import { SkeletonCategoryChips } from "../ui/SkeletonPromotion";

export default function CategoryPickerModal({
  open,
  selectedIds = [],
  onClose,
  onConfirm,
  t,
}) {
  const [search, setSearch] = useState("");
  const [picked, setPicked] = useState(new Set(selectedIds));
  const { categories, catLoading } = useCategories();
  const [isMounted, setIsMounted] = useState(open);
  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    if (!open) return;
    setPicked(new Set(selectedIds));
    setSearch("");
  }, [open, selectedIds]);

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

  // A category already assigned to this promotion stays selectable/visible
  // even if it's since been deactivated - otherwise editing an existing
  // category-scoped promotion would silently drop it from the list.
  const filtered = categories
    .filter((c) => c.status || picked.has(c.id))
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

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
            borderBottom: "1px solid var(--surface-tint-10)",
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
                color="currentColor"
                variant="Linear"
                className="text-white"
                style={{
                  width: 28,
                  height: 28,
                  animation: "float 2s ease-in-out infinite",
                }}
              />
              <h2
                style={{ color: "var(--accent-border-full)", fontSize: "1.5rem", fontWeight: 600 }}
              >
                {t.selectCategoriesTitle}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t.cancel}
              style={{
                background: "var(--surface-tint-10)",
                border: "none",
                color: "var(--accent-border-full)",
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
              background: "var(--surface-tint-05)",
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid var(--surface-tint-10)",
            }}
          >
            <SearchNormal1 size={18} color="currentColor" variant="Linear" className="text-white" />
            <input
              type="text"
              placeholder={t.searchCategoriesSimplePlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                marginLeft: 10,
                background: "transparent",
                border: "none",
                outline: "none",
                color: "var(--accent-border-full)",
                fontSize: "0.9rem",
              }}
            />
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
          {catLoading ? (
            <SkeletonCategoryChips count={6} />
          ) : filtered.length === 0 ? (
            <p style={{ color: "var(--accent-border-soft)", textAlign: "center" }}>
              {t.noCategoriesFoundMsg}
            </p>
          ) : (
            filtered.map((category) => {
              const checked = picked.has(category.id);
              return (
                <div
                  key={category.id}
                  onClick={() => toggle(category.id)}
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
                      : "1px solid var(--surface-tint-08)",
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
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--surface-tint-06)",
                    }}
                  >
                    <Category2 size={18} color="currentColor" variant="Linear" className="text-white" />
                  </div>
                  <span
                    style={{
                      color: "var(--accent-border-full)",
                      fontSize: "0.9rem",
                      fontWeight: 500,
                    }}
                  >
                    {category.name}
                    {!category.status ? ` - ${t.inactiveLabel}` : ""}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--surface-tint-10)",
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
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.9rem",
            }}
          >
            {t.cancel}
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
            {t.confirmCountMsg.replace("{n}", picked.size)}
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
