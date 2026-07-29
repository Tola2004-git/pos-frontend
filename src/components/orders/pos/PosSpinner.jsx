export function PosSpinner() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <circle
        cx="9"
        cy="9"
        r="7"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="2"
      />
      <path
        d="M9 2 A7 7 0 0 1 16 9"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default PosSpinner;
