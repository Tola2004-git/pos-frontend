import { ArrowDown, ArrowUp } from "iconsax-react";
import { glassCard } from "../../utils/styles";
import { SkeletonStockTable } from "../ui/SkeletonInventory";

const INCREASE_ACTIONS = ["add", "cancel_restore"];
const ACTION_LABELS = {
  add: "Add",
  remove: "Remove",
  sale: "Sale",
  cancel_restore: "Restored",
};

const HEADERS = [
  "#",
  "Product",
  "Action",
  "Qty",
  "Before",
  "After",
  "Supplier",
  "Note",
  "By",
  "Date",
];

export function StockHistoryTable({ logs, loading, page }) {
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
          className="min-w-[1100px]"
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
                  color: "#ffffff",
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
            <SkeletonStockTable rows={10} />
          ) : logs.length === 0 ? (
            <tr>
              <td
                colSpan={10}
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                No stock history found
              </td>
            </tr>
          ) : (
            logs.map((log, index) => {
              const isIncrease = INCREASE_ACTIONS.includes(log.action);
              return (
              <tr
                key={log.id}
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
                  }}
                >
                  {(page - 1) * 15 + index + 1}
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    color: "white",
                    fontWeight: 500,
                  }}
                >
                  {log.product?.name || "N/A"}
                </td>
                <td style={{ padding: "12px 14px" }}>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      width: "fit-content",
                      background: isIncrease
                        ? "rgba(46,204,113,0.2)"
                        : "rgba(192,57,43,0.2)",
                      color: isIncrease ? "#2ecc71" : "#e74c3c",
                      border: `1px solid ${isIncrease ? "rgba(46,204,113,0.3)" : "rgba(192,57,43,0.3)"}`,
                    }}
                  >
                    {isIncrease ? (
                      <ArrowUp size={12} color="#37d67a" variant="bold" />
                    ) : (
                      <ArrowDown size={12} color="#f47373" variant="bold" />
                    )}
                    {ACTION_LABELS[log.action] || log.action}
                  </span>
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    color: isIncrease ? "#2ecc71" : "#e74c3c",
                    fontWeight: 700,
                  }}
                >
                  {isIncrease ? "+" : "-"}
                  {log.quantity}
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  {log.qty_before}
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  {log.qty_after}
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "0.85rem",
                  }}
                >
                  {log.action === "sale" || log.action === "cancel_restore"
                    ? "—"
                    : log.supplier || "N/A"}
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "0.85rem",
                    maxWidth: "150px",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {log.note || "N/A"}
                  </span>
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: "0.85rem",
                  }}
                >
                  {log.user?.name || "N/A"}
                </td>
                <td
                  style={{
                    padding: "12px 14px",
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "0.82rem",
                  }}
                >
                  {new Date(log.created_at).toLocaleDateString()}
                  <br />
                  <span style={{ fontSize: "0.75rem" }}>
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
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
