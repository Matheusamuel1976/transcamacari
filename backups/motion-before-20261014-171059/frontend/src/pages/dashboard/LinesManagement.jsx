import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { api } from '../../services/api';

const empty = {
  codigo: '',
  nome: '',
  bairro: '',
  origem: '',
  destino: '',
  horarios: '',
  visivel: true,
};

export function LinesManagement() {
  const [lines, setLines] = useState([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const d = await api.lines.list(q);
      setLines(d.data || []);
    } catch {
      setMsg('Falha ao carregar linhas (backend offline?). Exibindo vazio.');
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
      if (editing) await api.lines.update(editing, form);
      else await api.lines.create(form);
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

  const remove = async (id) => {
    if (!confirm('Excluir esta linha?')) return;
    try {
      await api.lines.remove(id);
      setMsg('Linha excluída.');
      load();
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div>
      <h1 className="dash-h1">Linhas</h1>
      <p className="dash-sub">
        Cadastre conexões, atualize horários e escolha quais linhas aparecem no
        site.
      </p>
      {msg && (
        <div className="alert alert-info" role="status">
          <span>{msg}</span>
        </div>
      )}
      <form className="card line-form" onSubmit={submit}>
        <h2>{editing ? 'Editar linha' : 'Nova linha'}</h2>
        <div className="form-grid">
          <input
            className="input-field"
            placeholder="Código (ex.: 001)"
            aria-label="Código (ex.: 001)"
            required
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="Nome (ex.: Centro / Jauá)"
            aria-label="Nome (ex.: Centro / Jauá)"
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="Bairro atendido"
            aria-label="Bairro atendido"
            required
            value={form.bairro}
            onChange={(e) => setForm({ ...form, bairro: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="Origem"
            aria-label="Origem"
            required
            value={form.origem}
            onChange={(e) => setForm({ ...form, origem: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="Destino"
            aria-label="Destino"
            required
            value={form.destino}
            onChange={(e) => setForm({ ...form, destino: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="Horários separados por vírgula (05:30,06:15...)"
            aria-label="Horários separados por vírgula (05:30,06:15...)"
            value={form.horarios}
            onChange={(e) => setForm({ ...form, horarios: e.target.value })}
          />
        </div>
        <div className="form-actions">
          <label>
            <input
              type="checkbox"
              checked={form.visivel}
              onChange={(e) => setForm({ ...form, visivel: e.target.checked })}
            />{' '}
            Visível no site
          </label>
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
      <div className="line-search">
        <Search size={16} />
        <input
          className="input-field"
          placeholder="Filtrar..."
          aria-label="Filtrar..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), load())}
        />
      </div>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>Bairro</th>
              <th>Origem → Destino</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.id}>
                <td>{l.codigo}</td>
                <td>{l.nome}</td>
                <td>{l.bairro}</td>
                <td>
                  {l.origem} → {l.destino}
                </td>
                <td className="row-actions">
                  <button
                    className="btn btn-icon btn-ghost"
                    aria-label="Editar"
                    onClick={() => {
                      setEditing(l.id);
                      setForm({
                        codigo: l.codigo,
                        nome: l.nome,
                        bairro: l.bairro,
                        origem: l.origem,
                        destino: l.destino,
                        horarios: (l.horarios || []).join(','),
                        visivel: Number(l.visivel ?? 1) === 1,
                      });
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="btn btn-icon btn-ghost"
                    aria-label="Excluir"
                    onClick={() => remove(l.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {lines.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    textAlign: 'center',
                    color: 'var(--color-gray-500)',
                  }}
                >
                  Nenhuma linha cadastrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <style>{`
        .dash-h1{font-family:var(--font-display);font-size:var(--font-size-3xl);color:var(--color-petroleum)}
        .dash-sub{color:var(--color-gray-600);margin-bottom:var(--space-4)}
        .line-form{padding:var(--space-6);margin:var(--space-4) 0;display:flex;flex-direction:column;gap:var(--space-4)}
        .form-grid{display:grid;gap:var(--space-3)}
        .form-actions{display:flex;justify-content:flex-end;gap:var(--space-3)}
        .line-search{display:flex;align-items:center;gap:var(--space-2);margin:var(--space-4) 0;color:var(--color-gray-500)}
        .row-actions{display:flex;gap:var(--space-1)}
        @media(min-width:768px){.form-grid{grid-template-columns:1fr 1fr}}
      `}</style>
    </div>
  );
}
