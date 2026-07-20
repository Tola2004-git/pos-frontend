import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { RiCloseLine } from "react-icons/ri";
import { glassCard, glass, colors } from "../../utils/styles";
import { SkeletonCategoryList } from "../ui/SkeletonProduct";
import { Edit, Trash, AddCircle, TickCircle, Category2, Tag } from "iconsax-react";

function IconButtonWithTooltip({ icon, label, onClick }) {
  const [show, setShow] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);

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
        onMouseEnter={handleEnter}
        onMouseLeave={() => setShow(false)}
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        className="duration-200 hover:scale-110 transition-transform"
      >
        {icon}
      </button>
      {show &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              transform: "translate(-50%, -100%)",
              background: "rgba(20,28,35,0.95)",
              color: "white",
              padding: "4px 10px",
              borderRadius: "6px",
              fontSize: "0.75rem",
              whiteSpace: "nowrap",
              pointerEvents: "none",
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
  onSubmit,
  onDelete,
  onToggleStatus,
  onClose,
  resetCatForm,
  t,
}) {
  // Lock background page scroll while the modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

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
        {/* Header */}
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
              color: colors.whiteFull,
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
              <Category2 size={28} color="white" variant="Linear" />
            </div>
            {t.categoriesAction}
          </h3>
          <button
            onClick={onClose}
            aria-label={t.cancel}
            style={{
              border: "none",
              color: "white",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              cursor: "pointer",
              background: "rgba(255,255,255,0.1)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Add / Edit Form */}
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
            <Tag size={20} color="white" variant="Linear" style={{position: 'absolute', left: '12px', pointerEvents: 'none', zIndex: 1}}/>
            <input
              style={{ ...inputStyle, flex: 1, paddingLeft: "40px" }}
              placeholder={t.categoryNamePlaceholder}
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
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
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.1)",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                <RiCloseLine size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Category List */}
        <div className="hide-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
        {catModalLoading || catLoading ? (
          <SkeletonCategoryList rows={5} />
        ) : categories.length === 0 ? (
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
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
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <span style={{ color: "white", fontWeight: 500 }}>
                  {cat.name}
                </span>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  {/* Toggle Status */}
                  <div
                    onClick={() => onToggleStatus(cat)}
                    style={{
                      width: "38px",
                      height: "20px",
                      borderRadius: "10px",
                      background: cat.status
                        ? "#2ecc71"
                        : "rgba(255,255,255,0.2)",
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
                  {/* Edit */}
                  <IconButtonWithTooltip
                    icon={<Edit size={20} color="white" variant="Linear" />}
                    label={t.editAction}
                    onClick={() => {
                      setEditCat(cat);
                      setCatForm({ name: cat.name, status: cat.status });
                    }}
                  />
                  {/* Delete */}
                  <IconButtonWithTooltip
                    icon={<Trash size={20} color="white" variant="Linear" />}
                    label={t.deleteAction}
                    onClick={() => onDelete(cat.id)}
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
