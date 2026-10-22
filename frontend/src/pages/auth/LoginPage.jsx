import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { TransitionLink as Link } from '../../motion/TransitionLink';
import { useTransition } from '../../motion/TransitionContext';

export function LoginPage() {
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const motion = useTransition();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(form.email, form.password);
      const dest = Number(data?.user?.must_change_password || 0)
        ? '/trocar-senha'
        : data?.user?.role === 'funcionario'
          ? '/minhas-linhas'
          : '/dashboard';

      if (motion) motion.go(dest, { variant: 'context', replace: true });
      else navigate(dest, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && !loading && motion?.phase !== 'exit') {
    if (user?.role === 'funcionario')
      return <Navigate to="/minhas-linhas" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <div className="auth-wrap">
      <div className="container auth-grid">
        <div className="auth-visual" aria-hidden="true">
          <p className="auth-eyebrow">Camaçari · Bahia</p>
          <h1>
            Entrar no
            <br />
            TransCamaçari<em>.</em>
          </h1>
          <svg className="auth-route" viewBox="0 0 520 180" fill="none">
            <path
              d="M12 140H140C190 140 170 60 230 60H330C390 60 380 140 440 140H508"
              pathLength="1000"
              strokeDasharray="1000"
            />
            <circle cx="12" cy="140" r="7" />
            <circle cx="270" cy="60" r="7" />
            <circle cx="508" cy="140" r="7" />
          </svg>
          <p className="auth-tag">
            Gerencie linhas, funcionários, pontos e horários.
          </p>
        </div>
        <form className="auth-card" onSubmit={submit}>
          <h2>Acesso ao painel</h2>
          {error && (
            <div className="alert alert-error" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          <div className="input-group">
            <label className="input-label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              className="input-field"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
              placeholder="voce@empresa.com"
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>
          <button className="btn btn-accent btn-lg" disabled={loading}>
            <LogIn size={18} /> {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <p className="auth-alt">
            Sem conta? <Link to="/register">Cadastre-se</Link> ·{' '}
            <Link to="/">Voltar ao site</Link>
          </p>
        </form>
      </div>
      <style>{`
        .auth-wrap{min-height:100vh;background:linear-gradient(135deg,#1A237E 0%,#12175C 70%);padding:calc(var(--header-height) + var(--space-10)) 0 var(--space-16);color:#F5F5F5}
        .auth-grid{display:grid;gap:var(--space-10);align-items:center;align-content:center;min-height:calc(100svh - 260px)}
        .auth-eyebrow{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#4E59AC}
        .auth-visual h1{font-family:var(--font-display);font-size:clamp(2.6rem,6vw,4.6rem);line-height:1;letter-spacing:-.035em;color:#F5F5F5;margin:18px 0 8px}
        .auth-visual h1 em{font-style:normal;color:#4E59AC}
        .auth-route{width:100%;max-width:520px;height:auto;margin:30px 0 10px;overflow:visible}
        .auth-route path{stroke:#1A237E;stroke-width:2.5}
        .auth-route circle{fill:#1A237E}
        .auth-tag{color:rgba(245,245,245,.72);max-width:36ch}
        .auth-card{background:#212121;color:#F5F5F5;border:1px solid #4E59AC;border-radius:16px;padding:44px;display:flex;flex-direction:column;gap:20px;width:100%;max-width:600px;justify-self:end;box-shadow:0 24px 60px rgba(5,8,40,.45)}
        .auth-card h2{font-family:var(--font-display);color:#F5F5F5;font-size:25px;font-weight:500;letter-spacing:-.02em}
        .auth-card .input-label{color:#C9D2E8}
        .auth-card .input-field{background:rgba(245,245,245,.06);border:1px solid #4E59AC;color:#F5F5F5;border-radius:10px;padding:15px 18px;font-size:15px}
        .auth-card .input-field::placeholder{color:#8A93C9}
        .auth-card .input-field:focus{border-color:#4E59AC;box-shadow:0 0 0 3px rgba(26,35,126,.25)}
        .auth-card .btn-accent{background:#1A237E;border-color:#1A237E;color:#F5F5F5}
        .auth-card .btn-accent:hover:not(:disabled){background:#12175C;border-color:#12175C}
        .auth-alt{font-size:var(--font-size-sm);color:#8A93C9}
        .auth-alt a{color:#4E59AC;font-weight:600}
        .auth-alt a:hover{color:#1A237E}
        @media(min-width:900px){.auth-grid{grid-template-columns:1fr 1.08fr;gap:clamp(40px,6vw,96px)}}
        @media(max-width:899px){.auth-route{max-width:340px}.auth-card{max-width:none;justify-self:stretch;padding:32px 24px}.auth-grid{min-height:0}}
      `}</style>
    </div>
  );
}
