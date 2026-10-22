import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Bus,
  Users,
  Map,
  Settings,
  LogOut,
  Menu,
  X,
  Mail,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTransition } from '../motion/TransitionContext';
import { api } from '../services/api';

const links = [
  { to: '/dashboard', label: 'Visão geral', icon: LayoutDashboard, end: true },
  { to: '/dashboard/linhas', label: 'Linhas', icon: Bus },
  { to: '/dashboard/funcionarios', label: 'Funcionários', icon: Users },
  { to: '/dashboard/mapa', label: 'Mapa', icon: Map },
  { to: '/dashboard/mensagens', label: 'Mensagens', icon: Mail },
  { to: '/dashboard/configuracoes', label: 'Conta', icon: Settings },
];

export function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const motion = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    let alive = true;
    api.team
      .pending()
      .then((d) => {
        if (alive) setPendingCount((d.data || []).length);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const adminGo = (e, to) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    e.preventDefault();
    setOpen(false);
    if (motion) motion.go(to, { variant: 'admin' });
    else navigate(to);
  };

  const doLogout = async () => {
    try {
      await logout();
      if (motion) motion.go('/login', { variant: 'logout' });
      else navigate('/login');
    } catch {
      setError('Não foi possível encerrar a sessão. Tente novamente.');
    }
  };

  return (
    <div className="dash">
      <aside className={`dash-side ${open ? 'open' : ''}`}>
        <div className="dash-brand">
          TransCamaçari <span>painel</span>
        </div>
        <nav aria-label="Painel">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `dash-link ${isActive ? 'active' : ''}`
              }
              onClick={(e) => adminGo(e, l.to)}
            >
              <l.icon size={18} /> {l.label}
              {l.to === '/dashboard/funcionarios' && pendingCount > 0 && (
                <span
                  className="dash-badge"
                  aria-label={`${pendingCount} aprovações pendentes`}
                >
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="dash-user">
          <div className="avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
          <div>
            <p>{user?.name}</p>
            <span>{user?.email}</span>
          </div>
          <button onClick={doLogout} aria-label="Sair">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <div className="dash-main">
        <header className="dash-top">
          <button
            className="dash-menu"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <p className="dash-top-title">Gerenciamento</p>
        </header>
        <div className="dash-content">
          {error && (
            <p className="alert alert-error" role="alert">
              {error}
            </p>
          )}
          {children}
        </div>
      </div>
      <style>{`
        .dash{display:flex;min-height:100vh;background:var(--color-ivory)}
        .dash-side{position:fixed;top:0;bottom:0;left:0;width:260px;background:var(--color-petroleum);color:var(--color-ivory);padding:var(--space-6);display:flex;flex-direction:column;gap:var(--space-6);transform:translateX(-100%);transition:transform .3s ease;z-index:900}
        .dash-side.open{transform:none}
        .dash-brand{font-family:var(--font-display);font-weight:700;font-size:var(--font-size-lg)}
        .dash-brand span{color:#4E59AC;font-weight:400;font-size:var(--font-size-sm)}
        .dash-link{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);border-radius:var(--radius-md);color:rgba(245,245,245,.78);font-size:var(--font-size-sm);font-weight:500}
        .dash-link:hover{background:rgba(245,245,245,.1);color:var(--color-ivory)}
        .dash-link.active{background:#1A237E;color:#F5F5F5}
        .dash-badge{margin-left:auto;min-width:22px;height:22px;padding:0 6px;display:grid;place-items:center;border-radius:100px;background:#1A237E;color:#F5F5F5;font-size:11px;font-weight:700}
        .dash-link.active .dash-badge{background:#212121;color:#1A237E}
        .dash-user{margin-top:auto;display:flex;align-items:center;gap:var(--space-3);padding-top:var(--space-4);border-top:1px solid #4E59AC}
        .dash-user p{font-size:var(--font-size-sm);font-weight:600}
        .dash-user span{font-size:var(--font-size-xs);opacity:.6}
        .dash-user button{margin-left:auto;color:var(--color-ivory)}
        .dash-main{flex:1;min-width:0;margin-left:0}
        .dash-top{display:flex;align-items:center;gap:var(--space-4);padding:var(--space-4) var(--space-6);background:var(--color-white);border-bottom:1px solid var(--color-gray-200)}
        .dash-top-title{font-family:var(--font-display);font-weight:600;color:var(--color-petroleum)}
        .dash-menu{display:flex}
        .dash-content{padding:var(--space-6);max-width:1100px}
        @media(min-width:1024px){.dash-side{transform:none}.dash-main{margin-left:260px}.dash-menu{display:none}}
      `}</style>
    </div>
  );
}
