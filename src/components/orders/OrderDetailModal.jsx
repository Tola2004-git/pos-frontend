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

export default function OrderDetailModal({ order, onClose, onPrint }) {
  useEffect(() => {
    if (!order) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [order]);

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
            Order Detail
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
              <Printer size={16} color={colors.gold} variant="Linear" /> Print
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CloseCircle size={18} color="white" variant="Linear" />
            </button>
          </div>
        </div>

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
            label="Order#"
            value={order.order_number}
            valueStyle={{ color: "white", fontWeight: 600 }}
          />
          <Row
            icon={User}
            label="Customer"
            value={order.customer_name || "Walk-in"}
          />
          {order.customer_phone && (
            <Row icon={Call} label="Phone" value={order.customer_phone} />
          )}
          <Row icon={User} label="Cashier" value={order.user?.name || "N/A"} />
          <Row
            icon={Calendar2}
            label="Date"
            value={new Date(order.created_at).toLocaleString()}
          />
        </div>

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
          Items
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
            label="Subtotal"
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
              TOTAL
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
            label="Payment"
            value={order.payment_method?.name || "N/A"}
          />
          <Row
            icon={MoneyRecive}
            label="Amount Paid"
            value={`$${Number(order.amount_paid).toFixed(2)}`}
          />
          {(Number(order.amount_paid_usd) > 0 ||
            Number(order.amount_paid_khr) > 0) && (
            <Row
              label="Paid Breakdown"
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
            label="Change"
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
