export const getStatusStyle = (status) => {
  switch (status) {
    case "completed":
      return {
        color: "#2ecc71",
        bg: "rgba(46,204,113,0.2)",
        border: "rgba(46,204,113,0.3)",
      };
    case "pending":
      return {
        color: "#f1c40f",
        bg: "rgba(241,196,15,0.2)",
        border: "rgba(241,196,15,0.3)",
      };
    case "cancelled":
      return {
        color: "#e74c3c",
        bg: "rgba(192,57,43,0.2)",
        border: "rgba(192,57,43,0.3)",
      };
    case "refunded":
      return {
        color: "#9b59b6",
        bg: "rgba(155,89,182,0.2)",
        border: "rgba(155,89,182,0.3)",
      };
    default:
      return { color: "white", bg: "transparent", border: "transparent" };
  }
};
