import { useEffect, useState } from 'react';
import {
  Trash2,
  Check,
  X,
  Copy,
  RefreshCw,
  KeyRound,
  History,
} from 'lucide-react';
import { api } from '../../services/api';

const ACTION_LABELS = {
  'auth.login': 'entrou',
  'auth.logout': 'saiu',
  'auth.password': 'trocou a senha',
  'team.register': 'pediu acesso com código',
  'team.user.created': 'teve acesso criado',
  'team.user.approved': 'foi aprovado',
  'team.user.removed': 'teve acesso removido',
  'team.user.assigned': 'teve linhas atualizadas',
  'invite.regenerated': 'gerou novo código',
};

export function AuditList() {
  const [rows, setRows] = useState([]);
  const [state, setState] = useState('loading');
  useEffect(() => {
    if (!api.capabilities.teamManagement) {
      setState('unavailable');
      return undefined;
    }
    let alive = true;
    api.team
      .audit()
      .then((d) => {
        if (!alive) return;
        setRows(d.data || []);
        setState('ok');
      })
      .catch(() => {
        if (alive) setState('error');
      });
    return () => {
      alive = false;
    };
  }, []);
  const fmtWhen = (iso) => {
    const clean = String(iso || '')
      .replace(' ', 'T')
      .replace(/(\.\d{3})\d+/, '$1')
      .replace(/([+-]\d{2})$/, '$1:00');
    const d = new Date(clean);
    return Number.isNaN(d.getTime())
      ? String(iso || '')
      : d.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
  };
  const actorLabel = (r) => {
    if (r.actor) return r.actor;
    if ((r.action || '').startsWith('auth.')) return 'Conta excluída';
    if (r.action === 'team.register') return 'Novo cadastro';
    return 'Sistema';
  };
  if (!api.capabilities.teamManagement) {
    return (
      <div className="alert alert-info" role="status">
        A auditoria de acessos será habilitada quando a função administrativa
        segura for publicada.
      </div>
    );
  }
  return (
    <div className="card access__block">
      <h2>
        <History size={18} /> Auditoria de acessos
      </h2>
      {state === 'loading' && (
        <p className="access__hint">Carregando eventos…</p>
      )}
      {state === 'error' && (
        <p className="access__hint">Não foi possível carregar a auditoria.</p>
      )}
      {state === 'ok' && rows.length === 0 && (
        <p className="access__hint">Nenhum evento registrado ainda.</p>
      )}
      {rows.map((r) => (
        <div key={r.id} className="access__row access__row--audit">
          <div>
            <strong>
              {actorLabel(r)} {ACTION_LABELS[r.action] || r.action}
            </strong>
            <span>
              {fmtWhen(r.created_at)}
              {r.meta ? ` · ${r.meta}` : ''}
            </span>
          </div>
        </div>
      ))}
      <style>{`
        .access__row--audit{display:flex;align-items:center;justify-content:space-between;gap:16px;border-top:1px solid var(--color-gray-200);padding:14px 0}
        .access__row--audit strong{display:block;font-size:15px}
        .access__row--audit span{display:block;font-size:12px;color:var(--color-gray-600);margin-top:4px}
      `}</style>
    </div>
  );
}

