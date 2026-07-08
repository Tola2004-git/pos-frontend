import { Card, CardReceive, ReceiptItem, User, Bank, WalletMoney, Money } from "iconsax-react";
import { colors } from "../../utils/styles";

export default function ToastNotification({ toasts }) {
  if (!toasts.length) return null;

  return (
    <div
      className="fixed top-6 right-6 z-[999999] flex flex-col gap-3 pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto relative overflow-hidden rounded-[16px] border border-white/15 bg-gradient-to-br from-[#27ae60] to-[#1e8449] p-[14px_18px] min-w-[300px] max-w-[380px] text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
          style={{ animation: "slideIn 0.3s ease" }}
        >
          <div className="absolute inset-x-0 top-0 h-px bg-white/30" />
          <div className="mb-2 flex items-center gap-2.5">
            <span className="inline-flex text-[1.4rem]">
              <Card size="22" color="white" variant="Outline" />
            </span>
            <span className="text-[0.9rem] font-bold text-white/95">
              Payment Received!
            </span>
          </div>
          <div className="text-[0.8rem] leading-[1.4] text-white/85">
            {t.order.customer_name && (
              <div className="flex items-center gap-1.5">
                <User size="16" color="#ffffff" variant="Linear" /> <b>{t.order.customer_name}</b>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Money size="16" color="#ffffff" variant="Linear" /> Amount: <b style={{ color: colors.gold }}>${Number(t.order.total).toFixed(2)}</b>
            </div>
            <div className="flex items-center gap-1.5">
              <CardReceive size="16" color="#ffffff" variant="Linear" /> Method: <b>{t.order.payment_method?.name || "N/A"}</b>
            </div>
            {t.order.payment_method?.bank_name && (
              <div className="flex items-center gap-1.5">
                <Bank size="16" color="#ffffff" variant="Linear" /> Bank: <b>{t.order.payment_method.bank_name}</b>
              </div>
            )}
            {t.order.payment_method?.account_number && (
              <div>🔢 ACC: <b>{t.order.payment_method.account_number}</b></div>
            )}
            <div className="flex items-center gap-1.5">
              <ReceiptItem size="16" color="#ffffff" variant="Linear" /> Order: <b>{t.order.order_number}</b>
            </div>
          </div>
        </div>
      ))}
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
  );
}