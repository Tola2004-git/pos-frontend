import { jwtDecode } from "jwt-decode";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "../pages/Login";
import LowStockToastStack from "../components/notifications/LowStockToastStack";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Products from "../pages/Products";
import Inventory from "../pages/Inventory";
import StockHistory from "../pages/StockHistory";
import Ingredients from "../pages/Ingredients";
import PaymentMethods from "../pages/Payments";
import Orders from "../pages/Orders";
import Tables from "../pages/Tables";
import Promotions from "../pages/Promotions";
import CashierHome from "../pages/CashierHome";
import CashierOrders from "../pages/CashierOrders";
import ShiftReview from "../pages/ShiftReview";

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
}

function PrivateRoute({ children, roles }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  try {
    const { exp } = jwtDecode(token);
    if (exp * 1000 < Date.now()) {
      clearSession();
      return <Navigate to="/login" replace />;
    }
  } catch {
    clearSession();
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
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

    if (!roles.includes(role)) {
      // Authenticated with a known role, just not allowed on this route -
      // send them back to whichever home page actually matches their role.
      return <Navigate to={getHomePathForRole(role)} replace />;
    }
  }

  return children;
}

function GlobalLowStockAlerts() {
  const location = useLocation();
  if (location.pathname === "/login") return null;
  return <LowStockToastStack />;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <GlobalLowStockAlerts />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={(() => {
            const token = localStorage.getItem("token");
            if (!token) return <Navigate to="/login" replace />;
            try {
              const { exp } = jwtDecode(token);
              if (exp * 1000 < Date.now()) {
                clearSession();
                return <Navigate to="/login" replace />;
              }
              const role = getStoredRole();
              if (!role || !KNOWN_ROLES.includes(role)) {
                clearSession();
                return <Navigate to="/login" replace />;
              }
              return <Navigate to={getHomePathForRole(role)} replace />;
            } catch {
              clearSession();
              return <Navigate to="/login" replace />;
            }
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
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
