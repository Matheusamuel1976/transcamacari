import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
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
import { MensagensPage } from './pages/dashboard/MensagensPage';
import { AccountSettings } from './pages/dashboard/AccountSettings';
import { MyLinesPage } from './pages/MyLinesPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { LinesPage } from './pages/LinesPage';
import { LineDetailPage } from './pages/LineDetailPage';
import { HistoricalLinesPage } from './pages/HistoricalLinesPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { configurationError } from './services/supabase';

function needsPasswordChange(user) {
  return Number(user?.must_change_password || 0) === 1;
}

function LoadingScreen() {
  return (
    <div className="loading-fullscreen" aria-label="Carregando">
      <div className="loading-spinner" />
    </div>
  );
}

function MembershipState({ status }) {
  const { logout } = useAuth();
  const pending = status === 'pending';
  const rejected = status === 'rejected';
  return <section className="container" style={{ paddingBlock: '8rem' }} role="status">
    <h1>{pending ? 'Cadastro aguardando aprovação' : rejected ? 'Cadastro recusado' : 'Acesso suspenso'}</h1>
    <p>{pending ? 'O responsável da empresa ainda precisa aprovar seu vínculo e atribuir suas linhas.' : rejected ? 'A empresa recusou este pedido de vínculo. Solicite orientação ao responsável antes de tentar novamente.' : 'Seu acesso ao painel privado foi suspenso pela empresa.'}</p>
    <button className="btn btn-primary" onClick={() => logout().catch(() => window.location.reload())}>Sair</button>
  </section>;
}

MembershipState.propTypes = { status: PropTypes.string.isRequired };

function RequireStaff({ children }) {
  const { user, isAuthenticated, loading, profileError, logout } = useAuth();
  const motion = useTransition();
  if (loading) return <LoadingScreen />;
  if (
    !isAuthenticated &&
    !(motion.phase === 'exit' && motion.variant === 'logout')
  )
    return <Navigate to="/login" replace />;
  if (user?.role === 'funcionario' && user?.status !== 'active') return <MembershipState status={user.status} />;
  if (user?.role === 'funcionario')
    return <Navigate to="/minhas-linhas" replace />;
  if (!['admin', 'company_admin'].includes(user?.role)) return <section className="container" style={{ paddingBlock: '8rem' }}><h1>Acesso administrativo restrito</h1><p>{profileError || 'Sua conta não possui permissão para administrar o transporte.'}</p><a href="/linhas">Consultar linhas</a>{' '}<button className="btn btn-primary" onClick={() => logout().catch(() => window.location.reload())}>Sair</button></section>;
  if (needsPasswordChange(user)) return <Navigate to="/trocar-senha" replace />;
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
  if (user?.status !== 'active') return <MembershipState status={user.status} />;
  if (needsPasswordChange(user)) return <Navigate to="/trocar-senha" replace />;
  return <AnimatedPage mode="content">{children}</AnimatedPage>;
}

function RequirePlatformAdmin({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <DashboardLayout><AnimatedPage mode="content">{children}</AnimatedPage></DashboardLayout>;
}

function RequireCompanyAdmin({ children }) {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'company_admin') return <Navigate to="/dashboard" replace />;
  if (needsPasswordChange(user)) return <Navigate to="/trocar-senha" replace />;
  return <DashboardLayout><AnimatedPage mode="content">{children}</AnimatedPage></DashboardLayout>;
}

RequireStaff.propTypes = { children: PropTypes.node.isRequired };
RequireFuncionario.propTypes = { children: PropTypes.node.isRequired };
RequirePlatformAdmin.propTypes = { children: PropTypes.node.isRequired };
RequireCompanyAdmin.propTypes = { children: PropTypes.node.isRequired };

function HomeRoute() {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (isAuthenticated) {
    if (needsPasswordChange(user))
      return <Navigate to="/trocar-senha" replace />;
    if (user?.role === 'funcionario' && user?.status !== 'active') return <MembershipState status={user.status} />;
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
        path="/linhas"
        element={
          <AnimatedPage>
            <LinesPage />
          </AnimatedPage>
        }
      />
      <Route
        path="/linhas/historico"
        element={
          <AnimatedPage>
            <HistoricalLinesPage />
          </AnimatedPage>
        }
      />
      <Route
        path="/linhas/:id"
        element={
          <AnimatedPage>
            <LineDetailPage />
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
          <RequireCompanyAdmin>
            <EmployeesManagement />
          </RequireCompanyAdmin>
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
        path="/dashboard/mensagens"
        element={
          <RequirePlatformAdmin>
            <MensagensPage />
          </RequirePlatformAdmin>
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
      <Route
        path="/trocar-senha"
        element={
          <AnimatedPage>
            <ChangePasswordPage />
          </AnimatedPage>
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
  const isCatalog = pathname.startsWith('/linhas');
  return (
    <>
      <ScrollManager />
      <TransitionOverlay />
      {!isDashboard && <Navbar />}
      <main id="main-content" className={`main-content${isCatalog ? ' main-content--catalog' : ''}`}>
        <ErrorBoundary key={pathname}><AppRoutes /></ErrorBoundary>
      </main>
      <style>{`
        .loading-fullscreen{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:var(--color-petroleum);z-index:9999}
        .loading-spinner{width:48px;height:48px;border:3px solid rgba(26,35,126,.3);border-top-color:var(--color-petroleum-light);border-radius:50%;animation:spin 1s linear infinite}
        @keyframes spin{to{transform:rotate(360deg)}}
        .main-content{min-height:100vh}
        .main-content--catalog{width:100%;max-width:var(--container-max);margin:0 auto;padding:calc(var(--header-height) + var(--space-10)) var(--container-padding) var(--space-16)}
      `}</style>
    </>
  );
}

export default function App() {
  if (configurationError) return <main className="container" role="alert" style={{ paddingBlock: '8rem' }}><h1>Serviço temporariamente indisponível</h1><p>A conexão de dados precisa ser configurada pela equipe responsável.</p><button className="btn btn-primary" onClick={() => window.location.reload()}>Tentar novamente</button></main>;
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
