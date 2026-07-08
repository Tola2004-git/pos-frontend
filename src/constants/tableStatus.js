export const TABLE_STATUS = {
  available: "available",
  occupied: "occupied",
  reserved: "reserved",
};

export const TABLE_STATUS_STYLES = {
  available: {
    color: "#2ecc71",
    bg: "rgba(46, 204, 113, 0.15)",
    border: "rgba(46, 204, 113, 0.4)",
    label: "Available",
  },
  occupied: {
    color: "#e74c3c",
    bg: "rgba(231, 76, 60, 0.15)",
    border: "rgba(231, 76, 60, 0.4)",
    label: "Occupied",
  },
  reserved: {
    color: "#f39c12",
    bg: "rgba(243, 156, 18, 0.15)",
    border: "rgba(243, 156, 18, 0.4)",
    label: "Reserved",
  },
};

export const TABLE_STATUS_OPTIONS = [
  { value: TABLE_STATUS.available, label: "Available" },
  { value: TABLE_STATUS.occupied, label: "Occupied" },
  { value: TABLE_STATUS.reserved, label: "Reserved" },
];
