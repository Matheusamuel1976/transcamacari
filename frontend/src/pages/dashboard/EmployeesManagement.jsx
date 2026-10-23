import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { AccessManagement, AuditList } from './AccessManagement';

export function EmployeesManagement() {
  const [tab, setTab] = useState('perfis');
  const [profiles, setProfiles] = useState([]);
  const [state, setState] = useState('loading');

  useEffect(() => {
    let alive = true;
    api.employees
      .list()
      .then(({ data }) => {
        if (!alive) return;
        setProfiles(data || []);
        setState('ok');
      })
      .catch(() => {
        if (alive) setState('error');
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      <h1 className="dash-h1">Equipe</h1>
      <p className="dash-sub">
        Consulte perfis cadastrados e o estado dos recursos de acesso.
      </p>
      <div className="dash-tabs" role="tablist" aria-label="Equipe">
        {[
          ['perfis', 'Perfis'],
          ['acessos', 'Acessos ao sistema'],
          ['auditoria', 'Auditoria'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            className={tab === value ? 'active' : ''}
            onClick={() => setTab(value)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === 'acessos' && <AccessManagement />}
      {tab === 'auditoria' && <AuditList />}
      {tab === 'perfis' && (
        <div className="table-container">
          {state === 'loading' && <p role="status">Carregando perfis…</p>}
          {state === 'error' && (
            <p className="alert alert-error" role="alert">
              Não foi possível consultar os perfis autorizados.
            </p>
          )}
          {state === 'ok' && (
            <table className="table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Papel</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id}>
                    <td>{profile.name || 'Sem nome'}</td>
                    <td>{profile.email || '—'}</td>
                    <td>
                      {profile.role === 'admin'
                        ? 'Administrador'
                        : 'Operador'}
                    </td>
                  </tr>
                ))}
                {profiles.length === 0 && (
                  <tr>
                    <td colSpan={3}>Nenhum perfil disponível.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
      <style>{`
        .dash-tabs{display:flex;gap:8px;margin-bottom:var(--space-4);flex-wrap:wrap}
        .dash-tabs button{padding:10px 18px;border-radius:100px;font-size:13px;font-weight:600;color:var(--color-gray-600);border:1px solid var(--color-gray-200)}
        .dash-tabs button.active{background:var(--color-petroleum);color:var(--color-ivory);border-color:var(--color-petroleum)}
      `}</style>
    </div>
  );
}
