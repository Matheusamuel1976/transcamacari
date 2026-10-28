import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { TransitionLink as Link } from '../../motion/TransitionLink';

export function RegisterPage() {
  const [searchParams] = useSearchParams();
  const { register, user, isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    company_name: '',
    company_code: '',
  });
  const [kind, setKind] = useState(searchParams.get('tipo') === 'funcionario' ? 'employee' : 'company');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOk('');
    try {
      const data = await register({ ...form, kind });
      const ready = kind === 'company'
        ? 'Conta empresarial criada. Entre para concluir a configuração da empresa.'
        : 'Cadastro recebido. Após confirmar o e-mail, aguarde a aprovação da empresa.';
      setOk(data?.session ? ready : `${ready} Verifique seu e-mail para confirmar a conta.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated && !ok && !loading) {
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
            Empresas organizam sua operação privada. Funcionários acessam
            somente as linhas atribuídas após aprovação.
          </p>
        </div>
        <form className="auth-card" onSubmit={submit}>
          <h2>Cadastro</h2>
          <div className="auth-kind" role="tablist" aria-label="Tipo de cadastro">
            <button type="button" role="tab" aria-selected={kind === 'company'} className={kind === 'company' ? 'active' : ''} onClick={() => setKind('company')}>Empresa</button>
            <button type="button" role="tab" aria-selected={kind === 'employee'} className={kind === 'employee' ? 'active' : ''} onClick={() => setKind('employee')}>Funcionário</button>
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
              name="name"
              required
              minLength={2}
              className="input-field"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Seu nome"
            />
          </div>
          {kind === 'company' ? (
            <div className="input-group">
              <label className="input-label" htmlFor="company_name">Empresa</label>
              <input id="company_name" name="company_name" required minLength={2} className="input-field" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} placeholder="Nome da empresa" />
            </div>
          ) : (
            <div className="input-group">
              <label className="input-label" htmlFor="company_code">Código da empresa</label>
              <input id="company_code" name="company_code" required minLength={6} className="input-field" value={form.company_code} onChange={(e) => setForm({ ...form, company_code: e.target.value.toUpperCase() })} placeholder="Código fornecido pela empresa" autoComplete="off" />
            </div>
          )}
          <div className="input-group">
            <label className="input-label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              name="email"
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
              name="password"
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
        .auth-eyebrow{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--color-auth-muted)}
        .auth-visual h1{font-family:var(--font-display);font-size:clamp(2.6rem,6vw,4.6rem);line-height:1;letter-spacing:-.035em;color:#F5F5F5;margin:18px 0 8px}
        .auth-visual h1 em{font-style:normal;color:#4E59AC}
        .auth-route{width:100%;max-width:520px;height:auto;margin:30px 0 10px;overflow:visible}
        .auth-route path{stroke:#1A237E;stroke-width:2.5}
        .auth-route circle{fill:#1A237E}
        .auth-tag{color:rgba(245,245,245,.72);max-width:36ch}
        .auth-card{background:#212121;color:#F5F5F5;border:1px solid #4E59AC;border-radius:16px;padding:44px;display:flex;flex-direction:column;gap:20px;width:100%;max-width:600px;justify-self:end;box-shadow:0 24px 60px rgba(5,8,40,.45)}
        .auth-card h2{font-family:var(--font-display);color:#F5F5F5;font-size:25px;font-weight:500;letter-spacing:-.02em}
        .auth-kind{display:grid;grid-template-columns:1fr 1fr;border:1px solid #4E59AC;border-radius:10px;padding:4px}
        .auth-kind button{padding:10px;border-radius:7px;color:#C9D2E8;font-weight:600}
        .auth-kind button.active{background:#1A237E;color:#F5F5F5}
        .auth-card .input-label{color:#C9D2E8}
        .auth-card .input-field{background:rgba(245,245,245,.06);border:1px solid #4E59AC;color:#F5F5F5;border-radius:10px;padding:15px 18px;font-size:15px}
        .auth-card .input-field::placeholder{color:#8A93C9}
        .auth-card .input-field:focus{border-color:#4E59AC;box-shadow:0 0 0 3px rgba(26,35,126,.25)}
        .auth-card .btn-accent{background:#1A237E;border-color:#1A237E;color:#F5F5F5}
        .auth-card .btn-accent:hover:not(:disabled){background:#12175C;border-color:#12175C}
        .auth-alt{font-size:var(--font-size-sm);color:var(--color-auth-muted)}
        .auth-alt a{display:inline-flex;align-items:center;min-height:44px;color:var(--color-auth-muted);font-weight:600;text-decoration:underline;text-underline-offset:3px}
        .auth-alt a:hover{color:var(--color-white)}
        @media(min-width:900px){.auth-grid{grid-template-columns:1fr 1.08fr;gap:clamp(40px,6vw,96px)}}
        @media(max-width:899px){.auth-route{max-width:340px}.auth-card{max-width:none;justify-self:stretch;padding:32px 24px}.auth-grid{min-height:0}}
      `}</style>
    </div>
  );
}
