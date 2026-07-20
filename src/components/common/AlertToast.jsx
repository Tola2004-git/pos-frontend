import { TickCircle, Danger, InfoCircle } from "iconsax-react";

const TYPE_STYLES = {
  success: {
    gradient: "from-[#27ae60] to-[#1e8449]",
    Icon: TickCircle,
  },
  error: {
    gradient: "from-[#e74c3c] to-[#c0392b]",
    Icon: Danger,
  },
  warning: {
    gradient: "from-[#f39c12] to-[#d68910]",
    Icon: Danger,
  },
  info: {
    gradient: "from-[#2980b9] to-[#1a5276]",
    Icon: InfoCircle,
  },
};

export default function AlertToast({
  type = "info",
  title,
  message,
  onClose,
  closeLabel = "Close",
}) {
  const { gradient, Icon } = TYPE_STYLES[type] || TYPE_STYLES.info;

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-[16px] border border-white/15 bg-gradient-to-br ${gradient} p-[14px_18px] min-w-[260px] max-w-[380px] text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)]`}
      style={{
        animation:
          "alert-toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
      }}
    >
      <style>{`
        @keyframes alert-toast-in {
          from { opacity: 0; transform: translateX(60px) scale(0.9); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
      `}</style>
      <div className="absolute inset-x-0 top-0 h-px bg-white/30" />
      <div className="flex items-start gap-2.5">
        <Icon
          size="22"
          color="white"
          variant="Outline"
          className="mt-0.5 flex-shrink-0"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="m-0 truncate text-[0.9rem] font-bold text-white/95">
              {title}
            </p>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label={closeLabel}
                className="flex-shrink-0 rounded-full p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          {message && (
            <p className="m-0 mt-0.5 text-[0.8rem] leading-[1.4] text-white/85">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
