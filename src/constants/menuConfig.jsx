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
} from "iconsax-react";

export const MENU_ITEMS = [
  {
    key: "dashboard",
    path: "/dashboard",
    icon: Element3,
    roles: ["admin", "cashier"],
  },
  {
    key: "cashierPos",
    path: "/cashier",
    icon: CardPos,
    roles: ["cashier"],
  },
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
    key: "paymentMethods",
    path: "/payment-methods",
    icon: Card,
    roles: ["admin"],
  },
  {
    key: "promotions",
    path: "/promotions",
    icon: TicketDiscount,
    roles: ["admin"],
  },
  {
    key: "users",
    path: "/users",
    icon: User,
    roles: ["admin"],
  },
  {
    key: "shifts",
    path: "/shifts",
    icon: Wallet2,
    roles: ["admin"],
  },
];
