import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X, ArrowUpRight, Route } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TransitionLink } from '../motion/TransitionLink';

const items = [
  ['A cidade', 'cidade'],
  ['Os caminhos', 'caminhos'],
  ['Sua linha', 'descubra'],
  ['Mapa', 'mapa'],
];

export function Navbar() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 35);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const escape = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', escape);
    return () => window.removeEventListener('keydown', escape);
  }, [open]);
  return (
    <header
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''} ${open ? 'navbar--open' : ''}`}
    >
      <TransitionLink
        to="/"
        variant="route"
        className="navbar__brand"
        aria-label="TransCamaçari — início"
      >
        <Route size={25} />
        <span>
          TransCamaçari<span className="navbar__dot">.</span>
        </span>
      </TransitionLink>
      <nav className="navbar__desktop" aria-label="Navegação principal">
        {items.map(([name, id]) => (
          <TransitionLink key={id} to="/" hash={id}>
            {name}
          </TransitionLink>
        ))}
      </nav>
      <TransitionLink
        to={isAuthenticated ? '/dashboard' : '/login'}
        variant={isAuthenticated ? 'context' : 'auth'}
        className="navbar__access"
      >
        {isAuthenticated ? 'Meu painel' : 'Gerenciamento'}{' '}
        <ArrowUpRight size={16} />
      </TransitionLink>
      <button
        className="navbar__toggle"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        aria-expanded={open}
        aria-controls="mobile-menu"
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>
      {open && (
        <nav
          id="mobile-menu"
          className="navbar__mobile"
          aria-label="Navegação mobile"
        >
          {items.map(([name, id]) => (
            <TransitionLink
              key={id}
              to="/"
              hash={id}
              onClick={() => setOpen(false)}
            >
              {name}
              <ArrowUpRight size={22} />
            </TransitionLink>
          ))}
          <TransitionLink
            to={isAuthenticated ? '/dashboard' : '/login'}
            variant={isAuthenticated ? 'context' : 'auth'}
            onClick={() => setOpen(false)}
          >
            Gerenciamento
            <ArrowUpRight size={22} />
          </TransitionLink>
        </nav>
      )}
      <style>{`
        .navbar{position:fixed;inset:0 0 auto;height:86px;padding:0 3.5vw;display:flex;align-items:center;justify-content:space-between;gap:24px;z-index:1100;background:#1A237E;color:#F5F5F5;transition:box-shadow .2s}
        .navbar--scrolled{box-shadow:0 1px 0 #12175C}.navbar__brand{display:flex;align-items:center;gap:10px;font-size:22px;font-weight:600;letter-spacing:-.03em;color:#F5F5F5}.navbar__brand>svg{color:#4E59AC}.navbar__dot{color:#4E59AC}.navbar__desktop{display:flex;gap:30px;font-size:12px}.navbar__desktop a{padding:10px 0;position:relative;color:#F5F5F5}.navbar__desktop a:after{content:'';position:absolute;bottom:5px;left:0;right:0;height:2px;background:#4E59AC;transform:scaleX(0);transform-origin:left;transition:transform .25s}.navbar__desktop a:hover:after{transform:scaleX(1)}.navbar__access{display:flex;gap:12px;align-items:center;font-size:12px;color:#F5F5F5;border:1px solid #8A93C9;border-radius:100px;padding:10px 17px;transition:background-color .2s,color .2s,border-color .2s}.navbar__access:hover{background:#4E59AC;border-color:#4E59AC;color:#FFFFFF}.navbar__toggle{display:none;color:#F5F5F5;width:44px;height:44px;align-items:center;justify-content:center}.navbar__mobile{position:absolute;top:86px;left:0;right:0;background:#1A237E;color:#F5F5F5;padding:20px 25px 35px;border-bottom:1px solid #4E59AC}.navbar__mobile a{display:flex;justify-content:space-between;align-items:center;padding:18px 0;border-top:1px solid #4E59AC;font-size:25px;letter-spacing:-.03em;color:#F5F5F5}.navbar__mobile a svg{color:#4E59AC}
        @media(max-width:900px){.navbar__desktop{gap:16px}.navbar__brand{font-size:18px}}
        @media(max-width:700px){.navbar{height:74px;padding:0 20px;gap:10px}.navbar__brand{font-size:18px}.navbar__desktop,.navbar__access{display:none}.navbar__toggle{display:flex}.navbar__mobile{top:74px}}
      `}</style>
    </header>
  );
}
