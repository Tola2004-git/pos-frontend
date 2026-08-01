import { glassCard } from "../../utils/styles";
import { SkeletonIngredientTable } from "../ui/SkeletonIngredients";
import { getStockStatus } from "../../utils/stockHelpers";
import { Edit, Trash, Refresh2, Cake } from "iconsax-react";
import { Tooltip } from "../ui/Tooltip";

export default function IngredientsTable({
  ingredients,
  loading,
  page,
  onEdit,
  onDelete,
  onRestock,
  deletingId,
  t,
}) {
  const COLUMNS = [
    "#",
    t.ingColName,
    t.productColCategory,
    t.ingColUnit,
    t.ingColQuantity,
    t.ingColCostUnit,
    t.ingColExpiry,
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
            <tr style={{ borderBottom: "1px solid var(--surface-tint-10)" }}>
              {COLUMNS.map((h, hIndex) => (
                <th
                  key={h}
                  style={{
                    padding: "16px 14px",
                    textAlign: hIndex === 1 ? "left" : "center",
                    color: "var(--accent-border-full)",
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
                  colSpan={10}
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "var(--accent-border-soft)",
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
                      color="var(--accent-border-soft)"
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
                      borderBottom: "1px solid var(--surface-tint-05)",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--surface-tint-05)")
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
                    <td
                      style={{
                        padding: "12px 14px",
                        color: "var(--accent-border-full)",
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
                        color: "var(--accent-border-soft)",
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
                        color: "var(--accent-border-full)",
                        fontWeight: 600,
                      }}
                    >
                      ${Number(ingredient.cost_per_unit).toFixed(2)}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>
                      {ingredient.expiry_date ? (
                        <span
                          style={{
                            padding: "3px 10px",
                            borderRadius: "20px",
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            color: ingredient.is_expired
                              ? "#e74c3c"
                              : ingredient.is_expiring_soon
                                ? "#f39c12"
                                : "var(--accent-border-soft)",
                            border: `1px solid ${
                              ingredient.is_expired
                                ? "#e74c3c"
                                : ingredient.is_expiring_soon
                                  ? "#f39c12"
                                  : "var(--surface-border)"
                            }`,
                          }}
                        >
                          {ingredient.is_expired
                            ? t.ingredientExpiredBadge
                            : ingredient.is_expiring_soon
                              ? t.ingredientExpiringSoonBadge
                              : ingredient.expiry_date.slice(0, 10)}
                        </span>
                      ) : (
                        <span style={{ color: "var(--accent-border-soft)" }}>
                          {t.naLabel}
                        </span>
                      )}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        textAlign: "center",
                        color: "var(--accent-border-soft)",
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
                            <Refresh2
                              size="20"
                              color="currentColor"
                              variant="bulk"
                              className="text-white"
                            />
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
                            <Edit
                              size="20"
                              color="currentColor"
                              variant="Linear"
                              className="text-white"
                            />
                          </button>
                        </Tooltip>
                        <Tooltip label={t.deleteAction}>
                          <button
                            onClick={() => onDelete(ingredient.id)}
                            disabled={deletingId === ingredient.id}
                            className="duration-200 hover:scale-110 transition-transform"
                            style={{
                              padding: "6px",
                              borderRadius: "8px",
                              border: "none",
                              cursor: deletingId === ingredient.id ? "not-allowed" : "pointer",
                              background: "transparent",
                              display: "flex",
                              alignItems: "center",
                              opacity: deletingId === ingredient.id ? 0.6 : 1,
                            }}
                          >
                            {deletingId === ingredient.id ? (
                              <svg className="animate-spin" width="20" height="20" viewBox="0 0 18 18" fill="none">
                                <circle cx="9" cy="9" r="7" stroke="var(--surface-border)" strokeWidth="2" />
                                <path d="M9 2 A7 7 0 0 1 16 9" stroke="var(--accent-border-full)" strokeWidth="2" strokeLinecap="round" />
                              </svg>
                            ) : (
                              <Trash
                                size="20"
                                color="currentColor"
                                variant="Linear"
                                className="text-white"
                              />
                            )}
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
