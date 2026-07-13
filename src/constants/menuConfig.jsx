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
} from "iconsax-react";

export const MENU_ITEMS = [
  {
    key: "dashboard",
    path: "/dashboard",
    icon: Element3,
  },
  {
    key: "products",
    path: "/products",
    icon: ShoppingBag,
  },
  {
    key: "inventory",
    path: "/inventory",
    icon: Box,
  },
  {
    key: "stockHistory",
    path: "/inventory/history",
    icon: ReceiptSearch,
  },
  {
    key: "ingredients",
    path: "/ingredients",
    icon: Cake,
  },
  {
    key: "orders",
    path: "/orders",
    icon: ShoppingCart,
  },
  {
    key: "tables",
    path: "/tables",
    icon: Grid3,
  },
  {
    key: "paymentMethods",
    path: "/payment-methods",
    icon: Card,
  },
  {
    key: "promotions",
    path: "/promotions",
    icon: TicketDiscount,
  },
  { key: "users",
    path: "/users", 
    icon: User 
  },
];
