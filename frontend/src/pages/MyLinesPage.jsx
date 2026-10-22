import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import { Bus, LogOut, Clock, MapPin, X, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';

const CENTER = [-12.6975, -38.3242];

export function MyLinesPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [lines, setLines] = useState([]);
  const [state, setState] = useState('loading');
  const [open, setOpen] = useState(null);
  const mapEl = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let alive = true;
    api.lines
      .list()
      .then((d) => {
        if (!alive) return;
        setLines(d.data || []);
        setState('ok');
      })
      .catch(() => {
        if (alive) setState('error');
      });
    return () => {
      alive = false;
    };
  }, []);

  const doLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {}
  };

  useEffect(() => {
    if (!mapEl.current || mapRef.current || lines.length === 0) return;
    const map = L.map(mapEl.current, {
      center: CENTER,
      zoom: 12,
      scrollWheelZoom: false,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    const layer = L.layerGroup().addTo(map);
    const bounds = [];
    lines.forEach((line) => {
      const pts = (line.pontos || [])
        .map((p) => [Number(p.latitude), Number(p.longitude)])
        .filter((p) => p.every(Number.isFinite));
      if (pts.length > 1)
        L.polyline(pts, { color: '#FF6D00', weight: 3 }).addTo(layer);
      pts.forEach((pt) => {
        bounds.push(pt);
        L.circleMarker(pt, {
          radius: 6,
          fillColor: '#1A237E',
          color: '#fff',
          weight: 2,
          fillOpacity: 1,
        })
          .addTo(layer)
          .bindTooltip(`${line.codigo} · ${line.nome}`);
      });
    });
    if (bounds.length) map.fitBounds(bounds, { padding: [30, 30] });
    mapRef.current = map;
    const resize = new ResizeObserver(() => map.invalidateSize());
    resize.observe(mapEl.current);
    return () => {
      resize.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, [lines]);

  return (
    <div className="mylines">
      <header className="mylines__top">
        <div>
          <p className="mylines__eyebrow">TransCamaçari · Equipe</p>
          <h1>
            Olá, {user?.name?.split(' ')[0] || 'colega'}.
            <span>Estas são as suas linhas.</span>
          </h1>
        </div>
        <button className="mylines__logout" onClick={doLogout}>
          <LogOut size={17} /> Sair
        </button>
      </header>
      {state === 'loading' && (
        <p className="mylines__status" role="status">
          Consultando suas linhas…
        </p>
      )}
      {state === 'error' && (
        <p className="mylines__status" role="alert">
          Não foi possível consultar suas linhas. Verifique a conexão e tente
          recarregar.
        </p>
      )}
      {state === 'ok' && lines.length === 0 && (
        <p className="mylines__status">
          Nenhuma linha atribuída a você ainda. Fale com o responsável da sua
          empresa.
        </p>
      )}
      {state === 'ok' && lines.length > 0 && (
        <div className="mylines__map-wrap">
          <h2 className="mylines__map-title">Seu território</h2>
          <div
            ref={mapEl}
            className="mylines__map"
            role="application"
            aria-label="Mapa das suas linhas"
          />
          <p className="mylines__map-legend">
            Pontos e conexões das linhas atribuídas a você. Somente leitura.
          </p>
        </div>
      )}
      <div className="mylines__list">
        {lines.map((line) => (
          <article key={line.id} className="mylines__card">
            <button
              className="mylines__summary"
              onClick={() => setOpen(open === line.id ? null : line.id)}
              aria-expanded={open === line.id}
            >
              <span className="mylines__code">
                <Bus size={18} />
                {line.codigo}
              </span>
              <span className="mylines__name">{line.nome}</span>
              {open === line.id ? <X size={20} /> : <ArrowUpRight size={20} />}
            </button>
            {open === line.id && (
              <div className="mylines__details">
                <p>
                  <MapPin size={15} /> {line.origem} → {line.destino}
                </p>
                <p>
                  <Clock size={15} />{' '}
                  {(line.horarios || []).length
                    ? line.horarios.map((h) => h.slice(0, 5)).join(' · ')
                    : 'Sem horários informados.'}
                </p>
                {(line.pontos || []).length > 0 && (
                  <ul className="mylines__points">
                    {(line.pontos || []).map((p, i) => (
                      <li key={i}>
                        {p.nome} <em>({p.tipo})</em>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
      <style>{`
        .mylines{min-height:100vh;background:#F5F5F5;color:#212121;padding:110px 5vw 70px}
        .mylines__top{display:flex;justify-content:space-between;align-items:start;gap:24px;max-width:900px;margin:0 auto 40px}
        .mylines__eyebrow{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#FF6D00;font-weight:700}
        .mylines__top h1{font-size:clamp(2rem,5vw,3.2rem);letter-spacing:-.03em;color:#1A237E;line-height:1.05;margin-top:12px}
        .mylines__top h1 span{display:block;font-size:.5em;color:#212121;font-weight:400;margin-top:8px}
        .mylines__logout{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#1A237E;border:1px solid #C9CFDD;border-radius:100px;padding:10px 18px;white-space:nowrap}
        .mylines__logout:hover{background:#1A237E;color:#F5F5F5}
        .mylines__status{max-width:900px;margin:0 auto;font-size:14px;color:#5A5A5A}
        .mylines__map-wrap{max-width:900px;margin:0 auto 8px}
        .mylines__map-title{font-size:20px;color:#1A237E;margin-bottom:12px}
        .mylines__map{height:360px;border-radius:12px;border:1px solid #E4E7EF;z-index:0}
        .mylines__map-legend{font-size:11px;color:#5A5A5A;margin-top:8px}
        .mylines__list{max-width:900px;margin:26px auto 0;display:flex;flex-direction:column}
        .mylines__card{background:#fff;border:1px solid #E4E7EF;border-radius:12px;margin-bottom:14px;overflow:hidden}
        .mylines__summary{width:100%;display:flex;align-items:center;gap:18px;text-align:left;padding:20px 22px;color:#212121}
        .mylines__code{display:flex;align-items:center;gap:8px;font-weight:700;color:#FF6D00;font-size:18px;min-width:90px}
        .mylines__name{font-size:18px;font-weight:600;flex:1}
        .mylines__summary>svg:last-child{color:#8A93C9}
        .mylines__details{border-top:1px solid #E4E7EF;padding:18px 22px 22px;display:flex;flex-direction:column;gap:10px;font-size:14px}
        .mylines__details p{display:flex;align-items:center;gap:8px}
        .mylines__details svg{color:#FF6D00;flex-shrink:0}
        .mylines__points{margin-top:6px;display:flex;flex-direction:column;gap:6px;font-size:13px;color:#5A5A5A}
        .mylines__points em{font-style:normal;color:#8A93C9}
        @media(max-width:600px){.mylines{padding:100px 20px 50px}.mylines__top{flex-direction:column}.mylines__code{min-width:0}.mylines__name{font-size:16px}}
      `}</style>
    </div>
  );
}
