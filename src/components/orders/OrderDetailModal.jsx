import { RiPrinterLine } from "react-icons/ri";
import { glass, colors } from "../../utils/styles";

export default function OrderDetailModal({ order, onClose, onPrint }) {
  if (!order) return null;

  const Row = ({ label, value, valueStyle }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "6px",
      }}
    >
      <span style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
      <span style={{ color: "white", ...valueStyle }}>{value}</span>
    </div>
  );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(5px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          ...glass,
          borderRadius: "24px",
          padding: "32px",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ color: colors.gold, fontWeight: 700, margin: 0 }}>
            🧾 Order Detail
          </h3>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => onPrint(order)}
              style={{
                padding: "7px 14px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                background: "rgba(241,196,15,0.2)",
                color: colors.gold,
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "0.82rem",
              }}
            >
              <RiPrinterLine size={14} /> Print
            </button>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "white",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Order info */}
        <div
          style={{
            marginBottom: "16px",
            padding: "14px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          <Row
            label="Order#"
            value={order.order_number}
            valueStyle={{ color: colors.gold, fontWeight: 600 }}
          />
          <Row label="Customer" value={order.customer_name || "Walk-in"} />
          {order.customer_phone && (
            <Row label="Phone" value={order.customer_phone} />
          )}
          <Row label="Cashier" value={order.user?.name || "N/A"} />
          <Row
            label="Date"
            value={new Date(order.created_at).toLocaleString()}
          />
        </div>

        {/* Items */}
        <h4 style={{ color: "white", marginBottom: "10px" }}>🛍️ Items</h4>
        <div style={{ marginBottom: "16px" }}>
          {order.items?.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <span style={{ color: "white" }}>
                {item.product_name}{" "}
                <span style={{ color: "rgba(255,255,255,0.5)" }}>
                  x{item.quantity}
                </span>
              </span>
              <span style={{ color: colors.gold, fontWeight: 600 }}>
                ${Number(item.subtotal).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div
          style={{
            padding: "14px",
            borderRadius: "12px",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          <Row
            label="Subtotal"
            value={`$${Number(order.subtotal).toFixed(2)}`}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: "8px",
              marginTop: "4px",
              marginBottom: "6px",
            }}
          >
            <span style={{ color: colors.gold, fontWeight: 700 }}>TOTAL</span>
            <span
              style={{
                color: colors.gold,
                fontWeight: 800,
                fontSize: "1.1rem",
              }}
            >
              ${Number(order.total).toFixed(2)}
            </span>
          </div>
          <Row label="Payment" value={order.payment_method?.name || "N/A"} />
          <Row
            label="Amount Paid"
            value={`$${Number(order.amount_paid).toFixed(2)}`}
          />
          <Row
            label="Change"
            value={`$${Number(order.change_amount).toFixed(2)}`}
            valueStyle={{ color: "#2ecc71", fontWeight: 600 }}
          />
        </div>
      </div>
    </div>
  );
}
