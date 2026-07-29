import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Login from "../pages/Login";
import LowStockToastStack from "../components/notifications/LowStockToastStack";
import LockScreen from "../components/LockScreen";
import { useIdleLogout } from "../hooks/useIdleLogout";
import { useTranslations } from "../hooks/useTranslations";
import { alertWarning } from "../utils/alert.jsx";
import { clearCachedUser } from "../utils/currentUserCache";
import { resetCashierShiftCache } from "../hooks/useCashierShift";
import { isSessionStale, clearActivity } from "../utils/sessionActivity";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Products from "../pages/Products";
import Inventory from "../pages/Inventory";
import StockHistory from "../pages/StockHistory";
import Ingredients from "../pages/Ingredients";
import IngredientStockHistory from "../pages/IngredientStockHistory";
import PaymentMethods from "../pages/Payments";
import Orders from "../pages/Orders";
import Tables from "../pages/Tables";
import Promotions from "../pages/Promotions";
import CashierHome from "../pages/CashierHome";
import CashierOrders from "../pages/CashierOrders";
import ShiftReview from "../pages/ShiftReview";
import DailyExports from "../pages/DailyExports";
import Expenses from "../pages/Expenses";
import Backups from "../pages/Backups";
import AuditLogs from "../pages/AuditLogs";

// Role isn't embedded in the JWT (see AuthController@login) - it's cached in
// localStorage right after login (see Login.jsx) so route guards can check
// it synchronously, the same way the token itself is checked.
const KNOWN_ROLES = ["admin", "cashier"];

function getStoredRole() {
  return localStorage.getItem("role");
}

function getHomePathForRole(role) {
  return role === "admin" ? "/dashboard" : "/cashier";
}

function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  clearActivity();
}

function PrivateRoute({ children, roles }) {
  const token = localStorage.getItem("token");

  // Deliberately not checking the token's own exp here (used to, via
  // jwt-decode) - an access token past its 60min TTL isn't necessarily a
  // dead session anymore now that apiClient.js silently refreshes on a 401
  // and replays the request. Redirecting here on expiry alone would fire
  // before that refresh ever gets a chance to run, undoing it. A token
  // that's truly dead (past the 14-day refresh_ttl, or invalid) still ends
  // up here - just one API round-trip later, once the refresh attempt
  // itself comes back 401 and apiClient.js's own redirect kicks in.
  if (!token) return <Navigate to="/login" replace />;

  const role = getStoredRole();

  // A missing/unrecognized role can't be trusted to compute a safe home
  // path - getHomePathForRole would default it to "/cashier", which can
  // equal the very route being blocked and cause an infinite redirect
  // loop (React's "Maximum update depth exceeded", seen as a blank
  // white screen). Treat an untrustworthy role as an invalid session.
  if (!role || !KNOWN_ROLES.includes(role)) {
    clearSession();
    return <Navigate to="/login" replace />;
  }

  // The in-tab idle lock (useIdleLogout) can't catch a tab that was closed
  // outright - nothing runs to lock it. This is the equivalent check for
  // that case: if the tab (or the OS) was gone longer than this role's idle
  // timeout, the reopened tab still has a valid token, but the session
  // shouldn't be trusted anymore - require a real login, same as if the
  // lock screen's password check had failed.
  if (isSessionStale(role)) {
    clearSession();
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(role)) {
    // Authenticated with a known role, just not allowed on this route -
    // send them back to whichever home page actually matches their role.
    return <Navigate to={getHomePathForRole(role)} replace />;
  }

  return children;
}

function GlobalLowStockAlerts() {
  const location = useLocation();
  if (location.pathname === "/login") return null;
  return <LowStockToastStack />;
}

function IdleLockGuard() {
  const { t } = useTranslations();
  const navigate = useNavigate();
  const location = useLocation();
  const [locked, setLocked] = useState(false);
  const token = localStorage.getItem("token");
  const enabled = Boolean(token) && location.pathname !== "/login" && !locked;

  useIdleLogout({
    enabled,
    onWarning: () => alertWarning(t.idleWarningTitle, t.idleWarningMsg),
    // Idle timeout locks the screen in place rather than logging out, so an
    // order/cart the cashier had open isn't lost - unlocking re-enters the
    // same password through /login and resumes exactly where they left off.
    onTimeout: () => setLocked(true),
  });

  // Derived rather than synced via effect: nothing inside the lock screen
  // itself can navigate to /login (it has no route link, and the "not you?
  // log out" button clears `locked` before navigating), so this only
  // matters as a fallback in case the route ever changes out from under it.
  if (!locked || location.pathname === "/login") return null;

  return (
    <LockScreen
      onUnlock={() => setLocked(false)}
      onFullLogout={() => {
        clearSession();
        clearCachedUser();
        resetCashierShiftCache();
        setLocked(false);
        navigate("/login", { replace: true });
      }}
    />
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <GlobalLowStockAlerts />
      <IdleLockGuard />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={(() => {
            // See PrivateRoute for why this doesn't check token expiry, and
            // for the same closed-tab staleness check.
            const token = localStorage.getItem("token");
            if (!token) return <Navigate to="/login" replace />;
            const role = getStoredRole();
            if (!role || !KNOWN_ROLES.includes(role) || isSessionStale(role)) {
              clearSession();
              return <Navigate to="/login" replace />;
            }
            return <Navigate to={getHomePathForRole(role)} replace />;
          })()}
        />
        <Route
          path="/cashier"
          element={
            <PrivateRoute roles={["admin", "cashier"]}>
              <CashierHome />
            </PrivateRoute>
          }
        />
        <Route
          path="/cashier/orders"
          element={
            <PrivateRoute roles={["admin", "cashier"]}>
              <CashierOrders />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute roles={["admin", "cashier"]}>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/products"
          element={
            <PrivateRoute roles={["admin"]}>
              <Products />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <PrivateRoute roles={["admin"]}>
              <Inventory />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventory/history"
          element={
            <PrivateRoute roles={["admin"]}>
              <StockHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/ingredients"
          element={
            <PrivateRoute roles={["admin"]}>
              <Ingredients />
            </PrivateRoute>
          }
        />
        <Route
          path="/ingredients/history"
          element={
            <PrivateRoute roles={["admin"]}>
              <IngredientStockHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/payment-methods"
          element={
            <PrivateRoute roles={["admin"]}>
              <PaymentMethods />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute roles={["admin", "cashier"]}>
              <Orders />
            </PrivateRoute>
          }
        />
        <Route
          path="/tables"
          element={
            <PrivateRoute roles={["admin"]}>
              <Tables />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute roles={["admin"]}>
              <Users />
            </PrivateRoute>
          }
        />
        <Route
          path="/promotions"
          element={
            <PrivateRoute roles={["admin"]}>
              <Promotions />
            </PrivateRoute>
          }
        />
        <Route
          path="/shifts"
          element={
            <PrivateRoute roles={["admin"]}>
              <ShiftReview />
            </PrivateRoute>
          }
        />
        <Route
          path="/daily-exports"
          element={
            <PrivateRoute roles={["admin"]}>
              <DailyExports />
            </PrivateRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <PrivateRoute roles={["admin"]}>
              <Expenses />
            </PrivateRoute>
          }
        />
        <Route
          path="/backups"
          element={
            <PrivateRoute roles={["admin"]}>
              <Backups />
            </PrivateRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <PrivateRoute roles={["admin"]}>
              <AuditLogs />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
