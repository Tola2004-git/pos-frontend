import { jwtDecode } from "jwt-decode";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "../pages/Login";
import LowStockToastStack from "../components/notifications/LowStockToastStack";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import Products from "../pages/Products";
import Inventory from "../pages/Inventory";
import StockHistory from "../pages/StockHistory";
import PaymentMethods from "../pages/Payments";
import Orders from "../pages/Orders";
import Tables from "../pages/Tables";
import Promotions from "../pages/Promotions";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" />;

  try {
    const { exp } = jwtDecode(token);
    if (exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      return <Navigate to="/login" />;
    }
  } catch {
    localStorage.removeItem("token");
    return <Navigate to="/login" />;
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
            if (!token) return <Navigate to="/login" />;
            try {
              const { exp } = jwtDecode(token);
              if (exp * 1000 < Date.now()) {
                localStorage.removeItem("token");
                return <Navigate to="/login" />;
              }
              return <Navigate to="/dashboard" />;
            } catch {
              localStorage.removeItem("token");
              return <Navigate to="/login" />;
            }
          })()}
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/products"
          element={
            <PrivateRoute>
              <Products />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <PrivateRoute>
              <Inventory />
            </PrivateRoute>
          }
        />
        <Route
          path="/inventory/history"
          element={
            <PrivateRoute>
              <StockHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/payment-methods"
          element={
            <PrivateRoute>
              <PaymentMethods />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <Orders />
            </PrivateRoute>
          }
        />
        <Route
          path="/tables"
          element={
            <PrivateRoute>
              <Tables />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <Users />
            </PrivateRoute>
          }
        />
        <Route
          path="/promotions"
          element={
            <PrivateRoute>
              <Promotions />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
