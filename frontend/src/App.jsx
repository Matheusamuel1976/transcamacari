import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TransitionOverlay } from './motion/TransitionOverlay';
import { AnimatedPage } from './motion/AnimatedPage';
import { ScrollManager } from './motion/ScrollManager';
import { useTransition } from './motion/TransitionContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardOverview } from './pages/dashboard/DashboardOverview';
import { LinesManagement } from './pages/dashboard/LinesManagement';
import { EmployeesManagement } from './pages/dashboard/EmployeesManagement';
import { MapPage } from './pages/dashboard/MapPage';
import { AccountSettings } from './pages/dashboard/AccountSettings';

function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const motion = useTransition();
  if (loading)
    return (
      <div className="loading-fullscreen" aria-label="Carregando">
        <div className="loading-spinner" />
      </div>
    );
  // Keep the outgoing composition only during the confirmed logout exit.
  if (!isAuthenticated && !(motion.phase === 'exit' && motion.variant === 'logout')) return <Navigate to="/login" replace />;
  // Entrada rápida de conteúdo: sidebar estável, só o miolo anima.
  return (
    <DashboardLayout>
      <AnimatedPage mode="content">{children}</AnimatedPage>
    </DashboardLayout>
  );
}

function HomeRoute() {
  const { isAuthenticated, loading } = useAuth();
  if (loading)
    return (
      <div className="loading-fullscreen" aria-label="Carregando">
        <div className="loading-spinner" />
      </div>
    );
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AnimatedPage>
            <HomeRoute />
          </AnimatedPage>
        }
      />
      <Route
        path="/login"
        element={
          <AnimatedPage>
            <LoginPage />
          </AnimatedPage>
        }
      />
      <Route
        path="/register"
        element={
          <AnimatedPage>
            <RegisterPage />
          </AnimatedPage>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <DashboardOverview />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/linhas"
        element={
          <RequireAuth>
            <LinesManagement />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/funcionarios"
        element={
          <RequireAuth>
            <EmployeesManagement />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/mapa"
        element={
          <RequireAuth>
            <MapPage />
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard/configuracoes"
        element={
          <RequireAuth>
            <AccountSettings />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppContent() {
  const { pathname } = useLocation();
  const isDashboard = pathname.startsWith('/dashboard');
  return (
    <>
      <ScrollManager />
      <TransitionOverlay />
      {!isDashboard && <Navbar />}
      <main
        id="main-content"
        className="main-content"
      >
        <AppRoutes />
      </main>
      <style>{`
        .loading-fullscreen{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:var(--color-petroleum);z-index:9999}
        .loading-spinner{width:48px;height:48px;border:3px solid rgba(234,191,85,.3);border-top-color:var(--color-solar);border-radius:50%;animation:spin 1s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .main-content{min-height:100vh}
      `}</style>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
