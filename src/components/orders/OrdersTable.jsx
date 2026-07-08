import { RiEyeLine, RiPrinterLine, RiCloseLine } from "react-icons/ri";
import { glassCard, colors } from "../../utils/styles";
import { CloseCircle, Eye, Printer, Edit } from "iconsax-react";
import { SkeletonOrdersTable } from "../ui/SkeletonOrder";

const getStatusStyle = (status) => {
  switch (status) {
    case "completed":
      return {
        color: "#2ecc71",
        bg: "rgba(46,204,113,0.2)",
        border: "rgba(46,204,113,0.3)",
      };
    case "pending":
      return {
        color: "#f1c40f",
        bg: "rgba(241,196,15,0.2)",
        border: "rgba(241,196,15,0.3)",
      };
    case "cancelled":
      return {
        color: "#e74c3c",
        bg: "rgba(192,57,43,0.2)",
        border: "rgba(192,57,43,0.3)",
      };
    case "refunded":
      return {
        color: "#9b59b6",
        bg: "rgba(155,89,182,0.2)",
        border: "rgba(155,89,182,0.3)",
      };
    default:
      return { color: "white", bg: "transparent", border: "transparent" };
  }
};

const HEADERS = [
  "#",
  "Order",
  "Customer",
  "Table",
  "Items",
  "Total",
  "Payment",
  "Cashier",
  "Status",
  "Date",
  "Actions",
];

const getPaymentMethodName = (order) => {
  const directName = order?.payment_method?.name;
  const relationName = order?.paymentMethod?.name;
  const alternateName = order?.payment_method_name || order?.paymentMethodName;

  return directName || relationName || alternateName || "N/A";
};

export default function OrdersTable({
  orders,
  loading,
  page,
  lastPage,
  total,
  onView,
  onEdit,
  editLoadingId,
  onPrint,
  onCancel,
  onPagePrev,
  onPageNext,
}) {
  return (
    <>
      <div
        className="hide-scrollbar"
        style={{
          ...glassCard,
          borderRadius: "20px",
          overflowX: "auto",
          overflowY: "hidden",
          marginBottom: "16px",
          width: "100%",
        }}
      >
        <table
          style={{
            minWidth: "1000px",
            width: "100%",
            borderCollapse: "collapse",
          }}
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
                    fontSize: "1.1rem",
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
              <SkeletonOrdersTable rows={8} />
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "rgba(255,255,255,0.5)",
                  }}
                >
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order, index) => {
                const st = getStatusStyle(order.status);
                return (
                  <tr
                    key={order.id}
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
                      {(page - 1) * 15 + index + 1}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        color: colors.white,
                        fontWeight: 600,
                        fontSize: "0.82rem",
                      }}
                    >
                      {order.order_number}
                    </td>
                    <td style={{ padding: "12px 14px", color: "white" }}>
                      {order.customer_name || "Walk-in"}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {order.table?.name ? (
                        order.table.name
                      ) : order.order_type === "takeaway" ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "4px 10px",
                            borderRadius: "999px",
                            background: "rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.85)",
                            fontWeight: 600,
                            fontSize: "0.8rem",
                          }}
                        >
                          Takeaway
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {order.items?.length || 0} items
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        color: colors.white,
                        fontWeight: 700,
                      }}
                    >
                      ${Number(order.total).toFixed(2)}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "0.82rem",
                      }}
                    >
                      {getPaymentMethodName(order)}
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        color: "rgba(255,255,255,0.6)",
                        fontSize: "0.82rem",
                      }}
                    >
                      {order.user?.name || "N/A"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: st.color,
                          border: `2px solid ${st.border}`,
                        }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "0.8rem",
                      }}
                    >
                      {new Date(order.created_at).toLocaleDateString()}
                      <br />
                      <span style={{ fontSize: "0.75rem" }}>
                        {new Date(order.created_at).toLocaleTimeString()}
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <div
                          style={{
                            position: "relative",
                            display: "inline-block",
                          }}
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
                            onClick={() => onView(order)}
                            style={{
                              padding: "5px 10px",
                              borderRadius: "7px",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                              fontSize: "0.78rem",
                            }}
                            className="duration-200 hover:scale-110 transition-transform"
                          >
                            <Eye size={20} color="#fff" variant="TwoTone" />
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
                            View
                          </div>
                        </div>
                        {order.status === "pending" && onEdit && (
                          <div
                            style={{
                              position: "relative",
                              display: "inline-block",
                            }}
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
                              onClick={() => !(editLoadingId === order.id) && onEdit(order)}
                              disabled={editLoadingId === order.id}
                              style={{
                                padding: "5px 10px",
                                borderRadius: "7px",
                                border: "none",
                                cursor: editLoadingId === order.id ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "3px",
                                fontSize: "0.78rem",
                                opacity: editLoadingId === order.id ? 0.7 : 1,
                              }}
                              className="duration-200 hover:scale-110 transition-transform"
                            >
                              {editLoadingId === order.id ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" />
                                  <path d="M22 12a10 10 0 0 1-10 10" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
                                </svg>
                              ) : (
                                <Edit size={20} color="#fff" variant="TwoTone" />
                              )}
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
                              {editLoadingId === order.id ? "Loading..." : "Edit"}
                            </div>
                          </div>
                        )}
                        <div
                          style={{
                            position: "relative",
                            display: "inline-block",
                          }}
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
                            onClick={() => onPrint(order)}
                            style={{
                              padding: "5px 10px",
                              borderRadius: "7px",
                              border: "none",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "3px",
                              fontSize: "0.78rem",
                            }}
                            className="duration-200 hover:scale-110 transition-transform"
                          >
                            <Printer size={20} color="#fff" variant="TwoTone" />
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
                            Print
                          </div>
                        </div>
                        {order.status === "completed" && (
                          <div
                            style={{
                              position: "relative",
                              display: "inline-block",
                            }}
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
                              onClick={() => onCancel(order.id)}
                              style={{
                                padding: "5px 10px",
                                borderRadius: "7px",
                                border: "none",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "3px",
                                fontSize: "0.78rem",
                              }}
                              className="duration-200 hover:scale-110 transition-transform"
                            >
                              <CloseCircle
                                size={20}
                                color="#fff"
                                variant="TwoTone"
                              />
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
                              Cancel
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
          Total: {total} orders
        </span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button
            onClick={onPagePrev}
            disabled={page === 1}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "none",
              cursor: page === 1 ? "not-allowed" : "pointer",
              background:
                page === 1 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.1)",
              color: page === 1 ? "rgba(255,255,255,0.3)" : "white",
              fontWeight: 600,
            }}
          >
            Back
          </button>
          <span style={{ color: "white", fontWeight: 600, padding: "0 8px" }}>
            {page} / {lastPage}
          </span>
          <button
            onClick={onPageNext}
            disabled={page === lastPage}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              border: "none",
              cursor: page === lastPage ? "not-allowed" : "pointer",
              background:
                page === lastPage
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.1)",
              color: page === lastPage ? "rgba(255,255,255,0.3)" : "white",
              fontWeight: 600,
            }}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
}
