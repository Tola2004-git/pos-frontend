export default function StatusToggle({ active, onChange, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onChange}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        background: active ? "#2ecc71" : "rgba(255,255,255,0.2)",
        position: "relative",
        transition: "background 0.2s",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: active ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "white",
          transition: "left 0.2s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
        }}
      />
    </button>
  );
}
