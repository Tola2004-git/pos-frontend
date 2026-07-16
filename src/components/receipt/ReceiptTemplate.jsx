import { renderToStaticMarkup } from "react-dom/server";
import logo from "../../assets/logo.png";

const DEFAULT_EXCHANGE_RATE = 4100;

function formatUsd(amount) {
  return `$${(Number(amount) || 0).toFixed(2)}`;
}

function formatKhr(amount) {
  return `${Math.round(Number(amount) || 0).toLocaleString()} ៛`;
}

function getTableLabel(order) {
  if (order.order_type === "dine-in") {
    return order.table?.name || order.table_name || `Table ${order.table_id ?? "-"}`;
  }
  if (order.order_type === "self-seating") return "Self-Seating";
  return "Takeaway";
}

/**
 * Presentational-only receipt layout, sized for 80mm thermal printers.
 * Used both for on-screen preview and, via `printReceipt`, as the single
 * source of truth for the printed HTML - no markup duplication between the two.
 */
export function ReceiptTemplate({ order }) {
  if (!order) return null;

  const rate = Number(order.exchange_rate_used) || DEFAULT_EXCHANGE_RATE;
  const paidUsd = Number(order.amount_paid_usd) || 0;
  const paidKhr = Number(order.amount_paid_khr) || 0;
  const paidInKhrOnly = paidKhr > 0 && paidUsd === 0;
  const totalUsd = Number(order.total) || 0;
  const totalKhr = totalUsd * rate;
  const discount = Number(order.discount ?? order.discount_amount) || 0;

  const paidLabel =
    paidUsd > 0 && paidKhr > 0
      ? `${formatUsd(paidUsd)} + ${formatKhr(paidKhr)}`
      : paidInKhrOnly
        ? formatKhr(paidKhr)
        : formatUsd(order.amount_paid);

  const changeUsd = Number(order.change_amount) || 0;
  const changeLabel = paidInKhrOnly
    ? `${formatKhr(changeUsd * rate)} (${formatUsd(changeUsd)})`
    : formatUsd(changeUsd);

  const rowStyle = { padding: "2px 0" };
  const rightStyle = { padding: "2px 0", textAlign: "right" };
  const hrStyle = { border: "none", borderTop: "1px dashed #000", margin: "8px 0" };

  return (
    <div
      style={{
        fontFamily: "'Courier New', monospace",
        width: "280px",
        margin: "0 auto",
        padding: "16px",
        color: "#000",
        fontSize: "12px",
      }}
    >
      <img
        src={logo}
        alt="Logo"
        style={{ display: "block", margin: "0 auto 8px", maxWidth: "70px", maxHeight: "70px" }}
      />
      <h2 style={{ textAlign: "center", margin: "0 0 4px", fontSize: "16px" }}>The Temple Sourdough</h2>
      <p style={{ textAlign: "center", margin: "2px 0" }}>
        {new Date(order.created_at).toLocaleString()}
      </p>
      <p style={{ textAlign: "center", margin: "2px 0", fontWeight: "bold" }}>
        Order: {order.order_number}
      </p>

      <hr style={hrStyle} />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={rowStyle}>Cashier</td>
            <td style={rightStyle}>{order.user?.name || "N/A"}</td>
          </tr>
          <tr>
            <td style={rowStyle}>{order.order_type === "dine-in" ? "Table" : "Order Type"}</td>
            <td style={rightStyle}>{getTableLabel(order)}</td>
          </tr>
          {order.customer_name && (
            <tr>
              <td style={rowStyle}>Customer</td>
              <td style={rightStyle}>{order.customer_name}</td>
            </tr>
          )}
        </tbody>
      </table>

      <hr style={hrStyle} />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          {(order.items || []).map((item, index) => (
            <tr key={item.id ?? index}>
              <td style={rowStyle}>
                {(item.product_name || item.product?.name || "Item")} x{item.quantity}
              </td>
              <td style={rightStyle}>{formatUsd(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr style={hrStyle} />

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={rowStyle}>Subtotal</td>
            <td style={rightStyle}>{formatUsd(order.subtotal)}</td>
          </tr>
          {discount > 0 && (
            <tr>
              <td style={rowStyle}>Discount</td>
              <td style={rightStyle}>-{formatUsd(discount)}</td>
            </tr>
          )}
          <tr style={{ fontWeight: "bold", fontSize: "14px" }}>
            <td style={rowStyle}>TOTAL</td>
            <td style={rightStyle}>{formatUsd(totalUsd)}</td>
          </tr>
          <tr>
            <td style={rowStyle}>Total (KHR)</td>
            <td style={rightStyle}>{formatKhr(totalKhr)}</td>
          </tr>
          <tr>
            <td style={rowStyle}>Paid ({order.payment_method?.name || "-"})</td>
            <td style={rightStyle}>{paidLabel}</td>
          </tr>
          <tr>
            <td style={rowStyle}>Change</td>
            <td style={rightStyle}>{changeLabel}</td>
          </tr>
        </tbody>
      </table>

      <hr style={hrStyle} />

      <p style={{ textAlign: "center", margin: "8px 0 0" }}>Thank you! Come again</p>
    </div>
  );
}

/**
 * Opens a print-ready popup rendered from the same ReceiptTemplate markup
 * used for on-screen previews, so the two never drift apart.
 */
export function printReceipt(order) {
  if (!order) return;

  const markup = renderToStaticMarkup(<ReceiptTemplate order={order} />);
  const win = window.open("", "_blank", "width=380,height=640");
  if (!win) return;

  win.document.write(`
    <html>
      <head>
        <title>Receipt - ${order.order_number}</title>
        <style>
          body { margin: 0; }
          @media print {
            @page { size: 80mm auto; margin: 0; }
          }
        </style>
      </head>
      <body>${markup}</body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}

export default ReceiptTemplate;
