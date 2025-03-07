import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/layout/header';
import { Sidebar } from './components/layout/sidebar';
import { LandingPage } from './pages/landing';
import { LoginPage } from './pages/login';
import { SignupPage } from './pages/signup';
import { DashboardPage } from './pages/dashboard';
import { WorkflowsPage } from './pages/workflows';
import { WorkflowEditPage } from './pages/workflows/edit';
import { AccountsPage } from './pages/accounts';
import { ReferralPage } from './pages/referral';
import { SettingsPage } from './pages/settings';
import { HelpPage } from './pages/help';
import { NotificationsPage } from './pages/notifications';
import { OAuthCallback } from './pages/auth/callback';
import { AuthProvider, useAuth } from './lib/auth.tsx';
import { Toaster } from 'react-hot-toast';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Sidebar />
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/workflows"
              element={
                <PrivateRoute>
                  <Sidebar />
                  <WorkflowsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/workflows/:id/edit"
              element={
                <PrivateRoute>
                  <WorkflowEditPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/accounts"
              element={
                <PrivateRoute>
                  <Sidebar />
                  <AccountsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/referral"
              element={
                <PrivateRoute>
                  <Sidebar />
                  <ReferralPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PrivateRoute>
                  <Sidebar />
                  <SettingsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/help"
              element={
                <PrivateRoute>
                  <Sidebar />
                  <HelpPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <PrivateRoute>
                  <Sidebar />
                  <NotificationsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/auth/callback/:platform"
              element={<OAuthCallback />}
            />
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Header />
                  <LandingPage />
                </PublicRoute>
              }
            />
          </Routes>
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              style: {
                background: '#059669',
              },
            },
            error: {
              style: {
                background: '#DC2626',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;