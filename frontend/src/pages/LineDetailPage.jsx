import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import L from 'leaflet';
import { MapPin, AlertCircle, ChevronLeft } from 'lucide-react';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { DAY_LABELS, leafletRoute, normalizeSchedules, ROUTE_NOTICE, validPoint } from '../services/transport';

const CENTER = [-12.6975, -38.3242];

const CATEGORY_LABELS = DAY_LABELS;

export function LineDetailPage() {
  const { id } = useParams();
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const [line, setLine] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [points, setPoints] = useState([]);
  const [direction, setDirection] = useState('ida');
  const [attempt, setAttempt] = useState(0);
  const [mapError, setMapError] = useState('');
  const route = routes.find(value => value.sentido === direction);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [activeTab, setActiveTab] = useState('uteis');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setLine(null);
    setPoints([]);
    setRoutes([]);
    setMapError('');
    const load = async () => {
      try {
        if (!/^\d+$/.test(id)) throw new Error('Identificador de linha inválido. Volte à consulta e escolha uma linha.');
        const [lineRes, horRes, routeRes, pointRes] = await Promise.all([
          api.lines.get(id),
          api.horarios.list(id),
          api.routes.forLine(id).catch(() => ({ data: [], failed: true })),
          api.lines.pontos(id).catch(() => ({ data: [], failed: true })),
        ]);
        if (!active) return;
        setLine(lineRes.data);
        if (!lineRes.data) throw new Error('Linha não encontrada ou indisponível para consulta pública.');
        const normalizedSchedules = normalizeSchedules(horRes.data);
        setHorarios(normalizedSchedules);
        const firstCategory = Object.keys(DAY_LABELS).find(category =>
          normalizedSchedules.some(schedule => schedule.categoria === category)
        );
        if (firstCategory) setActiveTab(firstCategory);
        setRoutes(Array.isArray(routeRes.data) ? routeRes.data : []);
        setPoints(Array.isArray(pointRes.data) ? pointRes.data : []);
        setMapError(routeRes.failed || pointRes.failed ? 'Parte dos dados do mapa não carregou. Tente novamente.' : '');
      } catch (err) {
        if (!active) return;
        setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [id, attempt]);

  useEffect(() => {
    if (!mapEl.current || mapRef.current || !line) return () => {};
    const map = L.map(mapEl.current, { center: CENTER, zoom: 12 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, [line]);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer || !line) return;
    layer.clearLayers();

    const pts = [];
    const coords = leafletRoute(route, points.filter(point => point.sentido === direction));

    if (coords.length) {
      L.polyline(coords, { color: '#1a237e', weight: 4, opacity: 0.9 }).addTo(layer);
    }

    // Fetch pontos for this line to draw markers
    {
        const ptsList = points.filter(point => point.sentido === direction && validPoint(point) && point.geocoding_source && point.geocoding_source !== 'estimated');
        ptsList.forEach((p) => {
          const latlng = [Number(p.latitude), Number(p.longitude)];
          pts.push(latlng);
          const color =
            p.tipo === 'origem'
              ? '#1a237e'
              : p.tipo === 'destino'
                ? '#12175c'
                : '#4e59ac';
          L.circleMarker(latlng, {
            radius: 6,
            fillColor: color,
            color: '#fff',
            weight: 2,
            fillOpacity: 1,
          })
            .addTo(layer)
            .bindTooltip(Object.assign(document.createElement('span'), { textContent: `${p.nome} (${p.tipo})` }));
        });
        if (coords.length) {
          map.fitBounds(L.latLngBounds(coords), {
            padding: [40, 40],
            maxZoom: 14,
          });
        } else if (pts.length) {
          map.fitBounds(L.latLngBounds(pts), {
            padding: [40, 40],
            maxZoom: 14,
          });
        }
    }
  }, [line, route, points, direction]);

  const horariosByCat = horarios.filter(
    (h) => h.categoria === activeTab || h.categoria === 'todos'
  );
  const availableCategories = Object.keys(DAY_LABELS).filter(category =>
    category !== 'todos' && horarios.some(schedule => schedule.categoria === category)
  );
  const scheduleGroups = horariosByCat.reduce((groups, schedule) => {
    const departure = schedule.partida_de || '';
    if (!groups[departure]) groups[departure] = [];
    groups[departure].push(schedule);
    return groups;
  }, {});

  return (
    <div>
      {error ? (
        <div className="line-detail-error">
          <AlertCircle size={32} />
          <h2>Erro ao carregar linha</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => setAttempt(value => value + 1)}>Tentar novamente</button>
          <Link to="/linhas">Voltar para linhas</Link>
        </div>
      ) : loading ? (
        <div className="line-detail-loading">Carregando linha…</div>
      ) : line ? (
        <div>
          <div className="line-detail-header">
            <Link className="btn btn-ghost btn-sm" to="/linhas">
              <ChevronLeft size={16} /> Voltar
            </Link>
            <div className="line-detail-main">
              <span className="line-detail-code">{line.codigo}</span>
              <span className="line-detail-badge">
                {line.categoria === 'sede' ? 'Sede' : 'Orla'}
              </span>
              <h1 className="line-detail-title">{line.nome}</h1>
              <div className="line-detail-route">
                <MapPin size={14} />
                <span>{line.origem} → {line.destino}</span>
              </div>
              <p className="line-detail-bairro">{line.bairro}</p>
              {line.situacao_rede === 'historica' && <p className="alert alert-info">Registro histórico: os horários e itinerários podem não representar a operação atual.</p>}
              {line.fonte?.url && <p className="line-detail-source">Fonte: <a href={line.fonte.url} target="_blank" rel="noreferrer">{line.fonte.autoridade || 'documento oficial'}</a></p>}
            </div>
          </div>

          <div className="line-detail-body">
            <div className="line-detail-map">
              <label>Sentido <select value={direction} onChange={event => setDirection(event.target.value)}><option value="ida">Ida</option><option value="volta">Volta</option></select></label>
              <div ref={mapEl} className="line-detail-map-canvas" />
              <p role="status">{mapError || (leafletRoute(route, points.filter(point => point.sentido === direction)).length ? ROUTE_NOTICE : 'Trajeto indisponível: coordenadas provisórias ou geometria aguardando validação.')}</p>
              <h2>Itinerário — {direction}</h2>
              <ol>{points.filter(point => point.sentido === direction).sort((a, b) => a.ordem - b.ordem).map(point => <li key={point.id}>{point.nome}{point.geocoding_source === 'estimated' || point.grau_confirmacao === 'estimado_com_evidencias' ? ' (localização estimada com evidências)' : ''}</li>)}</ol>
              {!points.some(point => point.sentido === direction) && <p>Itinerário não disponível para este sentido.</p>}
            </div>
            <div className="line-detail-schedules">
              <h2 className="line-detail-section-title">Horários</h2>
              <div className="line-detail-tabs">
                {availableCategories.map((cat) => (
                  <button
                    key={cat}
                    className={`line-detail-tab ${activeTab === cat ? 'line-detail-tab-active' : ''}`}
                    onClick={() => setActiveTab(cat)}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
              <div className="line-detail-times">
                {horariosByCat.length === 0 ? (
                  <p className="line-detail-no-times">
                    Sem horários cadastrados para esta categoria.
                  </p>
                ) : (
                  Object.entries(scheduleGroups).map(([departure, values]) => (
                    <section key={departure || 'geral'} className="line-detail-departure">
                      {departure && <h3>Saída: {departure}</h3>}
                      <div className="line-detail-times-grid">
                        {values.map((h) => (
                          <span key={h.id ?? h.chave_fonte} className="line-detail-time">{h.horario}</span>
                        ))}
                      </div>
                    </section>
                  ))
                )}
              </div>
              {leafletRoute(route, points.filter(point => point.sentido === direction)).length > 0 && (
                <div className="line-detail-route-notice">
                  <AlertCircle size={14} />
                  <span>
                    {ROUTE_NOTICE}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : <p role="status">Linha indisponível.</p>}
      <style>{`
        .line-detail-error{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);color:var(--color-gray-600);padding:var(--space-8)}
        .line-detail-loading{color:var(--color-gray-500);padding:var(--space-8)}
        .line-detail-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:var(--space-6);gap:var(--space-4)}
        .line-detail-main{flex:1}
        .line-detail-code{font-family:var(--font-display);font-size:var(--font-size-3xl);font-weight:700;color:var(--color-petroleum);display:block}
        .line-detail-badge{font-size:var(--font-size-xs);font-weight:600;padding:var(--space-1) var(--space-3);border-radius:var(--radius-full);background:rgb(26 35 126 / 0.1);color:var(--color-petroleum);display:inline-block;margin:var(--space-2) 0}
        .line-detail-title{font-family:var(--font-display);font-size:var(--font-size-3xl);color:var(--color-petroleum-dark);margin:0 0 var(--space-2) 0}
        .line-detail-route{display:flex;align-items:center;gap:var(--space-2);color:var(--color-gray-600);font-size:var(--font-size-sm)}
        .line-detail-bairro{color:var(--color-gray-500);font-size:var(--font-size-sm)}
        .line-detail-source{font-size:var(--font-size-xs);color:var(--color-gray-600)}
        .line-detail-body{display:grid;grid-template-columns:1fr 420px;gap:var(--space-6)}
        .line-detail-map-canvas{height:420px;border-radius:var(--radius-xl);border:1px solid var(--color-gray-200)}
        .line-detail-section-title{font-family:var(--font-display);font-size:var(--font-size-xl);color:var(--color-petroleum);margin-bottom:var(--space-3)}
        .line-detail-tabs{display:flex;gap:var(--space-2);margin-bottom:var(--space-4)}
        .line-detail-tab{padding:var(--space-2) var(--space-4);border:1px solid var(--color-gray-200);background:var(--color-white);border-radius:var(--radius-md);color:var(--color-gray-600);font-size:var(--font-size-sm);cursor:pointer}
        .line-detail-tab:hover{border-color:var(--color-petroleum)}
        .line-detail-tab-active{border-color:var(--color-petroleum);color:var(--color-petroleum);background:rgb(26 35 126 / 0.05)}
        .line-detail-times{display:flex;flex-direction:column;gap:var(--space-3)}
        .line-detail-departure h3{font-size:var(--font-size-sm);color:var(--color-gray-700);margin:0 0 var(--space-2)}
        .line-detail-times-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:var(--space-2)}
        .line-detail-time{display:inline-block;padding:var(--space-2) var(--space-4);background:rgb(26 35 126 / 0.05);color:var(--color-petroleum-dark);border-radius:var(--radius-md);font-size:var(--font-size-sm);font-weight:600;text-align:center}
        .line-detail-no-times{color:var(--color-gray-500);font-style:italic}
        .line-detail-route-notice{display:flex;align-items:center;gap:var(--space-2);margin-top:var(--space-4);padding:var(--space-3);background:rgb(26 35 126 / 0.05);border:1px solid rgb(26 35 126 / 0.1);border-radius:var(--radius-md);font-size:var(--font-size-xs);color:var(--color-petroleum)}
        .line-detail-route-notice AlertCircle{color:var(--color-petroleum)}
        @media(max-width:900px){
          .line-detail-body{grid-template-columns:1fr}
          .line-detail-map-canvas{height:300px}
          .line-detail-header{flex-direction:column;align-items:flex-start}
        }
      `}</style>
    </div>
  );
}
