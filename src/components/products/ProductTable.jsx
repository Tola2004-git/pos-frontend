import { colors, glassCard } from "../../utils/styles";
import { SkeletonProductTable } from "../ui/SkeletonProduct";
import { Edit, Trash, Gallery } from "iconsax-react";

function ProductTable({ products, loading, page, onEdit, onDelete }) {
  return (
    <div
      style={{
        ...glassCard,
        borderRadius: "20px",
        overflow: "hidden",
        marginBottom: "16px",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            {[
              "#",
              "Image",
              "Name",
              "Category",
              "SKU",
              "QTY",
              "Price",
              "Barcode",
              "Status",
              "Actions",
            ].map((h) => (
              <th
                key={h}
                style={{
                  padding: "16px 14px",
                  textAlign: "left",
                  color: colors.whiteFull,
                  fontWeight: 600,
                  fontSize: "1.2rem",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonProductTable rows={8} />
          ) : products.length === 0 ? (
            <tr>
              <td
                colSpan={10}
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                No products found
              </td>
            </tr>
          ) : (
            products.map((product, index) => (
              <tr
                key={product.id}
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.05)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <td
                  style={{
                    padding: "12px 14px",
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "0.85rem",
                  }}
                >
                  {(page - 1) * 10 + index + 1}
                </td>
                <td style={{ padding: "12px 14px" }}>
                  {product.image ? (
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "10px",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          objectPosition: "top",
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.2rem",
                      }}
                    >
                      <Gallery size="30" color="#fff" variant="bulk"/>
                    </div>
                  )}
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    color: "white",
                    fontWeight: 500,
                  }}
                >
                  {product.name}
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "20px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "#3498db",
                      border: "#3498db 1px solid",
                    }}
                  >
                    {product.category?.name || "N/A"}
                  </span>
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "0.85rem",
                  }}
                >
                  {product.sku || "N/A"}
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <span
                    style={{
                      color:
                        product.qty <= 5
                          ? "#e74c3c"
                          : product.qty <= 20
                            ? colors.whiteFull
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
                    color: colors.whiteFull,
                    fontWeight: 600,
                  }}
                >
                  ${Number(product.price).toFixed(2)}
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "0.85rem",
                  }}
                >
                  {product.barcode || "N/A"}
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: "20px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: product.status ? "#2ecc71" : "#e74c3c",
                      border: `1px solid ${product.status ? "#2ecc71" : "#e74c3c"}`,
                    }}
                  >
                    {product.status ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <div
                      style={{ position: "relative", display: "inline-block" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.querySelector(
                          ".tooltip",
                        ).style.opacity = 1)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.querySelector(
                          ".tooltip",
                        ).style.opacity = 0)
                      }
                    >
                      <button
                        onClick={() => onEdit(product)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "8px",
                          border: "none",
                          cursor: "pointer",
                          background: "transparent",
                          display: "flex",
                          alignItems: "center",
                        }}
                        className="duration-200 hover:scale-110 transition-transform"
                      >
                        <Edit size="20" color="#fff" variant="Outline"/>
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
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        Edit Product
                      </div>
                    </div>
                    <div
                      style={{ position: "relative", display: "inline-block" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.querySelector(
                          ".tooltip",
                        ).style.opacity = 1)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.querySelector(
                          ".tooltip",
                        ).style.opacity = 0)
                      }
                    >
                      <button
                        onClick={() => onDelete(product.id)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "8px",
                          border: "none",
                          cursor: "pointer",
                          background: "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        className="duration-200 hover:scale-110 transition-transform"
                      >
                        <Trash size="20" color="#fff" variant="outline"/>
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
                        Delete Product
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProductTable;
