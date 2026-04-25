import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { PendingOrdersProvider } from "@/hooks/use-pending-orders";
import { Toaster } from "sonner";
import AppShell from "@/components/layout/app-shell";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/supplier/dashboard";
import RetailersPage from "@/pages/supplier/retailers";
import ProductsPage from "@/pages/supplier/products";
import OrdersPage from "@/pages/supplier/orders";
import OrderDetailPage from "@/pages/supplier/order-detail";
import AnalyticsPage from "@/pages/supplier/analytics";
import SupplierInvoicesPage from "@/pages/supplier/invoices";
import ManualOrderPage from "@/pages/supplier/manual-order";
import CatalogPage from "@/pages/retailer/catalog";
import CartPage from "@/pages/retailer/cart";
import RetailerOrdersPage from "@/pages/retailer/orders";
import RetailerInvoicesPage from "@/pages/retailer/invoices";

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === "supplier" ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/catalog" replace />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PendingOrdersProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<AppShell />}>
            {/* Supplier routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/retailers" element={<RetailersPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/invoices" element={<SupplierInvoicesPage />} />
            <Route path="/invoices/new" element={<ManualOrderPage />} />
            {/* Retailer routes */}
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/my-orders" element={<RetailerOrdersPage />} />
            <Route path="/my-orders/:id" element={<OrderDetailPage />} />
            <Route path="/my-invoices" element={<RetailerInvoicesPage />} />
          </Route>
          <Route path="*" element={<RoleRedirect />} />
        </Routes>
        </PendingOrdersProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