export function AccessManagement() {
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [lines, setLines] = useState([]);
  const [invite, setInvite] = useState('');
  const [inviteExp, setInviteExp] = useState('');
  const [copied, setCopied] = useState(false);
  const [assigning, setAssigning] = useState(null);
  const [assignSel, setAssignSel] = useState([]);
  const [approveSel, setApproveSel] = useState({});
  const [msg, setMsg] = useState({ type: '', text: '' });

  const load = async () => {
    try {
      const [u, p, l, inv] = await Promise.all([
        api.team.users(),
        api.team.pending(),
        api.lines.listPrivate(),
        api.team.invite(),
      ]);
      setUsers(u.data || []);
      setPending(p.data || []);
      setLines(l.data || []);
      setInvite(inv.code || '');
      setInviteExp(inv.expires_at || '');
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };
  useEffect(() => {
    if (!api.capabilities.teamManagement) return undefined;
    load();
  }, []);

  if (!api.capabilities.teamManagement) {
    return (
      <div className="alert alert-info" role="status">
        A gestão de convites, aprovações e atribuições exige uma função
        server-side autenticada. Esta instalação ainda não possui essa
        fronteira segura.
      </div>
    );
  }

  const say = (type, text) => setMsg({ type, text });

  const toggle = (list, id) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(invite);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      say('error', 'Não foi possível copiar. Anote o código manualmente.');
    }
  };

  const regen = async () => {
    try {
      const d = await api.team.regenerateInvite();
      setInvite(d.code);
      setInviteExp(d.expires_at || '');
      say('ok', 'Novo código gerado. Códigos antigos deixam de valer.');
    } catch (err) {
      say('error', err.message);
    }
  };

  const approve = async (id) => {
    try {
      await api.team.approve(id, approveSel[id] || []);
      say('ok', 'Cadastro aprovado.');
      load();
    } catch (err) {
      say('error', err.message);
    }
  };

  const reject = async (id) => {
    if (!confirm('Recusar este cadastro?')) return;
    try {
      await api.team.reject(id);
      say('ok', 'Cadastro recusado.');
      load();
    } catch (err) {
      say('error', err.message);
    }
  };

  const suspendUser = async (id) => {
    if (!confirm('Suspender este acesso ao painel privado?')) return;
    try {
      await api.team.suspend(id);
      say('ok', 'Acesso suspenso.');
      load();
    } catch (err) {
      say('error', err.message);
    }
  };

  const saveAssign = async (id) => {
    try {
      await api.team.assign(id, assignSel);
      setAssigning(null);
      say('ok', 'Linhas atualizadas.');
      load();
    } catch (err) {
      say('error', err.message);
    }
  };

  return (
    <div className="access">
      {msg.text && (
        <p
          className={`alert ${msg.type === 'error' ? 'alert-error' : 'alert-success'}`}
          role="status"
        >
          {msg.text}
        </p>
      )}

      <section className="card access__block">
        <h2>
          <KeyRound size={18} /> Código da empresa
        </h2>
        <p className="access__hint">
          Compartilhe com quem deve se cadastrar como funcionário. Quem se
          cadastra com o código entra na fila de aprovação abaixo.
          {inviteExp && <span className="access__exp"> Código temporário ativo.</span>}
        </p>
        <div className="access__invite">
          <code>{invite || 'Gere um novo código para compartilhar'}</code>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={copyInvite}
            disabled={!invite}
            aria-label="Copiar código"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={regen}
            aria-label="Gerar novo código"
          >
            <RefreshCw size={16} /> Novo código
          </button>
        </div>
      </section>

      <section className="card access__block">
        <h2>Aguardando aprovação ({pending.length})</h2>
        {pending.length === 0 && (
          <p className="access__hint">Nenhum cadastro pendente.</p>
        )}
        {pending.map((p) => (
          <div key={p.id} className="access__row">
            <div>
              <strong>{p.name}</strong>
              <span>{p.email}</span>
            </div>
            <div className="access__lines">
              {lines.map((l) => (
                <label key={l.id}>
                  <input
                    type="checkbox"
                    checked={(approveSel[p.id] || []).includes(l.id)}
                    onChange={() =>
                      setApproveSel({
                        ...approveSel,
                        [p.id]: toggle(approveSel[p.id] || [], l.id),
                      })
                    }
                  />
                  {l.codigo}
                </label>
              ))}
            </div>
            <div className="row-actions">
              <button className="btn btn-primary" onClick={() => approve(p.id)}>
                <Check size={16} /> Aprovar
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => reject(p.id)}
                aria-label={`Recusar ${p.name}`}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="card access__block">
        <h2>Usuários da empresa ({users.length})</h2>
        {users.map((u) => (
          <div key={u.id} className="access__row">
            <div>
              <strong>{u.name}</strong>
              <span>
                {u.email} · {u.role} · {u.status}
                {u.employee_nome ? ` · ${u.employee_nome}` : ''}
              </span>
              <span className="access__assigned">
                {(u.linhas || []).length
                  ? u.linhas.map((l) => l.codigo).join(', ')
                  : 'sem linhas atribuídas'}
              </span>
            </div>
            {u.role === 'funcionario' && (
              <div className="row-actions">
                {assigning === u.id ? (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => saveAssign(u.id)}
                    >
                      <Check size={16} /> Salvar
                    </button>
                    <button
                      className="btn btn-ghost"
                      onClick={() => setAssigning(null)}
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setAssigning(u.id);
                      setAssignSel((u.linhas || []).map((l) => l.id));
                    }}
                  >
                    Linhas
                  </button>
                )}
                <button
                  className="btn btn-icon btn-ghost"
                  aria-label={`Suspender acesso de ${u.name}`}
                  onClick={() => suspendUser(u.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
            {assigning === u.id && (
              <div className="access__lines access__lines--full">
                {lines.map((l) => (
                  <label key={l.id}>
                    <input
                      type="checkbox"
                      checked={assignSel.includes(l.id)}
                      onChange={() => setAssignSel(toggle(assignSel, l.id))}
                    />
                    {l.codigo} — {l.nome}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      <style>{`
        .access{display:flex;flex-direction:column;gap:var(--space-4)}
        .access__block{padding:var(--space-6);display:flex;flex-direction:column;gap:var(--space-4)}
        .access__block h2{font-size:20px;font-weight:600;display:flex;align-items:center;gap:10px;color:var(--color-petroleum)}
        .access__hint{font-size:13px;color:var(--color-gray-600)}
        .access__invite{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
        .access__invite code{font-family:var(--font-mono);font-size:14px;background:var(--color-gray-100);border:1px solid var(--color-gray-200);border-radius:8px;padding:10px 14px;max-width:100%;overflow:hidden;text-overflow:ellipsis}
        .access__row{display:flex;align-items:center;justify-content:space-between;gap:16px;border-top:1px solid var(--color-gray-200);padding:16px 0;flex-wrap:wrap}
        .access__row strong{display:block;font-size:15px}
        .access__row span{display:block;font-size:12px;color:var(--color-gray-600)}
        .access__assigned{color:var(--color-petroleum-dark)!important;font-weight:600}
        .access__lines{display:flex;flex-wrap:wrap;gap:8px 16px;font-size:13px}
        .access__lines label{display:flex;align-items:center;gap:6px;cursor:pointer}
        .access__lines--full{grid-column:1/-1;border:1px solid var(--color-gray-200);border-radius:8px;padding:12px 14px}
        .access__lines legend{font-size:12px;color:var(--color-gray-600);padding:0 6px}
      `}</style>
    </div>
  );
}
