export const BANKS = [
  { key: "aba", name: "ABA", logo: "/assets/banks/aba.jpeg" },
  { key: "acleda", name: "ACLEDA", logo: "/assets/banks/acleda.jpg" },
  { key: "wing", name: "Wing", logo: "/assets/banks/wing.jpeg" },
  { key: "true_money", name: "True Money", logo: "/assets/banks/true-money.jpeg" },
  { key: "prasac", name: "Prasac", logo: "/assets/banks/prasac.png" },
  { key: "canadia", name: "Canadia", logo: "/assets/banks/canadia.jpeg" },
];

export const DEFAULT_METHODS = [
  { name: "Cash", icon: "💵", description: "Pay with cash" },
  { name: "Credit Card", icon: "💳", description: "Pay with credit/debit card" },
  { name: "Bank Transfer", icon: "/assets/banks/aba.jpeg", description: "Transfer via bank" },
];

export const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.1)",
  color: "white",
  fontSize: "0.9rem",
  outline: "none",
};

export const labelStyle = {
  color: "rgba(255,255,255,0.8)",
  fontSize: "0.85rem",
  display: "block",
  marginBottom: "6px",
};
