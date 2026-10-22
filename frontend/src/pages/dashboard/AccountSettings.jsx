import { useState } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

export function AccountSettings() {
  const { user, updateUser, updatePassword } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [status, setStatus] = useState({ error: false, text: '' });
  const [saving, setSaving] = useState(false);
  const [smtp, setSmtp] = useState({ sending: false, text: '', error: false });
  const [pw, setPw] = useState({ current: '', password: '', confirm: '' });
  const [pwStatus, setPwStatus] = useState({ error: false, text: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus({ error: false, text: '' });
    try {
      await updateUser({ name });
      setStatus({ error: false, text: 'Nome salvo na sua conta.' });
    } catch (error) {
      setStatus({ error: true, text: error.message });
    } finally {
      setSaving(false);
    }
  };
  const testSmtp = async () => {
    setSmtp({ sending: true, text: '', error: false });
    try {
      const d = await api.smtpTest();
      setSmtp({ sending: false, text: d.message, error: false });
    } catch (error) {
      setSmtp({ sending: false, text: error.message, error: true });
    }
  };
  const changePw = async (e) => {
    e.preventDefault();
    setPwStatus({ error: false, text: '' });
    if (pw.password !== pw.confirm) {
      setPwStatus({
        error: true,
        text: 'A nova senha e a confirmação não coincidem.',
      });
      return;
    }
    setPwSaving(true);
    try {
      await updatePassword(pw.current, pw.password);
      setPw({ current: '', password: '', confirm: '' });
      setPwStatus({ error: false, text: 'Senha atualizada.' });
    } catch (error) {
      setPwStatus({ error: true, text: error.message });
    } finally {
      setPwSaving(false);
    }
  };
  return (
    <div>
      <h1 className="dash-h1">Sua conta</h1>
      <p className="dash-sub">Atualize o nome usado no gerenciamento.</p>
      {status.text && (
        <p
          className={`alert ${status.error ? 'alert-error' : 'alert-success'}`}
          role="status"
        >
          {status.text}
        </p>
      )}
      <form className="card account-form" onSubmit={save}>
        <div className="input-group">
          <label htmlFor="account-name" className="input-label">
            Nome
          </label>
          <input
            id="account-name"
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
          />
        </div>
        <div className="input-group">
          <label htmlFor="account-email" className="input-label">
            E-mail
          </label>
          <input
            id="account-email"
            className="input-field"
            value={user?.email || ''}
            disabled
          />
        </div>
        <button className="btn btn-primary" disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar nome'}
        </button>
      </form>
      <h2 className="dash-h2">Trocar senha</h2>
      <p className="dash-sub">Altere sua senha de acesso quando quiser.</p>
      {pwStatus.text && (
        <p
          className={`alert ${pwStatus.error ? 'alert-error' : 'alert-success'}`}
          role="status"
        >
          {pwStatus.text}
        </p>
      )}
      <form className="card account-form" onSubmit={changePw}>
        <div className="input-group">
          <label htmlFor="pw-current" className="input-label">
            Senha atual
          </label>
          <input
            id="pw-current"
            type="password"
            className="input-field"
            value={pw.current}
            onChange={(e) => setPw({ ...pw, current: e.target.value })}
            required
            autoComplete="current-password"
          />
        </div>
        <div className="input-group">
          <label htmlFor="pw-new" className="input-label">
            Nova senha (mín. 8)
          </label>
          <input
            id="pw-new"
            type="password"
            className="input-field"
            value={pw.password}
            onChange={(e) => setPw({ ...pw, password: e.target.value })}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <div className="input-group">
          <label htmlFor="pw-confirm" className="input-label">
            Confirmar nova senha
          </label>
          <input
            id="pw-confirm"
            type="password"
            className="input-field"
            value={pw.confirm}
            onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </div>
        <button className="btn btn-primary" disabled={pwSaving}>
          {pwSaving ? 'Salvando…' : 'Trocar senha'}
        </button>
      </form>
      <h2 className="dash-h2">E-mail da plataforma</h2>
      <p className="dash-sub">
        Verifica se o SMTP configurado no servidor entrega mensagens de verdade.
      </p>
      {smtp.text && (
        <p
          className={`alert ${smtp.error ? 'alert-error' : 'alert-success'}`}
          role="status"
        >
          {smtp.text}
        </p>
      )}
      <button
        className="btn btn-ghost"
        onClick={testSmtp}
        disabled={smtp.sending}
      >
        <Send size={16} />{' '}
        {smtp.sending ? 'Enviando…' : 'Enviar e-mail de teste'}
      </button>
      <style>{`.account-form{padding:30px;display:flex;flex-direction:column;gap:22px;max-width:520px;margin-bottom:40px}.account-form button{align-self:start}.dash-h2{font-family:var(--font-display);font-size:22px;color:var(--color-petroleum);margin-bottom:4px}`}</style>
    </div>
  );
}
