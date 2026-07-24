import { useEffect } from "react";
import {
  ReceiptText,
  Printer,
  CloseCircle,
  Hashtag,
  User,
  Call,
  Calendar2,
  Bag2,
  CardPos,
  DollarCircle,
  MoneyRecive,
  Danger,
  NoteText,
} from "iconsax-react";
import { glassCard, colors } from "../../utils/styles";

function Row({ icon: Icon, label, value, valueStyle }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px",
      }}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          color: "rgba(255,255,255,0.5)",
          fontSize: "0.85rem",
        }}
      >
        {Icon && <Icon size={14} color="currentColor" variant="Linear" />}
        {label}
      </span>
      <span style={{ color: "white", fontSize: "0.85rem", ...valueStyle }}>
        {value}
      </span>
    </div>
  );
}

export default function OrderDetailModal({
  order,
  onClose,
  onPrint,
  onRefund,
  refundLoadingId,
  isAdmin = false,
  t,
}) {
  // Optional - the admin Orders page doesn't pass a translation table, so
  // every lookup below falls back to the English default this component
  // always had.
  const tr = (key, fallback) => t?.[key] || fallback;

  useEffect(() => {
    if (!order) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [order]);

  useEffect(() => {
    if (!order) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [order, onClose]);

  if (!order) return null;

  return (
    <div
      style={{
        ...glassCard,
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          ...glassCard,
          borderRadius: "24px",
          padding: "32px",
          width: "100%",
          maxWidth: "560px",
          maxHeight: "90vh",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255, 255, 255, 0.2) transparent",
        }}
        className="[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/15 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
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
          <h3
            style={{
              color: "white",
              fontWeight: 700,
              fontSize: "1.1rem",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ReceiptText size={22} color="white" variant="Bold" />
            {tr("orderDetailTitle", "Order Detail")}
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
                gap: "5px",
                fontSize: "0.82rem",
                fontWeight: 600,
              }}
            >
              <Printer size={16} color={colors.gold} variant="Linear" /> {tr("print", "Print")}
            </button>
            {isAdmin && order.status === "completed" && onRefund && (
              <button
                onClick={() => !(refundLoadingId === order.id) && onRefund(order.id)}
                disabled={refundLoadingId === order.id}
                style={{
                  padding: "7px 14px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: refundLoadingId === order.id ? "not-allowed" : "pointer",
                  background: "rgba(155,89,182,0.2)",
                  color: "#9b59b6",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  opacity: refundLoadingId === order.id ? 0.7 : 1,
                }}
              >
                <MoneyRecive size={16} color="#9b59b6" variant="Linear" />
                {refundLoadingId === order.id
                  ? tr("refundingAction", "Refunding...")
                  : tr("refundAction", "Refund")}
              </button>
            )}
            <button
              onClick={onClose}
              aria-label={tr("cancel", "Close")}
              style={{
                background: "rgba(255,255,255,0.1)",
                border: "none",
                color: "white",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CloseCircle size={18} color="white" variant="Linear" />
            </button>
          </div>
        </div>

        {/* Refund info */}
        {order.status === "refunded" && (
          <div
            style={{
              ...glassCard,
              marginBottom: "16px",
              padding: "14px",
              borderRadius: "12px",
              border: "1px solid rgba(155,89,182,0.35)",
              background: "rgba(155,89,182,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#9b59b6",
                fontWeight: 700,
                fontSize: "0.85rem",
                marginBottom: "8px",
              }}
            >
              <Danger size={16} color="#9b59b6" variant="Bold" />
              {tr("refundedLabel", "Refunded")}
            </div>
            <Row
              icon={User}
              label={tr("refundedByLabel", "Refunded by")}
              value={order.refunded_by?.name || tr("notAvailable", "N/A")}
            />
            {order.refunded_at && (
              <Row
                icon={Calendar2}
                label={tr("refundedOnLabel", "Refunded on")}
                value={new Date(order.refunded_at).toLocaleString()}
              />
            )}
            {order.refund_reason && (
              <div style={{ marginTop: "6px" }}>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
                  {tr("reasonLabel", "Reason")}
                </span>
                <div style={{ color: "white", fontSize: "0.85rem", marginTop: "4px" }}>
                  {order.refund_reason}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Order info */}
        <div
          style={{
            ...glassCard,
            marginBottom: "16px",
            padding: "14px",
            borderRadius: "12px",
          }}
        >
          <Row
            icon={Hashtag}
            label={tr("orderHash", "Order#")}
            value={order.order_number}
            valueStyle={{ color: "white", fontWeight: 600 }}
          />
          <Row
            icon={User}
            label={tr("customerLabel", "Customer")}
            value={order.customer_name || tr("walkIn", "Walk-in")}
          />
          {order.customer_phone && (
            <Row icon={Call} label={tr("phoneLabel", "Phone")} value={order.customer_phone} />
          )}
          <Row icon={User} label={tr("cashierLabel", "Cashier")} value={order.user?.name || tr("notAvailable", "N/A")} />
          <Row
            icon={Calendar2}
            label={tr("dateLabel", "Date")}
            value={new Date(order.created_at).toLocaleString()}
          />
        </div>

        {order.note && (
          <div
            style={{
              ...glassCard,
              marginBottom: "16px",
              padding: "14px",
              borderRadius: "12px",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <NoteText size={14} color="rgba(255,255,255,0.5)" variant="Linear" />
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}>
                {tr("noteOptional", "Note (optional)")}
              </span>
            </div>
            <div style={{ color: "white", fontSize: "0.85rem" }}>{order.note}</div>
          </div>
        )}

        {/* Items */}
        <h4
          style={{
            color: "white",
            fontSize: "1rem",
            fontWeight: 600,
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <Bag2 size={18} color="white" variant="Outline" />
          {tr("itemsLabel", "Items")}
        </h4>
        <div
          style={{
            ...glassCard,
            borderRadius: "12px",
            padding: "4px 14px",
            marginBottom: "16px",
          }}
        >
          {order.items?.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                fontSize: "0.85rem",
              }}
              className="last:border-b-0"
            >
              <span style={{ color: "white" }}>
                {item.product_name}{" "}
                <span style={{ color: "rgba(255,255,255,0.5)" }}>
                  x{item.quantity}
                </span>
              </span>
              <span style={{ color: "white", fontWeight: 600 }}>
                ${Number(item.subtotal).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div
          style={{
            ...glassCard,
            padding: "14px",
            borderRadius: "12px",
          }}
        >
          <Row
            icon={DollarCircle}
            label={tr("subtotalLabel", "Subtotal")}
            value={`$${Number(order.subtotal).toFixed(2)}`}
          />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: "8px",
              marginTop: "4px",
              marginBottom: "8px",
            }}
          >
            <span
              style={{
                color: colors.gold,
                fontWeight: 700,
                fontSize: "0.9rem",
              }}
            >
              {tr("totalLabel", "TOTAL")}
            </span>
            <span
              style={{
                color: colors.gold,
                fontWeight: 800,
                fontSize: "1.15rem",
              }}
            >
              ${Number(order.total).toFixed(2)}
            </span>
          </div>
          <Row
            icon={CardPos}
            label={tr("paymentLabel", "Payment")}
            value={order.payment_method?.name || tr("notAvailable", "N/A")}
          />
          <Row
            icon={MoneyRecive}
            label={tr("amountPaidLabel", "Amount Paid")}
            value={`$${Number(order.amount_paid).toFixed(2)}`}
          />
          {(Number(order.amount_paid_usd) > 0 ||
            Number(order.amount_paid_khr) > 0) && (
            <Row
              label={tr("paidBreakdownLabel", "Paid Breakdown")}
              value={[
                Number(order.amount_paid_usd) > 0 &&
                  `$${Number(order.amount_paid_usd).toFixed(2)}`,
                Number(order.amount_paid_khr) > 0 &&
                  `${Math.round(Number(order.amount_paid_khr)).toLocaleString()} ៛`,
              ]
                .filter(Boolean)
                .join(" + ")}
              valueStyle={{ color: "rgba(255,255,255,0.6)" }}
            />
          )}
          <Row
            label={tr("changeLabel", "Change")}
            value={(() => {
              const changeUsd = Number(order.change_amount) || 0;
              const paidInKhrOnly =
                Number(order.amount_paid_khr) > 0 &&
                Number(order.amount_paid_usd) === 0;

              if (!paidInKhrOnly) return `$${changeUsd.toFixed(2)}`;

              const rate = Number(order.exchange_rate_used) || 4100;
              const changeKhr = Math.round(changeUsd * rate);
              return `${changeKhr.toLocaleString()} ៛ ($${changeUsd.toFixed(2)})`;
            })()}
            valueStyle={{ color: "#2ecc71", fontWeight: 600 }}
          />
        </div>
      </div>
    </div>
  );
}
