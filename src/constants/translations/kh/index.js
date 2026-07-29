import dashboard from "./dashboard.js";
import orders from "./orders.js";
import common from "./common.js";
import products from "./products.js";
import inventory from "./inventory.js";
import stockHistory from "./stockHistory.js";
import ingredients from "./ingredients.js";
import payments from "./payments.js";
import users from "./users.js";
import promotions from "./promotions.js";
import login from "./login.js";
import shiftReview from "./shiftReview.js";
import nav from "./nav.js";
import dailyExports from "./dailyExports.js";
import backups from "./backups.js";
import expenses from "./expenses.js";
import auditLogs from "./auditLogs.js";
import background from "./background.js";
import cashierShift from "./cashierShift.js";
import cashierHome from "./cashierHome.js";
import tables from "./tables.js";
import cashierOrders from "./cashierOrders.js";
import posModal from "./posModal.js";

export default {
  ...dashboard,
  ...orders,
  ...common,
  ...products,
  ...inventory,
  ...stockHistory,
  ...ingredients,
  ...payments,
  ...users,
  ...promotions,
  ...login,
  ...shiftReview,
  ...nav,
  ...dailyExports,
  ...backups,
  ...expenses,
  ...auditLogs,
  ...background,
  ...cashierShift,
  ...cashierHome,
  ...tables,
  ...cashierOrders,
  ...posModal,
};
