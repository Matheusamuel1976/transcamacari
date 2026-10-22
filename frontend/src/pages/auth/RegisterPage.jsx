import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { TransitionLink as Link } from '../../motion/TransitionLink';
import { useTransition } from '../../motion/TransitionContext';

export function RegisterPage() {
  const { register, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const motion = useTransition();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    company_code: '',
  });
  const [kind, setKind] = useState('empresa');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOk('');
    try {
      const payload =
        kind === 'funcionario'
          ? {
              name: form.name,
              email: form.email,
              password: form.password,
              company_code: form.company_code,
            }
          : {
              name: form.name,
              email: form.email,
              password: form.password,
              company: form.company,
            };
      const data = await register(payload);
      setOk(
        data?.message ||
          (kind === 'funcionario'
            ? 'Cadastro enviado. Aguarde a aprovação da empresa.'
            : 'Cadastro realizado. Redirecionando para o login...'),
      );
      setTimeout(() => {
        if (motion) motion.go('/login', { variant: 'auth' });
        else navigate('/login');
      }, 2200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
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
            Criar
            <br />
            conta<em>.</em>
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
            Cadastre sua empresa responsável e gerencie o transporte.
          </p>
        </div>
        <form className="auth-card" onSubmit={submit}>
          <h2>Cadastro</h2>
          <div className="auth-kind" role="tablist" aria-label="Tipo de conta">
            {[
              ['empresa', 'Empresa'],
              ['funcionario', 'Funcionário'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={kind === value}
                className={kind === value ? 'active' : ''}
                onClick={() => {
                  setKind(value);
                  setError('');
                  setOk('');
                }}
              >
                {label}
              </button>
            ))}
          </div>
          {error && (
            <div className="alert alert-error" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          {ok && (
            <div className="alert alert-success" role="status">
              <CheckCircle2 size={16} />
              <span>{ok}</span>
            </div>
          )}
          <div className="input-group">
            <label className="input-label" htmlFor="name">
              Nome
            </label>
            <input
              id="name"
              required
              minLength={2}
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Seu nome"
            />
          </div>
          {kind === 'empresa' ? (
            <div className="input-group">
              <label className="input-label" htmlFor="company">
                Empresa / conta responsável
              </label>
              <input
                id="company"
                required
                minLength={2}
                className="input-field"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Ex.: Viação Camaçari"
              />
            </div>
          ) : (
            <div className="input-group">
              <label className="input-label" htmlFor="company_code">
                Código da empresa
              </label>
              <input
                id="company_code"
                required
                minLength={8}
                className="input-field"
                value={form.company_code}
                onChange={(e) =>
                  setForm({ ...form, company_code: e.target.value.trim() })
                }
                placeholder="Peça o código ao responsável"
                autoComplete="off"
              />
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
              placeholder="voce@empresa.com"
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="password">
              Senha (mín. 8)
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <button className="btn btn-accent btn-lg" disabled={loading}>
            <UserPlus size={18} /> {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
          <p className="auth-alt">
            Já tem conta? <Link to="/login">Entrar</Link> ·{' '}
            <Link to="/">Voltar ao site</Link>
          </p>
        </form>
      </div>
      <style>{`
        .auth-wrap{min-height:100vh;background:linear-gradient(135deg,#1A237E 0%,#12175C 70%);padding:calc(var(--header-height) + var(--space-10)) 0 var(--space-16);color:#F5F5F5}
        .auth-grid{display:grid;gap:var(--space-10);align-items:center;align-content:center;min-height:calc(100svh - 260px)}
        .auth-eyebrow{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#FF8A3D}
        .auth-visual h1{font-family:var(--font-display);font-size:clamp(2.6rem,6vw,4.6rem);line-height:1;letter-spacing:-.035em;color:#F5F5F5;margin:18px 0 8px}
        .auth-visual h1 em{font-style:normal;color:#FF6D00}
        .auth-route{width:100%;max-width:520px;height:auto;margin:30px 0 10px;overflow:visible}
        .auth-route path{stroke:#FF6D00;stroke-width:2.5}
        .auth-route circle{fill:#FF6D00}
        .auth-tag{color:rgba(245,245,245,.72);max-width:36ch}
        .auth-card{background:#212121;color:#F5F5F5;border:1px solid #4E59AC;border-radius:16px;padding:44px;display:flex;flex-direction:column;gap:20px;width:100%;max-width:600px;justify-self:end;box-shadow:0 24px 60px rgba(5,8,40,.45)}
        .auth-card h2{font-family:var(--font-display);color:#F5F5F5;font-size:25px;font-weight:500;letter-spacing:-.02em}
        .auth-kind{display:grid;grid-template-columns:1fr 1fr;gap:8px;background:rgba(245,245,245,.06);border:1px solid #4E59AC;border-radius:10px;padding:6px}
        .auth-kind button{padding:10px;border-radius:7px;font-size:13px;font-weight:600;color:#8A93C9;transition:background-color .18s,color .18s}
        .auth-kind button.active{background:#FF6D00;color:#212121}
        .auth-kind button:not(.active):hover{color:#F5F5F5}
        .auth-card .input-label{color:#C9D2E8}
        .auth-card .input-field{background:rgba(245,245,245,.06);border:1px solid #4E59AC;color:#F5F5F5;border-radius:10px;padding:15px 18px;font-size:15px}
        .auth-card .input-field::placeholder{color:#8A93C9}
        .auth-card .input-field:focus{border-color:#FF6D00;box-shadow:0 0 0 3px rgba(255,109,0,.25)}
        .auth-card .btn-accent{background:#FF6D00;border-color:#FF6D00;color:#212121}
        .auth-card .btn-accent:hover:not(:disabled){background:#FF8A3D;border-color:#FF8A3D}
        .auth-alt{font-size:var(--font-size-sm);color:#8A93C9}
        .auth-alt a{color:#FF8A3D;font-weight:600}
        .auth-alt a:hover{color:#FF6D00}
        @media(min-width:900px){.auth-grid{grid-template-columns:1fr 1.08fr;gap:clamp(40px,6vw,96px)}}
        @media(max-width:899px){.auth-route{max-width:340px}.auth-card{max-width:none;justify-self:stretch;padding:32px 24px}.auth-grid{min-height:0}}
      `}</style>
    </div>
  );
}
