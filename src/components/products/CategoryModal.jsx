import { RiCloseLine } from "react-icons/ri";
import { glassCard, glass, colors } from "../../utils/styles";
import { SkeletonCategoryList } from "../ui/SkeletonProduct";
import { Edit, Trash, AddCircle, TickCircle, Category2, Tag } from "iconsax-react";

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
}) {
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
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              color: colors.whiteFull,
              fontWeight: 700,
              margin: 0,
              display: "flex",
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
              <Category2 size="24" color="#fff" variant="bulk" />
            </div>
            Categories
          </h3>
          <button
            onClick={onClose}
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
        <div style={{ marginBottom: "24px" }}>
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
            <Tag size="20" color="#fff" variant="outline" style={{position: 'absolute', left: '12px', pointerEvents: 'none', zIndex: 1}}/>
            <input
              style={{ ...inputStyle, flex: 1, paddingLeft: "40px" }}
              placeholder="Category name..."
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
                  {editCat ? "Saving..." : "Adding..."}
                </>
              ) : (
                <>
                  {editCat ? (
                    <TickCircle size="20" color="#fff" variant="bold" />
                  ) : (
                    <AddCircle size="20" color="#fff" variant="bold" />
                  )}
                  {editCat ? "Save" : "Add"}
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
            No categories yet
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
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.querySelector(".tooltip").style.opacity =
                        1)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.querySelector(".tooltip").style.opacity =
                        0)
                    }
                  >
                    <button
                      onClick={() => {
                        setEditCat(cat);
                        setCatForm({ name: cat.name, status: cat.status });
                      }}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      className="duration-200 hover:scale-110 transition-transform"
                    >
                      <Edit size="20" color="#fff" variant="outline" />
                    </button>
                    <div
                      className="tooltip"
                      style={{
                        position: "absolute",
                        bottom: "110%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "rgba(20,28,35,0.95)",
                        color: "white",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                        opacity: 0,
                        transition: "opacity 0.2s",
                      }}
                    >
                      Edit Category
                    </div>
                  </div>
                  {/* Delete */}
                  <div
                    style={{ position: "relative", display: "inline-block" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.querySelector(".tooltip").style.opacity =
                        1)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.querySelector(".tooltip").style.opacity =
                        0)
                    }
                  >
                    <button
                      onClick={() => onDelete(cat.id)}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      className="duration-200 hover:scale-110 transition-transform"
                    >
                      <Trash size="20" color="#fff" variant="outline" />
                    </button>
                    <div
                      className="tooltip"
                      style={{
                        position: "absolute",
                        bottom: "110%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "rgba(20,28,35,0.95)",
                        color: "white",
                        padding: "4px 10px",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                        opacity: 0,
                        transition: "opacity 0.2s",
                      }}
                    >
                      Delete Category
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CategoryModal;
