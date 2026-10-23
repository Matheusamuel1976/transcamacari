import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Trash2, Plus, MousePointerClick } from 'lucide-react';
import { api } from '../../services/api';
import { leafletRoute, validPoint } from '../../services/transport';

const CENTER = [-12.6975, -38.3242];

export function MapPage() {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [lineId, setLineId] = useState('');
  const [sentido, setSentido] = useState('ida');
  const [pontos, setPontos] = useState([]);
  const [route, setRoute] = useState(null);
  const [staged, setStaged] = useState(null);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('parada');
  const [msg, setMsg] = useState('');
  const [generating, setGenerating] = useState(false);
  const [loadedLineId, setLoadedLineId] = useState('');
  const generate = async () => {
    if (generating || !lineId || String(loadedLineId) !== String(lineId)) return;
    setGenerating(true); setMsg('');
    try {
      const routing = await import('../../services/routing');
      const result = await routing.generateRouteForLine(lineId, pontos, sentido);
      if (result.error) throw new Error(result.error);
      const saved = await routing.saveRouteGeometry(lineId, sentido, result.geometry);
      setRoute(saved.data); setMsg('Trajeto estimado salvo — percurso sujeito a validação.');
    } catch (error) { setMsg(error.message); }
    finally { setGenerating(false); }
  };
  const placing = true;
  const selectionRef = useRef({ placing, lineId });
  selectionRef.current = { placing, lineId };
  const requestId = useRef(0);

  useEffect(() => {
    api.lines
      .listAll()
      .then((d) => setLines(d.data || []))
      .catch(() =>
        setMsg('Não foi possível carregar as linhas.')
      );
  }, []);

  useEffect(() => {
    let active = true;
    setRoute(null);
    if (lineId) api.lines.route(lineId, sentido).then(result => { if (active) setRoute(result.data); }).catch(() => { if (active) setMsg('Geometria ausente para este sentido; valide os pontos antes de gerar.'); });
    return () => { active = false; };
  }, [lineId, sentido]);

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return () => {};
    const map = L.map(mapEl.current, { center: CENTER, zoom: 12 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    L.control.scale({ metric: true, imperial: false }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    map.on('click', (e) => {
      if (!selectionRef.current.placing || !selectionRef.current.lineId) return;
      setStaged({
        lat: Number(e.latlng.lat.toFixed(6)),
        lng: Number(e.latlng.lng.toFixed(6)),
      });
    });
    const resize = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    resize.observe(mapEl.current);
    return () => {
      resize.disconnect();
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  const loadPontos = async (id) => {
    const currentRequest = ++requestId.current;
    setPontos([]);
    setLoadedLineId('');
    setStaged(null);
    setRoute(null);
    if (!id) {
      setPontos([]);
      return;
    }
    try {
      const d = await api.lines.pontos(id);
      if (currentRequest !== requestId.current) return;
      setPontos(d.data || []);
      setLoadedLineId(String(id));
    } catch (e) {
      setMsg(e.message);
    }
  };

  const draw = (list, stage, routeGeom, activeSentido) => {
    const layer = layerRef.current;
    const map = mapRef.current;
    if (!layer || !map) return;
    layer.clearLayers();

    const markers = [];
    list.forEach((p) => {
      if (p.sentido !== activeSentido || !validPoint(p)) return;
      const latlng = [Number(p.latitude), Number(p.longitude)];
      markers.push(latlng);
      const color =
        p.tipo === 'origem' ? '#1a237e' : p.tipo === 'destino' ? '#12175c' : '#4e59ac';
      L.circleMarker(latlng, {
        radius: 7,
        fillColor: color,
        color: '#fff',
        weight: 2,
        fillOpacity: 1,
      })
        .addTo(layer)
        .bindTooltip(`${p.ordem} · ${p.nome} (${p.tipo})`);
    });

    const coords = leafletRoute(routeGeom, list.filter(point => point.sentido === activeSentido));
    if (coords.length && routeGeom?.sentido === activeSentido) {
      L.polyline(coords, {
        color: '#1a237e',
        weight: 4,
        opacity: 0.9,
      }).addTo(layer);

      if (coords.length) {
        map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 14 });
      }
    } else if (markers.length) {
      const bounds = L.latLngBounds(markers);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    if (stage) {
      L.circleMarker([stage.lat, stage.lng], {
        radius: 10,
        color: '#1a237e',
        fillColor: '#ffffff',
        fillOpacity: 1,
      })
        .addTo(layer)
        .bindTooltip('Novo ponto (ainda não salvo)')
        .openTooltip();
    }
  };

  useEffect(() => {
    draw(pontos, staged, route, sentido);
  }, [pontos, staged, route, sentido]);

  const save = async (e) => {
    e.preventDefault();
    if (!lineId || !staged || nome.trim().length < 2) {
      setMsg('Escolha a linha, clique no mapa e dê um nome (mín. 2).');
      return;
    }
    try {
      await api.lines.addPonto(lineId, {
        nome: nome.trim(),
        latitude: staged.lat,
        longitude: staged.lng,
        tipo,
        sentido,
        ordem: Math.max(-1, ...pontos.filter(point => point.sentido === sentido).map(point => Number(point.ordem))) + 1,
        geocoding_source: 'manual',
      });
      setMsg('Ponto salvo.');
      setStaged(null);
      setNome('');
      loadPontos(lineId);
    } catch (err) {
      setMsg(err.message);
    }
  };

  const remove = async (pid) => {
    if (!confirm('Excluir este ponto?')) return;
    try {
      await api.lines.removePonto(pid);
      setMsg('Ponto excluído.');
      loadPontos(lineId);
    } catch (err) {
      setMsg(err.message);
    }
  };

  const handleSentidoChange = (s) => {
    setSentido(s);
  };

  return (
    <div>
      <h1 className="dash-h1">Mapa — rotas e pontos</h1>
      <p className="dash-sub">
        Visualize as trajetórias estimadas pelas ruas. As polilinhas roxas
        seguem a malha viária; os círculos marcam locais do itinerário.
      </p>
      <button className="btn btn-primary" disabled={!lineId || generating || String(loadedLineId) !== String(lineId)} onClick={generate}>{generating ? 'Calculando…' : 'Gerar e salvar trajeto estimado'}</button>
      {lineId && !leafletRoute(route, pontos.filter(point => point.sentido === sentido)).length && <p role="status">Sem percurso confiável neste sentido. Revise as coordenadas provisórias antes de gerar.</p>}
      {msg && (
        <div className="alert alert-info" role="status">
          <span>{msg}</span>
        </div>
      )}
      <div className="map-ed-grid">
        <div>
          <div
            ref={mapEl}
            className="map-ed-canvas"
            role="application"
            aria-label="Editor de rotas"
          />
          <div className="map-ed-controls">
            <label>
              <input
                type="radio"
                name="sentido"
                value="ida"
                checked={sentido === 'ida'}
                disabled={generating}
                onChange={() => handleSentidoChange('ida')}
              />{' '}
              Ida
            </label>
            <label>
              <input
                type="radio"
                name="sentido"
                value="volta"
                checked={sentido === 'volta'}
                disabled={generating}
                onChange={() => handleSentidoChange('volta')}
              />{' '}
              Volta
            </label>
            {route && (
              <span className="route-badge">
                {route.estado_validacao === 'estimated'
                  ? 'Estimado'
                  : route.estado_validacao === 'needs_review'
                    ? 'Revisão'
                    : route.estado_validacao === 'reviewed'
                      ? 'Revisado'
                      : 'Oficial'}
              </span>
            )}
            <p className="map-ed-hint">
              <MousePointerClick size={14} /> Clique no mapa para posicionar um
              novo ponto (requer linha selecionada e sentido escolhido).
            </p>
          </div>
        </div>
        <div className="map-ed-side">
          <div className="input-group">
            <label className="input-label" htmlFor="ed-line">
              Linha
            </label>
            <select
              id="ed-line"
              className="input-field select-field"
              value={lineId}
              disabled={generating}
              onChange={(e) => {
                setLineId(e.target.value);
                setStaged(null);
                setRoute(null);
                loadPontos(e.target.value);
              }}
            >
              <option value="">Selecione...</option>
              {lines.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.codigo} — {l.nome}
                </option>
              ))}
            </select>
          </div>
          <form onSubmit={save} className="map-ed-form">
            <div className="input-group">
              <label className="input-label" htmlFor="ed-nome">
                Nome do ponto
              </label>
              <input
                id="ed-nome"
                className="input-field"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Parada da Praça"
                required
                minLength={2}
              />
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="ed-tipo">
                Tipo
              </label>
              <select
                id="ed-tipo"
                className="input-field select-field"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option value="origem">Origem</option>
                <option value="parada">Parada</option>
                <option value="destino">Destino</option>
              </select>
            </div>
            <p className="map-ed-coords">
              {staged
                ? `Posição: ${staged.lat}, ${staged.lng}`
                : 'Nenhuma posição marcada.'}
            </p>
            <button className="btn btn-primary" disabled={!lineId || !staged || !sentido}>
              <Plus size={16} /> Salvar ponto
            </button>
          </form>
          <h2 className="map-ed-list-title">Pontos ({pontos.filter((p) => p.sentido === sentido).length})</h2>
          <ul className="map-ed-list">
            {pontos
              .filter((p) => p.sentido === sentido)
              .map((p) => (
                <li key={p.id}>
                  <span>
                    <strong>{p.ordem}</strong> · {p.nome} <em>({p.tipo})</em>
                  </span>
                  <button
                    className="btn btn-icon btn-ghost"
                    aria-label={`Excluir ${p.nome}`}
                    onClick={() => remove(p.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </li>
              ))}
            {pontos.filter((p) => p.sentido === sentido).length === 0 && (
              <li className="map-ed-empty">
                Sem pontos para este sentido. Marque o primeiro clicando no mapa.
              </li>
            )}
          </ul>
        </div>
      </div>
      <style>{`
        .dash-h1{font-family:var(--font-display);font-size:var(--font-size-3xl);color:var(--color-petroleum)}
        .dash-sub{color:var(--color-gray-600);margin-bottom:var(--space-4)}
        .map-ed-grid{display:grid;gap:var(--space-4)}
        .map-ed-canvas{height:420px;border-radius:var(--radius-xl);border:1px solid var(--color-gray-200);z-index:0}
        .map-ed-controls{display:flex;align-items:center;gap:var(--space-3);margin-top:var(--space-2);flex-wrap:wrap}
        .map-ed-controls label{display:flex;align-items:center;gap:var(--space-2);font-size:var(--font-size-sm);color:var(--color-gray-700)}
        .route-badge{font-size:var(--font-size-xs);padding:var(--space-1) var(--space-3);border-radius:var(--radius-full);background:rgb(26 35 126 / 0.1);color:var(--color-petroleum);font-weight:600;margin-left:var(--space-2)}
        .map-ed-hint{display:flex;align-items:center;gap:var(--space-2);font-size:var(--font-size-xs);color:var(--color-gray-500);margin-top:var(--space-2)}
        .map-ed-side{display:flex;flex-direction:column;gap:var(--space-4)}
        .map-ed-form{display:flex;flex-direction:column;gap:var(--space-3);background:var(--color-white);border:1px solid var(--color-gray-200);border-radius:var(--radius-lg);padding:var(--space-4)}
        .map-ed-coords{font-family:var(--font-mono);font-size:var(--font-size-xs);color:var(--color-gray-600)}
        .map-ed-list-title{font-family:var(--font-display);font-size:var(--font-size-base);color:var(--color-petroleum)}
        .map-ed-list{display:flex;flex-direction:column;gap:var(--space-2);max-height:300px;overflow-y:auto}
        .map-ed-list li{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);background:var(--color-white);border:1px solid var(--color-gray-200);border-radius:var(--radius-md);padding:var(--space-2) var(--space-3);font-size:var(--font-size-sm)}
        .map-ed-list em{color:var(--color-gray-500)}
        .map-ed-empty{color:var(--color-gray-500);font-size:var(--font-size-sm)}
        @media(min-width:1024px){.map-ed-grid{grid-template-columns:1.4fr 1fr}}
      `}</style>
    </div>
  );
}
