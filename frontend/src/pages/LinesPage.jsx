import { useEffect, useState } from 'react';
import { Search, Bus, Clock, MapPin, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';

const CATEGORY_LABELS = {
  sede: 'Sede',
  orla: 'Orla',
};

export function LinesPage() {
  const [lines, setLines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [categoria, setCategoria] = useState('');

  useEffect(() => {
    api.lines
      .list()
      .then((d) => setLines(d.data || []))
      .catch(() => setLines([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = lines.filter((l) => {
    const matchQ =
      !q ||
      l.codigo.toLowerCase().includes(q.toLowerCase()) ||
      l.nome.toLowerCase().includes(q.toLowerCase()) ||
      l.origem.toLowerCase().includes(q.toLowerCase()) ||
      l.destino.toLowerCase().includes(q.toLowerCase());
    const matchCat = !categoria || l.categoria === categoria;
    return matchQ && matchCat;
  });

  return (
    <div>
      <h1 className="lines-h1">Linhas de ônibus</h1>
      <p className="lines-sub">
        Consulte as linhas, horários e trajetos do transporte coletivo de
        Camaçari.
      </p>

      <div className="lines-toolbar">
        <div className="lines-search">
          <Search size={18} />
          <input
            className="input-field"
            placeholder="Buscar por código, nome, origem ou destino..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="lines-filter">
          <label className="filter-label">Categoria</label>
          <select
            className="input-field select-field"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="sede">Sede</option>
            <option value="orla">Orla</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="lines-loading">Carregando linhas…</div>
      ) : filtered.length === 0 ? (
        <div className="lines-empty">
          <Bus size={32} />
          <p>Nenhuma linha encontrada.</p>
        </div>
      ) : (
        <div className="lines-list">
          {filtered.map((l) => (
            <Link
              key={l.id}
              to={`/linhas/${l.id}`}
              className="line-card"
            >
              <div className="line-card-body">
                <div className="line-header">
                  <span className="line-code">{l.codigo}</span>
                  <span className="line-badge">{CATEGORY_LABELS[l.categoria]}</span>
                </div>
                <h3 className="line-name">{l.nome}</h3>
                <div className="line-route">
                  <MapPin size={14} />
                  <span>{l.origem} → {l.destino}</span>
                </div>
                <div className="line-footer">
                  <span className="line-bairro">{l.bairro}</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
      <style>{`
        .lines-h1{font-family:var(--font-display);font-size:var(--font-size-4xl);color:var(--color-petroleum);margin-bottom:var(--space-2)}
        .lines-sub{color:var(--color-gray-600);margin-bottom:var(--space-6)}
        .lines-toolbar{display:flex;gap:var(--space-4);margin-bottom:var(--space-6);flex-wrap:wrap}
        .lines-search{display:flex;align-items:center;gap:var(--space-2)}
        .lines-search input{width:320px}
        .lines-filter{display:flex;align-items:center;gap:var(--space-2)}
        .filter-label{font-size:var(--font-size-xs);color:var(--color-gray-600)}
        .lines-list{display:grid;gap:var(--space-3)}
        .line-card{display:block;text-decoration:none;background:var(--color-white);border:1px solid var(--color-gray-200);border-radius:var(--radius-xl);padding:var(--space-5);transition:all var(--transition-base)}
        .line-card:hover{border-color:var(--color-petroleum);box-shadow:var(--shadow-lg);transform:translateY(-2px)}
        .line-header{display:flex;align-items:center;gap:var(--space-2);margin-bottom:var(--space-2)}
        .line-code{font-family:var(--font-display);font-size:var(--font-size-2xl);font-weight:700;color:var(--color-petroleum)}
        .line-badge{font-size:var(--font-size-xs);font-weight:600;padding:var(--space-1) var(--space-3);border-radius:var(--radius-full);background:rgb(26 35 126 / 0.1);color:var(--color-petroleum)}
        .line-name{font-family:var(--font-display);font-size:var(--font-size-xl);color:var(--color-petroleum-dark);margin:0 0 var(--space-2) 0}
        .line-route{display:flex;align-items:center;gap:var(--space-2);color:var(--color-gray-600);font-size:var(--font-size-sm);margin-bottom:var(--space-2)}
        .line-footer{display:flex;align-items:center;justify-content:space-between;font-size:var(--font-size-xs);color:var(--color-gray-500)}
        .line-bairro{font-weight:500;color:var(--color-gray-700)}
        .lines-loading{color:var(--color-gray-500);padding:var(--space-8)}
        .lines-empty{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);color:var(--color-gray-500);padding:var(--space-8)}
        @media(max-width:640px){.lines-search input{width:200px}}
      `}</style>
    </div>
  );
}