import { useState } from "react";
import { glassCard } from "../../utils/styles";
import { SkeletonProductTable } from "../ui/SkeletonProduct";
import { Edit, Trash, Gallery, Cake } from "iconsax-react";
import { Tooltip } from "../ui/Tooltip";

function ProductImagePlaceholder() {
  return (
    <div
      style={{
        width: "44px",
        height: "44px",
        borderRadius: "10px",
        background: "var(--surface-tint-06)",
        border: "1px solid var(--surface-tint-10)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Gallery size={22} color="currentColor" variant="Bulk" className="text-white" />
    </div>
  );
}

function ProductImage({ image, name }) {
  const [failed, setFailed] = useState(false);

  if (!image || failed) {
    return <ProductImagePlaceholder />;
  }

  return (
    <div
      style={{
        width: "44px",
        height: "44px",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      <img
        src={image}
        alt={name}
        onError={() => setFailed(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          objectPosition: "top",
        }}
      />
    </div>
  );
}

function ProductTable({ products, loading, page, onEdit, onDelete, onRecipe, deletingId, t }) {
  const COLUMNS = [
    "#",
    t.productColImage,
    t.productColName,
    t.productColCategory,
    t.productColSku,
    t.productColQty,
    t.productColPrice,
    t.productColBarcode,
    t.productColStatus,
    t.productColActions,
  ];

  if (loading) {
    return (
      <div style={{ ...glassCard, borderRadius: 16, overflow: "hidden", marginBottom: "16px" }}>
        <div className="table-scroll-x" style={{ overflowX: "auto" }}>
          <table
            className="min-w-[1100px]"
            style={{ width: "100%", borderCollapse: "collapse", color: "var(--accent-border-full)", fontSize: "0.85rem" }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid var(--surface-tint-12)",
                  background: "var(--surface-tint-05)",
                }}
              >
                {COLUMNS.map((col, colIndex) => (
                  <th
                    key={col}
                    style={{
                      padding: "12px 14px",
                      textAlign: colIndex === 2 ? "left" : "center",
                      fontWeight: 600,
                      color: "var(--accent-border-full)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <SkeletonProductTable rows={8} />
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div
        style={{
          ...glassCard,
          borderRadius: 16,
          padding: "48px 24px",
          textAlign: "center",
          color: "var(--accent-border-soft)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          marginBottom: "16px",
        }}
      >
        <Gallery size={80} color="currentColor" variant="Linear" />
        {t.noProductsFoundMsg}
      </div>
    );
  }

  return (
    <div style={{ ...glassCard, borderRadius: 16, overflow: "hidden", marginBottom: "16px" }}>
      <div className="table-scroll-x" style={{ overflowX: "auto" }}>
        <table
          className="min-w-[1100px]"
          style={{ width: "100%", borderCollapse: "collapse", color: "var(--accent-border-full)", fontSize: "0.85rem" }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid var(--surface-tint-12)",
                background: "var(--surface-tint-05)",
              }}
            >
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  style={{
                    padding: "12px 14px",
                    textAlign: col === "Name" ? "left" : "center",
                    fontWeight: 600,
                    color: "var(--accent-border-full)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={product.id}
                style={{
                  height: "64px",
                  borderBottom: "1px solid var(--surface-tint-06)",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--surface-tint-05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <td
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    color: "var(--accent-border-soft)",
                  }}
                >
                  {(page - 1) * 10 + index + 1}
                </td>
                <td style={{ padding: "12px 14px", textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <ProductImage image={product.image} name={product.name} />
                  </div>
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    textAlign: "left",
                    color: "var(--accent-border-full)",
                    fontWeight: 500,
                  }}
                >
                  <div className="block max-w-[180px] truncate" title={product.name}>
                    {product.name}
                  </div>
                </td>
                <td style={{ padding: "12px 14px", textAlign: "center" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      padding: "6px 12px",
                      borderRadius: 999,
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#3498db",
                      background: "rgba(52,152,219,0.12)",
                    }}
                  >
                    {product.category?.name || t.naLabel}
                  </span>
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    color: "var(--accent-border-soft)",
                  }}
                >
                  {product.sku || t.naLabel}
                </td>
                <td style={{ padding: "12px 14px", textAlign: "center" }}>
                  <span
                    style={{
                      color:
                        product.qty <= 5
                          ? "#e74c3c"
                          : product.qty <= 20
                            ? "var(--accent-border-full)"
                            : "#2ecc71",
                      fontWeight: 600,
                    }}
                  >
                    {product.qty}
                  </span>
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    color: "var(--accent-border-full)",
                    fontWeight: 600,
                  }}
                >
                  ${Number(product.price).toFixed(2)}
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    textAlign: "center",
                    color: "var(--accent-border-soft)",
                  }}
                >
                  {product.barcode || t.naLabel}
                </td>
                <td style={{ padding: "12px 14px", textAlign: "center" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "6px 12px",
                      borderRadius: 999,
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: product.status ? "#2ecc71" : "#e74c3c",
                      background: product.status
                        ? "rgba(46,204,113,0.12)"
                        : "rgba(231,76,60,0.12)",
                    }}
                  >
                    {product.status ? t.activeLabel : t.inactiveLabel}
                  </span>
                </td>
                <td style={{ padding: "12px 14px", textAlign: "center" }}>
                  <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                    <Tooltip label={t.editAction}>
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="duration-200 hover:scale-110 transition-transform"
                        style={{
                          border: "none",
                          borderRadius: 8,
                          cursor: "pointer",
                          background: "transparent",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        <Edit size={20} color="currentColor" variant="Linear" className="text-white" />
                      </button>
                    </Tooltip>
                    {onRecipe && (
                      <Tooltip label={t.recipeAction}>
                        <button
                          type="button"
                          onClick={() => onRecipe(product)}
                          className="duration-200 hover:scale-110 transition-transform"
                          style={{
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer",
                            background: "transparent",
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                        >
                          <Cake size={20} color="currentColor" variant="Linear" className="text-white" />
                        </button>
                      </Tooltip>
                    )}
                    <Tooltip label={t.deleteAction}>
                      <button
                        type="button"
                        onClick={() => onDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="duration-200 hover:scale-110 transition-transform"
                        style={{
                          border: "none",
                          borderRadius: 8,
                          cursor: deletingId === product.id ? "not-allowed" : "pointer",
                          background: "transparent",
                          display: "inline-flex",
                          alignItems: "center",
                          opacity: deletingId === product.id ? 0.6 : 1,
                        }}
                      >
                        {deletingId === product.id ? (
                          <svg className="animate-spin" width="20" height="20" viewBox="0 0 18 18" fill="none">
                            <circle cx="9" cy="9" r="7" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                            <path d="M9 2 A7 7 0 0 1 16 9" stroke="white" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        ) : (
                          <Trash size={20} color="currentColor" variant="Linear" className="text-white" />
                        )}
                      </button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ProductTable;
