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
import { MyLinesPage } from './pages/MyLinesPage';

function LoadingScreen() {
  return (
    <div className="loading-fullscreen" aria-label="Carregando">
      <div className="loading-spinner" />
    </div>
  );
}

function RequireStaff({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  const motion = useTransition();
  if (loading) return <LoadingScreen />;
  if (
    !isAuthenticated &&
    !(motion.phase === 'exit' && motion.variant === 'logout')
  )
    return <Navigate to="/login" replace />;
  if (user?.role === 'funcionario')
    return <Navigate to="/minhas-linhas" replace />;
  return (
    <DashboardLayout>
      <AnimatedPage mode="content">{children}</AnimatedPage>
    </DashboardLayout>
  );
}

function RequireFuncionario({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'funcionario') return <Navigate to="/dashboard" replace />;
  return <AnimatedPage mode="content">{children}</AnimatedPage>;
}

function HomeRoute() {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (isAuthenticated) {
    if (user?.role === 'funcionario')
      return <Navigate to="/minhas-linhas" replace />;
    return <Navigate to="/dashboard" replace />;
  }
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
          <RequireStaff>
            <DashboardOverview />
          </RequireStaff>
        }
      />
      <Route
        path="/dashboard/linhas"
        element={
          <RequireStaff>
            <LinesManagement />
          </RequireStaff>
        }
      />
      <Route
        path="/dashboard/funcionarios"
        element={
          <RequireStaff>
            <EmployeesManagement />
          </RequireStaff>
        }
      />
      <Route
        path="/dashboard/mapa"
        element={
          <RequireStaff>
            <MapPage />
          </RequireStaff>
        }
      />
      <Route
        path="/dashboard/configuracoes"
        element={
          <RequireStaff>
            <AccountSettings />
          </RequireStaff>
        }
      />
      <Route
        path="/minhas-linhas"
        element={
          <RequireFuncionario>
            <MyLinesPage />
          </RequireFuncionario>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function AppContent() {
  const { pathname } = useLocation();
  const isDashboard =
    pathname.startsWith('/dashboard') || pathname === '/minhas-linhas';
  return (
    <>
      <ScrollManager />
      <TransitionOverlay />
      {!isDashboard && <Navbar />}
      <main id="main-content" className="main-content">
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
