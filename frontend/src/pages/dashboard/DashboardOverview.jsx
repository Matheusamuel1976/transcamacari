import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bus,
  Users,
  MapPin,
  Clock,
  ArrowUpRight,
  UserPlus,
} from 'lucide-react';
import { api } from '../../services/api';

export function DashboardOverview() {
  const [stats, setStats] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    Promise.all([api.lines.list(), api.employees.list()])
      .then(([lines, employees]) => {
        if (!alive) return;
        setStats({
          linhas: lines.data.length,
          funcionarios: employees.data.length,
          pontos: lines.data.reduce((n, l) => n + (l.pontos?.length || 0), 0),
          horarios: lines.data.reduce(
            (n, l) => n + (l.horarios?.length || 0),
            0,
          ),
        });
      })
      .catch(() => {
        if (alive)
          setError(
            'Não foi possível consultar sua operação. Verifique a conexão e tente recarregar.',
          );
      });
    api.team
      .pending()
      .then((d) => {
        if (alive) setPendingCount((d.data || []).length);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  const cards = [
    [Bus, 'Linhas cadastradas', 'linhas'],
    [Users, 'Funcionários', 'funcionarios'],
    [MapPin, 'Pontos de parada', 'pontos'],
    [Clock, 'Horários cadastrados', 'horarios'],
  ];
  return (
    <div>
      <h1 className="dash-h1">Sua operação, em perspectiva.</h1>
      <p className="dash-sub">Organize as conexões que movimentam a cidade.</p>
      {error && (
        <p className="alert alert-error" role="alert">
          {error}
        </p>
      )}
      {pendingCount > 0 && (
        <p className="alert alert-warning" role="status">
          <UserPlus size={16} />
          <span>
            {pendingCount}{' '}
            {pendingCount === 1
              ? 'cadastro de funcionário aguarda sua aprovação.'
              : 'cadastros de funcionários aguardam sua aprovação.'}{' '}
            <Link to="/dashboard/funcionarios">Revisar na aba Acessos</Link>
          </span>
        </p>
      )}
      <div className="stat-grid">
        {cards.map(([Icon, name, key]) => (
          <article key={key} className="card stat-card">
            <Icon size={22} />
            <p className="stat-v">{stats ? stats[key] : '—'}</p>
            <span>{name}</span>
          </article>
        ))}
      </div>
      <div className="dash-shortcuts">
        <Link to="/dashboard/linhas">
          Gerenciar linhas <ArrowUpRight size={20} />
        </Link>
        <Link to="/dashboard/mapa">
          Editar pontos no mapa <ArrowUpRight size={20} />
        </Link>
      </div>
      <style>{`.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}.stat-card{padding:24px 0}.stat-v{font-size:48px;font-variant-numeric:tabular-nums;margin:18px 0 8px}.stat-card>span{font-size:12px;color:#5A5A5A}.dash-shortcuts{display:flex;gap:35px;margin-top:50px}.dash-shortcuts a{display:flex;gap:20px;align-items:center;border-bottom:1px solid #9aa88e;padding-bottom:12px;font-size:14px}@media(max-width:700px){.stat-grid{grid-template-columns:1fr 1fr}.dash-shortcuts{flex-direction:column;gap:25px}.stat-v{font-size:38px}}`}</style>
    </div>
  );
}
