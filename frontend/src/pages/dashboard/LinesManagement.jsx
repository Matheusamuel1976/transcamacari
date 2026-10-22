import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { api } from '../../services/api';

const empty = {
  codigo: '',
  nome: '',
  bairro: '',
  origem: '',
  destino: '',
  categoria: 'sede',
  visivel: true,
  publicado: false,
  horariosUteis: '',
  horariosSabado: '',
  horariosDomingoFeriado: '',
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
      const d = await api.lines.listAll();
      const all = d.data || [];
      const filtered = q
        ? all.filter(
            (l) =>
              l.codigo.toLowerCase().includes(q.toLowerCase()) ||
              l.nome.toLowerCase().includes(q.toLowerCase()) ||
              l.origem.toLowerCase().includes(q.toLowerCase()) ||
              l.destino.toLowerCase().includes(q.toLowerCase())
          )
        : all;
      setLines(filtered);
    } catch {
      setMsg('Falha ao carregar linhas. Exibindo vazio.');
    }
  };
  useEffect(() => {
    load();
  }, []);

  const loadHorarios = async (linhaId) => {
    try {
      const d = await api.horarios.list(linhaId);
      const horarios = d.data || [];
      const byCat = { uteis: [], sabado: [], domingo_feriado: [] };
      horarios.forEach((h) => {
        if (byCat[h.categoria]) byCat[h.categoria].push(h.horario);
      });
      setForm((prev) => ({
        ...prev,
        horariosUteis: byCat.uteis.join(','),
        horariosSabado: byCat.sabado.join(','),
        horariosDomingoFeriado: byCat.domingo_feriado.join(','),
      }));
    } catch {
      setMsg('Falha ao carregar horários da linha.');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const linhaData = {
        codigo: form.codigo,
        nome: form.nome,
        bairro: form.bairro,
        origem: form.origem,
        destino: form.destino,
        categoria: form.categoria,
        visivel: form.visivel,
        publicado: form.publicado,
      };

      if (editing) {
        await api.lines.update(editing, linhaData);
        // Delete existing horarios first
        const { data: existing } = await api.horarios.list(editing);
        for (const h of existing.data || []) {
          await api.horarios.remove(h.id);
        }
      } else {
        const created = await api.lines.create(linhaData);
        setEditing(created.data.id);
      }

      // Insert horarios by category
      const categorias = [
        { cat: 'uteis', val: form.horariosUteis },
        { cat: 'sabado', val: form.horariosSabado },
        { cat: 'domingo_feriado', val: form.horariosDomingoFeriado },
      ];
      let ordem = 0;
      for (const { cat, val } of categorias) {
        const times = val.split(',').map((t) => t.trim()).filter(Boolean);
        for (const t of times) {
          await api.horarios.create({
            linha_id: editing,
            horario: t,
            categoria: cat,
            ordem,
          });
          ordem += 1;
        }
      }

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
        Cadastre linhas, atualize horários por categoria e escolha quais linhas
        aparecem no site.
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
            placeholder="Código (ex.: S01)"
            aria-label="Código"
            required
            value={form.codigo}
            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="Nome (ex.: Centro x Glebas & Phocs)"
            aria-label="Nome"
            required
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
          <input
            className="input-field"
            placeholder="Bairro atendido"
            aria-label="Bairro"
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
          <select
            className="input-field select-field"
            value={form.categoria}
            onChange={(e) => setForm({ ...form, categoria: e.target.value })}
          >
            <option value="sede">Sede</option>
            <option value="orla">Orla</option>
          </select>
        </div>
        <div className="form-grid">
          <div className="input-group">
            <label className="input-label">Horários — Dias úteis (vírgula)</label>
            <input
              className="input-field"
              placeholder="05:30,06:15,07:00..."
              value={form.horariosUteis}
              onChange={(e) => setForm({ ...form, horariosUteis: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Horários — Sábados (vírgula)</label>
            <input
              className="input-field"
              placeholder="06:00,07:00,08:00..."
              value={form.horariosSabado}
              onChange={(e) => setForm({ ...form, horariosSabado: e.target.value })}
            />
          </div>
          <div className="input-group">
            <label className="input-label">Horários — Domingos e feriados (vírgula)</label>
            <input
              className="input-field"
              placeholder="06:30,08:00,09:30..."
              value={form.horariosDomingoFeriado}
              onChange={(e) => setForm({ ...form, horariosDomingoFeriado: e.target.value })}
            />
          </div>
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
          <label>
            <input
              type="checkbox"
              checked={form.publicado}
              onChange={(e) => setForm({ ...form, publicado: e.target.checked })}
            />{' '}
            Publicado (público)
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
              <th>Categoria</th>
              <th>Origem → Destino</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l.id}>
                <td>{l.codigo}</td>
                <td>{l.nome}</td>
                <td>{l.categoria}</td>
                <td>{l.origem} → {l.destino}</td>
                <td>
                  {l.publicado ? 'Publicado' : 'Rascunho'}{' '}
                  {l.visivel ? '· visível' : '· oculto'}
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
                        categoria: l.categoria,
                        visivel: l.visivel,
                        publicado: l.publicado,
                        horariosUteis: '',
                        horariosSabado: '',
                        horariosDomingoFeriado: '',
                      });
                      loadHorarios(l.id);
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
                  colSpan={6}
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
        .form-actions{display:flex;justify-content:flex-end;gap:var(--space-3);flex-wrap:wrap;align-items:center}
        .line-search{display:flex;align-items:center;gap:var(--space-2);margin:var(--space-4) 0;color:var(--color-gray-500)}
        .row-actions{display:flex;gap:var(--space-1)}
        .input-group{display:flex;flex-direction:column;gap:var(--space-1)}
        .input-label{font-size:var(--font-size-xs);color:var(--color-gray-600)}
        @media(min-width:768px){.form-grid{grid-template-columns:1fr 1fr}}
        @media(min-width:1024px){.form-grid{grid-template-columns:1fr 1fr 1fr}}
      `}</style>
    </div>
  );
}