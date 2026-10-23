import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function ChangePasswordPage() {
  const { user, isAuthenticated, updatePassword, loading: authLoading, isRecovery } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ current: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);

  if (authLoading) return <p role="status">Verificando sessão…</p>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setOk('');
    if (form.password !== form.confirm) {
      setError('A nova senha e a confirmação não coincidem.');
      return;
    }
    setLoading(true);
    try {
      await updatePassword(form.current, form.password);
      setOk('Senha atualizada. Levando você à sua área…');
      setTimeout(() => {
        navigate(
          user?.role === 'funcionario' ? '/minhas-linhas' : '/dashboard',
          { replace: true },
        );
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="container auth-grid auth-grid--single">
        <form className="auth-card" onSubmit={submit}>
          <h2>
            <KeyRound size={22} /> Troque sua senha
          </h2>
          <p className="auth-tag">
            Por segurança, quem recebe acesso da empresa precisa definir a
            própria senha no primeiro acesso.
          </p>
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
          {!isRecovery && <div className="input-group">
            <label className="input-label" htmlFor="current">
              Senha atual (a inicial que você recebeu)
            </label>
            <input
              id="current"
              type="password"
              required
              className="input-field"
              value={form.current}
              onChange={(e) => setForm({ ...form, current: e.target.value })}
              autoComplete="current-password"
            />
          </div>}
          <div className="input-group">
            <label className="input-label" htmlFor="password">
              Nova senha (mín. 8)
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              className="input-field"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="confirm">
              Confirmar nova senha
            </label>
            <input
              id="confirm"
              type="password"
              required
              minLength={8}
              className="input-field"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              autoComplete="new-password"
            />
          </div>
          <button className="btn btn-accent btn-lg" disabled={loading}>
            <KeyRound size={18} /> {loading ? 'Salvando…' : 'Definir senha'}
          </button>
        </form>
      </div>
      <style>{`
        .auth-wrap{min-height:100vh;background:linear-gradient(135deg,#1A237E 0%,#12175C 70%);padding:calc(var(--header-height) + var(--space-10)) 0 var(--space-16);color:#F5F5F5}
        .auth-grid--single{max-width:560px}
        .auth-card{background:#212121;color:#F5F5F5;border:1px solid #4E59AC;border-radius:16px;padding:44px;display:flex;flex-direction:column;gap:20px;box-shadow:0 24px 60px rgba(5,8,40,.45)}
        .auth-card h2{font-family:var(--font-display);color:#F5F5F5;font-size:25px;font-weight:500;display:flex;align-items:center;gap:10px}
        .auth-card h2 svg{color:#4E59AC}
        .auth-tag{color:rgba(245,245,245,.72);font-size:14px}
        .auth-card .input-label{color:#C9D2E8}
        .auth-card .input-field{background:rgba(245,245,245,.06);border:1px solid #4E59AC;color:#F5F5F5;border-radius:10px;padding:15px 18px;font-size:15px}
        .auth-card .input-field:focus{border-color:#4E59AC;box-shadow:0 0 0 3px rgba(26,35,126,.25)}
        .auth-card .btn-accent{background:#1A237E;border-color:#1A237E;color:#F5F5F5}
        .auth-card .btn-accent:hover:not(:disabled){background:#12175C;border-color:#12175C}
        @media(max-width:899px){.auth-card{padding:32px 24px}}
      `}</style>
    </div>
  );
}
