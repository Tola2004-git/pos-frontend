import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RiCloseLine } from "react-icons/ri";
import { glassCard, glass, accentBorder } from "../../utils/styles";
import { SkeletonCategoryList } from "../ui/SkeletonProduct";
import { Edit, Trash, AddCircle, TickCircle, Category2, Tag } from "iconsax-react";

function IconButtonWithTooltip({ icon, label, onClick, disabled = false }) {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);

  useEffect(() => {
    let timeout;
    if (show) {
      setMounted(true);
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
      timeout = setTimeout(() => setMounted(false), 150);
    }
    return () => clearTimeout(timeout);
  }, [show]);

  const handleEnter = () => {
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.top - 8, left: rect.left + rect.width / 2 });
    setShow(true);
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={handleEnter}
        onMouseLeave={() => setShow(false)}
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          border: "none",
          background: "transparent",
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.6 : 1,
        }}
        className={disabled ? "" : "duration-200 hover:scale-110 transition-transform"}
      >
        {icon}
      </button>
      {mounted &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              transform: visible
                ? "translate(-50%, -100%)"
                : "translate(-50%, calc(-100% + 4px))",
              background: "var(--tooltip-bg)",
              color: "var(--tooltip-text)",
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "0.75rem",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              opacity: visible ? 1 : 0,
              transition: "opacity 0.2s ease, transform 0.2s ease",
              zIndex: 20000,
            }}
          >
            {label}
          </div>,
          document.body,
        )}
    </>
  );
}

function CategoryModal({
  categories,
  catLoading,
  catModalLoading,
  editCat,
  setEditCat,
  catForm,
  setCatForm,
  catError,
  catSubmitting,
  deletingCatId,
  onSubmit,
  onDelete,
  onToggleStatus,
  onClose,
  resetCatForm,
  t,
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const [nameFocused, setNameFocused] = useState(false);

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "10px",
    border: nameFocused
      ? `1px solid ${accentBorder.soft}`
      : "1px solid var(--surface-border)",
    color: "var(--accent-border-full)",
    fontSize: "0.9rem",
    outline: "none",
    transition: "border 0.2s",
  };

  return (
    <div
      style={{
        ...glass,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          ...glassCard,
          borderRadius: "24px",
          padding: "32px",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            flexShrink: 0,
          }}
        >
          <h3
            style={{
              color: accentBorder.full,
              fontWeight: 700,
              fontSize: "1.5rem",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                animation: "float 3s ease-in-out infinite",
              }}
            >
              <Category2 size={28} color="currentColor" variant="Linear" />
            </div>
            {t.categoriesAction}
          </h3>
          <button
            onClick={onClose}
            aria-label={t.cancel}
            style={{
              border: "none",
              color: "var(--accent-border-full)",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              cursor: "pointer",
              background: "var(--surface-tint-10)",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ marginBottom: "24px", flexShrink: 0 }}>
          {catError && (
            <div
              style={{
                background: "rgba(192,57,43,0.3)",
                border: "1px solid rgba(192,57,43,0.5)",
                color: "#ff6b6b",
                padding: "8px 12px",
                borderRadius: "8px",
                marginBottom: "12px",
                fontSize: "0.82rem",
              }}
            >
              {catError}
            </div>
          )}
          <div style={{ position: 'relative', alignItems: "center", display: "flex", gap: "10px" }}>
            <Tag size={20} color="currentColor" variant="Linear" className="text-white" style={{position: 'absolute', left: '12px', pointerEvents: 'none', zIndex: 1}}/>
            <input
              style={{ ...inputStyle, flex: 1, paddingLeft: "40px" }}
              placeholder={t.categoryNamePlaceholder}
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
            />
            <button
              onClick={onSubmit}
              disabled={catSubmitting}
              className="btn-shine-blue"
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "0.9rem",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                opacity: catSubmitting ? 0.8 : 1,
                cursor: catSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {catSubmitting ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 18 18"
                    style={{ animation: "spin 0.8s linear infinite" }}
                  >
                    <circle
                      cx="9"
                      cy="9"
                      r="7"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                    />
                    <path
                      d="M9 2 A7 7 0 0 1 16 9"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  {editCat ? t.savingAction : t.catAddingAction}
                </>
              ) : (
                <>
                  {editCat ? (
                    <TickCircle size="22" color="#fff" variant="outline" />
                  ) : (
                    <AddCircle size="22" color="#fff" variant="outline" />
                  )}
                  {editCat ? t.saveAction : t.catAddAction}
                </>
              )}
            </button>
            {editCat && (
              <button
                onClick={resetCatForm}
                style={{
                  padding: "10px",
                  borderRadius: "10px",
                  border: "1px solid var(--surface-border)",
                  background: "var(--surface-tint-10)",
                  color: "var(--accent-border-full)",
                  cursor: "pointer",
                }}
              >
                <RiCloseLine size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
        {catModalLoading || catLoading ? (
          <SkeletonCategoryList rows={5} />
        ) : categories.length === 0 ? (
          <p
            style={{
              color: accentBorder.soft,
              textAlign: "center",
              padding: "20px",
            }}
          >
            {t.noCategoriesYetMsg}
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {categories.map((cat) => (
              <div
                key={cat.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: glassCard.border,
                  boxShadow: glassCard.boxShadow,
                }}
              >
                <span style={{ color: "var(--accent-border-full)", fontWeight: 500 }}>
                  {cat.name}
                </span>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div
                    onClick={() => onToggleStatus(cat)}
                    style={{
                      width: "38px",
                      height: "20px",
                      borderRadius: "10px",
                      background: cat.status
                        ? "#2ecc71"
                        : "var(--surface-tint-15)",
                      cursor: "pointer",
                      position: "relative",
                      transition: "background 0.3s",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "2px",
                        left: cat.status ? "20px" : "2px",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: "white",
                        transition: "left 0.3s",
                      }}
                    />
                  </div>
                  <IconButtonWithTooltip
                    icon={<Edit size={20} color="currentColor" variant="Linear" className="text-white" />}
                    label={t.editAction}
                    onClick={() => {
                      setEditCat(cat);
                      setCatForm({ name: cat.name, status: cat.status });
                    }}
                  />
                  <IconButtonWithTooltip
                    icon={
                      deletingCatId === cat.id ? (
                        <svg className="animate-spin" width="20" height="20" viewBox="0 0 18 18" fill="none">
                          <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                          <path d="M9 2 A7 7 0 0 1 16 9" stroke="white" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      ) : (
                        <Trash size={20} color="currentColor" variant="Linear" className="text-white" />
                      )
                    }
                    label={t.deleteAction}
                    onClick={() => onDelete(cat.id)}
                    disabled={deletingCatId === cat.id}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default CategoryModal;
