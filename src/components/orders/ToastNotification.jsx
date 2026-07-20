import {
  TickCircle,
  CardPos,
  Hashtag,
  DollarCircle,
  PauseCircle,
  RefreshCircle,
  CloseCircle,
  Printer,
} from "iconsax-react";
import { colors } from "../../utils/styles";
import { useTranslations } from "../../hooks/useTranslations";

const TOAST_DURATION = 3000;

export default function ToastNotification({ toasts, onClose, onPrint }) {
  const { t } = useTranslations();
  if (!toasts.length) return null;

  const TOAST_CONFIG = {
    payment: {
      title: t.paymentReceivedToast,
      Icon: TickCircle,
      gradient: "from-[#27ae60] to-[#1e8449]",
    },
    hold: {
      title: t.orderHeldToast,
      Icon: PauseCircle,
      gradient: "from-[#f39c12] to-[#b9770e]",
    },
    update: {
      title: t.orderUpdatedToast,
      Icon: RefreshCircle,
      gradient: "from-[#2980b9] to-[#1f618d]",
    },
  };

  return (
    <div className="fixed top-6 right-6 z-[999999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => {
        const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.payment;
        const Icon = config.Icon;
        const duration = toast.duration || TOAST_DURATION;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto relative overflow-hidden rounded-[16px] border border-white/15 bg-gradient-to-br ${config.gradient} p-[14px_18px] min-w-[300px] max-w-[380px] text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)]`}
            style={{ animation: "slideIn 0.3s ease" }}
          >
            <div className="absolute inset-x-0 top-0 h-px bg-white/30" />

            <button
              type="button"
              onClick={() => onClose?.(toast.id)}
              className="absolute right-2.5 top-2.5 text-white/70 transition-colors hover:text-white"
              aria-label={t.closeAction}
            >
              <CloseCircle size="18" color="currentColor" variant="Linear" />
            </button>

            <div className="mb-2 flex items-center gap-2.5 pr-5">
              <span className="inline-flex text-[1.4rem]">
                <Icon size="22" color="white" variant="Bold" />
              </span>
              <span className="text-[0.9rem] font-bold text-white/95">
                {config.title}
              </span>
            </div>
            <div className="text-[0.8rem] leading-[1.4] text-white/85">
              {toast.type === "payment" && (
                <>
                  <div className="flex items-center gap-1.5">
                    <DollarCircle size="16" color="#ffffff" variant="Linear" />{" "}
                    {t.amountToastLabel}{" "}
                    <b style={{ color: colors.gold }}>
                      ${Number(toast.order.total).toFixed(2)}
                    </b>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CardPos size="16" color="#ffffff" variant="Linear" />{" "}
                    {t.methodToastLabel} <b>{toast.order.payment_method?.name || t.notAvailable}</b>
                  </div>
                </>
              )}
              <div className="flex items-center gap-1.5">
                <Hashtag size="16" color="#ffffff" variant="Linear" /> {t.orderToastLabel}{" "}
                <b>{toast.order.order_number}</b>
              </div>
            </div>

            {toast.type === "payment" && onPrint && (
              <button
                type="button"
                onClick={() => onPrint(toast.order)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] border border-white/25 bg-white/15 py-2 text-[0.82rem] font-semibold text-white transition-colors hover:bg-white/25"
              >
                <Printer size="16" color="white" variant="Linear" />
                {t.printReceiptBtn}
              </button>
            )}

            <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/15">
              <div
                className="h-full bg-white/70"
                style={{
                  animation: `toastShrink ${duration}ms linear forwards`,
                }}
              />
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes toastShrink { from { width: 100%; } to { width: 0%; } }
      `}</style>
    </div>
  );
}
