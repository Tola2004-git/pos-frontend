import { Archive } from "iconsax-react";

const spinnerStyles = `
@keyframes hold-spin {
  to { transform: rotate(360deg); }
}
.hold-spin-loader {
  width: 16px;
  height: 16px;
  border: 2.5px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: hold-spin 0.7s linear infinite;
}
`;

export function HoldOrderAction({ onHold, disabled, loading, t }) {
  const handleHold = async () => {
    if (loading || disabled) return;
    await onHold();
  };

  return (
    <button
      type="button"
      onClick={handleHold}
      disabled={disabled || loading}
      className="btn-shine-blue w-full disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap text-sm"
      style={{
        borderRadius: "12px",
        color: "white",
        cursor: "pointer",
        fontWeight: 500,
      }}
    >
      <style>{spinnerStyles}</style>
      {loading ? (
        <span className="hold-spin-loader" />
      ) : (
        <Archive size={18} color="white" variant="Outline" />
      )}
      {loading ? (t?.holding || "Holding...") : (t?.hold || "Hold")}
    </button>
  );
}
