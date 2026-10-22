import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function AccountSettings() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [status, setStatus] = useState({ error: false, text: '' });
  const [saving, setSaving] = useState(false);
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
      <style>{`.account-form{padding:30px;display:flex;flex-direction:column;gap:22px;max-width:520px}.account-form button{align-self:start}`}</style>
    </div>
  );
}
