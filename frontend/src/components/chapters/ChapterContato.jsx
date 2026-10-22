import { useState } from 'react';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export function ChapterContato() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    assunto: '',
    mensagem: '',
    website: '',
  });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [sending, setSending] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setStatus({ type: '', msg: '' });
    try {
      const result = await api.contact(form);
      setStatus({
        type: result.delivery === 'stored' ? 'warning' : 'success',
        msg: result.message,
      });
      setForm({ nome: '', email: '', assunto: '', mensagem: '', website: '' });
    } catch (err) {
      setStatus({
        type: 'error',
        msg: err.message || 'Não foi possível enviar. Tente novamente.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      id="contato"
      className="ch-contact"
      aria-labelledby="contact-title"
    >
      <div className="container contact-grid">
        <div>
          <span className="ch-num">07</span>
          <h2 id="contact-title" className="ch-title">
            Contato
          </h2>
          <p className="ch-sub">
            Dúvidas sobre linhas, horários ou parcerias? Fale com a equipe.
          </p>
          <ul className="contact-info">
            <li>
              <strong>Camaçari</strong> — Bahia, Brasil
            </li>
            <li>Conte sua dúvida ou sugestão para a equipe.</li>
          </ul>
        </div>
        <form
          className="contact-form"
          onSubmit={handleSubmit}
          noValidate={false}
        >
          {status.msg && (
            <div
              className={`alert ${status.type === 'success' ? 'alert-success' : status.type === 'warning' ? 'alert-warning' : 'alert-error'}`}
              role="alert"
            >
              {status.type === 'success' ? (
                <CheckCircle2 size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              <span>{status.msg}</span>
            </div>
          )}
          <div className="input-group">
            <label className="input-label" htmlFor="nome">
              Nome
            </label>
            <input
              id="nome"
              name="nome"
              className="input-field"
              required
              minLength={2}
              maxLength={120}
              value={form.nome}
              onChange={handleChange}
              placeholder="Seu nome"
              autoComplete="name"
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input-field"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="voce@email.com"
              autoComplete="email"
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="assunto">
              Assunto
            </label>
            <input
              id="assunto"
              name="assunto"
              className="input-field"
              required
              minLength={3}
              maxLength={150}
              value={form.assunto}
              onChange={handleChange}
              placeholder="Sobre o que quer falar?"
            />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="mensagem">
              Mensagem
            </label>
            <textarea
              id="mensagem"
              name="mensagem"
              className="input-field textarea-field"
              required
              minLength={10}
              maxLength={2000}
              value={form.mensagem}
              onChange={handleChange}
              placeholder="Escreva sua mensagem..."
            />
          </div>
          <input
            type="text"
            name="website"
            value={form.website}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="off"
            className="sr-only"
            aria-hidden="true"
          />
          <button
            type="submit"
            className="btn btn-accent btn-lg"
            disabled={sending}
          >
            <Send size={18} /> {sending ? 'Enviando...' : 'Enviar mensagem'}
          </button>
        </form>
      </div>
      <style>{`
        .ch-contact{background:var(--color-petroleum);color:var(--color-ivory);padding:var(--space-24) 0}
        .contact-grid{display:grid;grid-template-columns:1fr;gap:var(--space-10)}
        .ch-num{font-family:var(--font-display);font-size:clamp(3rem,6vw,5rem);font-weight:700;color:var(--color-solar);opacity:.35;line-height:1}
        .ch-title{font-family:var(--font-display);font-size:clamp(2.5rem,5vw,4rem);color:var(--color-ivory)}
        .ch-sub{color:rgba(243,240,232,.7);font-size:var(--font-size-lg);margin:var(--space-3) 0 var(--space-6)}
        .contact-info{display:flex;flex-direction:column;gap:var(--space-2);color:rgba(243,240,232,.7)}
        .contact-form{background:var(--color-white);border-radius:var(--radius-xl);padding:var(--space-6);display:flex;flex-direction:column;gap:var(--space-4);color:var(--color-petroleum)}
        @media(min-width:900px){.contact-grid{grid-template-columns:1fr 1.1fr;align-items:start}}
      `}</style>
    </section>
  );
}
