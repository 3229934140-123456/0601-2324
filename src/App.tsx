import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Warnings from '@/pages/Warnings';
import Procurement from '@/pages/Procurement';
import Reports from '@/pages/Reports';
import UserManagement from '@/pages/System/UserManagement';
import HospitalManagement from '@/pages/System/HospitalManagement';
import { useAuthStore } from '@/store/auth';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, fetchUser } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, fetchUser]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/warnings"
          element={
            <ProtectedRoute>
              <Layout>
                <Warnings />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/procurement"
          element={
            <ProtectedRoute>
              <Layout>
                <Procurement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/system/users"
          element={
            <ProtectedRoute>
              <Layout>
                <UserManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/system/hospitals"
          element={
            <ProtectedRoute>
              <Layout>
                <HospitalManagement />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
