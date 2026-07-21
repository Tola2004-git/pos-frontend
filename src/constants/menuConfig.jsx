import {
  Element3,
  ShoppingBag,
  Box,
  ReceiptSearch,
  ShoppingCart,
  CardPos,
  User,
  Grid3,
  Card,
  TicketDiscount,
  Cake,
  Wallet2,
  DocumentDownload,
} from "iconsax-react";

export const MENU_ITEMS = [
  // Overview
  {
    key: "dashboard",
    path: "/dashboard",
    icon: Element3,
    roles: ["admin", "cashier"],
  },

  // Daily operations - the pages used every shift
  {
    key: "cashierPos",
    path: "/cashier",
    icon: CardPos,
    roles: ["cashier"],
  },
  {
    key: "orders",
    path: "/orders",
    icon: ShoppingCart,
    roles: ["admin", "cashier"],
  },
  {
    key: "tables",
    path: "/tables",
    icon: Grid3,
    roles: ["admin", "cashier"],
  },
  {
    key: "shifts",
    path: "/shifts",
    icon: Wallet2,
    roles: ["admin"],
  },

  // Catalog & inventory - changed less often than daily operations
  {
    key: "products",
    path: "/products",
    icon: ShoppingBag,
    roles: ["admin"],
  },
  {
    key: "inventory",
    path: "/inventory",
    icon: Box,
    roles: ["admin"],
  },
  {
    key: "stockHistory",
    path: "/inventory/history",
    icon: ReceiptSearch,
    roles: ["admin"],
  },
  {
    key: "ingredients",
    path: "/ingredients",
    icon: Cake,
    roles: ["admin"],
  },

  // Marketing & configuration
  {
    key: "promotions",
    path: "/promotions",
    icon: TicketDiscount,
    roles: ["admin"],
  },
  {
    key: "paymentMethods",
    path: "/payment-methods",
    icon: Card,
    roles: ["admin"],
  },

  // Reports
  {
    key: "dailyExports",
    path: "/daily-exports",
    icon: DocumentDownload,
    roles: ["admin"],
  },

  // System administration - touched least often
  {
    key: "users",
    path: "/users",
    icon: User,
    roles: ["admin"],
  },
];
