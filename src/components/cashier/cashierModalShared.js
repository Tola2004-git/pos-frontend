export const fieldStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid var(--surface-border)",
  color: "var(--accent-border-full)",
  fontSize: "0.95rem",
  outline: "none",
};

export const labelStyle = {
  color: "var(--accent-border-soft)",
  fontSize: "0.8rem",
  display: "block",
  marginBottom: "6px",
};

export const badgeFloatStyles = `
@keyframes badge-float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-5px); }
}
.badge-float { animation: badge-float 2.2s ease-in-out infinite; }

@keyframes spin-loader {
  to { transform: rotate(360deg); }
}
.spin-loader {
  width: 18px;
  height: 18px;
  border: 2.5px solid rgba(255,255,255,0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin-loader 0.7s linear infinite;
}

@keyframes confirm-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes confirm-pop {
  from { opacity: 0; transform: scale(0.95) translateY(20px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
`;

export function fmtUsd(v) {
  return `$${(Number(v) || 0).toFixed(2)}`;
}
export function fmtKhr(v) {
  return `${Math.round(Number(v) || 0).toLocaleString()} ៛`;
}
