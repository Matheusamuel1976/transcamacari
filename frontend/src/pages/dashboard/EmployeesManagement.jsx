import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { AccessManagement } from './AccessManagement';

const empty = { nome: '', cargo: '', email: '', telefone: '' };

export function EmployeesManagement() {
  const [tab, setTab] = useState('equipe');
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const d = await api.employees.list();
      setList(d.data || []);
    } catch {
      setMsg('Backend offline — lista vazia.');
    }
  };
  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      if (editing) await api.employees.update(editing, form);
      else await api.employees.create(form);
      setForm(empty);
      setEditing(null);
      setMsg('Salvo com sucesso.');
      load();
    } catch (err) {
      setMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="dash-h1">Equipe</h1>
      <p className="dash-sub">
        Cadastro de profissionais e controle de quem acessa o sistema.
      </p>
      <div className="dash-tabs" role="tablist" aria-label="Equipe">
        {[
          ['equipe', 'Funcionários'],
          ['acessos', 'Acessos ao sistema'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            className={tab === value ? 'active' : ''}
            onClick={() => setTab(value)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'acessos' && <AccessManagement />}
      {tab === 'equipe' && (
        <>
          {msg && (
            <div className="alert alert-info" role="status">
              <span>{msg}</span>
            </div>
          )}
          <form className="card line-form" onSubmit={submit}>
            <h2>{editing ? 'Editar funcionário' : 'Novo funcionário'}</h2>
            <div className="form-grid">
              <input
                className="input-field"
                placeholder="Nome"
                aria-label="Nome"
                required
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
              />
              <input
                className="input-field"
                placeholder="Cargo"
                aria-label="Cargo"
                required
                value={form.cargo}
                onChange={(e) => setForm({ ...form, cargo: e.target.value })}
              />
              <input
                className="input-field"
                type="email"
                placeholder="E-mail"
                aria-label="E-mail"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <input
                className="input-field"
                placeholder="Telefone"
                aria-label="Telefone"
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              />
            </div>
            <div className="form-actions">
              {editing && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setEditing(null);
                    setForm(empty);
                  }}
                >
                  Cancelar
                </button>
              )}
              <button className="btn btn-primary" disabled={saving}>
                <Plus size={16} />{' '}
                {saving ? 'Salvando…' : editing ? 'Salvar' : 'Cadastrar'}
              </button>
            </div>
          </form>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Cargo</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {list.map((f) => (
                  <tr key={f.id}>
                    <td>{f.nome}</td>
                    <td>{f.cargo}</td>
                    <td>{f.email}</td>
                    <td>{f.telefone}</td>
                    <td className="row-actions">
                      <button
                        className="btn btn-icon btn-ghost"
                        aria-label="Editar"
                        onClick={() => {
                          setEditing(f.id);
                          setForm({
                            nome: f.nome,
                            cargo: f.cargo,
                            email: f.email || '',
                            telefone: f.telefone || '',
                          });
                        }}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="btn btn-icon btn-ghost"
                        aria-label="Excluir"
                        onClick={async () => {
                          if (!confirm('Excluir?')) return;
                          try {
                            await api.employees.remove(f.id);
                            load();
                          } catch (e) {
                            setMsg(e.message);
                          }
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {list.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: 'center',
                        color: 'var(--color-gray-500)',
                      }}
                    >
                      Nenhum funcionário cadastrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
      <style>{`
        .dash-tabs{display:flex;gap:8px;margin-bottom:var(--space-4)}
        .dash-tabs button{padding:10px 18px;border-radius:100px;font-size:13px;font-weight:600;color:var(--color-gray-600);border:1px solid var(--color-gray-200)}
        .dash-tabs button.active{background:var(--color-petroleum);color:var(--color-ivory);border-color:var(--color-petroleum)}
        .dash-h1{font-family:var(--font-display);font-size:var(--font-size-3xl);color:var(--color-petroleum)}
        .dash-sub{color:var(--color-gray-600);margin-bottom:var(--space-4)}
        .line-form{padding:var(--space-6);margin:var(--space-4) 0;display:flex;flex-direction:column;gap:var(--space-4)}
        .form-grid{display:grid;gap:var(--space-3)}
        .form-actions{display:flex;justify-content:flex-end;gap:var(--space-3)}
        .row-actions{display:flex;gap:var(--space-1)}
        @media(min-width:768px){.form-grid{grid-template-columns:1fr 1fr}}
      `}</style>
    </div>
  );
}
