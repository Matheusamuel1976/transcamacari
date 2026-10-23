import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Search, Crosshair, Expand, X, ArrowUpRight } from 'lucide-react';
import { loadPublicLines, searchText } from '../../services/lines';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { ROUTE_NOTICE } from '../../services/transport';

const center = [-12.6975, -38.3242];

export function ChapterMapa() {
  const canvas = useRef(null);
  const mapRef = useRef(null);
  const layer = useRef(null);
  const userMarker = useRef(null);
  const [lines, setLines] = useState([]);
  const [source, setSource] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [tileError, setTileError] = useState(false);
  const reduced = useReducedMotion();
  const selected = lines.find((line) => String(line.id) === String(selectedId));
  const filtered = lines.filter((line) => searchText(`${line.code} ${line.name} ${line.bairro}`).includes(searchText(q)));

  useEffect(() => {
    const map = L.map(canvas.current, {
      center,
      zoom: 12,
      zoomControl: false,
      scrollWheelZoom: false,
    });
    mapRef.current = map;
    layer.current = L.featureGroup().addTo(map);
    const tiles = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      },
    ).addTo(map);
    tiles.on('tileerror', () => setTileError(true));
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.control
      .scale({ metric: true, imperial: false, position: 'bottomleft' })
      .addTo(map);
    const resize = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    resize.observe(canvas.current);
    return () => {
      resize.disconnect();
      tiles.off();
      map.remove();
      mapRef.current = null;
      layer.current = null;
      userMarker.current = null;
    };
  }, []);
  useEffect(() => {
    let alive = true;
    setSource('loading');
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
          setSource('error');
        }
      });
    return () => {
      alive = false;
    };
  }, [attempt]);
  useEffect(() => {
    const choose = (e) => {
      setSelectedId(e.detail.id);
      setQ('');
    };
    window.addEventListener('transcamacari:line', choose);
    return () => window.removeEventListener('transcamacari:line', choose);
  }, []);
  useEffect(() => {
    if (!layer.current) return;
    layer.current.clearLayers();
    const chosen = lines.find(line => String(line.id) === String(selectedId));
    const shown = chosen ? [chosen] : lines.filter(line => searchText(`${line.code} ${line.name} ${line.bairro}`).includes(searchText(q)));
    shown.forEach((line) => {
      const color = '#1A237E';
      if (line.routePoints?.length > 1)
        L.polyline(line.routePoints, { color, weight: 3 })
          .addTo(layer.current)
          .on('click', () => setSelectedId(line.id));
      line.points.forEach((point, index) => {
        const label = document.createElement('span');
        label.textContent = `${line.code} · ${index === 0 ? 'Origem' : index === line.points.length - 1 ? 'Destino' : `Ponto ${index}`}`;
        L.circleMarker(point, {
          radius: index === 0 ? 8 : 5,
          color: '#FFFFFF',
          weight: 2,
          fillColor: '#1A237E',
          fillOpacity: 1,
        })
          .addTo(layer.current)
          .bindTooltip(label);
      });
    });
    const bounds = layer.current.getBounds();
    if (bounds.isValid())
      mapRef.current.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 14,
        animate: !reduced,
      });
  }, [lines, q, selectedId, reduced, source]);
  const fit = () => {
    const bounds = layer.current?.getBounds();
    if (bounds?.isValid())
      mapRef.current?.fitBounds(bounds, {
        padding: [40, 40],
        maxZoom: 14,
        animate: !reduced,
      });
    else mapRef.current?.setView(center, 12, { animate: !reduced });
  };
  const locate = () => {
    if (!navigator.geolocation) {
      setError(
        'Seu navegador não oferece localização. Explore o mapa pela busca.',
      );
      return;
    }
    setLocating(true);
    setError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const map = mapRef.current;
        if (!map) return;
        const point = [position.coords.latitude, position.coords.longitude];
        userMarker.current?.remove();
        userMarker.current = L.circleMarker(point, {
          color: '#fff',
          fillColor: '#1A237E',
          fillOpacity: 1,
          radius: 9,
          weight: 3,
        })
          .addTo(map)
          .bindTooltip('Sua localização');
        map.setView(point, 14, { animate: !reduced });
        setLocating(false);
      },
      (e) => {
        if (!mapRef.current) return;
        setLocating(false);
        setError(
          e.code === 1
            ? 'Localização não autorizada. A busca e o mapa continuam disponíveis.'
            : 'Não conseguimos obter sua posição. Tente novamente ou use a busca.',
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  };
  return (
    <section id="mapa" className="territory-map" aria-labelledby="mapa-title">
      <div className="territory-map__heading">
        <h2 id="mapa-title">
          Encontre-se
          <br />
          <em>em Camaçari.</em>
        </h2>
        <p>
          Explore os pontos de cada linha.
          <br />
          Conecte o mapa ao seu cotidiano.
        </p>
      </div>
      <div className="territory-map__workspace">
        <aside
          className="territory-map__sidebar"
          aria-label="Linhas e controles do mapa"
        >
          <label className="map-search">
            <Search size={18} />
            <span className="sr-only">Buscar linha ou bairro no mapa</span>
            <input
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setSelectedId(null);
              }}
              placeholder="Linha ou bairro"
            />
          </label>
          <div className="map-actions">
            <button onClick={locate} disabled={locating}>
              <Crosshair size={17} />
              {locating ? 'Localizando…' : 'Minha posição'}
            </button>
            <button onClick={fit} aria-label="Enquadrar trajetos">
              <Expand size={17} />
            </button>
          </div>
          {error && (
            <p className="map-message" role="alert">
              {error}
            </p>
          )}
          <p className="map-source">
            {source === 'loading'
              ? 'Consultando linhas…'
              : 'Linhas cadastradas'}
          </p>
          {source === 'error' && <p role="alert">Não foi possível consultar as linhas. <button onClick={() => setAttempt(value => value + 1)}>Tentar novamente</button></p>}
          {source === 'live' && lines.length > 0 && !lines.some(line => line.routePoints?.length) && <p className="map-message" role="status">Os itinerários estão cadastrados, mas suas coordenadas ainda precisam de validação. Nenhum percurso confiável está disponível para exibição.</p>}
          <ul className="map-lines">
            {filtered.map((line) => (
              <li key={line.id}>
                <button
                  aria-pressed={String(selectedId) === String(line.id)}
                  onClick={() => setSelectedId(line.id)}
                >
                  <span
                    className="map-line-code"
                    style={{
                      color: '#1A237E',
                    }}
                  >
                    {line.code}
                  </span>
                  <span>
                    {line.name}
                    <small>
                      {line.locais?.filter(point => point.sentido === 'ida').length ?? line.points.length} locais no itinerário
                    </small>
                  </span>
                  <ArrowUpRight size={15} />
                </button>
              </li>
            ))}
          </ul>
          {!filtered.length && (
            <p className="map-message">
              {lines.length
                ? 'Nenhuma linha corresponde à busca.'
                : 'Ainda não há linhas públicas cadastradas.'}
            </p>
          )}
          <p className="map-legend">
            <span />
            {ROUTE_NOTICE}
            <br />
            Sem rastreamento em tempo real.
          </p>
        </aside>
        <div className="territory-map__canvas-wrap">
          <div
            ref={canvas}
            className="territory-map__canvas"
            aria-label="Mapa interativo de Camaçari"
          />
          {tileError && (
            <div className="map-tile-notice" role="status">
              A base cartográfica não carregou completamente. Verifique sua
              conexão.
            </div>
          )}
          {selected && (
            <div className="map-selection">
              <div>
                <strong>{selected.name}</strong>
                <p>
                  {selected.routePoints?.length ? ROUTE_NOTICE : 'Trajeto indisponível: coordenadas ou geometria precisam de validação.'}
                </p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                aria-label="Limpar seleção"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
