import {
  LuBadgePercent,
  LuCakeSlice,
  LuCalculator,
  LuChartColumnIncreasing,
  LuChefHat,
  LuCircleDollarSign,
  LuClipboardList,
  LuCreditCard,
  LuDatabaseBackup,
  LuFileSpreadsheet,
  LuFileSearch,
  LuHistory,
  LuLayoutDashboard,
  LuPackageSearch,
  LuReceiptText,
  LuScrollText,
  LuSettings2,
  LuShieldCheck,
  LuShoppingBag,
  LuStore,
  LuTable2,
  LuUsersRound,
  LuWalletCards,
  LuWarehouse,
} from "react-icons/lu";

export const MENU_GROUPS = [
  { key: "overview", labelKey: "dashboard", icon: LuLayoutDashboard, collapsible: false },
  { key: "dailyOperations", labelKey: "navGroupOperations", icon: LuStore, collapsible: true },
  { key: "catalog", labelKey: "navGroupCatalog", icon: LuWarehouse, collapsible: true },
  { key: "business", labelKey: "navGroupBusiness", icon: LuSettings2, collapsible: true },
  { key: "reports", labelKey: "navGroupReports", icon: LuChartColumnIncreasing, collapsible: true },
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
    icon: LuCalculator,
    group: "dailyOperations",
    roles: ["cashier"],
  },
  {
    key: "orders",
    path: "/orders",
    icon: LuReceiptText,
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
    icon: LuWalletCards,
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
    icon: LuWarehouse,
    group: "catalog",
    roles: ["admin"],
  },
  {
    key: "stockHistory",
    path: "/inventory/history",
    icon: LuHistory,
    group: "catalog",
    roles: ["admin"],
  },
  {
    key: "ingredients",
    path: "/ingredients",
    icon: LuChefHat,
    group: "catalog",
    roles: ["admin"],
  },
  {
    key: "ingredientStockHistory",
    path: "/ingredients/history",
    icon: LuHistory,
    group: "catalog",
    roles: ["admin"],
  },

  // Marketing & configuration
  {
    key: "promotions",
    path: "/promotions",
    icon: LuBadgePercent,
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
    icon: LuFileSpreadsheet,
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
    icon: LuUsersRound,
    group: "administration",
    roles: ["admin"],
  },
  {
    key: "backups",
    path: "/backups",
    icon: LuDatabaseBackup,
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
