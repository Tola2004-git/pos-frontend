import { glassCard, colors } from "../../utils/styles";
import { SkeletonInventoryTable } from "../ui/SkeletonInventory";
import { getStockStatus } from "../../utils/stockHelpers";
import restockIcon from "../../assets/icons/restock.png";
import { Gallery, Refresh2 } from "iconsax-react";

const HEADERS = [
  "#",
  "Image",
  "Product Name",
  "Category",
  "SKU",
  "QTY",
  "Barcode",
  "Stock Status",
  "Action",
];

export default function InventoryTable({
  products,
  loading,
  page,
  threshold,
  openRestock,
}) {
  return (
    <div
      style={{
        ...glassCard,
        borderRadius: "20px",
        overflow: "hidden",
        marginBottom: "16px",
      }}
    >
      <div className="table-scroll-x" style={{ overflowX: "auto" }}>
        <table
          className="min-w-[1000px]"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            {HEADERS.map((h) => (
              <th
                key={h}
                style={{
                  padding: "16px 14px",
                  textAlign: "left",
                  color: colors.whiteFull,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <SkeletonInventoryTable rows={8} />
          ) : products.length === 0 ? (
            <tr>
              <td
                colSpan={9}
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
            products.map((product, index) => {
              const status = getStockStatus(product.qty, threshold);
              return (
                <tr
                  key={product.id}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(255,255,255,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    style={{
                      padding: "12px 14px",
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    {(page - 1) * 10 + index + 1}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "10px",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
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
                        border: "1px solid #3498db",
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
                        color: status.color,
                        fontWeight: 700,
                        fontSize: "1rem",
                      }}
                    >
                      {product.qty}
                    </span>
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
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: status.color,
                        border: `1px solid ${status.border}`,
                      }}
                    >
                      {status.label}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px" }}>
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
                        type="button"
                        onClick={() => openRestock(product)}
                        style={{
                          padding: "6px",
                          borderRadius: "8px",
                          border: "none",
                          cursor: "pointer",
                          background: "transparent",
                          display: "flex",
                          alignItems: "center",
                        }}
                        className="duration-200 hover:scale-110 transition-transform"
                      >
                        <Refresh2 size="20" color="#fff" variant="bulk"/>
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
                        Restock
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
        </table>
      </div>
    </div>
  );
}
