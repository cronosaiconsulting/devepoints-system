import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Store } from './pages/Store';
import { Referrals } from './pages/Referrals';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UsersManagement } from './pages/admin/UsersManagement';
import RewardsManagement from './pages/admin/RewardsManagement';
import { StoreManagement } from './pages/admin/StoreManagement';
import { TransactionsView } from './pages/admin/TransactionsView';
import { OrdersView } from './pages/admin/OrdersView';
import { AnalyticsDashboard } from './pages/admin/AnalyticsDashboard';
import { SettingsView } from './pages/admin/SettingsView';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { token, isAdmin } = useAuth();
  if (!token) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

function AppRoutes() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" /> : <Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store"
        element={
          <ProtectedRoute>
            <Store />
          </ProtectedRoute>
        }
      />
      <Route
        path="/referrals"
        element={
          <ProtectedRoute>
            <Referrals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <UsersManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/rewards"
        element={
          <AdminRoute>
            <RewardsManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminRoute>
            <StoreManagement />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/transactions"
        element={
          <AdminRoute>
            <TransactionsView />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <OrdersView />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <AdminRoute>
            <AnalyticsDashboard />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <SettingsView />
          </AdminRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
