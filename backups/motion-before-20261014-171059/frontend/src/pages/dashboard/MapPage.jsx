import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Trash2, Plus, MousePointerClick } from 'lucide-react';
import { api } from '../../services/api';

const CENTER = [-12.6975, -38.3242];

/**
 * Editor de pontos do trajeto: seleciona a linha, clica no mapa para
 * posicionar, nomeia e salva (POST /linhas/:id/pontos). Exclui com DELETE.
 */
export function MapPage() {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const [lines, setLines] = useState([]);
  const [lineId, setLineId] = useState('');
  const [pontos, setPontos] = useState([]);
  const [staged, setStaged] = useState(null);
  const [nome, setNome] = useState('');
  const [tipo, setTipo] = useState('parada');
  const [msg, setMsg] = useState('');
  const [placing, setPlacing] = useState(true);
  const selectionRef = useRef({ placing, lineId });
  selectionRef.current = { placing, lineId };
  const requestId = useRef(0);

  useEffect(() => {
    api.lines
      .list()
      .then((d) => setLines(d.data || []))
      .catch(() =>
        setMsg('Backend offline — conecte o MySQL para editar pontos.'),
      );
  }, []);

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
    setStaged(null);
    if (!id) {
      setPontos([]);
      return;
    }
    try {
      const d = await api.lines.pontos(id);
      if (currentRequest !== requestId.current) return;
      setPontos(d.data || []);
    } catch (e) {
      setMsg(e.message);
    }
  };

  const draw = (list, stage) => {
    const layer = layerRef.current;
    const map = mapRef.current;
    if (!layer || !map) return;
    layer.clearLayers();
    const latlngs = list.map((p) => [Number(p.latitude), Number(p.longitude)]);
    list.forEach((p) => {
      const label = document.createElement('span');
      label.textContent = `${p.ordem} · ${p.nome} (${p.tipo})`;
      L.circleMarker([Number(p.latitude), Number(p.longitude)], {
        radius: 7,
        fillColor: '#FF6D00',
        color: '#fff',
        weight: 2,
        fillOpacity: 1,
      })
        .addTo(layer)
        .bindTooltip(label);
    });
    if (latlngs.length) {
      L.polyline(latlngs, {
        color: '#FF6D00',
        weight: 3,
        dashArray: '8 8',
      }).addTo(layer);
      map.fitBounds(L.latLngBounds(latlngs), {
        padding: [40, 40],
        maxZoom: 14,
      });
    }
    if (stage) {
      L.circleMarker([stage.lat, stage.lng], {
        radius: 10,
        color: '#FF6D00',
        fillColor: '#FFFFFF',
        fillOpacity: 1,
      })
        .addTo(layer)
        .bindTooltip('Novo ponto (ainda não salvo)')
        .openTooltip();
    }
  };

  useEffect(() => {
    draw(pontos, staged);
  }, [pontos, staged]);

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

  return (
    <div>
      <h1 className="dash-h1">Mapa — editor de pontos</h1>
      <p className="dash-sub">
        Selecione a linha, clique no mapa para posicionar o ponto e salve. Os
        pontos alimentam o mapa público.
      </p>
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
            aria-label="Editor de pontos"
          />
          <p className="map-ed-hint">
            <MousePointerClick size={14} /> Clique no mapa posiciona o novo
            ponto (requer linha selecionada).
          </p>
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
              onChange={(e) => {
                setLineId(e.target.value);
                setStaged(null);
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
            <button className="btn btn-primary" disabled={!lineId || !staged}>
              <Plus size={16} /> Salvar ponto
            </button>
          </form>
          <h2 className="map-ed-list-title">Pontos ({pontos.length})</h2>
          <ul className="map-ed-list">
            {pontos.map((p) => (
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
            {pontos.length === 0 && (
              <li className="map-ed-empty">
                Sem pontos. Marque o primeiro clicando no mapa.
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
