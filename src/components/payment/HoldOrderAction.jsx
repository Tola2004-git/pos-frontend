import { Archive } from "iconsax-react";

export function HoldOrderAction({ onHold, disabled, loading }) {
  const handleHold = async () => {
    if (loading || disabled) return;
    await onHold();
  };

  return (
    <button
      type="button"
      onClick={handleHold}
      disabled={disabled || loading}
      className="btn-shine-blue w-full disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
      style={{
        borderRadius: "12px",
        color: "white",
        cursor: "pointer",
        fontWeight: 500,
      }}
    >
      <Archive size={18} color="white" variant="Outline"/>
      {loading ? "Holding Order..." : "Hold Order"}
    </button>
  );
}
