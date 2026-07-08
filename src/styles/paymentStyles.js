export const paymentStyles = {
  headerContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },

  headerTitle: {
    color: "white",
    fontWeight: 700,
    fontSize: "1.5rem",
    margin: 0,
  },

  addButton: {
    padding: "10px 20px",
    borderRadius: "12px",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
  },

  statusToggle: {
    width: "42px",
    height: "22px",
    borderRadius: "11px",
    cursor: "pointer",
    position: "relative",
    transition: "background 0.3s",
    flexShrink: 0,
  },

  toggleSlider: {
    position: "absolute",
    top: "3px",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    background: "white",
    transition: "left 0.3s",
  },

  iconPicker: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },

  iconButton: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1.4rem",
  },

  errorMessage: {
    background: "rgba(192,57,43,0.3)",
    border: "1px solid rgba(192,57,43,0.5)",
    color: "#ff6b6b",
    padding: "10px 14px",
    borderRadius: "10px",
    marginBottom: "16px",
    fontSize: "0.85rem",
  },

  bankInfo: {
    padding: "12px",
    borderRadius: "10px",
    background: "rgba(52,152,219,0.1)",
    border: "1px solid rgba(52,152,219,0.2)",
    marginBottom: "16px",
  },

  bankInfoLabel: {
    color: "#3498db",
    fontSize: "0.82rem",
    fontWeight: 600,
    marginBottom: "12px",
  },

  actionButtons: {
    display: "flex",
    gap: "8px",
  },

  editButton: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    background: "rgba(52,152,219,0.2)",
    color: "#3498db",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "0.82rem",
  },

  deleteButton: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    background: "rgba(192,57,43,0.2)",
    color: "#e74c3c",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "0.82rem",
  },
};
