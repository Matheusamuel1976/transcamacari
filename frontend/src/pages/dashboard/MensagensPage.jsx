import { useEffect, useState } from 'react';
import { Trash2, MailOpen, Reply } from 'lucide-react';
import { api } from '../../services/api';

export function MensagensPage() {
  const [list, setList] = useState([]);
  const [state, setState] = useState('loading');
  const [open, setOpen] = useState(null);

  const load = async () => {
    try {
      const d = await api.messages.list();
      setList(d.data || []);
      setState('ok');
    } catch {
      setState('error');
    }
  };
  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    if (!confirm('Excluir esta mensagem?')) return;
    try {
      await api.messages.remove(id);
      load();
    } catch {}
  };

  const fmtWhen = (iso) => {
    const d = new Date(String(iso || '').replace(' ', 'T'));
    return Number.isNaN(d.getTime())
      ? String(iso || '')
      : d.toLocaleString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
  };

  return (
    <div>
      <h1 className="dash-h1">Mensagens</h1>
      <p className="dash-sub">
        Dúvidas e sugestões enviadas pelo formulário de contato ({list.length}).
      </p>
      {state === 'loading' && <p role="status">Carregando…</p>}
      {state === 'error' && (
        <p className="alert alert-error" role="alert">
          Não foi possível carregar as mensagens.
        </p>
      )}
      {list.map((m) => (
        <article key={m.id} className="card msg-card">
          <button
            className="msg-summary"
            onClick={() => setOpen(open === m.id ? null : m.id)}
            aria-expanded={open === m.id}
          >
            <MailOpen size={18} />
            <span>
              <strong>{m.assunto}</strong>
              <small>
                {m.nome} · {m.email} · {fmtWhen(m.created_at)}
              </small>
            </span>
          </button>
          {open === m.id && (
            <div className="msg-body">
              <p>{m.mensagem}</p>
              <div className="row-actions">
                <a
                  className="btn btn-ghost"
                  href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.assunto}`)}`}
                >
                  <Reply size={16} /> Responder
                </a>
                <button
                  className="btn btn-icon btn-ghost"
                  aria-label="Excluir mensagem"
                  onClick={() => remove(m.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}
        </article>
      ))}
      {state === 'ok' && list.length === 0 && (
        <p className="alert alert-info" role="status">
          Nenhuma mensagem recebida.
        </p>
      )}
      <style>{`
        .msg-card{margin-bottom:12px;overflow:hidden}
        .msg-summary{width:100%;display:flex;align-items:center;gap:14px;text-align:left;padding:18px 20px;color:var(--color-petroleum)}
        .msg-summary>svg{color:var(--color-terracotta);flex-shrink:0}
        .msg-summary strong{display:block;font-size:15px}
        .msg-summary small{display:block;font-size:12px;color:var(--color-gray-600)}
        .msg-body{border-top:1px solid var(--color-gray-200);padding:16px 20px;font-size:14px;display:flex;flex-direction:column;gap:14px;white-space:pre-wrap}
      `}</style>
    </div>
  );
}
