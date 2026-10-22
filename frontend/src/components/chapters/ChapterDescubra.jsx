import { useEffect, useState } from 'react';
import { ArrowUpRight, Search, ArrowDown, X } from 'lucide-react';
import { loadPublicLines, searchText } from '../../services/lines';

export function ChapterDescubra() {
  const [lines, setLines] = useState([]);
  const [source, setSource] = useState('loading');
  const [q, setQ] = useState('');
  const [bairro, setBairro] = useState('');
  const [selected, setSelected] = useState(null);
  const load = async () => {
    setSource('loading');
    try {
      setLines(await loadPublicLines());
      setSource('live');
    } catch {
      setLines([]);
      setSource('live');
    }
  };
  useEffect(() => {
    let alive = true;
    loadPublicLines()
      .then((data) => {
        if (alive) {
          setLines(data);
          setSource('live');
        }
      })
      .catch(() => {
        if (alive) {
          setLines([]);
          setSource('live');
        }
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    const choose = (e) => {
      setQ(e.detail);
      setBairro('');
    };
    window.addEventListener('transcamacari:search', choose);
    return () => window.removeEventListener('transcamacari:search', choose);
  }, []);
  const filtered = lines.filter(
    (line) =>
      (!bairro || line.bairro === bairro) &&
      searchText(
        [line.code, line.name, line.bairro, line.origem, line.destino].join(
          ' ',
        ),
      ).includes(searchText(q)),
  );
  const viewMap = (line) => {
    window.dispatchEvent(
      new CustomEvent('transcamacari:line', { detail: { id: line.id } }),
    );
    document.getElementById('mapa')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    });
  };
  return (
    <section
      id="descubra"
      className="line-finder"
      aria-labelledby="descubra-title"
    >
      <div className="line-finder__heading">
        <h2 id="descubra-title">
          Qual é o seu
          <br />
          <em>próximo destino?</em>
        </h2>
        <p>
          Encontre sua linha.
          <br />
          Consulte os horários cadastrados.
          <br />
          Veja os pontos no mapa.
        </p>
      </div>
      <div className="line-finder__search">
        <label>
          <Search size={22} />
          <span className="sr-only">Buscar linhas</span>
          <input
            type="search"
            placeholder="Bairro, linha ou destino"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSelected(null);
            }}
          />
        </label>
        <label>
          <span className="sr-only">Filtrar por bairro</span>
          <select
            value={bairro}
            onChange={(e) => {
              setBairro(e.target.value);
              setSelected(null);
            }}
          >
            <option value="">Todos os bairros</option>
            {[...new Set(lines.map((l) => l.bairro))].sort().map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
          <ArrowDown size={18} />
        </label>
      </div>
      {source === 'loading' && (
        <div className="data-notice" role="status">
          <p>
            <strong>Consultando linhas cadastradas.</strong> Aguarde enquanto
            carregamos os dados do transporte público.
          </p>
        </div>
      )}
      <div className="line-finder__count" aria-live="polite">
        {source === 'loading'
          ? 'Consultando linhas…'
          : `${filtered.length} ${filtered.length === 1 ? 'conexão encontrada' : 'conexões encontradas'}`}
        <span>
          {source === 'live'
            ? 'Informações cadastradas'
            : 'Carregando...'}
        </span>
      </div>
      <div className="line-finder__results">
        {filtered.map((line) => (
          <article
            key={line.id}
            className={`line-result ${selected === line.id ? 'line-result--open' : ''}`}
          >
            <button
              className="line-result__summary"
              onClick={() => setSelected(selected === line.id ? null : line.id)}
              aria-expanded={selected === line.id}
              aria-controls={`line-details-${line.id}`}
            >
              <span className="line-result__code">{line.code}</span>
              <span className="line-result__name">
                {line.name}
                <small>{line.bairro}</small>
              </span>
              <span className="line-result__schedule">
                {line.horarios[0]?.horario?.slice(0, 5) ||
                  line.horarios[0]?.slice(0, 5) ||
                  'Sem horário'}
                <small>Primeiro horário cadastrado</small>
              </span>
              {selected === line.id ? (
                <X size={22} />
              ) : (
                <ArrowUpRight size={24} />
              )}
            </button>
            {selected === line.id && (
              <div
                id={`line-details-${line.id}`}
                className="line-result__details"
              >
                <div>
                  <small>Origem → destino</small>
                  <p>
                    {line.origem} → {line.destino}
                  </p>
                </div>
                <div>
                  <small>Horários cadastrados</small>
                  <p>
                    {line.horarios.length
                      ? line.horarios.map((h) => h.slice(0, 5)).join(' · ')
                      : 'Nenhum horário informado.'}
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => viewMap(line)}
                >
                  Ver no mapa <ArrowUpRight size={18} />
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
      {source !== 'loading' && filtered.length === 0 && (
        <div className="line-finder__empty">
          <h3>Nenhuma linha encontrada.</h3>
          <p>
            {lines.length
              ? 'Tente outro bairro ou destino.'
              : 'Ainda não há linhas públicas cadastradas.'}
          </p>
          {(q || bairro) && (
            <button
              onClick={() => {
                setQ('');
                setBairro('');
              }}
            >
              Limpar busca
            </button>
          )}
        </div>
      )}
    </section>
  );
}
