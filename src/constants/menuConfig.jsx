import {
  LuCakeSlice,
  LuChartNoAxesColumnIncreasing,
  LuCircleDollarSign,
  LuClipboardList,
  LuCloudCog,
  LuCreditCard,
  LuFileDown,
  LuFileSearch,
  LuLayoutDashboard,
  LuMonitor,
  LuPackage,
  LuPackageSearch,
  LuScrollText,
  LuShieldCheck,
  LuShoppingBag,
  LuShoppingCart,
  LuTable2,
  LuTicketPercent,
  LuUsers,
  LuWallet,
} from "react-icons/lu";

export const MENU_GROUPS = [
  { key: "overview", labelKey: "dashboard", icon: LuLayoutDashboard, collapsible: false },
  { key: "dailyOperations", labelKey: "navGroupOperations", icon: LuShoppingCart, collapsible: true },
  { key: "catalog", labelKey: "navGroupCatalog", icon: LuPackageSearch, collapsible: true },
  { key: "business", labelKey: "navGroupBusiness", icon: LuTicketPercent, collapsible: true },
  { key: "reports", labelKey: "navGroupReports", icon: LuChartNoAxesColumnIncreasing, collapsible: true },
  { key: "administration", labelKey: "navGroupAdministration", icon: LuShieldCheck, collapsible: true },
];

export const MENU_ITEMS = [
  // Overview
  {
    key: "dashboard",
    path: "/dashboard",
    icon: LuLayoutDashboard,
    group: "overview",
    roles: ["admin"],
  },

  // Daily operations - the pages used every shift
  {
    key: "cashierPos",
    path: "/cashier",
    icon: LuMonitor,
    group: "dailyOperations",
    roles: ["cashier"],
  },
  {
    key: "orders",
    path: "/orders",
    icon: LuClipboardList,
    group: "dailyOperations",
    roles: ["admin", "cashier"],
  },
  {
    key: "tables",
    path: "/tables",
    icon: LuTable2,
    group: "dailyOperations",
    roles: ["admin", "cashier"],
  },
  {
    key: "shifts",
    path: "/shifts",
    icon: LuWallet,
    group: "dailyOperations",
    roles: ["admin"],
  },

  // Catalog & inventory - changed less often than daily operations
  {
    key: "products",
    path: "/products",
    icon: LuShoppingBag,
    group: "catalog",
    roles: ["admin"],
  },
  {
    key: "inventory",
    path: "/inventory",
    icon: LuPackage,
    group: "catalog",
    roles: ["admin"],
  },
  {
    key: "stockHistory",
    path: "/inventory/history",
    icon: LuFileSearch,
    group: "catalog",
    roles: ["admin"],
  },
  {
    key: "ingredients",
    path: "/ingredients",
    icon: LuCakeSlice,
    group: "catalog",
    roles: ["admin"],
  },
  {
    key: "ingredientStockHistory",
    path: "/ingredients/history",
    icon: LuScrollText,
    group: "catalog",
    roles: ["admin"],
  },

  // Marketing & configuration
  {
    key: "promotions",
    path: "/promotions",
    icon: LuTicketPercent,
    group: "business",
    roles: ["admin"],
  },
  {
    key: "paymentMethods",
    path: "/payment-methods",
    icon: LuCreditCard,
    group: "business",
    roles: ["admin"],
  },

  // Reports
  {
    key: "dailyExports",
    path: "/daily-exports",
    icon: LuFileDown,
    group: "reports",
    roles: ["admin"],
  },
  {
    key: "expenses",
    path: "/expenses",
    icon: LuCircleDollarSign,
    group: "reports",
    roles: ["admin"],
  },

  // System administration - touched least often
  {
    key: "users",
    path: "/users",
    icon: LuUsers,
    group: "administration",
    roles: ["admin"],
  },
  {
    key: "backups",
    path: "/backups",
    icon: LuCloudCog,
    group: "administration",
    roles: ["admin"],
  },
  {
    key: "auditLogs",
    path: "/audit-logs",
    icon: LuScrollText,
    group: "administration",
    roles: ["admin"],
  },
];
