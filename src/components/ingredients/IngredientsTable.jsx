import { glassCard } from "../../utils/styles";
import { SkeletonIngredientTable } from "../ui/SkeletonIngredients";
import { getStockStatus } from "../../utils/stockHelpers";
import { Edit, Trash, Refresh2, Cake } from "iconsax-react";

function Tooltip({ label, children }) {
  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={(e) =>
        (e.currentTarget.querySelector(".tooltip").style.opacity = 1)
      }
      onMouseLeave={(e) =>
        (e.currentTarget.querySelector(".tooltip").style.opacity = 0)
      }
    >
      {children}
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
        {label}
      </div>
    </div>
  );
}

export default function IngredientsTable({
  ingredients,
  loading,
  page,
  onEdit,
  onDelete,
  onRestock,
  t,
}) {
  const COLUMNS = [
    "#",
    t.ingColName,
    t.productColCategory,
    t.ingColUnit,
    t.ingColQuantity,
    t.ingColCostUnit,
    t.ingColSupplier,
    t.productColStatus,
    t.productColActions,
  ];

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
              {COLUMNS.map((h, hIndex) => (
                <th
                  key={h}
                  style={{
                    padding: "16px 14px",
                    textAlign: hIndex === 1 ? "left" : "center",
                    color: "#ffffff",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonIngredientTable rows={8} />
            ) : ingredients.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Cake
                      size={60}
                      color="rgba(255,255,255,0.5)"
                      variant="Bulk"
                    />
                    {t.noIngredientsFoundMsg}
                  </div>
                </td>
              </tr>
            ) : (
              ingredients.map((ingredient, index) => {
                const status = getStockStatus(
                  Number(ingredient.quantity),
                  Number(ingredient.low_stock_threshold),
                  t,
                );
                return (
                  <tr
                    key={ingredient.id}
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
                        textAlign: "center",
                        color: "rgba(255,255,255,0.5)",
                      }}
                    >
                      {(page - 1) * 10 + index + 1}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        color: "white",
                        fontWeight: 500,
                      }}
                    >
                      {ingredient.name}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
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
                        {ingredient.category?.name || t.naLabel}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        textAlign: "center",
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {ingredient.unit}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      <span
                        style={{
                          color: status.color,
                          fontWeight: 700,
                          fontSize: "1rem",
                        }}
                      >
                        {Number(ingredient.quantity)}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        textAlign: "center",
                        color: "white",
                        fontWeight: 600,
                      }}
                    >
                      ${Number(ingredient.cost_per_unit).toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        textAlign: "center",
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {ingredient.supplier || t.naLabel}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
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
                        style={{
                          display: "flex",
                          gap: "10px",
                          justifyContent: "center",
                        }}
                      >
                        <Tooltip label={t.restockAction}>
                          <button
                            onClick={() => onRestock(ingredient)}
                            className="duration-200 hover:scale-110 transition-transform"
                            style={{
                              padding: "6px",
                              borderRadius: "8px",
                              border: "none",
                              cursor: "pointer",
                              background: "transparent",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Refresh2 size="20" color="#fff" variant="bulk" />
                          </button>
                        </Tooltip>
                        <Tooltip label={t.editAction}>
                          <button
                            onClick={() => onEdit(ingredient)}
                            className="duration-200 hover:scale-110 transition-transform"
                            style={{
                              padding: "6px",
                              borderRadius: "8px",
                              border: "none",
                              cursor: "pointer",
                              background: "transparent",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Edit size="20" color="#fff" variant="Linear" />
                          </button>
                        </Tooltip>
                        <Tooltip label={t.deleteAction}>
                          <button
                            onClick={() => onDelete(ingredient.id)}
                            className="duration-200 hover:scale-110 transition-transform"
                            style={{
                              padding: "6px",
                              borderRadius: "8px",
                              border: "none",
                              cursor: "pointer",
                              background: "transparent",
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <Trash size="20" color="#fff" variant="Linear" />
                          </button>
                        </Tooltip>
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
