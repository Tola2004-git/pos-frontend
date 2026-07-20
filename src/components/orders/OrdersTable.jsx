import { RiEyeLine, RiPrinterLine, RiCloseLine } from "react-icons/ri";
import { glassCard, colors } from "../../utils/styles";
import { CloseCircle, Eye, Printer, Edit, MoneyRecive } from "iconsax-react";
import { SkeletonOrdersTable } from "../ui/SkeletonOrder";
import { getStatusStyle } from "../../utils/orderHelpers";
import ItemsPopover from "./ItemsPopover";

const getPaymentMethodName = (order, notAvailableLabel) => {
  const directName = order?.payment_method?.name;
  const relationName = order?.paymentMethod?.name;
  const alternateName = order?.payment_method_name || order?.paymentMethodName;

  return directName || relationName || alternateName || notAvailableLabel;
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
  cancelLoadingId,
  onRefund,
  refundLoadingId,
  isAdmin = false,
  onPagePrev,
  onPageNext,
  t,
}) {
  // Optional - the admin Orders page doesn't pass a translation table, so
  // every lookup below falls back to the English default this component
  // always had.
  const HEADERS = [
    t?.colIndex || "#",
    t?.colOrder || "Order",
    t?.colCustomer || "Customer",
    t?.colTable || "Table",
    t?.colItems || "Items",
    t?.colTotal || "Total",
    t?.colPayment || "Payment",
    t?.colCashier || "Cashier",
    t?.colStatus || "Status",
    t?.colDate || "Date",
    t?.colActions || "Actions",
  ];
  const STATUS_LABELS = {
    completed: t?.statusCompleted || "Completed",
    pending: t?.statusPending || "Pending",
    cancelled: t?.statusCancelled || "Cancelled",
    refunded: t?.statusRefunded || "Refunded",
  };
  const noOrdersFound = t?.noOrdersFound || "No orders found";
  const walkInLabel = t?.walkIn || "Walk-in";
  const takeawayLabel = t?.takeaway || "Takeaway";
  const notAvailableLabel = t?.notAvailable || "N/A";
  const viewLabel = t?.view || "View";
  const loadingLabel = t?.loadingAction || "Loading...";
  const editLabel = t?.editAction || "Edit";
  const printLabel = t?.print || "Print";
  const cancelLabel = t?.cancelAction || "Cancel";
  const cancellingLabel = t?.cancellingAction || "Cancelling...";
  const refundLabel = t?.refundAction || "Refund";
  const refundingLabel = t?.refundingAction || "Refunding...";
  const backLabel = t?.back || "Back";
  const nextLabel = t?.next || "Next";
  const refundedByOn = (name, date) =>
    (t?.refundedByOn || "Refunded by {name} on {date}")
      .replace("{name}", name)
      .replace("{date}", date);
  const totalOrdersCount = (n) =>
    (t?.totalOrdersCount || "Total: {n} orders").replace("{n}", n);

  return (
    <>
      <div
        className="table-scroll-x"
        style={{
          ...glassCard,
          borderRadius: "20px",
          overflowX: "auto",
          overflowY: "hidden",
          marginBottom: "16px",
          width: "100%",
          maxWidth: "100%",
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
                    fontSize: "0.85rem",
                    letterSpacing: "0.02em",
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
                  {noOrdersFound}
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
                        fontSize: "0.85rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {(page - 1) * 15 + index + 1}
                    </td>
                    <td
                      title={order.order_number}
                      style={{
                        padding: "12px 14px",
                        color: colors.white,
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        maxWidth: "150px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {order.order_number}
                    </td>
                    <td
                      title={order.customer_name || walkInLabel}
                      style={{
                        padding: "12px 14px",
                        color: "white",
                        fontSize: "0.85rem",
                        maxWidth: "140px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {order.customer_name || walkInLabel}
                    </td>
                    <td
                      title={order.table?.name || order.table_name || undefined}
                      style={{
                        padding: "12px 14px",
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "0.85rem",
                        maxWidth: "110px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {order.table?.name || order.table_name || takeawayLabel ? (
                        order.table?.name || order.table_name || takeawayLabel
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
                          {takeawayLabel}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <ItemsPopover order={order} t={t} />
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        color: colors.white,
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ${Number(order.total).toFixed(2)}
                      {Number(order.amount_paid_khr) > 0 && (
                        <div
                          style={{
                            fontWeight: 500,
                            fontSize: "0.72rem",
                            color: "rgba(255,255,255,0.4)",
                          }}
                        >
                          {Math.round(Number(order.amount_paid_khr)).toLocaleString()} ៛
                        </div>
                      )}
                    </td>
                    <td
                      title={getPaymentMethodName(order, notAvailableLabel)}
                      style={{
                        padding: "12px 14px",
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "0.85rem",
                        maxWidth: "100px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {getPaymentMethodName(order, notAvailableLabel)}
                    </td>
                    <td
                      title={order.user?.name || notAvailableLabel}
                      style={{
                        padding: "12px 14px",
                        color: "rgba(255,255,255,0.6)",
                        fontSize: "0.85rem",
                        maxWidth: "100px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {order.user?.name || notAvailableLabel}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span
                        title={
                          order.status === "refunded"
                            ? `${refundedByOn(
                                order.refundedBy?.name || notAvailableLabel,
                                order.refunded_at ? new Date(order.refunded_at).toLocaleString() : "",
                              )}${order.refund_reason ? ` — ${order.refund_reason}` : ""}`
                            : undefined
                        }
                        style={{
                          padding: "4px 10px",
                          borderRadius: "20px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                          color: st.color,
                          border: `2px solid ${st.border}`,
                        }}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 14px",
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "0.85rem",
                      }}
                    >
                      <div style={{ whiteSpace: "nowrap" }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                      <div
                        style={{
                          whiteSpace: "nowrap",
                          color: "rgba(255,255,255,0.4)",
                          fontSize: "0.78rem",
                        }}
                      >
                        {new Date(order.created_at).toLocaleTimeString()}
                      </div>
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
                            {viewLabel}
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
                              {editLoadingId === order.id ? loadingLabel : editLabel}
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
                            {printLabel}
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
                              onClick={() => !(cancelLoadingId === order.id) && onCancel(order.id)}
                              disabled={cancelLoadingId === order.id}
                              style={{
                                padding: "5px 10px",
                                borderRadius: "7px",
                                border: "none",
                                cursor: cancelLoadingId === order.id ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "3px",
                                fontSize: "0.78rem",
                                opacity: cancelLoadingId === order.id ? 0.7 : 1,
                              }}
                              className="duration-200 hover:scale-110 transition-transform"
                            >
                              {cancelLoadingId === order.id ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" />
                                  <path d="M22 12a10 10 0 0 1-10 10" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
                                </svg>
                              ) : (
                                <CloseCircle
                                  size={20}
                                  color="#fff"
                                  variant="TwoTone"
                                />
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
                              {cancelLoadingId === order.id ? cancellingLabel : cancelLabel}
                            </div>
                          </div>
                        )}
                        {isAdmin && order.status === "completed" && onRefund && (
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
                              onClick={() => !(refundLoadingId === order.id) && onRefund(order.id)}
                              disabled={refundLoadingId === order.id}
                              style={{
                                padding: "5px 10px",
                                borderRadius: "7px",
                                border: "none",
                                cursor: refundLoadingId === order.id ? "not-allowed" : "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "3px",
                                fontSize: "0.78rem",
                                opacity: refundLoadingId === order.id ? 0.7 : 1,
                              }}
                              className="duration-200 hover:scale-110 transition-transform"
                            >
                              {refundLoadingId === order.id ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                                  <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" />
                                  <path d="M22 12a10 10 0 0 1-10 10" stroke="white" strokeWidth="3" strokeLinecap="round" fill="none" />
                                </svg>
                              ) : (
                                <MoneyRecive size={20} color="#9b59b6" variant="TwoTone" />
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
                              {refundLoadingId === order.id ? refundingLabel : refundLabel}
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
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
          {totalOrdersCount(total)}
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
              fontSize: "0.85rem",
            }}
          >
            {backLabel}
          </button>
          <span style={{ color: "white", fontWeight: 600, fontSize: "0.85rem", padding: "0 8px" }}>
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
              fontSize: "0.85rem",
            }}
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </>
  );
}
